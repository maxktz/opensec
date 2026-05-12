import { Card, CardDescription, CardHeader, CardTitle } from "@opensec/ui/components/card";
import type { Metadata } from "next";
import Link from "next/link";

import { getTopDonors } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Donors",
  description: "People donating spare AI usage to open source security reviews on OpenSec.",
  alternates: {
    canonical: "/donors",
  },
};

export default async function DonorsPage() {
  const donors = await getTopDonors();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold">Donors</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          People donating spare AI usage to open source security reviews.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {donors.length ? (
          donors.map((donor) =>
            donor.githubUsername ? (
              <Link key={donor.id} href={`/users/${donor.githubUsername}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle>{donor.name}</CardTitle>
                    <CardDescription>{donor.reviews} donated reviews</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ) : (
              <Card key={donor.id} className="transition-colors">
                <CardHeader>
                  <CardTitle>{donor.name}</CardTitle>
                  <CardDescription>{donor.reviews} donated reviews</CardDescription>
                </CardHeader>
              </Card>
            ),
          )
        ) : (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>No donors yet</CardTitle>
              <CardDescription>Donated reviews will appear here.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </main>
  );
}
