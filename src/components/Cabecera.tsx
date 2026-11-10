import Link from "next/link";
import Logo from "./Logo";
import { MARCA } from "@/config/marca";
export default function Cabecera() {
  return (
    <header className="cab">
      <Link href="/" className="marca"><Logo /><span>{MARCA.nombre}</span></Link>
      <nav aria-label="Principal">
        <Link href="/#atalaya">Atalaya</Link>
        <Link href="/#precios">Precios</Link>
        <Link href="/a-la-medida">A la medida</Link>
        <Link href="/#contacto" className="btn chico">Pedir demo</Link>
      </nav>
    </header>
  );
}
