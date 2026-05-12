import { auth } from "@opensec/auth";
import { Badge } from "@opensec/ui/components/badge";
import { buttonVariants } from "@opensec/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@opensec/ui/components/card";
import { Star } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DonateReviewDialog } from "@/components/donate-review-dialog";
import { getGithubUsernameForUserId, getReviewDetailBySlug } from "@/lib/reviews";

type ReviewDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ReviewDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getReviewDetailBySlug(slug);

  if (!detail) {
    return {
      title: "Repository Not Found",
    };
  }

  const repoName = `${detail.request.repoOwner}/${detail.request.repoName}`;

  return {
    title: `${repoName} Security Review`,
    description:
      detail.request.ghDescription ||
      `OpenSec security review request for the public GitHub repository ${repoName}.`,
    alternates: {
      canonical: `/repos/${slug}`,
    },
    openGraph: {
      title: `${repoName} Security Review`,
      description:
        detail.request.ghDescription ||
        `OpenSec security review request for the public GitHub repository ${repoName}.`,
      url: `/repos/${slug}`,
    },
  };
}

function SeverityGrid({
  report,
}: {
  report: {
    summaryPairs: Array<{ label: string; count: number }>;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    informationalCount: number;
    totalCount: number;
  };
}) {
  const summaryPairs = report.summaryPairs.length
    ? report.summaryPairs
    : [
        { label: "CRITICAL", count: report.criticalCount },
        { label: "HIGH", count: report.highCount },
        { label: "MEDIUM", count: report.mediumCount },
        { label: "LOW", count: report.lowCount },
        { label: "INFORMATIONAL", count: report.informationalCount },
      ].filter((pair) => pair.count > 0);
  const items = [
    ["Total findings", report.totalCount],
    ...summaryPairs.map((pair) => [pair.label, pair.count]),
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {items.map(([label, value]) => (
        <div key={label} className="border p-3">
          <p className="text-lg font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: value >= 1000 ? "compact" : "standard",
  })
    .format(value)
    .toLowerCase();
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    value,
  );
}

function verificationLabel(level: "unverified" | "contributor" | "maintainer") {
  if (level === "maintainer") {
    return "Verified maintainer";
  }

  if (level === "contributor") {
    return "Verified contributor";
  }

  return "Unverified request";
}

function verificationClassName(level: "unverified" | "contributor" | "maintainer") {
  if (level === "maintainer") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (level === "contributor") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300";
  }

  return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const { slug } = await params;
  const detail = await getReviewDetailBySlug(slug);
  const session = await auth.api.getSession({ headers: await headers() });

  if (!detail) {
    notFound();
  }

  const { request, report, submissions } = detail;
  const donorUsername = report ? await getGithubUsernameForUserId(report.donorId) : null;
  const canViewReport = Boolean(
    report && session?.user && [request.requesterId, report.donorId].includes(session.user.id),
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <section className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div className="flex items-start gap-4">
          {request.ghOwnerAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="size-16 border" src={request.ghOwnerAvatarUrl} />
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {request.status}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              {request.repoOwner}/{request.repoName}
            </h1>
            <Badge
              variant="outline"
              className={`mt-3 ${verificationClassName(request.verificationLevel)}`}
            >
              {verificationLabel(request.verificationLevel)}
            </Badge>
            {request.ghDescription ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {request.ghDescription}
              </p>
            ) : null}
            <a
              className="mt-2 block text-sm underline"
              href={request.repoUrl}
              target="_blank"
              rel="noreferrer"
            >
              {request.repoUrl}
            </a>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {!report && session?.user ? (
            <DonateReviewDialog repositoryId={request.id} repoUrl={request.repoUrl} />
          ) : null}
          {!report && !session?.user ? (
            <Link className={buttonVariants()} href="/login">
              Sign in to submit an audit
            </Link>
          ) : null}
          <Link className={buttonVariants({ variant: "outline" })} href="/repos">
            Back to repos
          </Link>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Repository metadata</CardTitle>
          <CardDescription>
            {request.ghFetchedAt
              ? `Fetched from GitHub on ${formatDate(request.ghFetchedAt)}`
              : "GitHub metadata has not been fetched yet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-6">
            <div className="border p-3">
              <p className="font-semibold">
                {typeof request.ghStars === "number" ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-4" />
                    {formatCount(request.ghStars)}
                  </span>
                ) : (
                  "-"
                )}
              </p>
              <p className="text-xs text-muted-foreground">Stars</p>
            </div>
            <div className="border p-3">
              <p className="font-semibold">
                {typeof request.ghForks === "number" ? formatCount(request.ghForks) : "-"}
              </p>
              <p className="text-xs text-muted-foreground">Forks</p>
            </div>
            <div className="border p-3">
              <p className="font-semibold">
                {typeof request.ghOpenIssues === "number" ? formatCount(request.ghOpenIssues) : "-"}
              </p>
              <p className="text-xs text-muted-foreground">Issues</p>
            </div>
            <div className="border p-3">
              <p className="truncate font-semibold">{request.ghLanguage || "-"}</p>
              <p className="text-xs text-muted-foreground">Language</p>
            </div>
            <div className="border p-3">
              <p className="truncate font-semibold">{request.ghLicense || "-"}</p>
              <p className="text-xs text-muted-foreground">License</p>
            </div>
            <div className="border p-3">
              <p className="truncate font-semibold">
                {request.ghPushedAt ? formatDate(request.ghPushedAt) : "-"}
              </p>
              <p className="text-xs text-muted-foreground">Last push</p>
            </div>
            <div className="border p-3">
              <p className="truncate font-semibold">
                {typeof request.locTotal === "number" ? formatCount(request.locTotal) : "-"}
              </p>
              <p className="text-xs text-muted-foreground">LOC</p>
            </div>
            <div className="border p-3">
              <p className="truncate font-semibold">
                {typeof request.locFiles === "number" ? formatCount(request.locFiles) : "-"}
              </p>
              <p className="text-xs text-muted-foreground">Files</p>
            </div>
          </div>
          {request.ghArchived ? (
            <p className="border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm">
              This repository is archived on GitHub.
            </p>
          ) : null}
          {request.verificationLevel === "unverified" ? (
            <p className="border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
              This request was submitted by a user whose GitHub access to the repository could not
              be verified.
            </p>
          ) : null}
          {request.ghTopics.length ? (
            <div className="flex flex-wrap gap-2">
              {request.ghTopics.map((topic) => (
                <span key={topic} className="border px-2 py-1 text-xs text-muted-foreground">
                  {topic}
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {request.ghDefaultBranch ? (
              <span>default branch: {request.ghDefaultBranch}</span>
            ) : null}
            {request.ghOwnerType ? <span>owner type: {request.ghOwnerType}</span> : null}
            {request.ghHomepage ? (
              <a className="underline" href={request.ghHomepage} target="_blank" rel="noreferrer">
                homepage
              </a>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request context</CardTitle>
          <CardDescription>Active request by {request.requesterName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7">
          <p className="whitespace-pre-wrap">{request.notes}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request submissions</CardTitle>
          <CardDescription>
            Every submission is stored. The repository uses the highest verification level as the
            active request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {submissions.map((submission) => (
            <div key={submission.id} className="border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{submission.requester.name}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={verificationClassName(submission.verificationLevel)}
                  >
                    {verificationLabel(submission.verificationLevel)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {submission.requesterRepoPermission}
                  </span>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{submission.notes}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {typeof submission.locTotal === "number" ? (
                  <span>{formatCount(submission.locTotal)} LOC</span>
                ) : null}
                {typeof submission.locFiles === "number" ? (
                  <span>{formatCount(submission.locFiles)} files</span>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {report ? (
        <Card>
          <CardHeader>
            <CardTitle>Review summary</CardTitle>
            <CardDescription>
              Donated by{" "}
              {donorUsername ? (
                <Link className="underline" href={`/users/${donorUsername}`}>
                  {report.donorName}
                </Link>
              ) : (
                report.donorName
              )}
              {" using "}
              {report.modelName || report.provider}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <SeverityGrid report={report} />
            {canViewReport ? (
              <div className="space-y-2">
                <h2 className="font-medium">Private Markdown report</h2>
                <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap border bg-muted/30 p-4 text-xs leading-6">
                  {report.markdown}
                </pre>
              </div>
            ) : (
              <p className="border p-4 text-sm text-muted-foreground">
                The full report is private to the requester and donor. Public pages only show safe
                summary metadata.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
