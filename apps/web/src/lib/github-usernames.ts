import { db } from "@opensec/db";
import { account, user } from "@opensec/db/schema";
import { env } from "@opensec/env/server";
import { and, eq } from "drizzle-orm";

type GithubUserResponse = {
  login?: string;
};

async function fetchGithubUsernameByAccountId(accountId: string) {
  const response = await fetch(`https://api.github.com/user/${accountId}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GithubUserResponse;
  return data.login?.toLowerCase() ?? null;
}

export async function ensureGithubUsernameForUserId(userId: string) {
  const row = await db
    .select({
      userId: user.id,
      githubUsername: user.githubUsername,
      githubAccountId: account.accountId,
    })
    .from(user)
    .leftJoin(account, and(eq(account.userId, user.id), eq(account.providerId, "github")))
    .where(eq(user.id, userId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!row) {
    return null;
  }

  if (row.githubUsername) {
    return row.githubUsername;
  }

  if (!row.githubAccountId) {
    return null;
  }

  const githubUsername = await fetchGithubUsernameByAccountId(row.githubAccountId);
  if (!githubUsername) {
    return null;
  }

  await db.update(user).set({ githubUsername }).where(eq(user.id, userId));
  return githubUsername;
}

export async function ensureGithubUsernamesForUserIds(userIds: string[]) {
  const uniqueUserIds = [...new Set(userIds)];
  const pairs = await Promise.all(
    uniqueUserIds.map(
      async (userId) => [userId, await ensureGithubUsernameForUserId(userId)] as const,
    ),
  );

  return new Map(pairs);
}
