import { ImageResponse } from "next/og";

import { getTopDonors } from "@/lib/reviews";

export const runtime = "nodejs";
export const alt = "OpenSec Donors Leaderboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

const MEDALS = [
  { ring: "#FFD700", text: "#FFD700" },
  { ring: "#C0C0C0", text: "#C0C0C0" },
  { ring: "#CD7F32", text: "#CD7F32" },
] as const;

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
    { headers: { "User-Agent": "Mozilla/5.0" } },
  ).then((r) => r.text());
  const url = css.match(/url\((https:\/\/[^)]+)\)/)?.[1];
  if (!url) throw new Error(`Failed to resolve ${family} font URL`);
  return fetch(url).then((r) => r.arrayBuffer());
}

export default async function Image() {
  const [allDonors, geistRegular, geistBold, silkscreen] = await Promise.all([
    getTopDonors(3),
    loadGoogleFont("Geist Mono", 400),
    loadGoogleFont("Geist Mono", 700),
    loadGoogleFont("Silkscreen", 700),
  ]);
  const donors = allDonors.slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000000",
          color: "#ffffff",
          fontFamily: "Geist Mono",
          padding: "56px 64px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 40,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}>
              Donors
            </div>
            <div style={{ marginTop: 14, fontSize: 22, color: "#9a9a9a" }}>
              People donating spare AI usage to open source security reviews.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ display: "flex", fontSize: 28, color: "#6b6b6b", marginRight: 14 }}>
              {">"}
            </span>
            <span
              style={{
                display: "flex",
                fontFamily: "Silkscreen",
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: "0.06em",
                color: "#ffffff",
              }}
            >
              opensec.sh
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            border: "1px solid #2a2a2a",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 24px",
              borderBottom: "1px solid #2a2a2a",
              background: "rgba(255,255,255,0.03)",
              fontSize: 13,
              color: "#9a9a9a",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}
          >
            <div style={{ display: "flex", width: 96 }}>Rank</div>
            <div style={{ display: "flex", flex: 1 }}>Donor</div>
            <div style={{ display: "flex" }}>Reviews</div>
          </div>

          {donors.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                padding: "60px 24px",
              }}
            >
              <div style={{ display: "flex", fontSize: 28, color: "#ffffff" }}>No donors yet</div>
              <div style={{ display: "flex", marginTop: 8, fontSize: 18, color: "#9a9a9a" }}>
                Donated reviews will appear here.
              </div>
            </div>
          ) : (
            donors.map((donor, index) => {
              const medal = MEDALS[index];
              const rank = String(index + 1).padStart(2, "0");
              const isLast = index === donors.length - 1;
              const avatarBorder = medal ? `2px solid ${medal.ring}` : "1px solid #2a2a2a";

              return (
                <div
                  key={donor.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "18px 24px",
                    borderBottom: isLast ? "none" : "1px solid #2a2a2a",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: 96,
                      fontSize: 28,
                      color: medal?.text ?? "#9a9a9a",
                      fontWeight: medal ? 700 : 400,
                    }}
                  >
                    {rank}
                  </div>

                  <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
                    {donor.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt=""
                        src={donor.image}
                        width={64}
                        height={64}
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: "cover",
                          border: avatarBorder,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          width: 64,
                          height: 64,
                          alignItems: "center",
                          justifyContent: "center",
                          border: avatarBorder,
                          color: "#9a9a9a",
                          fontSize: 24,
                          textTransform: "uppercase",
                        }}
                      >
                        {(donor.name ?? "?").slice(0, 1)}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        marginLeft: 20,
                        maxWidth: 620,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          fontSize: 28,
                          color: "#ffffff",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {donor.name}
                      </div>
                      {donor.githubUsername ? (
                        <div
                          style={{
                            display: "flex",
                            marginTop: 4,
                            fontSize: 18,
                            color: "#9a9a9a",
                          }}
                        >
                          @{donor.githubUsername}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <div
                      style={{
                        display: "flex",
                        fontSize: 30,
                        lineHeight: 1,
                        color: "#ffffff",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {donor.reviews}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        marginLeft: 12,
                        marginBottom: 4,
                        fontSize: 14,
                        lineHeight: 1,
                        color: "#9a9a9a",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }}
                    >
                      donated
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist Mono", data: geistRegular, style: "normal", weight: 400 },
        { name: "Geist Mono", data: geistBold, style: "normal", weight: 700 },
        { name: "Silkscreen", data: silkscreen, style: "normal", weight: 700 },
      ],
    },
  );
}
