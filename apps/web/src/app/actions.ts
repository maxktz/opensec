"use server";

import { auth } from "@opensec/auth";
import { db } from "@opensec/db";
import {
  account,
  repository,
  reviewReport,
  reviewRequestSubmission,
  type VerificationLevel,
} from "@opensec/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { parseClocOutput } from "@/lib/cloc";
import {
  fetchGithubRepoMetadata,
  fetchGithubRepoPermission,
  parseGithubRepoUrl,
} from "@/lib/github";
import { parseReportStats, parseReportSummaryPairs } from "@/lib/report-stats";

const verificationPriority: Record<VerificationLevel, number> = {
  unverified: 0,
  contributor: 1,
  maintainer: 2,
};

export type FormActionResult = { ok: true; redirectTo: string } | { ok: false; error: string };

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

async function requireUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return session.user;
}

async function getGithubAccessToken(userId: string) {
  const githubAccount = await db.query.account.findFirst({
    where: and(eq(account.userId, userId), eq(account.providerId, "github")),
  });

  return githubAccount?.accessToken ?? null;
}

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${key} is required.`);
  }

  return value.trim();
}

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export async function createReviewRequest(formData: FormData): Promise<FormActionResult> {
  const user = await requireUser();

  try {
    const repo = parseGithubRepoUrl(getRequiredString(formData, "repoUrl"));
    const notes = getRequiredString(formData, "notes");
    const parsedCloc = parseClocOutput(getOptionalString(formData, "clocOutput"));
    const accessToken = await getGithubAccessToken(user.id);
    const [metadata, permission] = await Promise.all([
      fetchGithubRepoMetadata(repo.owner, repo.repo),
      fetchGithubRepoPermission(repo.owner, repo.repo, accessToken),
    ]);

    if (!metadata) {
      return {
        ok: false,
        error: "Repository not found. Submit a real public GitHub repository URL.",
      };
    }

    if (metadata.isPrivate || metadata.visibility !== "public") {
      return { ok: false, error: "Only public GitHub repositories can request reviews." };
    }

    const existingRepository = await db.query.repository.findFirst({
      where: eq(repository.repoUrl, repo.repoUrl),
    });

    const [repoRecord] = existingRepository
      ? [existingRepository]
      : await db
          .insert(repository)
          .values({
            repoUrl: repo.repoUrl,
            repoSlug: repo.slug,
            repoOwner: repo.owner,
            repoName: repo.repo,
            verificationLevel: permission.verificationLevel,
            ghDescription: metadata.ghDescription,
            ghStars: metadata.ghStars,
            ghForks: metadata.ghForks,
            ghOpenIssues: metadata.ghOpenIssues,
            ghLanguage: metadata.ghLanguage,
            ghTopics: metadata.ghTopics,
            ghLicense: metadata.ghLicense,
            ghDefaultBranch: metadata.ghDefaultBranch,
            ghPushedAt: metadata.ghPushedAt,
            ghOwnerAvatarUrl: metadata.ghOwnerAvatarUrl,
            ghOwnerType: metadata.ghOwnerType,
            ghHomepage: metadata.ghHomepage,
            ghArchived: metadata.ghArchived,
            ghFetchedAt: metadata.ghFetchedAt,
            locTotal: parsedCloc.locTotal,
            locFiles: parsedCloc.locFiles,
            locBlank: parsedCloc.locBlank,
            locComment: parsedCloc.locComment,
            locByLanguage: parsedCloc.locByLanguage,
            clocOutputRaw: parsedCloc.clocOutputRaw,
          })
          .returning();

    const [submission] = await db
      .insert(reviewRequestSubmission)
      .values({
        repositoryId: repoRecord.id,
        requesterId: user.id,
        verificationLevel: permission.verificationLevel,
        requesterRepoPermission: permission.permission,
        notes,
        locTotal: parsedCloc.locTotal,
        locFiles: parsedCloc.locFiles,
        locBlank: parsedCloc.locBlank,
        locComment: parsedCloc.locComment,
        locByLanguage: parsedCloc.locByLanguage,
        clocOutputRaw: parsedCloc.clocOutputRaw,
      })
      .returning();

    const shouldPromoteSubmission =
      verificationPriority[permission.verificationLevel] >=
      verificationPriority[repoRecord.verificationLevel];
    const updateValues = {
      ghDescription: metadata.ghDescription,
      ghStars: metadata.ghStars,
      ghForks: metadata.ghForks,
      ghOpenIssues: metadata.ghOpenIssues,
      ghLanguage: metadata.ghLanguage,
      ghTopics: metadata.ghTopics,
      ghLicense: metadata.ghLicense,
      ghDefaultBranch: metadata.ghDefaultBranch,
      ghPushedAt: metadata.ghPushedAt,
      ghOwnerAvatarUrl: metadata.ghOwnerAvatarUrl,
      ghOwnerType: metadata.ghOwnerType,
      ghHomepage: metadata.ghHomepage,
      ghArchived: metadata.ghArchived,
      ghFetchedAt: metadata.ghFetchedAt,
      ...(shouldPromoteSubmission
        ? {
            activeSubmissionId: submission.id,
            verificationLevel: permission.verificationLevel,
            verifiedBySubmissionId:
              permission.verificationLevel === "unverified"
                ? repoRecord.verifiedBySubmissionId
                : submission.id,
            verifiedByUserId:
              permission.verificationLevel === "unverified" ? repoRecord.verifiedByUserId : user.id,
            verifiedAt:
              permission.verificationLevel === "unverified" ? repoRecord.verifiedAt : new Date(),
            locTotal: parsedCloc.locTotal,
            locFiles: parsedCloc.locFiles,
            locBlank: parsedCloc.locBlank,
            locComment: parsedCloc.locComment,
            locByLanguage: parsedCloc.locByLanguage,
            clocOutputRaw: parsedCloc.clocOutputRaw,
          }
        : {}),
    };

    if (Object.keys(updateValues).length > 0) {
      await db.update(repository).set(updateValues).where(eq(repository.id, repoRecord.id));
    }

    revalidatePath("/");
    revalidatePath("/repos");
    revalidatePath(`/repos/${repoRecord.repoSlug}`);
    return { ok: true, redirectTo: `/repos/${repoRecord.repoSlug}` };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function submitReviewReport(formData: FormData): Promise<FormActionResult> {
  const user = await requireUser();

  try {
    const repositoryId = getRequiredString(formData, "repositoryId");
    const markdown = getRequiredString(formData, "markdown");
    const providerValue = getRequiredString(formData, "provider");
    const provider =
      providerValue === "claude" || providerValue === "codex" ? providerValue : "other";
    const modelName = getRequiredString(formData, "modelName");
    const summaryPairs = parseReportSummaryPairs(markdown);
    const { criticalCount, highCount, mediumCount, lowCount, informationalCount, totalCount } =
      parseReportStats(markdown);

    const repoRecord = await db.query.repository.findFirst({
      where: and(eq(repository.id, repositoryId), eq(repository.status, "pending")),
    });

    if (!repoRecord) {
      return { ok: false, error: "This repository is no longer accepting donated reviews." };
    }

    await db.insert(reviewReport).values({
      repositoryId,
      donorId: user.id,
      markdown,
      provider,
      modelName,
      summaryPairs,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      informationalCount,
      totalCount,
    });

    await db
      .update(repository)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(repository.id, repositoryId));

    revalidatePath("/");
    revalidatePath("/repos");
    revalidatePath(`/repos/${repoRecord.repoSlug}`);
    return { ok: true, redirectTo: `/repos/${repoRecord.repoSlug}` };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}
