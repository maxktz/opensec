"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@opensec/ui/components/dropdown-menu";
import { Github, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { APP_ROUTES, HOTKEYS } from "@/lib/consts";

const navLinks = [
  { href: APP_ROUTES.repositories, label: "Repositories", number: HOTKEYS.repositories },
  { href: APP_ROUTES.donors, label: "Donors", number: HOTKEYS.donors },
] as const;

type HeaderSession = Awaited<ReturnType<typeof authClient.getSession>>["data"];

export default function Header({
  initialSession = null,
}: {
  initialSession?: HeaderSession | null;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { resolvedTheme, setTheme, theme } = useTheme();
  const currentTheme = resolvedTheme ?? theme;
  const { data: clientSession, isPending } = authClient.useSession();
  const session = isPending ? initialSession : clientSession;
  const githubUsername = session?.user
    ? (session.user as typeof session.user & { githubUsername?: string | null }).githubUsername
    : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  async function signInWithGitHub() {
    await authClient.signIn.social(
      {
        provider: "github",
        callbackURL: APP_ROUTES.home,
      },
      {
        onError: (error) => {
          toast.error(error.error.message || error.error.statusText);
        },
      },
    );
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-border bg-background/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Link
          className="flex items-center gap-2 font-mono text-sm text-foreground transition-all duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          href={APP_ROUTES.home}
        >
          <span className="text-muted-foreground">{">"}</span>
          <span className="font-pixel tracking-wider">opensec.sh</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              className="px-3 py-1.5 font-mono text-xs text-muted-foreground transition-all duration-200 hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
              href={link.href}
            >
              <span className="opacity-50">{link.number.padStart(2, "0")}</span>{" "}
              {link.label.toUpperCase()}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-all duration-200 hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground lg:hidden"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44 bg-popover lg:hidden">
              <DropdownMenuGroup>
                {navLinks.map((link) => (
                  <DropdownMenuItem key={link.href} render={<Link href={link.href} />}>
                    <span className="opacity-50">{link.number.padStart(2, "0")}</span> {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-all duration-200 hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {mounted ? currentTheme === "dark" ? <Sun size={14} /> : <Moon size={14} /> : null}
          </button>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex h-8 min-w-8 items-center justify-center gap-2 border border-border px-1.5 font-mono text-xs text-muted-foreground transition-all duration-200 hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:min-w-24 sm:justify-start sm:px-2"
                  />
                }
              >
                {session.user.image ? (
                  <Image
                    alt={`${session.user.name || "Account"} avatar`}
                    className="size-5 border border-border"
                    src={session.user.image}
                    width={20}
                    height={20}
                  />
                ) : null}
                <span className="hidden max-w-32 truncate sm:inline">
                  {session.user.name || "Account"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44 max-w-72 bg-popover">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="max-w-72 whitespace-normal break-all">
                    {session.user.email || "GitHub account"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    render={
                      <Link href={githubUsername ? `/users/${githubUsername}` : "/users/me"} />
                    }
                  >
                    My profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      authClient.signOut({
                        fetchOptions: {
                          onSuccess: () => router.refresh(),
                        },
                      });
                    }}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              className="flex h-8 min-w-8 items-center justify-center gap-2 border border-border px-2 font-mono text-xs text-muted-foreground transition-all duration-200 hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:min-w-24 sm:justify-start sm:px-3"
              disabled={isPending}
              onClick={signInWithGitHub}
            >
              <Github size={14} />
              <span className="hidden sm:inline">{isPending ? "..." : "Sign in"}</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
