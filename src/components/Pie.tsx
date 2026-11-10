import Link from "next/link";
import { MARCA } from "@/config/marca";
export default function Pie() {
  return (
    <footer className="pie">
      <div><b>{MARCA.nombre}</b><p>{MARCA.ciudad}. Soluciones de TI para todo México.</p></div>
      <div><a href={`mailto:${MARCA.correo}`}>{MARCA.correo}</a><br /><Link href="/privacidad">Aviso de privacidad</Link></div>
    </footer>
  );
}
