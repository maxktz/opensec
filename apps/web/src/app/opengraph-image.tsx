import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "OpenSec - Donated Security Reviews for Open Source";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ASCII_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=-~^";

function generateAsciiFrame(rows: number, cols: number) {
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
}

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
    { headers: { "User-Agent": "Mozilla/5.0" } },
  ).then((r) => r.text());
  const latinMatch = css.match(/\/\* latin \*\/[\s\S]*?url\((https:\/\/[^)]+)\)/);
  const url = latinMatch?.[1] ?? css.match(/url\((https:\/\/[^)]+)\)/)?.[1];
  if (!url) throw new Error(`Failed to resolve ${family} font URL`);
  return fetch(url).then((r) => r.arrayBuffer());
}

export default async function Image() {
  const [geistRegular, geistBold, geistPixelSquare, silkscreen] = await Promise.all([
    loadGoogleFont("Geist Mono", 400),
    loadGoogleFont("Geist Mono", 700),
    readFile(path.join(process.cwd(), "src/fonts/GeistPixel-Square.ttf")),
    loadGoogleFont("Silkscreen", 400),
  ]);

  const ascii = generateAsciiFrame(40, 160);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000000",
          color: "#ffffff",
          fontFamily: "Geist Mono",
          display: "flex",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: "Geist Mono",
              fontSize: 14,
              lineHeight: "16px",
              color: "#ffffff",
              opacity: 0.05,
              whiteSpace: "pre",
            }}
          >
            {ascii}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            padding: "56px 64px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #2a2a2a",
                padding: "8px 14px",
              }}
            >
              <span
                style={{
                  display: "flex",
                  width: 8,
                  height: 8,
                  background: "#ffffff",
                  marginRight: 12,
                }}
              />
              <span
                style={{
                  display: "flex",
                  fontSize: 16,
                  color: "#9a9a9a",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                powered by vercel deepsec
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  display: "flex",
                  fontSize: 28,
                  color: "#6b6b6b",
                  marginRight: 14,
                }}
              >
                {">"}
              </span>
              <span
                style={{
                  display: "flex",
                  fontFamily: "Silkscreen",
                  fontSize: 28,
                  letterSpacing: "0.06em",
                  color: "#ffffff",
                }}
              >
                opensec.sh
              </span>
            </div>
          </div>

          <div style={{ display: "flex", marginTop: 80, flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontFamily: "Geist Pixel Square",
                fontWeight: 500,
                fontSize: 64,
                lineHeight: 1.12,
                letterSpacing: "-0.01em",
              }}
            >
              <span style={{ display: "flex", color: "#ffffff" }}>
                Donate your spare AI usage
              </span>
              <span style={{ display: "flex", color: "#6b6b6b", marginTop: 6 }}>
                for Open Source security
              </span>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 22,
                lineHeight: 1.5,
                color: "#9a9a9a",
                maxWidth: 940,
              }}
            >
              Request an AI security review for a public GitHub repository. Donors run the report
              with their own Claude or Codex capacity, then submit findings privately to you.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist Mono", data: geistRegular, style: "normal", weight: 400 },
        { name: "Geist Mono", data: geistBold, style: "normal", weight: 700 },
        { name: "Geist Pixel Square", data: geistPixelSquare, style: "normal", weight: 500 },
        { name: "Silkscreen", data: silkscreen, style: "normal", weight: 400 },
      ],
    },
  );
}
