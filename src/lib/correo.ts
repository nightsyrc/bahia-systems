import nodemailer from "nodemailer";
import { MARCA } from "@/config/marca";

export async function enviar(para: string, asunto: string, html: string, texto: string, opts: { baja?: string; replyTo?: string } = {}) {
  const user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
  if (!user || !pass) throw new Error("Falta SMTP_USER o SMTP_PASS");
  const t = nodemailer.createTransport({ host: process.env.SMTP_HOST ?? "smtp.gmail.com", port: 465, secure: true, auth: { user, pass } });
  await t.sendMail({
    from: `"${MARCA.nombre}" <${user}>`, to: para, subject: asunto, html, text: texto, replyTo: opts.replyTo,
    headers: opts.baja ? { "List-Unsubscribe": `<${opts.baja}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined,
  });
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Estructura común: texto sencillo, sin imágenes pesadas, con baja en cada mensaje a prospectos. */
export function plantilla(titulo: string, parrafos: string[], boton?: { texto: string; url: string }, baja?: string): string {
  const cuerpo = parrafos.map((p) => `<p style="margin:0 0 14px;line-height:1.6">${p}</p>`).join("");
  const b = boton ? `<p style="margin:22px 0"><a href="${boton.url}" style="background:#00A3A1;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px;display:inline-block">${esc(boton.texto)}</a></p>` : "";
  const pie = baja
    ? `<p style="font-size:12px;color:#5a7683;margin:28px 0 0">Recibes este mensaje porque pediste información en ${MARCA.nombre}. <a href="${baja}" style="color:#5a7683">Darme de baja</a> · <a href="${MARCA.url}/privacidad" style="color:#5a7683">Aviso de privacidad</a></p>`
    : `<p style="font-size:12px;color:#5a7683;margin:28px 0 0">${MARCA.nombre} · ${MARCA.ciudad}</p>`;
  return `<!doctype html><html lang="es"><body style="margin:0;background:#F3F8F8;font-family:Arial,Helvetica,sans-serif;color:#0B3954"><div style="max-width:560px;margin:0 auto;padding:28px 20px"><p style="font-weight:800;font-size:18px;margin:0 0 22px">${MARCA.nombre}</p><h1 style="font-size:22px;margin:0 0 16px;line-height:1.25">${esc(titulo)}</h1>${cuerpo}${b}${pie}</div></body></html>`;
}
export { esc };
