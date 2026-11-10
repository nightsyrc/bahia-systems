// Vista previa en el navegador: mismo HTML que se envía, con un enlace de baja de ejemplo. Sin dependencias de servidor.
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
export function plantillaFrioVista(cuerpo: string): string {
  const parrafos = cuerpo.split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px;line-height:1.6">${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  return `<!doctype html><html lang="es"><body style="margin:0;font-family:Arial,Helvetica,sans-serif;color:#0B3954;background:#fff"><div style="max-width:560px;padding:20px">${parrafos}<p style="font-size:12px;color:#5a7683;margin:26px 0 0;border-top:1px solid #dfe9eb;padding-top:12px">Bahía Systems · Puerto Vallarta, Jalisco. Te escribimos porque tu empresa publica este correo como contacto comercial. Si no quieres recibir más mensajes, <u>date de baja aquí</u>. <u>Aviso de privacidad</u>.</p></div></body></html>`;
}
