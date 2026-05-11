"use server";

import { auth } from "@deepsec-me/auth";
import { db } from "@deepsec-me/db";
import { reviewReport, reviewRequest } from "@deepsec-me/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { fetchGithubRepoMetadata, parseGithubRepoUrl } from "@/lib/github";

async function requireUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return session.user;
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

function getCount(formData: FormData, key: string) {
  const value = Number(formData.get(key) || 0);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export async function createReviewRequest(formData: FormData) {
  const user = await requireUser();
  const repo = parseGithubRepoUrl(getRequiredString(formData, "repoUrl"));
  const description = getRequiredString(formData, "description");
  const securityNotes = getOptionalString(formData, "securityNotes");
  const metadata = await fetchGithubRepoMetadata(repo.owner, repo.repo);

  const existing = await db.query.reviewRequest.findFirst({
    where: eq(reviewRequest.repoUrl, repo.repoUrl),
  });

  if (existing) {
    redirect(`/reviews/${existing.id}`);
  }

  const [request] = await db
    .insert(reviewRequest)
    .values({
      repoUrl: repo.repoUrl,
      repoOwner: repo.owner,
      repoName: repo.repo,
      description,
      securityNotes,
      ...metadata,
      requesterId: user.id,
    })
    .returning({ id: reviewRequest.id });

  revalidatePath("/");
  revalidatePath("/reviews");
  redirect(`/reviews/${request.id}`);
}

export async function submitReviewReport(formData: FormData) {
  const user = await requireUser();
  const requestId = getRequiredString(formData, "requestId");
  const markdown = getRequiredString(formData, "markdown");
  const providerValue = getRequiredString(formData, "provider");
  const provider =
    providerValue === "claude" || providerValue === "codex" ? providerValue : "other";
  const modelName = getOptionalString(formData, "modelName");
  const criticalCount = getCount(formData, "criticalCount");
  const highCount = getCount(formData, "highCount");
  const mediumCount = getCount(formData, "mediumCount");
  const lowCount = getCount(formData, "lowCount");
  const informationalCount = getCount(formData, "informationalCount");
  const totalCount = criticalCount + highCount + mediumCount + lowCount + informationalCount;

  const request = await db.query.reviewRequest.findFirst({
    where: and(eq(reviewRequest.id, requestId), eq(reviewRequest.status, "pending")),
  });

  if (!request) {
    redirect(`/reviews/${requestId}`);
  }

  await db.insert(reviewReport).values({
    requestId,
    donorId: user.id,
    markdown,
    provider,
    modelName,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    informationalCount,
    totalCount,
  });

  await db
    .update(reviewRequest)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(reviewRequest.id, requestId));

  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath(`/reviews/${requestId}`);
  redirect(`/reviews/${requestId}`);
}
