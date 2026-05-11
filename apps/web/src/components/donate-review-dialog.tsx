"use client";

import { submitReviewReport } from "@/app/actions";
import { Button } from "@deepsec-me/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@deepsec-me/ui/components/dialog";
import { Input } from "@deepsec-me/ui/components/input";
import { Label } from "@deepsec-me/ui/components/label";

type DonateReviewDialogProps = {
  requestId: string;
  repoUrl: string;
};

export function DonateReviewDialog({ requestId, repoUrl }: DonateReviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={<Button size="lg" />}>Donate a review</DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Donate a review</DialogTitle>
          <DialogDescription>
            Run DeepSec locally, then paste the final Markdown report. The full report stays
            private.
          </DialogDescription>
        </DialogHeader>

        <div className="border bg-muted/30 p-4 font-mono text-xs">deepsec {repoUrl}</div>

        <form action={submitReviewReport} className="space-y-5">
          <input type="hidden" name="requestId" value={requestId} />
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
              <Input
                id="modelName"
                name="modelName"
                placeholder="Claude Opus 4.5, GPT-5.1 Codex..."
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="criticalCount">Critical</Label>
              <Input
                id="criticalCount"
                name="criticalCount"
                type="number"
                min="0"
                defaultValue="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="highCount">High</Label>
              <Input id="highCount" name="highCount" type="number" min="0" defaultValue="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mediumCount">Medium</Label>
              <Input id="mediumCount" name="mediumCount" type="number" min="0" defaultValue="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowCount">Low</Label>
              <Input id="lowCount" name="lowCount" type="number" min="0" defaultValue="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="informationalCount">Info</Label>
              <Input
                id="informationalCount"
                name="informationalCount"
                type="number"
                min="0"
                defaultValue="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="markdown">DeepSec Markdown report</Label>
            <textarea
              id="markdown"
              name="markdown"
              className="min-h-80 w-full border bg-transparent p-3 font-mono text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>

          <Button type="submit">Submit private report</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
