/**
 * RADAR DE ESCUELAS - backend en Google Apps Script
 *
 * Cómo funciona:
 * - Esta hoja de cálculo (Google Sheet) es la base de datos: tiene dos pestañas,
 *   "Escuelas" y "Actividades".
 * - Este archivo (Code.gs) corre en los servidores de Google. Las funciones de acá
 *   se pueden llamar desde el navegador (archivo Index.html) usando google.script.run.
 * - doGet() es lo que se ejecuta cuando alguien abre la URL pública de la web app:
 *   simplemente le devuelve la página Index.html.
 */

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Radar de Escuelas')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// --------------------------------------------------------------
// Helpers de acceso a la planilla
// --------------------------------------------------------------

function getSheet_(nombre) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(nombre);
  if (!sheet) sheet = ss.insertSheet(nombre);
  return sheet;
}

// Crea los encabezados si la pestaña está vacía (primera vez que se usa)
function asegurarEncabezados_() {
  const escuelas = getSheet_('Escuelas');
  if (escuelas.getLastRow() === 0) {
    escuelas.appendRow(['id', 'nombre', 'zona', 'contacto_nombre', 'contacto_tel', 'notas']);
  }
  const actividades = getSheet_('Actividades');
  if (actividades.getLastRow() === 0) {
    actividades.appendRow(['id', 'escuela_id', 'fecha', 'tipo', 'descripcion', 'autor']);
  }
}

// Convierte una pestaña completa en un array de objetos JS, usando la primera
// fila como nombres de campo. Ej: [{id: "...", nombre: "Escuela 12", ...}, ...]
function sheetToObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();

  return values.slice(1).map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) {
      let val = row[i];
      // Google Sheets a veces convierte fechas de texto ("2026-08-03") en objetos Date.
      // Las volvemos a texto plano yyyy-MM-dd para que el frontend siempre reciba lo mismo.
      if (val instanceof Date) {
        val = Utilities.formatDate(val, tz, 'yyyy-MM-dd');
      }
      obj[h] = val;
    });
    return obj;
  });
}

// Busca en qué fila de la planilla está el registro con ese id (columna A).
// Devuelve el número de fila tal como lo usa Sheets (empieza en 1, y la fila 1
// son los encabezados), o -1 si no existe.
function buscarFilaPorId_(sheet, id) {
  const ultimaFila = sheet.getLastRow();
  if (ultimaFila < 2) return -1;
  // Leemos solo la columna A (ids) de una vez: es mucho más rápido que leer
  // celda por celda, porque cada llamada a la planilla es un viaje al servidor.
  const ids = sheet.getRange(2, 1, ultimaFila - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2; // +2: arrancamos en la fila 2
  }
  return -1;
}

// --------------------------------------------------------------
// Funciones que llama el frontend (Index.html) vía google.script.run
// --------------------------------------------------------------

// Trae todo lo necesario para pintar el dashboard de una sola vez
function obtenerDatos() {
  asegurarEncabezados_();
  return {
    escuelas: sheetToObjects_(getSheet_('Escuelas')),
    actividades: sheetToObjects_(getSheet_('Actividades')),
  };
}

function agregarEscuela(datos) {
  asegurarEncabezados_();
  const sheet = getSheet_('Escuelas');
  const id = Utilities.getUuid();
  sheet.appendRow([
    id,
    datos.nombre || '',
    datos.zona || '',
    datos.contacto_nombre || '',
    datos.contacto_tel || '',
    datos.notas || '',
  ]);
  return id;
}

function agregarActividad(datos) {
  asegurarEncabezados_();
  const sheet = getSheet_('Actividades');
  const id = Utilities.getUuid();
  sheet.appendRow([
    id,
    datos.escuela_id,
    datos.fecha,
    datos.tipo,
    datos.descripcion || '',
    datos.autor || '',
  ]);
  return id;
}

// Registra la MISMA actividad (misma fecha, tipo, descripción, autor) para
// varias escuelas de una sola vez. Se usa, por ejemplo, cuando se manda el
// mismo material por WhatsApp a varias escuelas el mismo día: en vez de
// cargar el mensaje repetidas veces, se tilda a quiénes se les mandó y se
// crea una fila por escuela en la planilla.
function agregarActividadMasiva(datosBase, escuelaIds) {
  asegurarEncabezados_();
  const sheet = getSheet_('Actividades');
  const nuevos = [];

  escuelaIds.forEach(function (escuela_id) {
    const id = Utilities.getUuid();
    sheet.appendRow([
      id,
      escuela_id,
      datosBase.fecha,
      datosBase.tipo,
      datosBase.descripcion || '',
      datosBase.autor || '',
    ]);
    nuevos.push({
      id: id,
      escuela_id: escuela_id,
      fecha: datosBase.fecha,
      tipo: datosBase.tipo,
      descripcion: datosBase.descripcion || '',
      autor: datosBase.autor || '',
    });
  });

  return nuevos;
}

// Corrige una actividad ya cargada (por ejemplo, una fecha mal puesta).
// Se reescribe la fila completa (menos el id, que no cambia nunca).
//
// LockService: si dos personas guardan cambios exactamente al mismo tiempo,
// el "lock" hace que una espere a que termine la otra. Así no pasa que una
// busca la fila 7, la otra borra una fila de más arriba, y la primera termina
// escribiendo sobre la actividad equivocada.
function editarActividad(id, datos) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // espera hasta 10 segundos
  try {
    const sheet = getSheet_('Actividades');
    const fila = buscarFilaPorId_(sheet, id);
    if (fila === -1) throw new Error('No se encontró la actividad (¿la borró alguien?)');

    // Columnas B a F: escuela_id, fecha, tipo, descripcion, autor
    sheet.getRange(fila, 2, 1, 5).setValues([[
      datos.escuela_id,
      datos.fecha,
      datos.tipo,
      datos.descripcion || '',
      datos.autor || '',
    ]]);

    return {
      id: id,
      escuela_id: datos.escuela_id,
      fecha: datos.fecha,
      tipo: datos.tipo,
      descripcion: datos.descripcion || '',
      autor: datos.autor || '',
    };
  } finally {
    lock.releaseLock();
  }
}

// Borra una actividad cargada por error (la fila desaparece de la planilla).
function eliminarActividad(id) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_('Actividades');
    const fila = buscarFilaPorId_(sheet, id);
    if (fila === -1) throw new Error('No se encontró la actividad (¿ya estaba borrada?)');
    sheet.deleteRow(fila);
    return id;
  } finally {
    lock.releaseLock();
  }
}
