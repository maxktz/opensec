import { env } from "@deepsec-me/env/server";

export function parseGithubRepoUrl(value: string) {
  const url = new URL(value.trim());

  if (url.hostname !== "github.com") {
    throw new Error("Use a github.com repository URL.");
  }

  const [owner, repo] = url.pathname.replace(/^\/+/, "").split("/");

  if (!owner || !repo) {
    throw new Error("Use a full GitHub repository URL like https://github.com/owner/repo.");
  }

  const repoName = repo.replace(/\.git$/, "");

  return {
    owner,
    repo: repoName,
    repoUrl: `https://github.com/${owner}/${repoName}`,
  };
}

type GithubRepoResponse = {
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics?: string[];
  license: { spdx_id: string | null } | null;
  default_branch: string | null;
  pushed_at: string | null;
  homepage: string | null;
  archived: boolean;
  owner: {
    avatar_url: string | null;
    type: string | null;
  };
};

export async function fetchGithubRepoMetadata(owner: string, repo: string) {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as GithubRepoResponse;

    return {
      ghDescription: data.description,
      ghStars: data.stargazers_count,
      ghForks: data.forks_count,
      ghOpenIssues: data.open_issues_count,
      ghLanguage: data.language,
      ghTopics: data.topics ?? [],
      ghLicense: data.license?.spdx_id ?? null,
      ghDefaultBranch: data.default_branch,
      ghPushedAt: data.pushed_at ? new Date(data.pushed_at) : null,
      ghOwnerAvatarUrl: data.owner.avatar_url,
      ghOwnerType: data.owner.type,
      ghHomepage: data.homepage,
      ghArchived: data.archived,
      ghFetchedAt: new Date(),
    };
  } catch {
    return null;
  }
}
