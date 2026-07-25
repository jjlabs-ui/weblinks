import { NextRequest, NextResponse } from "next/server";

export const revalidate = 600;

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`,
      { next: { revalidate: 600 } },
    );
    const data = await res.json();
    const current = data.current;

    const codes: Record<number, string> = {
      0: "Céu limpo",
      1: "Parcialmente nublado",
      2: "Parcialmente nublado",
      3: "Nublado",
      45: "Neblina",
      48: "Neblina",
      51: "Garoa",
      61: "Chuva",
      71: "Neve",
      80: "Pancadas",
      95: "Tempestade",
    };

    return NextResponse.json({
      temp: Math.round(current.temperature_2m),
      description: codes[current.weather_code] || "Clima estável",
      icon: String(current.weather_code),
    });
  } catch {
    return NextResponse.json({ temp: 0, description: "—", icon: "0" });
  }
}
