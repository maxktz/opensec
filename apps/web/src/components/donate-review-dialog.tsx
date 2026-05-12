"use client";

import { submitReviewReport } from "@/app/actions";
import { Button } from "@opensec/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@opensec/ui/components/dialog";
import { Input } from "@opensec/ui/components/input";
import { Label } from "@opensec/ui/components/label";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type DonateReviewDialogProps = {
  repositoryId: string;
  repoUrl: string;
};

export function DonateReviewDialog({ repositoryId, repoUrl }: DonateReviewDialogProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: submitReviewReport,
    onSuccess: (result) => {
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setError(null);
      router.push(result.redirectTo as Route);
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Failed to submit report.");
    },
  });

  return (
    <Dialog>
      <DialogTrigger render={<Button size="lg" />}>Submit an audit</DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Submit a review</DialogTitle>
          <DialogDescription>
            Run your preferred security review workflow, then paste the final Markdown report. The
            full report stays private. Severity totals are parsed automatically when possible.
          </DialogDescription>
        </DialogHeader>

        <div className="border bg-muted/30 p-4 font-mono text-xs">Repository: {repoUrl}</div>

        <form
          ref={formRef}
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);

            if (!formRef.current) {
              setError("Form is not ready. Please try again.");
              return;
            }

            mutation.mutate(new FormData(formRef.current));
          }}
        >
          <input type="hidden" name="repositoryId" value={repositoryId} />
          {error ? (
            <p className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <select
                id="provider"
                name="provider"
                className="h-8 w-full border bg-background px-2 text-xs"
              >
                <option value="claude">Claude</option>
                <option value="codex">Codex</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelName">Model name</Label>
              <Input id="modelName" name="modelName" placeholder="Opus 4.5, GPT-5.5..." required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="markdown">Markdown report</Label>
            <textarea
              id="markdown"
              name="markdown"
              className="min-h-80 w-full border bg-transparent p-3 font-mono text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder={`# Vulnerability Scan Report

| Field | Value |
|-------|-------|
| Total findings | 25 |

## Summary

| Severity | Count |
|----------|-------|
| HIGH | 1 |
| MEDIUM | 14 |`}
              required
            />
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {mutation.isPending ? "Submitting report..." : "Submit private report"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
