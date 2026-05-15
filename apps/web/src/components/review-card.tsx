import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@opensec/ui/components/card";
import { Badge } from "@opensec/ui/components/badge";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ReviewCardProps = {
  repoSlug: string;
  repoOwner: string;
  repoName: string;
  notes?: string | null;
  verificationLevel?: "unverified" | "contributor" | "maintainer";
  locTotal?: number | null;
  locFiles?: number | null;
  ghDescription?: string | null;
  ghStars?: number | null;
  ghLanguage?: string | null;
  ghOwnerAvatarUrl?: string | null;
  meta?: string;
};

function formatCount(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: value >= 1000 ? "compact" : "standard",
  })
    .format(value)
    .toLowerCase();
}

function verificationLabel(level?: "unverified" | "contributor" | "maintainer") {
  if (level === "maintainer") {
    return "Verified maintainer";
  }

  if (level === "contributor") {
    return "Verified contributor";
  }

  return "Unverified request";
}

function verificationClassName(level?: "unverified" | "contributor" | "maintainer") {
  if (level === "maintainer") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (level === "contributor") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300";
  }

  return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

export function ReviewCard({
  repoSlug,
  repoOwner,
  repoName,
  notes,
  verificationLevel,
  locTotal,
  locFiles,
  ghDescription,
  ghStars,
  ghLanguage,
  ghOwnerAvatarUrl,
  meta,
}: ReviewCardProps) {
  const summary = ghDescription || notes;

  return (
    <Link href={`/repos/${repoSlug}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {ghOwnerAvatarUrl ? (
                <Image
                  alt={`${repoOwner} avatar`}
                  className="size-9 border"
                  src={ghOwnerAvatarUrl}
                  width={36}
                  height={36}
                />
              ) : null}
              <div className="min-w-0">
                <CardTitle className="truncate">
                  {repoOwner}/{repoName}
                </CardTitle>
                {meta ? <CardDescription>{meta}</CardDescription> : null}
              </div>
            </div>
            {typeof ghStars === "number" ? (
              <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3.5" />
                <span>{formatCount(ghStars)}</span>
              </div>
            ) : null}
          </div>
        </CardHeader>
        {summary || typeof ghStars === "number" || ghLanguage || typeof locTotal === "number" ? (
          <CardContent className="space-y-3 text-muted-foreground">
            {summary ? <p>{summary}</p> : null}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline" className={verificationClassName(verificationLevel)}>
                {verificationLabel(verificationLevel)}
              </Badge>
              {ghLanguage ? <span>{ghLanguage}</span> : null}
              {typeof locTotal === "number" ? <span>{formatCount(locTotal)} LOC</span> : null}
              {typeof locFiles === "number" ? <span>{formatCount(locFiles)} files</span> : null}
            </div>
          </CardContent>
        ) : null}
      </Card>
    </Link>
  );
}
