import { NextResponse } from "next/server";
import { COOKIE, claveValida, valorCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as { clave?: string } | null;
  if (!claveValida(typeof b?.clave === "string" ? b.clave : "")) return NextResponse.json({ error: "Clave incorrecta." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, valorCookie(), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 14 });
  return res;
}
