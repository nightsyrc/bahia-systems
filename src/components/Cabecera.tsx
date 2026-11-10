import Link from "next/link";
import Logo from "./Logo";
import { MARCA } from "@/config/marca";

const LINKS: [string, string][] = [["/#atalaya", "Atalaya"], ["/#reporte", "El reporte"], ["/#precios", "Precios"], ["/a-la-medida", "A la medida"]];

export default function Cabecera() {
  return (
    <header className="cab">
      <div className="cab-in">
        <Link href="/" className="marca" aria-label={`${MARCA.nombre}, inicio`}><Logo /><span>{MARCA.nombre}</span></Link>
        <nav aria-label="Principal" className="cab-nav">
          {LINKS.map(([h, t]) => <Link key={h} href={h}>{t}</Link>)}
        </nav>
        <div className="cab-acc">
          <Link href="/#contacto" className="btn chico">Pedir demo</Link>
          <details className="menu-m">
            <summary aria-label="Abrir menú"><span /><span /><span /></summary>
            <nav aria-label="Menú móvil" className="menu-m-lista">
              {LINKS.map(([h, t]) => <Link key={h} href={h}>{t}</Link>)}
              <Link href="/#contacto" className="btn primario">Pedir una demo</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
