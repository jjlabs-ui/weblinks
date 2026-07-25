import { NextRequest, NextResponse } from "next/server";

export const revalidate = 300;

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ error: "username required" }, { status: 400 });
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 300 },
      }),
      fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=1`,
        {
          headers: { Accept: "application/vnd.github+json" },
          next: { revalidate: 300 },
        },
      ),
    ]);

    if (!userRes.ok) throw new Error("GitHub user fetch failed");

    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];
    const lastRepo = repos[0];

    const langRes = await fetch(
      `https://api.github.com/users/${username}/repos?sort=stars&per_page=6`,
      { next: { revalidate: 600 } },
    );
    const langRepos = langRes.ok ? await langRes.json() : [];
    const langSet = new Set<string>();
    for (const repo of langRepos) {
      if (repo.language) langSet.add(repo.language);
    }

    return NextResponse.json({
      repos: user.public_repos ?? 0,
      followers: user.followers ?? 0,
      languages: Array.from(langSet).slice(0, 4),
      lastRepo: lastRepo
        ? {
            name: lastRepo.name,
            description: lastRepo.description || "",
            url: lastRepo.html_url,
            language: lastRepo.language,
          }
        : undefined,
    });
  } catch {
    return NextResponse.json({
      repos: 0,
      followers: 0,
      languages: [],
    });
  }
}
