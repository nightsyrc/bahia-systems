import { ensureSchema, sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Baja de correos", robots: { index: false } };

export default async function Baja({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const t = ((await searchParams).t ?? "").replace(/[^a-f0-9]/g, "").slice(0, 40);
  let hecho = false;
  if (t.length >= 16) {
    try { await ensureSchema(); const r = await sql`UPDATE leads SET baja = TRUE WHERE token = ${t} RETURNING id`; hecho = r.rows.length > 0; } catch { /* se muestra el mensaje de error */ }
  }
  return (
    <main className="legal">
      <h1>{hecho ? "Listo, ya no te escribiremos" : "No pudimos procesar la baja"}</h1>
      <p>{hecho ? "Quitamos tu correo de nuestros seguimientos. No recibirás más mensajes automáticos." : "El enlace no es válido o ya se usó. Escríbenos y te damos de baja a mano."}</p>
    </main>
  );
}
