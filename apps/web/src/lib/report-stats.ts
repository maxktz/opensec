type ParsedReportStats = {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  informationalCount: number;
  totalCount: number;
};

type ReportSummaryPair = {
  label: string;
  count: number;
};

const emptyStats: ParsedReportStats = {
  criticalCount: 0,
  highCount: 0,
  mediumCount: 0,
  lowCount: 0,
  informationalCount: 0,
  totalCount: 0,
};

function parseCount(value: string) {
  const match = value.replace(/,/g, "").match(/-?\d+/);
  return match ? Number.parseInt(match[0], 10) : null;
}

function normalizeSeverity(value: string) {
  return value
    .replace(/[`*_]/g, "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function applySeverity(stats: ParsedReportStats, severity: string, count: number) {
  if (count <= 0) {
    return;
  }

  switch (normalizeSeverity(severity)) {
    case "CRITICAL":
    case "CRITICAL_BUG":
      stats.criticalCount += count;
      return;
    case "HIGH":
    case "HIGH_BUG":
      stats.highCount += count;
      return;
    case "MEDIUM":
    case "MEDIUM_BUG":
      stats.mediumCount += count;
      return;
    case "LOW":
    case "LOW_BUG":
      stats.lowCount += count;
      return;
    case "INFO":
    case "INFORMATIONAL":
    case "INFO_BUG":
    case "INFORMATIONAL_BUG":
    case "BUG":
      stats.informationalCount += count;
      return;
    default:
      return;
  }
}

function parsePipeTable(markdown: string) {
  const rows = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"));

  if (!rows.length) {
    return [] as string[][];
  }

  return rows
    .map((row) =>
      row
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    )
    .filter((cells) => !cells.every((cell) => /^:?-{3,}:?$/.test(cell)));
}

function parseSummaryPairsFromTable(markdown: string) {
  const lines = markdown.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    if (!/^#{1,6}\s+summary\b/i.test(lines[index].trim())) {
      continue;
    }

    const tableBlock: string[] = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const line = lines[cursor].trim();
      if (!line) {
        if (tableBlock.length) {
          break;
        }
        continue;
      }

      if (line.startsWith("|")) {
        tableBlock.push(line);
        continue;
      }

      if (tableBlock.length) {
        break;
      }
    }

    const rows = parsePipeTable(tableBlock.join("\n"));
    if (!rows.length) {
      continue;
    }

    const [header, ...body] = rows;
    const severityIndex = header.findIndex((cell) => /^severity$/i.test(cell));
    const countIndex = header.findIndex((cell) => /^count$/i.test(cell));

    if (severityIndex === -1 || countIndex === -1) {
      continue;
    }

    const pairs = body
      .map((row) => {
        const label = row[severityIndex]?.trim();
        const count = parseCount(row[countIndex] || "");

        return label && count !== null ? { label, count } : null;
      })
      .filter((value): value is ReportSummaryPair => value !== null);

    if (pairs.length) {
      return pairs;
    }
  }

  return [] as ReportSummaryPair[];
}

function parseSummaryTable(markdown: string, stats: ParsedReportStats) {
  for (const pair of parseSummaryPairsFromTable(markdown)) {
    applySeverity(stats, pair.label, pair.count);
  }
}

function parseFallbackSeverityLines(markdown: string, stats: ParsedReportStats) {
  const patterns = [
    /(?:^|\|)\s*(CRITICAL|HIGH|MEDIUM|LOW|INFO(?:RMATIONAL)?|(?:CRITICAL|HIGH|MEDIUM|LOW|INFO(?:RMATIONAL)?)_BUG|BUG)\s*(?:\||:|-)\s*(\d+)\s*(?:\||$)/gim,
    /^[-*]\s*(CRITICAL|HIGH|MEDIUM|LOW|INFO(?:RMATIONAL)?|(?:CRITICAL|HIGH|MEDIUM|LOW|INFO(?:RMATIONAL)?)_BUG|BUG)\s*[:-]\s*(\d+)$/gim,
  ];

  for (const pattern of patterns) {
    for (const match of markdown.matchAll(pattern)) {
      const severity = match[1];
      const count = parseCount(match[2] || "");
      if (severity && count !== null) {
        applySeverity(stats, severity, count);
      }
    }
  }
}

function parseTotalFindings(markdown: string) {
  const tableRows = parsePipeTable(markdown);

  for (const row of tableRows) {
    if (row.length < 2) {
      continue;
    }

    if (/^total findings$/i.test(row[0])) {
      const count = parseCount(row[1]);
      if (count !== null) {
        return count;
      }
    }
  }

  const fallbackPatterns = [/total findings\s*[:|-]?\s*(\d+)/i, /findings total\s*[:|-]?\s*(\d+)/i];

  for (const pattern of fallbackPatterns) {
    const match = markdown.match(pattern);
    const count = match?.[1] ? parseCount(match[1]) : null;
    if (count !== null) {
      return count;
    }
  }

  return null;
}

export function parseReportStats(markdown: string): ParsedReportStats {
  const stats = { ...emptyStats };

  parseSummaryTable(markdown, stats);
  const parsedSummaryTotal =
    stats.criticalCount +
    stats.highCount +
    stats.mediumCount +
    stats.lowCount +
    stats.informationalCount;

  if (parsedSummaryTotal === 0) {
    parseFallbackSeverityLines(markdown, stats);
  }

  const parsedTotal = parseTotalFindings(markdown);
  const severityTotal =
    stats.criticalCount +
    stats.highCount +
    stats.mediumCount +
    stats.lowCount +
    stats.informationalCount;

  stats.totalCount = parsedTotal ?? severityTotal;

  return stats;
}

export function parseReportSummaryPairs(markdown: string) {
  const summaryPairs = parseSummaryPairsFromTable(markdown);

  if (summaryPairs.length) {
    return summaryPairs;
  }

  const pairs: ReportSummaryPair[] = [];
  const seen = new Set<string>();
  const patterns = [
    /(?:^|\|)\s*(CRITICAL|HIGH|MEDIUM|LOW|INFO(?:RMATIONAL)?|(?:CRITICAL|HIGH|MEDIUM|LOW|INFO(?:RMATIONAL)?)_BUG|BUG)\s*(?:\||:|-)\s*(\d+)\s*(?:\||$)/gim,
    /^[-*]\s*(CRITICAL|HIGH|MEDIUM|LOW|INFO(?:RMATIONAL)?|(?:CRITICAL|HIGH|MEDIUM|LOW|INFO(?:RMATIONAL)?)_BUG|BUG)\s*[:-]\s*(\d+)$/gim,
  ];

  for (const pattern of patterns) {
    for (const match of markdown.matchAll(pattern)) {
      const label = match[1]?.trim();
      const count = parseCount(match[2] || "");

      if (!label || count === null) {
        continue;
      }

      const key = normalizeSeverity(label);
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      pairs.push({ label, count });
    }
  }

  return pairs;
}

export type { ParsedReportStats, ReportSummaryPair };
