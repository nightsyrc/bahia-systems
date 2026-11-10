import Link from "next/link";
export default function AdminNav({ actual }: { actual: "monitor" | "bandeja" | "equipo" | "prospectos" | "mensajes" }) {
  const it: [string, string, string][] = [["monitor", "/admin", "Monitor"], ["bandeja", "/admin/bandeja", "Bandeja"], ["equipo", "/admin/equipo", "Equipo"], ["prospectos", "/admin/prospectos", "Prospectos"], ["mensajes", "/admin/mensajes", "Mensajes"]];
  return (
    <nav className="adm-nav" aria-label="Panel">
      {it.map(([k, h, t]) => <Link key={k} href={h} aria-current={actual === k ? "page" : undefined}>{t}</Link>)}
    </nav>
  );
}
