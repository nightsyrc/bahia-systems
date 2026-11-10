import Link from "next/link";
import Cabecera from "@/components/Cabecera";
import Pie from "@/components/Pie";
import CartaNautica from "@/components/CartaNautica";
import MockAtalaya from "@/components/MockAtalaya";
import FormContacto from "@/components/FormContacto";
import { PLANES, mxn } from "@/config/marca";

const RESUELVE: [string, string][] = [
  ["Accesos y visitas", "Cada entrada y salida queda registrada con quién, a qué unidad y a qué hora. Las visitas anunciadas llevan firma digital."],
  ["Paquetes con constancia", "Se avisa al residente y la entrega queda con firma de quien recibe. Se acabó el «yo creo que ya se lo dieron»."],
  ["Turnos que se entregan solos", "Quien termina firma el relevo y quien llega ve lo que quedó pendiente, sin llamadas ni mensajes sueltos."],
  ["El reporte llega al administrador", "Al cerrar cada turno, el administrador recibe un PDF con lo ocurrido y lo que necesita su atención."],
];
const PASOS: [string, string][] = [
  ["Pides una demo", "Te mostramos Atalaya en 20 minutos con datos de ejemplo y resolvemos tus dudas."],
  ["Configuramos tu condominio", "Cargamos tus unidades, tu rol de turnos y a tu equipo. Tú solo nos das la lista."],
  ["Tu caseta empieza a registrar", "El equipo entra desde el celular o la computadora de la caseta el mismo día."],
];
const FAQ: [string, string][] = [
  ["¿Funciona en el celular?", "Sí. Está pensado para usarse de pie en la caseta, con botones grandes. También funciona en computadora."],
  ["¿Qué pasa con la información de mi condominio?", "Es tuya. Puedes exportarla en cualquier momento y cada persona ve solo lo que su rol permite. Registramos quién hace qué."],
  ["¿Mi equipo necesita capacitación?", "Una sesión corta basta. Atalaya está hecha para usarse sin manual, con pasos claros y botones grandes."],
  ["¿Puedo pedir cambios para mi condominio?", "Sí. Si necesitas algo que Atalaya no hace, lo desarrollamos a la medida. Mira la sección de soluciones a la medida."],
  ["¿Hay contrato forzoso?", "Los planes son mensuales. Puedes cancelar cuando quieras."],
];

export default function Inicio() {
  return (
    <>
      <Cabecera />
      <main>
        <section className="hero">
          <div className="hero-txt">
            <h1>La caseta de tu condominio, sin cuaderno ni mensajes sueltos.</h1>
            <p className="lead">Atalaya registra accesos, paquetes y turnos, y entrega al administrador un reporte claro al terminar cada turno.</p>
            <div className="acciones">
              <Link href="#contacto" className="btn primario">Pedir una demo</Link>
              <Link href="#precios" className="btn">Ver precios</Link>
            </div>
            <p className="nota">Hecho en Puerto Vallarta, probado en una caseta real.</p>
          </div>
          <CartaNautica />
        </section>

        <section id="atalaya" className="bloque">
          <h2>Lo que cambia en la caseta</h2>
          <dl className="filas">
            {RESUELVE.map(([t, d]) => (<div key={t}><dt>{t}</dt><dd>{d}</dd></div>))}
          </dl>
        </section>

        <section className="bloque mock-bloque">
          <div>
            <h2>Se ve como lo usa tu equipo</h2>
            <p className="lead">Lo más nuevo primero, avisos pendientes a la vista y un toque para ver el detalle. Nada de menús escondidos.</p>
          </div>
          <MockAtalaya />
        </section>

        <section className="bloque">
          <h2>Cómo empezamos</h2>
          <ol className="pasos">
            {PASOS.map(([t, d], i) => (<li key={t}><span className="paso-n">{i + 1}</span><div><b>{t}</b><p>{d}</p></div></li>))}
          </ol>
        </section>

        <section id="precios" className="bloque">
          <h2>Precios de Atalaya</h2>
          <p className="lead">Por mes, en pesos mexicanos, más IVA. Sin costo de alta.</p>
          <div className="libro">
            {PLANES.map((p) => (
              <article key={p.id} className={p.destacado ? "plan destacado" : "plan"}>
                <h3>{p.nombre}</h3>
                <p className="precio">{mxn(p.precio)}<small> / mes</small></p>
                <p className="para">{p.para}</p>
                <ul>{p.incluye.map((i) => <li key={i}>{i}</li>)}</ul>
                <Link href="#contacto" className={p.destacado ? "btn primario" : "btn"}>Pedir demo de {p.nombre}</Link>
              </article>
            ))}
          </div>
          <p className="nota">¿Necesitas algo distinto? <Link href="/a-la-medida">Cotiza una solución a la medida</Link>.</p>
        </section>

        <section className="bloque medida">
          <div>
            <h2>¿Algo que Atalaya no hace?</h2>
            <p className="lead">Diseñamos y desarrollamos aplicaciones, automatizaciones, integraciones y sitios web para tu operación. Armas tu alcance, ves un rango de precio al instante y recibes la cotización final por escrito.</p>
          </div>
          <Link href="/a-la-medida" className="btn primario">Cotizar a la medida</Link>
        </section>

        <section className="bloque">
          <h2>Preguntas frecuentes</h2>
          <div className="faq">
            {FAQ.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
          </div>
        </section>

        <section id="contacto" className="bloque contacto">
          <div>
            <h2>Pide tu demo</h2>
            <p className="lead">Cuéntanos de tu condominio y te escribimos en un día hábil para agendar una demo de 20 minutos.</p>
          </div>
          <FormContacto />
        </section>
      </main>
      <Pie />
    </>
  );
}
