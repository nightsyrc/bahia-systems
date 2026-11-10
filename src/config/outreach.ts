// Reglas del outreach y metas del embudo. Los números de las metas son supuestos de arranque: ajústalos con datos reales.
export const OUTREACH = {
  enviosPorDia: 15,            // tope diario de correos en frío (sube despacio para cuidar la reputación del dominio)
  horaIni: 9, horaFin: 18,     // horario de envío, hora de Puerto Vallarta, solo lunes a viernes
  diasSeg2: 4, diasSeg3: 5,    // días sin respuesta antes de proponer el 2.º y 3.er mensaje
  propuestasPorVuelta: 8,      // prospectos nuevos que el Prospector propone por corrida
  zonas: ["Puerto Vallarta", "Nuevo Vallarta", "Bucerías", "Sayulita", "Punta Mita", "Mazatlán", "Los Cabos", "Cancún", "Playa del Carmen", "Tulum", "Guadalajara"],
  categorias: ["administradoras de condominios", "administradoras de propiedades vacacionales", "desarrolladores con condominios en operación", "asociaciones de condóminos"],
};
export const METAS = {
  inicio: "2026-11-10", dias: 90,
  contactados: 150, demos: 12, clientes: 5, mrr: 15000, proyectosMedida: 2,
};
// Hechos verificables de Atalaya. El Redactor solo puede afirmar cosas de esta lista.
export const HECHOS_ATALAYA = [
  "Registra accesos de personas y vehículos, con unidad, hora y quién registró",
  "Registra paquetes, avisa al residente y guarda la firma de quien recibe",
  "Maneja turnos: rol del equipo, entrega de turno firmada y reporte en PDF al terminar cada turno",
  "Envía el reporte del turno por correo al administrador y permite aprobarlo",
  "Visitas anunciadas con firma digital, proveedores, llaves y ocupación de unidades",
  "Funciona en celular y en computadora, hecho en Puerto Vallarta y probado en una caseta real",
  "Planes desde $1,490 MXN al mes más IVA, sin costo de alta",
];
