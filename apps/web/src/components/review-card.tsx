import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@deepsec-me/ui/components/card";
import { Star } from "lucide-react";
import Link from "next/link";

type ReviewCardProps = {
  id: string;
  repoOwner: string;
  repoName: string;
  description?: string | null;
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

export function ReviewCard({
  id,
  repoOwner,
  repoName,
  description,
  ghDescription,
  ghStars,
  ghLanguage,
  ghOwnerAvatarUrl,
  meta,
}: ReviewCardProps) {
  const summary = ghDescription || description;

  return (
    <Link href={`/reviews/${id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {ghOwnerAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="" className="size-9 border" src={ghOwnerAvatarUrl} />
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
        {summary || typeof ghStars === "number" || ghLanguage ? (
          <CardContent className="space-y-3 text-muted-foreground">
            {summary ? <p>{summary}</p> : null}
            {ghLanguage ? <div className="text-xs">{ghLanguage}</div> : null}
          </CardContent>
        ) : null}
      </Card>
    </Link>
  );
}
