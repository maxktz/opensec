export const SITE_LINKS = {
  github: "https://github.com/maxktz/opensec",
  author: "https://x.com/maxk4tz",
} as const;

export const APP_ROUTES = {
  home: "/",
  repositories: "/repos",
  donors: "/donors",
  requestReview: "/request",
  donateReview: "/repos",
} as const;

export const HOTKEYS = {
  home: "0",
  repositories: "1",
  donors: "2",
  theme: "M",
  requestReview: "R",
  donateReview: "D",
} as const;

export const DONOR_MEDALS = [
  { ring: "border-[#FFD700]", text: "text-[#FFD700]", label: "GOLD" },
  { ring: "border-[#C0C0C0]", text: "text-[#C0C0C0]", label: "SILVER" },
  { ring: "border-[#CD7F32]", text: "text-[#CD7F32]", label: "BRONZE" },
] as const;
