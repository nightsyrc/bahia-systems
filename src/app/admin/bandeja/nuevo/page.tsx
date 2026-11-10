import Link from "next/link";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import NuevoDestinatario from "@/components/NuevoDestinatario";
import { esAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export default async function Nuevo() {
  if (!(await esAdmin())) redirect("/admin/login");
  return (
    <main className="adm">
      <h1>Nuevo destinatario</h1>
      <p className="sub">Solo correos de empresa publicados como contacto comercial. Se guarda en la bandeja y no sale hasta que lo confirmes.</p>
      <AdminNav actual="bandeja" />
      <NuevoDestinatario />
      <p><Link href="/admin/bandeja">← Volver a la bandeja</Link></p>
    </main>
  );
}
