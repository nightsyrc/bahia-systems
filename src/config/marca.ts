// Todo lo que cambia entre versiones del sitio vive aquí: nombre, contacto y precios.
export const MARCA = {
  nombre: "Bahía Systems",
  lema: "Sistemas que cuidan la operación.",
  ciudad: "Puerto Vallarta, Jalisco",
  coord: "20°39′N 105°14′O",
  correo: process.env.CONTACT_TO ?? "hola@bahiasystems.mx",
  url: process.env.SITE_URL ?? "http://localhost:3000",
};

export type Plan = { id: string; nombre: string; precio: number; para: string; incluye: string[]; destacado?: boolean };
// Precios sugeridos en MXN por mes, más IVA. Ajústalos aquí y se actualizan en todo el sitio.
export const PLANES: Plan[] = [
  { id: "esencial", nombre: "Esencial", precio: 1490, para: "Una caseta pequeña que quiere dejar el cuaderno.", incluye: ["Accesos de personas y vehículos", "Paquetes con aviso al residente", "Observaciones y seguimientos", "Reporte diario por correo", "Hasta 4 usuarios"] },
  { id: "condominio", nombre: "Condominio", precio: 2990, para: "El condominio que quiere control real de sus turnos.", incluye: ["Todo lo de Esencial", "Rol de turnos y entrega firmada", "Proveedores, llaves y ocupación", "Visitas anunciadas con firma digital", "Reporte PDF al terminar cada turno", "Usuarios ilimitados"], destacado: true },
  { id: "plus", nombre: "Plus", precio: 5490, para: "Administradoras con varios condominios.", incluye: ["Todo lo de Condominio", "Varias casetas y condominios", "Aprobación de reportes por el supervisor", "Bitácora de seguridad y respaldo", "Soporte prioritario por WhatsApp"] },
];

// Cotizador de soluciones a la medida (MXN, rangos orientativos; la cotización final se confirma por escrito).
export const MEDIDA = {
  tipos: [
    { id: "app", nombre: "Aplicación web o móvil", min: 35000, max: 90000 },
    { id: "auto", nombre: "Automatización y reportes", min: 12000, max: 35000 },
    { id: "integra", nombre: "Integración entre sistemas", min: 15000, max: 45000 },
    { id: "sitio", nombre: "Sitio web", min: 8000, max: 25000 },
  ],
  extras: [
    { id: "usuarios", nombre: "Usuarios con roles y permisos", min: 4000, max: 10000 },
    { id: "pagos", nombre: "Cobros en línea", min: 6000, max: 14000 },
    { id: "correo", nombre: "Correos y avisos automáticos", min: 2500, max: 6000 },
    { id: "pdf", nombre: "Reportes en PDF", min: 3000, max: 8000 },
    { id: "capacitacion", nombre: "Capacitación del equipo", min: 2000, max: 5000 },
  ],
  urgencia: [
    { id: "normal", nombre: "Sin prisa (6 a 10 semanas)", mult: 1 },
    { id: "pronto", nombre: "Pronto (3 a 5 semanas)", mult: 1.25 },
  ],
};
export const mxn = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
