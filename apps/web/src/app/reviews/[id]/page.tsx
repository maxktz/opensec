import { auth } from "@deepsec-me/auth";
import { buttonVariants } from "@deepsec-me/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@deepsec-me/ui/components/card";
import { Star } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DonateReviewDialog } from "@/components/donate-review-dialog";
import { getReviewDetail } from "@/lib/reviews";

type ReviewDetailPageProps = {
  params: Promise<{ id: string }>;
};

function SeverityGrid({
  report,
}: {
  report: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    informationalCount: number;
    totalCount: number;
  };
}) {
  const items = [
    ["Total", report.totalCount],
    ["Critical", report.criticalCount],
    ["High", report.highCount],
    ["Medium", report.mediumCount],
    ["Low", report.lowCount],
    ["Info", report.informationalCount],
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
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

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const { id } = await params;
  const detail = await getReviewDetail(id);
  const session = await auth.api.getSession({ headers: await headers() });

  if (!detail) {
    notFound();
  }

  const { request, report } = detail;
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
            <DonateReviewDialog requestId={request.id} repoUrl={request.repoUrl} />
          ) : null}
          {!report && !session?.user ? (
            <Link className={buttonVariants()} href="/login">
              Sign in to donate a review
            </Link>
          ) : null}
          <Link className={buttonVariants({ variant: "outline" })} href="/reviews">
            Back to queue
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
          </div>
          {request.ghArchived ? (
            <p className="border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm">
              This repository is archived on GitHub.
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
          <CardDescription>Requested by {request.requesterName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7">
          <p>{request.description}</p>
          {request.securityNotes ? (
            <div>
              <p className="font-medium">Security notes</p>
              <p className="text-muted-foreground">{request.securityNotes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {report ? (
        <Card>
          <CardHeader>
            <CardTitle>Review summary</CardTitle>
            <CardDescription>
              Donated by{" "}
              <Link className="underline" href={`/users/${report.donorId}`}>
                {report.donorName}
              </Link>
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
