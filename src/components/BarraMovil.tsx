"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Botón fijo de contacto para celular; se esconde cuando el formulario ya está en pantalla. */
export default function BarraMovil() {
  const [ver, setVer] = useState(true);
  useEffect(() => {
    const el = document.getElementById("contacto");
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setVer(!e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className={`barra-m ${ver ? "" : "oculta"}`}>
      <Link href="/#contacto" className="btn primario">Pedir una demo de Atalaya</Link>
    </div>
  );
}
