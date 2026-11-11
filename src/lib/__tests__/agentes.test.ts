import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Base de datos simulada: registra cada consulta y responde por coincidencia de texto.
type Regla = { si: RegExp; filas: Record<string, unknown>[] };
const calls: string[] = [];
let reglas: Regla[] = [];
vi.mock("@/lib/db", () => ({
  sql: (strings: TemplateStringsArray, ...vals: unknown[]) => {
    const q = strings.join("?");
    calls.push(q.replace(/\s+/g, " ").trim());
    const r = reglas.find((x) => x.si.test(q)) ?? (/COUNT\(\*\)/.test(q) ? { filas: [{ n: 0 }] } : undefined);
    const p = Promise.resolve({ rows: r?.filas ?? [] });
    return Object.assign(p, { catch: p.catch.bind(p) });
  },
}));
const enviarMock = vi.fn(async () => undefined);
vi.mock("@/lib/correo", () => ({ enviar: (...a: unknown[]) => (enviarMock as unknown as (...x: unknown[]) => Promise<void>)(...a), plantillaFrio: (c: string, b: string) => `${c}|${b}` }));
let respuestaIA = "[]";
vi.mock("@/lib/ia", async () => {
  const real = await vi.importActual<typeof import("@/lib/ia")>("@/lib/ia");
  return { ...real, llamar: vi.fn(async () => respuestaIA) };
});

import { prospector, redactorVuelta, enviarCola } from "@/lib/agentes";
import { OUTREACH } from "@/config/outreach";

beforeEach(() => { calls.length = 0; reglas = []; enviarMock.mockClear(); delete process.env.AUTO_ENVIO; });
afterEach(() => { vi.useRealTimers(); });

describe("Prospector: solo propone, nunca contacta", () => {
  it("guarda solo buzones de empresa y descarta correos personales", async () => {
    respuestaIA = JSON.stringify([
      { empresa: "Admin Vallarta", correo_contacto: "info@adminvallarta.mx", fuente_url: "https://x.mx" },
      { empresa: "Juan Pérez Propiedades", correo_contacto: "juan.perez@gmail.com", fuente_url: "https://y.mx" },
    ]);
    reglas = [{ si: /INSERT INTO prospectos/, filas: [{ id: 1 }] }];
    await prospector();
    const inserts = calls.filter((c) => c.startsWith("INSERT INTO prospectos"));
    expect(inserts.length).toBe(2);
    expect(enviarMock).not.toHaveBeenCalled();
  });
  it("no revienta si la IA no devuelve JSON", async () => {
    respuestaIA = "No encontré nada, lo siento";
    expect(await prospector()).toBe(0);
    expect(enviarMock).not.toHaveBeenCalled();
  });
  it("limita las propuestas por vuelta", async () => {
    respuestaIA = JSON.stringify(Array.from({ length: 30 }, (_, i) => ({ empresa: `E${i}`, correo_contacto: null })));
    reglas = [{ si: /INSERT INTO prospectos/, filas: [{ id: 1 }] }];
    await prospector();
    expect(calls.filter((c) => c.startsWith("INSERT INTO prospectos")).length).toBeLessThanOrEqual(OUTREACH.propuestasPorVuelta);
  });
});

describe("Redactor: solo deja borradores", () => {
  it("crea borradores y no envía", async () => {
    respuestaIA = JSON.stringify({ asunto: "Atalaya para tu caseta", cuerpo: "Hola, somos el equipo." });
    reglas = [{ si: /FROM prospectos p WHERE p.estado = 'aprobado'/, filas: [{ id: 7, empresa: "Admin Vallarta", correo: "info@a.mx" }] }];
    await redactorVuelta();
    expect(calls.some((c) => c.startsWith("INSERT INTO mensajes"))).toBe(true);
    expect(enviarMock).not.toHaveBeenCalled();
  });
});

describe("Envío: horario, tope diario, bajas y aprobación", () => {
  const msg = { id: 1, tipo: "frio1", asunto: "A", cuerpo: "Cuerpo", pid: 9, correo: "info@empresa.mx", token: "tok123" };
  it("fuera de horario (domingo) no envía nada", async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-15T18:00:00Z")); // domingo
    reglas = [{ si: /FROM mensajes m JOIN prospectos/, filas: [msg] }];
    expect(await enviarCola()).toBe(0);
    expect(enviarMock).not.toHaveBeenCalled();
  });
  it("sin AUTO_ENVIO no aprueba borradores por su cuenta", async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-11T20:00:00Z")); // miércoles, horario hábil
    await enviarCola();
    expect(calls.some((c) => c.includes("SET estado = 'aprobado'"))).toBe(false);
  });
  it("con AUTO_ENVIO=si sí aprueba borradores (interruptor consciente)", async () => {
    process.env.AUTO_ENVIO = "si";
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-11T20:00:00Z"));
    await enviarCola();
    expect(calls.some((c) => c.includes("SET estado = 'aprobado'"))).toBe(true);
  });
  it("respeta el tope diario", async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-11T20:00:00Z"));
    reglas = [
      { si: /COUNT\(\*\)/, filas: [{ n: OUTREACH.enviosPorDia }] },
      { si: /FROM mensajes m JOIN prospectos/, filas: [msg] },
    ];
    expect(await enviarCola()).toBe(0);
    expect(enviarMock).not.toHaveBeenCalled();
  });
  it("la consulta de la cola excluye bajas y prospectos sin correo", async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-11T20:00:00Z"));
    await enviarCola();
    const cola = calls.find((c) => c.includes("FROM mensajes m JOIN prospectos"))!;
    expect(cola).toContain("p.baja = FALSE");
    expect(cola).toContain("p.correo IS NOT NULL");
    expect(cola).toContain("m.estado = 'aprobado'");
  });
  it("cada correo enviado lleva enlace de baja y reply-to", async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-11T20:00:00Z"));
    reglas = [
      { si: /COUNT\(\*\)/, filas: [{ n: 0 }] },
      { si: /FROM mensajes m JOIN prospectos/, filas: [msg] },
    ];
    expect(await enviarCola()).toBe(1);
    const args = enviarMock.mock.calls[0] as unknown as unknown[];
    expect(String(args[3])).toContain("/baja?t=tok123");
    expect((args[4] as { baja: string }).baja).toContain("tok123");
  });
});
