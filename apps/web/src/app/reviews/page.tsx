import { buttonVariants } from "@deepsec-me/ui/components/button";
import { Card, CardContent } from "@deepsec-me/ui/components/card";
import Link from "next/link";

import { ReviewCard } from "@/components/review-card";
import { getPendingReviews } from "@/lib/reviews";

export default async function ReviewsPage() {
  const reviews = await getPendingReviews();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Pending reviews</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a repo, run DeepSec manually, and submit the Markdown report.
          </p>
        </div>
        <Link className={buttonVariants()} href="/request">
          Request review
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {reviews.length ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              id={review.id}
              repoOwner={review.repoOwner}
              repoName={review.repoName}
              description={review.description}
              ghDescription={review.ghDescription}
              ghStars={review.ghStars}
              ghLanguage={review.ghLanguage}
              ghOwnerAvatarUrl={review.ghOwnerAvatarUrl}
              meta={`requested by ${review.requesterName}`}
            />
          ))
        ) : (
          <Card className="md:col-span-2">
            <CardContent>No pending review requests yet.</CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
