"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { APP_ROUTES } from "@/lib/consts";

const ASCII_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=-~^";

function useAsciiFrame(rows: number, cols: number, enabled: boolean) {
  const [frame, setFrame] = useState("");
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const generateFrame = useCallback(() => {
    let result = "";

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = Math.abs(col - cols / 2) / (cols / 2);
        const y = Math.abs(row - rows / 2) / (rows / 2);
        const distance = Math.sqrt(x ** 2 + y ** 2);
        result +=
          Math.random() > distance * 0.72
            ? ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)]
            : " ";
      }

      if (row < rows - 1) result += "\n";
    }

    return result;
  }, [cols, rows]);

  useEffect(() => {
    if (!enabled) {
      setFrame(generateFrame());
      return;
    }

    const animate = (time: number) => {
      if (time - lastTimeRef.current > 144) {
        lastTimeRef.current = time;
        setFrame(generateFrame());
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, generateFrame]);

  return frame;
}

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [asciiSize, setAsciiSize] = useState({ cols: 160, rows: 40 });
  const asciiFrame = useAsciiFrame(asciiSize.rows, asciiSize.cols, motionEnabled);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setMotionEnabled(!mediaQuery.matches);

    updateMotion();
    mediaQuery.addEventListener("change", updateMotion);

    return () => mediaQuery.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const height = sectionRef.current?.offsetHeight ?? window.innerHeight;

      setAsciiSize({
        cols: Math.ceil(window.innerWidth / 8) + 24,
        rows: Math.ceil(height / 18) + 4,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="opensec-hero relative flex min-h-[560px] flex-col items-center justify-center overflow-hidden px-4 py-16 sm:min-h-[644px] sm:py-20 md:min-h-[713px] md:py-24"
    >
      {motionEnabled ? (
        <div className="opensec-scanline pointer-events-none absolute inset-0 z-10 h-[2px] w-full bg-foreground/6" />
      ) : null}

      <div
        className="opensec-ascii-mask pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.055]"
        aria-hidden="true"
      >
        <pre className="w-screen max-w-none select-none font-mono text-xs leading-[18px] text-foreground sm:text-sm lg:text-base lg:leading-[22px]">
          {asciiFrame}
        </pre>
      </div>

      <div className="relative z-20 flex w-full max-w-4xl flex-col items-start gap-8 text-left">
        <div className="opensec-hero-copy flex max-w-4xl flex-col items-start gap-6">
          <a
            className="inline-flex items-center gap-2 border border-border px-3 py-1 font-mono text-xs uppercase text-muted-foreground transition-colors duration-200 hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            href="https://github.com/vercel-labs/deepsec/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="inline-block h-1.5 w-1.5 bg-foreground" />
            <span>powered by vercel deepsec</span>
          </a>

          <h1 className="font-pixel-line text-[1.75rem] font-bold leading-[1.08] tracking-normal text-foreground sm:text-[2.75rem] md:text-5xl lg:text-6xl">
            <span className="sm:whitespace-nowrap">Donate your spare AI usage</span>
            <br />
            <span className="text-muted-foreground sm:whitespace-nowrap">
              for Open Source security
            </span>
          </h1>

          <p className="max-w-prose font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            Request an AI security review for a public GitHub repository. Donors run the report with
            their own Claude or Codex capacity, then submit findings privately to you.
          </p>
        </div>

        <div className="opensec-hero-actions flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-start">
          <Link
            className="group flex items-center justify-center gap-2 border border-foreground bg-foreground px-6 py-3 font-mono font-semibold text-sm text-background transition-all duration-200 hover:bg-transparent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:justify-start"
            href={APP_ROUTES.requestReview}
          >
            Request a review
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              {"->"}
            </span>
          </Link>
          <Link
            className="flex items-center justify-center gap-2 border border-border px-6 py-3 font-mono font-semibold text-sm text-muted-foreground transition-all duration-200 hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:justify-start"
            href={APP_ROUTES.donateReview}
          >
            Donate a review
          </Link>
        </div>
      </div>
    </section>
  );
}
