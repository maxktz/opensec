import Image from "next/image";

import { getCachedLandingData } from "@/lib/reviews";

function toDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}

function formatRelativeTime(value: Date | null) {
  if (!value) {
    return "recently";
  }

  const diffMs = value.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}

function Avatar({ image, label }: { image?: string | null; label: string }) {
  if (image) {
    return (
      <Image
        alt={`${label} avatar`}
        className="size-5 border border-border"
        src={image}
        width={20}
        height={20}
      />
    );
  }

  return (
    <span className="flex size-5 items-center justify-center border border-border text-[10px] uppercase">
      {label.slice(0, 1)}
    </span>
  );
}

export async function EventTicker() {
  const { pending, completed } = await getCachedLandingData();

  const events = [
    ...completed.map((review) => {
      const completedAt = toDate(review.completedAt);

      return {
        id: `completed-${review.id}`,
        user: review.donorName || "Anonymous donor",
        userAvatar: review.donorImage,
        action: "donated a review to",
        repo: `${review.repoOwner}/${review.repoName}`,
        repoAvatar: review.ghOwnerAvatarUrl,
        time: formatRelativeTime(completedAt),
        createdAt: completedAt?.getTime() ?? 0,
      };
    }),
    ...pending.map((review) => {
      const createdAt = toDate(review.createdAt);

      return {
        id: `pending-${review.id}`,
        user: review.requesterName || "Anonymous requester",
        userAvatar: review.requesterImage,
        action: "requested a review for",
        repo: `${review.repoOwner}/${review.repoName}`,
        repoAvatar: review.ghOwnerAvatarUrl,
        time: formatRelativeTime(createdAt),
        createdAt: createdAt?.getTime() ?? 0,
      };
    }),
  ]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 8);

  if (!events.length) {
    return null;
  }

  return (
    <section
      className="max-w-screen overflow-hidden border-y border-border bg-background py-3"
      aria-label="Latest activity"
    >
      <div className="opensec-event-ticker flex w-max gap-8 whitespace-nowrap">
        {[...events, ...events].map((event, index) => (
          <div
            key={`${event.id}-${index}`}
            className="flex items-center gap-2 font-mono text-xs text-muted-foreground"
          >
            <Avatar image={event.userAvatar} label={event.user} />
            <span className="text-foreground">{event.user}</span>
            <span>{event.action}</span>
            <Avatar image={event.repoAvatar} label={event.repo} />
            <span className="text-foreground">{event.repo}</span>
            <span className="text-border">///</span>
            <span>{event.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
