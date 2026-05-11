import { db } from "@deepsec-me/db";
import { reviewReport, reviewRequest, user } from "@deepsec-me/db/schema";
import { count, desc, eq } from "drizzle-orm";

export async function getLandingData() {
  const pending = await db
    .select({
      id: reviewRequest.id,
      repoOwner: reviewRequest.repoOwner,
      repoName: reviewRequest.repoName,
      description: reviewRequest.description,
      ghDescription: reviewRequest.ghDescription,
      ghStars: reviewRequest.ghStars,
      ghLanguage: reviewRequest.ghLanguage,
      ghOwnerAvatarUrl: reviewRequest.ghOwnerAvatarUrl,
      createdAt: reviewRequest.createdAt,
      requesterName: user.name,
      requesterImage: user.image,
    })
    .from(reviewRequest)
    .innerJoin(user, eq(reviewRequest.requesterId, user.id))
    .where(eq(reviewRequest.status, "pending"))
    .orderBy(desc(reviewRequest.createdAt))
    .limit(6);

  const completed = await db
    .select({
      id: reviewRequest.id,
      repoOwner: reviewRequest.repoOwner,
      repoName: reviewRequest.repoName,
      ghOwnerAvatarUrl: reviewRequest.ghOwnerAvatarUrl,
      ghLanguage: reviewRequest.ghLanguage,
      ghStars: reviewRequest.ghStars,
      completedAt: reviewRequest.completedAt,
      donorId: reviewReport.donorId,
      donorName: user.name,
      provider: reviewReport.provider,
      criticalCount: reviewReport.criticalCount,
      highCount: reviewReport.highCount,
      mediumCount: reviewReport.mediumCount,
      lowCount: reviewReport.lowCount,
      informationalCount: reviewReport.informationalCount,
      totalCount: reviewReport.totalCount,
    })
    .from(reviewRequest)
    .innerJoin(reviewReport, eq(reviewRequest.id, reviewReport.requestId))
    .innerJoin(user, eq(reviewReport.donorId, user.id))
    .where(eq(reviewRequest.status, "completed"))
    .orderBy(desc(reviewRequest.completedAt))
    .limit(6);

  const topDonors = await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      reviews: count(reviewReport.id),
    })
    .from(reviewReport)
    .innerJoin(user, eq(reviewReport.donorId, user.id))
    .groupBy(user.id, user.name, user.image)
    .orderBy(desc(count(reviewReport.id)))
    .limit(6);

  return { pending, completed, topDonors };
}

export async function getPendingReviews() {
  return db
    .select({
      id: reviewRequest.id,
      repoUrl: reviewRequest.repoUrl,
      repoOwner: reviewRequest.repoOwner,
      repoName: reviewRequest.repoName,
      description: reviewRequest.description,
      securityNotes: reviewRequest.securityNotes,
      ghDescription: reviewRequest.ghDescription,
      ghStars: reviewRequest.ghStars,
      ghForks: reviewRequest.ghForks,
      ghOpenIssues: reviewRequest.ghOpenIssues,
      ghLanguage: reviewRequest.ghLanguage,
      ghTopics: reviewRequest.ghTopics,
      ghLicense: reviewRequest.ghLicense,
      ghPushedAt: reviewRequest.ghPushedAt,
      ghOwnerAvatarUrl: reviewRequest.ghOwnerAvatarUrl,
      ghArchived: reviewRequest.ghArchived,
      createdAt: reviewRequest.createdAt,
      requesterId: reviewRequest.requesterId,
      requesterName: user.name,
      requesterImage: user.image,
    })
    .from(reviewRequest)
    .innerJoin(user, eq(reviewRequest.requesterId, user.id))
    .where(eq(reviewRequest.status, "pending"))
    .orderBy(desc(reviewRequest.createdAt));
}

export async function getReviewDetail(id: string) {
  const [request] = await db
    .select({
      id: reviewRequest.id,
      repoUrl: reviewRequest.repoUrl,
      repoOwner: reviewRequest.repoOwner,
      repoName: reviewRequest.repoName,
      description: reviewRequest.description,
      securityNotes: reviewRequest.securityNotes,
      ghDescription: reviewRequest.ghDescription,
      ghStars: reviewRequest.ghStars,
      ghForks: reviewRequest.ghForks,
      ghOpenIssues: reviewRequest.ghOpenIssues,
      ghLanguage: reviewRequest.ghLanguage,
      ghTopics: reviewRequest.ghTopics,
      ghLicense: reviewRequest.ghLicense,
      ghDefaultBranch: reviewRequest.ghDefaultBranch,
      ghPushedAt: reviewRequest.ghPushedAt,
      ghOwnerAvatarUrl: reviewRequest.ghOwnerAvatarUrl,
      ghOwnerType: reviewRequest.ghOwnerType,
      ghHomepage: reviewRequest.ghHomepage,
      ghArchived: reviewRequest.ghArchived,
      ghFetchedAt: reviewRequest.ghFetchedAt,
      requesterId: reviewRequest.requesterId,
      requesterName: user.name,
      status: reviewRequest.status,
      createdAt: reviewRequest.createdAt,
      completedAt: reviewRequest.completedAt,
    })
    .from(reviewRequest)
    .innerJoin(user, eq(reviewRequest.requesterId, user.id))
    .where(eq(reviewRequest.id, id))
    .limit(1);

  if (!request) {
    return null;
  }

  const [report] = await db
    .select({
      id: reviewReport.id,
      donorId: reviewReport.donorId,
      donorName: user.name,
      provider: reviewReport.provider,
      modelName: reviewReport.modelName,
      markdown: reviewReport.markdown,
      criticalCount: reviewReport.criticalCount,
      highCount: reviewReport.highCount,
      mediumCount: reviewReport.mediumCount,
      lowCount: reviewReport.lowCount,
      informationalCount: reviewReport.informationalCount,
      totalCount: reviewReport.totalCount,
      createdAt: reviewReport.createdAt,
    })
    .from(reviewReport)
    .innerJoin(user, eq(reviewReport.donorId, user.id))
    .where(eq(reviewReport.requestId, id))
    .limit(1);

  return { request, report: report ?? null };
}

export async function getUserProfile(id: string) {
  const profile = await db.query.user.findFirst({
    where: eq(user.id, id),
  });

  if (!profile) {
    return null;
  }

  const donated = await db
    .select({
      requestId: reviewRequest.id,
      repoOwner: reviewRequest.repoOwner,
      repoName: reviewRequest.repoName,
      provider: reviewReport.provider,
      totalCount: reviewReport.totalCount,
      criticalCount: reviewReport.criticalCount,
      highCount: reviewReport.highCount,
      createdAt: reviewReport.createdAt,
    })
    .from(reviewReport)
    .innerJoin(reviewRequest, eq(reviewReport.requestId, reviewRequest.id))
    .where(eq(reviewReport.donorId, id))
    .orderBy(desc(reviewReport.createdAt));

  const requested = await db
    .select({
      id: reviewRequest.id,
      repoOwner: reviewRequest.repoOwner,
      repoName: reviewRequest.repoName,
      status: reviewRequest.status,
      createdAt: reviewRequest.createdAt,
    })
    .from(reviewRequest)
    .where(eq(reviewRequest.requesterId, id))
    .orderBy(desc(reviewRequest.createdAt));

  return { profile, donated, requested };
}
