import type { Metadata } from "next";
import Link from "next/link";

import { DONOR_MEDALS } from "@/lib/consts";
import { getTopDonors } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Donors",
  description: "People donating spare AI usage to open source security reviews on OpenSec.",
  alternates: {
    canonical: "/donors",
  },
};

export const dynamic = "force-dynamic";

export default async function DonorsPage() {
  const donors = await getTopDonors();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
      <div>
        <h1 className="font-pixel-line text-3xl font-bold text-foreground sm:text-4xl">Donors</h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          People donating spare AI usage to open source security reviews.
        </p>
      </div>

      {donors.length ? (
        <div className="border border-border">
          <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 border-b border-border bg-muted/30 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:gap-4 sm:px-5">
            <span>Rank</span>
            <span>Donor</span>
            <span>Reviews</span>
          </div>

          <ul>
            {donors.map((donor, index) => {
              const medal = DONOR_MEDALS[index];
              const rank = String(index + 1).padStart(2, "0");
              const avatarRing = medal
                ? `border-2 ${medal.ring}`
                : "border border-border";
              const rankText = medal ? `${medal.text} font-semibold` : "text-muted-foreground";

              const row = (
                <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 px-4 py-3 transition-colors group-hover:bg-muted/40 sm:gap-4 sm:px-5">
                  <span
                    className={`font-mono text-sm tabular-nums ${rankText}`}
                    aria-label={medal ? `${medal.label} medal, rank ${index + 1}` : `Rank ${index + 1}`}
                  >
                    {rank}
                  </span>

                  <div className="flex items-center gap-3 min-w-0">
                    {donor.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={donor.name ? `${donor.name}'s avatar` : "Donor avatar"}
                        src={donor.image}
                        className={`size-9 shrink-0 ${avatarRing}`}
                      />
                    ) : (
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center font-mono text-sm uppercase text-muted-foreground ${avatarRing}`}
                      >
                        {donor.name?.slice(0, 1) ?? "?"}
                      </span>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-mono text-sm text-foreground">
                        {donor.name}
                      </span>
                      {donor.githubUsername ? (
                        <span className="truncate font-mono text-xs text-muted-foreground">
                          @{donor.githubUsername}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="text-base text-foreground tabular-nums sm:text-lg">
                      {donor.reviews}
                    </span>
                    <span className="hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
                      donated
                    </span>
                  </div>
                </div>
              );

              return (
                <li
                  key={donor.id}
                  className={index === donors.length - 1 ? "" : "border-b border-border"}
                >
                  {donor.githubUsername ? (
                    <Link
                      href={`/users/${donor.githubUsername}`}
                      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className="group">{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="border border-border px-5 py-10 text-center font-mono">
          <p className="text-sm text-foreground">No donors yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Donated reviews will appear here.
          </p>
        </div>
      )}
    </main>
  );
}
