import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const firma = () => createHmac("sha256", process.env.ADMIN_KEY ?? "").update("bahia-admin-v1").digest("hex");
export const COOKIE = "bs_admin";

export function claveValida(clave: string): boolean {
  const k = process.env.ADMIN_KEY ?? "";
  if (k.length < 12 || clave.length !== k.length) return false;
  return timingSafeEqual(Buffer.from(clave), Buffer.from(k));
}
export async function esAdmin(): Promise<boolean> {
  if ((process.env.ADMIN_KEY ?? "").length < 12) return false;
  const v = (await cookies()).get(COOKIE)?.value ?? "";
  const esperado = firma();
  return v.length === esperado.length && timingSafeEqual(Buffer.from(v), Buffer.from(esperado));
}
export const valorCookie = firma;
