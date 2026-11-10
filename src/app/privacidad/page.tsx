import Cabecera from "@/components/Cabecera";
import Pie from "@/components/Pie";
import { MARCA } from "@/config/marca";

export const metadata = { title: "Aviso de privacidad" };

export default function Privacidad() {
  return (
    <>
      <Cabecera />
      <main className="legal">
        <h1>Aviso de privacidad</h1>
        <p><b>Borrador para revisión de un abogado antes de publicarse.</b></p>
        <h2>Quién es el responsable</h2>
        <p>{MARCA.nombre}, con domicilio en {MARCA.ciudad}, México, es responsable del tratamiento de tus datos personales. Contacto: {MARCA.correo}.</p>
        <h2>Qué datos recabamos y para qué</h2>
        <p>Nombre, empresa, correo, teléfono (opcional) y el mensaje que nos escribes. Los usamos para responder tu solicitud, enviarte una demo o cotización y darte seguimiento a ese contacto. No pedimos datos sensibles.</p>
        <h2>Con quién los compartimos</h2>
        <p>Con los proveedores que alojan el sitio, la base de datos y el correo, solo para operar este servicio. No vendemos tus datos.</p>
        <h2>Tus derechos</h2>
        <p>Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos (derechos ARCO) escribiendo a {MARCA.correo}. Cada correo de seguimiento incluye un enlace para darte de baja al instante.</p>
        <h2>Cambios</h2>
        <p>Si este aviso cambia, publicaremos la nueva versión en esta página.</p>
      </main>
      <Pie />
    </>
  );
}
