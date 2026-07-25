import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/config";

const NS = getSiteConfig().views.namespace;
const BASE = getSiteConfig().views.baseCount;

async function counterFetch(path: string) {
  const res = await fetch(`https://api.counterapi.dev/v1/${NS}/hits${path}`, {
    redirect: "follow",
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data.count === "number" ? data.count : null;
}

export async function POST() {
  try {
    const current = await counterFetch("");
    if (current === null || current < BASE) {
      await fetch(`https://api.counterapi.dev/v1/${NS}/hits/set?count=${BASE - 1}`, {
        redirect: "follow",
      });
    }
    const count = await counterFetch("/up");
    if (count === null) throw new Error("increment failed");
    return NextResponse.json(
      { count },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      },
    );
  } catch {
    const fallback = await counterFetch("");
    return NextResponse.json({ count: fallback ?? BASE });
  }
}

export async function GET() {
  const count = await counterFetch("");
  return NextResponse.json({ count: count ?? BASE });
}
