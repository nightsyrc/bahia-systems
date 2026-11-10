// Llamadas a la API de Claude. Requiere ANTHROPIC_API_KEY. El modelo se puede cambiar con ANTHROPIC_MODEL.
export async function llamar(sistema: string, usuario: string, opts: { buscar?: boolean; maxTokens?: number } = {}): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("Falta ANTHROPIC_API_KEY");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5", max_tokens: opts.maxTokens ?? 2000, system: sistema,
      messages: [{ role: "user", content: usuario }],
      ...(opts.buscar ? { tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 6 }] } : {}),
    }),
  });
  if (!r.ok) throw new Error(`API ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = (await r.json()) as { content?: { type: string; text?: string }[] };
  return (j.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n").trim();
}

/** Saca el primer JSON (objeto o lista) de un texto; devuelve null si no hay uno válido. */
export function extraerJson<T>(texto: string): T | null {
  const ini = texto.search(/[\[{]/);
  if (ini < 0) return null;
  for (let fin = texto.length; fin > ini; fin--) {
    const c = texto[fin - 1];
    if (c !== "]" && c !== "}") continue;
    try { return JSON.parse(texto.slice(ini, fin)) as T; } catch { /* sigue buscando */ }
  }
  return null;
}
