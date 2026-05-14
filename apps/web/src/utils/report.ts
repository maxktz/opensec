function stripInlineMarkdown(value: string) {
  return value
    .trim()
    .replace(/^`+|`+$/g, "")
    .replace(/^\*\*|\*\*$/g, "")
    .trim();
}

export function normalizeReportProjectName(value: string) {
  const cleaned = stripInlineMarkdown(value).replace(/\.git$/i, "");
  const parts = cleaned.split("/").filter(Boolean);
  return (parts.at(-1) ?? cleaned).toLowerCase();
}

export function parseReportProject(markdown: string) {
  for (const line of markdown.split(/\r?\n/)) {
    const cells = line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

    if (cells.length >= 2 && /^project$/i.test(stripInlineMarkdown(cells[0] || ""))) {
      return stripInlineMarkdown(cells[1] || "");
    }
  }

  const match = markdown.match(/^\s*(?:[-*]\s*)?(?:\*\*)?project(?:\*\*)?\s*:\s*(.+)$/im);
  return match?.[1] ? stripInlineMarkdown(match[1]) : null;
}
