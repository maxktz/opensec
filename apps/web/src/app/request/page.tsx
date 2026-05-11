import { auth } from "@deepsec-me/auth";
import { Button } from "@deepsec-me/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@deepsec-me/ui/components/card";
import { Input } from "@deepsec-me/ui/components/input";
import { Label } from "@deepsec-me/ui/components/label";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createReviewRequest } from "@/app/actions";

export default async function RequestPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Request a DeepSec review</CardTitle>
          <CardDescription>
            Submit a public GitHub repository. The full report will stay private to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createReviewRequest} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="repoUrl">GitHub repository URL</Label>
              <Input
                id="repoUrl"
                name="repoUrl"
                placeholder="https://github.com/owner/repo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Project description</Label>
              <textarea
                id="description"
                name="description"
                className="min-h-28 w-full border bg-transparent p-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="What does this project do?"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="securityNotes">Security-sensitive areas</Label>
              <textarea
                id="securityNotes"
                name="securityNotes"
                className="min-h-28 w-full border bg-transparent p-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Auth, payments, webhooks, file uploads, secrets handling..."
              />
            </div>
            <Button type="submit">Create request</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
