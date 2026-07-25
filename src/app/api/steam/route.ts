import { NextRequest, NextResponse } from "next/server";

export const revalidate = 120;

function readCdata(xml: string, tag: string): string {
  const cdata = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`));
  if (cdata?.[1]) return cdata[1].trim();
  const plain = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return plain?.[1]?.trim() ?? "";
}

export async function GET(request: NextRequest) {
  const steamId = request.nextUrl.searchParams.get("steamId");
  if (!steamId) {
    return NextResponse.json({ error: "steamId required" }, { status: 400 });
  }

  try {
    const xmlRes = await fetch(
      `https://steamcommunity.com/profiles/${steamId}?xml=1`,
      { next: { revalidate: 120 } },
    );
    const xml = await xmlRes.text();

    const onlineState = readCdata(xml, "onlineState");
    const gameName = xml.match(
      /<mostPlayedGame>[\s\S]*?<gameName><!\[CDATA\[([\s\S]*?)\]\]><\/gameName>/,
    );

    return NextResponse.json({
      online: onlineState.toLowerCase() === "online",
      personaName: readCdata(xml, "steamID") || "JJ",
      avatarUrl: readCdata(xml, "avatarFull") || readCdata(xml, "avatarMedium"),
      lastGame: gameName?.[1]?.trim() || readCdata(xml, "gameName") || undefined,
      location: readCdata(xml, "location") || undefined,
      gameCount: parseInt(readCdata(xml, "gamesOwned") || "0", 10) || undefined,
    });
  } catch {
    return NextResponse.json({
      online: false,
      personaName: "JJ",
      avatarUrl: "",
    });
  }
}
