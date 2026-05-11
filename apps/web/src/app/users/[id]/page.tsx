import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@deepsec-me/ui/components/card";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getUserProfile } from "@/lib/reviews";

type UserPageProps = {
  params: Promise<{ id: string }>;
};

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;
  const data = await getUserProfile(id);

  if (!data) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <section>
        <h1 className="text-3xl font-semibold">{data.profile.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {data.donated.length} donated reviews · {data.requested.length} requested reviews
        </p>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Donated reviews</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {data.donated.length ? (
            data.donated.map((review) => (
              <Link key={review.requestId} href={`/reviews/${review.requestId}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle>
                      {review.repoOwner}/{review.repoName}
                    </CardTitle>
                    <CardDescription>
                      {review.provider} · {review.totalCount} total issues
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="md:col-span-2">
              <CardContent>No donated reviews yet.</CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">Requested reviews</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {data.requested.length ? (
            data.requested.map((request) => (
              <Link key={request.id} href={`/reviews/${request.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle>
                      {request.repoOwner}/{request.repoName}
                    </CardTitle>
                    <CardDescription>{request.status}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="md:col-span-2">
              <CardContent>No requested reviews yet.</CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
