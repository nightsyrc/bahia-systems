import Link from "next/link";
import Logo from "./Logo";
import { MARCA } from "@/config/marca";
export default function Pie() {
  return (
    <footer className="pie">
      <div className="pie-in">
        <div className="pie-marca">
          <Link href="/" className="marca"><Logo /><span>{MARCA.nombre}</span></Link>
          <p>{MARCA.lema}</p>
          <p className="pie-sub">{MARCA.ciudad} · {MARCA.coord}</p>
        </div>
        <div>
          <h4>Producto</h4>
          <Link href="/#atalaya">Atalaya</Link>
          <Link href="/#reporte">El reporte de turno</Link>
          <Link href="/#precios">Precios</Link>
        </div>
        <div>
          <h4>Empresa</h4>
          <Link href="/a-la-medida">Soluciones a la medida</Link>
          <a href={`mailto:${MARCA.correo}`}>{MARCA.correo}</a>
          <Link href="/privacidad">Aviso de privacidad</Link>
        </div>
      </div>
      <p className="pie-copy">© {new Date().getFullYear()} {MARCA.nombre}. Soluciones de TI para todo México.</p>
    </footer>
  );
}
