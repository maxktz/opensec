import { buttonVariants } from "@deepsec-me/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@deepsec-me/ui/components/card";
import { Star } from "lucide-react";
import Link from "next/link";

import { ReviewCard } from "@/components/review-card";
import { getLandingData } from "@/lib/reviews";

function SeverityPills({
  review,
}: {
  review: { criticalCount: number; highCount: number; totalCount: number };
}) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="border px-2 py-1">{review.totalCount} total</span>
      <span className="border px-2 py-1">{review.criticalCount} critical</span>
      <span className="border px-2 py-1">{review.highCount} high</span>
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

export default async function Home() {
  const { pending, completed, topDonors } = await getLandingData();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div className="space-y-6">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            DeepSec.me
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Crowdfunded AI security reviews for open source.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Request a DeepSec review for a public GitHub repository. Donors run the report with
            their own Claude or Codex capacity, then submit private findings and public-safe stats.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className={buttonVariants({ size: "lg" })} href="/request">
              Request a review
            </Link>
            <Link className={buttonVariants({ variant: "outline", size: "lg" })} href="/reviews">
              Donate a review
            </Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>Manual first, trusted later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>1. Someone requests a public repo review.</p>
            <p>2. A donor runs DeepSec locally with their agent.</p>
            <p>3. The full Markdown stays private; public pages show only summary stats.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Needs Review</h2>
          <Link className="text-sm underline" href="/reviews">
            View all
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {pending.length ? (
            pending.map((request) => (
              <ReviewCard
                key={request.id}
                id={request.id}
                repoOwner={request.repoOwner}
                repoName={request.repoName}
                description={request.description}
                ghDescription={request.ghDescription}
                ghStars={request.ghStars}
                ghLanguage={request.ghLanguage}
                ghOwnerAvatarUrl={request.ghOwnerAvatarUrl}
                meta={`requested by ${request.requesterName}`}
              />
            ))
          ) : (
            <Card className="md:col-span-3">
              <CardContent>No pending requests yet.</CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Recent Donations</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {completed.length ? (
            completed.map((review) => (
              <Link key={review.id} href={`/reviews/${review.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        {review.ghOwnerAvatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img alt="" className="size-9 border" src={review.ghOwnerAvatarUrl} />
                        ) : null}
                        <div>
                          <CardTitle>
                            {review.repoOwner}/{review.repoName}
                          </CardTitle>
                          <CardDescription>
                            donated by {review.donorName} with {review.provider}
                          </CardDescription>
                        </div>
                      </div>
                      {typeof review.ghStars === "number" ? (
                        <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                          <Star className="size-3.5" />
                          <span>{formatCount(review.ghStars)}</span>
                        </div>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <SeverityPills review={review} />
                    {review.ghLanguage ? (
                      <div className="text-xs text-muted-foreground">{review.ghLanguage}</div>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="md:col-span-3">
              <CardContent>No completed reviews yet.</CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Top Donors</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {topDonors.length ? (
            topDonors.map((donor) => (
              <Link key={donor.id} href={`/users/${donor.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle>{donor.name}</CardTitle>
                    <CardDescription>{donor.reviews} donated reviews</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="md:col-span-3">
              <CardContent>No donors yet.</CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
