"use client";

import { Button } from "@deepsec-me/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@deepsec-me/ui/components/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import Loader from "@/components/loader";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Loader />;
  }

  if (session) {
    router.push("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in to DeepSec.me</CardTitle>
          <CardDescription>
            Use GitHub to request and donate open source security reviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={async () => {
              await authClient.signIn.social(
                {
                  provider: "github",
                  callbackURL: "/",
                },
                {
                  onError: (error) => {
                    toast.error(error.error.message || error.error.statusText);
                  },
                },
              );
            }}
          >
            Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
