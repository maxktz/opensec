"use client";

import { createReviewRequest } from "@/app/actions";
import { Button } from "@opensec/ui/components/button";
import { Input } from "@opensec/ui/components/input";
import { Label } from "@opensec/ui/components/label";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function RequestReviewForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: createReviewRequest,
    onSuccess: (result) => {
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setError(null);
      router.push(result.redirectTo as Route);
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error ? mutationError.message : "Failed to create request.",
      );
    },
  });

  return (
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
      {error ? (
        <p className="border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="repoUrl">
          GitHub repository URL
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </Label>
        <Input id="repoUrl" name="repoUrl" placeholder="https://github.com/owner/repo" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">
          Note for reviewer
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </Label>
        <textarea
          id="notes"
          name="notes"
          className="min-h-40 w-full border bg-transparent p-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Anything specific reviewer should know about or pass to the prompt?"
          required
        />
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {mutation.isPending ? "Creating request..." : "Create request"}
      </Button>
    </form>
  );
}
