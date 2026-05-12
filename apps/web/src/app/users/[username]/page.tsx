import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@opensec/ui/components/card";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getUserProfile } from "@/lib/reviews";

type UserPageProps = {
  params: Promise<{ username: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getUserProfile(username);

  if (!data) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: data.profile.name || "OpenSec User",
    description: `${data.profile.name || "This user"} has donated ${data.donated.length} reviews and requested ${data.requested.length} reviews on OpenSec.`,
    alternates: {
      canonical: `/users/${username}`,
    },
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;
  const data = await getUserProfile(username);

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
              <Link key={review.repositoryId} href={`/repos/${review.repoSlug}`}>
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
              <Link key={request.id} href={`/repos/${request.repoSlug}`}>
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
