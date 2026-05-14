"use client";

import { Button } from "@opensec/ui/components/button";
import { Check, Copy } from "lucide-react";

import { useCopy } from "@/lib/use-copy";

type CopyMarkdownButtonProps = {
  markdown: string;
};

export function CopyMarkdownButton({ markdown }: CopyMarkdownButtonProps) {
  const { copied, copy } = useCopy(markdown, {
    successMessage: "Markdown copied",
    errorMessage: "Could not copy Markdown",
  });
  const Icon = copied ? Check : Copy;
  const label = copied ? "Copied" : "Copy";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="bg-background/95 shadow-sm backdrop-blur"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy markdown"}
      aria-live="polite"
    >
      <Icon className="size-3.5" />
      {label}
    </Button>
  );
}
