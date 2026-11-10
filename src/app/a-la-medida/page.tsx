import Cabecera from "@/components/Cabecera";
import Pie from "@/components/Pie";
import Cotizador from "@/components/Cotizador";

export const metadata = { title: "Soluciones a la medida", description: "Aplicaciones, automatizaciones, integraciones y sitios web a la medida. Arma tu alcance y ve un rango de precio al instante." };

export default function Medida() {
  return (
    <>
      <Cabecera />
      <main className="bloque pagina">
        <h1>Soluciones a la medida</h1>
        <p className="lead">Elige lo que necesitas y ve un rango de precio al instante. Enviando el formulario recibes una cotización final por escrito, sin costo.</p>
        <Cotizador />
      </main>
      <Pie />
    </>
  );
}
