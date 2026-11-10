import Link from "next/link";
import Cabecera from "@/components/Cabecera";
import Pie from "@/components/Pie";
import CartaNautica from "@/components/CartaNautica";
import MockAtalaya from "@/components/MockAtalaya";
import MockReporte from "@/components/MockReporte";
import BarraMovil from "@/components/BarraMovil";
import { IcPuerta, IcPaquete, IcRelevo, IcReporte, IcCheck, IcFlecha, IcCodigo, IcRayo, IcEnlace, IcGlobo } from "@/components/Iconos";
import FormContacto from "@/components/FormContacto";
import { PLANES, mxn } from "@/config/marca";

const ICONOS = [<IcPuerta key="a" />, <IcPaquete key="b" />, <IcRelevo key="c" />, <IcReporte key="d" />];
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
          <div className="hero-fondo" aria-hidden="true"><CartaNautica /></div>
          <div className="hero-in">
            <div className="hero-txt">
              <p className="pildora"><i /> Caseta digital · Hecho en Puerto Vallarta</p>
              <h1>La caseta de tu condominio, <em>sin cuaderno</em> ni mensajes sueltos.</h1>
              <p className="lead">Atalaya registra accesos, paquetes y turnos, y entrega al administrador un reporte claro al terminar cada turno.</p>
              <div className="acciones">
                <Link href="#contacto" className="btn primario grande">Pedir una demo <IcFlecha /></Link>
                <Link href="#precios" className="btn fantasma grande">Ver precios</Link>
              </div>
              <ul className="confianza">
                <li><IcCheck /> Sin costo de alta</li>
                <li><IcCheck /> Cancela cuando quieras</li>
                <li><IcCheck /> Probado en una caseta real</li>
              </ul>
            </div>
            <div className="hero-vis"><MockAtalaya /></div>
          </div>
        </section>

        <section className="franja" aria-label="Qué incluye">
          <p>Desde el celular o la computadora de la caseta</p>
          <ul><li>Accesos</li><li>Paquetes</li><li>Turnos</li><li>Llaves</li><li>Proveedores</li><li>Reportes PDF</li></ul>
        </section>

        <section id="atalaya" className="bloque">
          <p className="eyebrow">Lo que cambia en la caseta</p>
          <h2>Menos papel. Más control. Cero «yo creo que sí».</h2>
          <div className="bento">
            {RESUELVE.map(([t, d], i) => (
              <article key={t} className={`bento-c b${i + 1}`}>
                <span className="ico">{ICONOS[i]}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="reporte" className="bloque duo">
          <div className="duo-txt">
            <p className="eyebrow">El reporte de turno</p>
            <h2>El administrador sabe cómo quedó la caseta, sin preguntar.</h2>
            <p className="lead">Al cerrar cada turno llega un correo claro con lo que pasó y un PDF con las constancias. Si algo necesita su atención, Atalaya se lo marca.</p>
            <ul className="lista-ok">
              <li><IcCheck /> Resumen en lenguaje sencillo, no una tabla de datos.</li>
              <li><IcCheck /> Firmas y fotos de cada entrega en el PDF.</li>
              <li><IcCheck /> Aprobación del supervisor antes de enviar, si lo prefieres.</li>
            </ul>
          </div>
          <MockReporte />
        </section>

        <section className="bloque">
          <p className="eyebrow">Cómo empezamos</p>
          <h2>De la demo a tu primer turno, sin complicarte.</h2>
          <ol className="pasos">
            {PASOS.map(([t, d], i) => (<li key={t}><span className="paso-n">{i + 1}</span><div><b>{t}</b><p>{d}</p></div></li>))}
          </ol>
        </section>

        <section id="precios" className="bloque">
          <p className="eyebrow">Precios</p>
          <h2>Un plan para cada caseta.</h2>
          <p className="lead">Por mes, en pesos mexicanos, más IVA. Sin costo de alta.</p>
          <div className="libro">
            {PLANES.map((p) => (
              <article key={p.id} className={p.destacado ? "plan destacado" : "plan"}>
                {p.destacado ? <span className="plan-tag">Recomendado</span> : null}
                <h3>{p.nombre}</h3>
                <p className="precio">{mxn(p.precio)}<small> / mes</small></p>
                <p className="para">{p.para}</p>
                <ul>{p.incluye.map((i) => <li key={i}>{i}</li>)}</ul>
                <Link href="#contacto" className={p.destacado ? "btn primario" : "btn"}>Pedir demo de {p.nombre}</Link>
              </article>
            ))}
          </div>
          <p className="nota centro">¿Necesitas algo distinto? <Link href="/a-la-medida">Cotiza una solución a la medida</Link>.</p>
        </section>

        <section className="medida">
          <div className="medida-in">
            <div>
              <p className="eyebrow claro">A la medida</p>
              <h2>¿Algo que Atalaya no hace?</h2>
              <p className="lead">Diseñamos y desarrollamos aplicaciones, automatizaciones, integraciones y sitios web para tu operación. Armas tu alcance, ves un rango de precio al instante y recibes la cotización final por escrito.</p>
              <Link href="/a-la-medida" className="btn primario grande">Cotizar a la medida <IcFlecha /></Link>
            </div>
            <ul className="medida-chips">
              <li><IcCodigo /> Aplicaciones web y móviles</li>
              <li><IcRayo /> Automatizaciones y reportes</li>
              <li><IcEnlace /> Integración entre sistemas</li>
              <li><IcGlobo /> Sitios web</li>
            </ul>
          </div>
        </section>

        <section className="bloque">
          <p className="eyebrow">Preguntas frecuentes</p>
          <h2>Lo que nos preguntan antes de empezar.</h2>
          <div className="faq">
            {FAQ.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
          </div>
        </section>

        <section id="contacto" className="bloque contacto">
          <div>
            <p className="eyebrow">Pide tu demo</p>
            <h2>Cuéntanos de tu condominio.</h2>
            <p className="lead">Te escribimos en un día hábil para agendar una demo de 20 minutos, con datos de ejemplo y sin compromiso.</p>
            <ul className="lista-ok">
              <li><IcCheck /> Respuesta en un día hábil.</li>
              <li><IcCheck /> Sin costo de alta ni contrato forzoso.</li>
              <li><IcCheck /> Tu información es tuya y la puedes exportar.</li>
            </ul>
          </div>
          <div className="contacto-card"><FormContacto /></div>
        </section>
      </main>
      <Pie />
      <BarraMovil />
    </>
  );
}
