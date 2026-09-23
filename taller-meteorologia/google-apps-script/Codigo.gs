// Backend del "Taller de Información Meteorológica - Actividad Final".
// Se pega en Extensiones → Apps Script de una Google Sheet (ver GOOGLE-SHEETS.md).
//
// Cada reporte que envía un brigadista llega acá (doPost) y se guarda como una
// fila en la hoja "Respuestas":
// - Los encabezados se crean solos con el primer envío. Si más adelante se
//   agregan preguntas a la app, las columnas nuevas se suman al final.
// - Cada envío trae un "ID envío" único. Si el mismo reporte llega dos veces
//   (por ejemplo, al tocar "Reintentar envío"), se actualiza la misma fila en
//   lugar de duplicarla.

// Clave para ver los resultados desde la página interna (index.html#resultados).
// CAMBIALA por una propia antes de publicar: quien la tenga puede leer todas
// las respuestas. Mientras diga "cambiar-esta-clave", la lectura está bloqueada.
const CLAVE_RESULTADOS = "cambiar-esta-clave";

const NOMBRE_HOJA = "Respuestas";
const COLUMNA_ID = "ID envío";
const COLUMNA_FECHA = "Fecha de envío";

// - Sin parámetros: abrir la URL en el navegador sirve para comprobar que el
//   script está publicado correctamente.
// - ?accion=resultados&clave=...: devuelve todas las filas para la página de
//   resultados.
function doGet(e) {
  const parametros = (e && e.parameter) || {};
  if (parametros.accion !== "resultados") {
    return responderJson({ ok: true, mensaje: "El script del taller está funcionando." });
  }
  if (CLAVE_RESULTADOS === "cambiar-esta-clave") {
    return responderJson({ ok: false, error: "Falta configurar CLAVE_RESULTADOS en el script." });
  }
  if (parametros.clave !== CLAVE_RESULTADOS) {
    return responderJson({ ok: false, error: "Clave incorrecta." });
  }
  return responderJson({ ok: true, filas: leerFilas() });
}

// Convierte la hoja en una lista de objetos { columna: valor }.
function leerFilas() {
  const hoja = obtenerHoja();
  if (hoja.getLastRow() < 2) return [];
  const valores = hoja.getRange(1, 1, hoja.getLastRow(), hoja.getLastColumn()).getValues();
  const encabezados = valores[0];
  return valores.slice(1).map((fila) => {
    const obj = {};
    encabezados.forEach((columna, i) => { if (columna) obj[columna] = fila[i]; });
    return obj;
  });
}

function doPost(e) {
  // El candado evita que dos envíos simultáneos se pisen al escribir.
  const candado = LockService.getScriptLock();
  candado.waitLock(15000);
  try {
    const datos = JSON.parse(e.postData.contents);
    const campos = datos.campos; // [[columna, valor], [columna, valor], ...]
    if (!Array.isArray(campos) || campos.length === 0) throw new Error("El envío llegó vacío");

    const hoja = obtenerHoja();
    const encabezados = asegurarEncabezados(hoja, campos.map((c) => c[0]));

    const valores = {};
    campos.forEach(([columna, valor]) => { valores[columna] = valor; });
    const fila = encabezados.map((columna) => prepararValor(columna, valores[columna]));

    const numeroFila = buscarFilaPorId(hoja, encabezados, valores[COLUMNA_ID]);
    if (numeroFila) {
      hoja.getRange(numeroFila, 1, 1, fila.length).setValues([fila]);
    } else {
      hoja.appendRow(fila);
    }
    return responderJson({ ok: true });
  } catch (err) {
    return responderJson({ ok: false, error: String(err) });
  } finally {
    candado.releaseLock();
  }
}

function obtenerHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  return libro.getSheetByName(NOMBRE_HOJA) || libro.insertSheet(NOMBRE_HOJA);
}

// Devuelve la lista de encabezados, agregando al final los que falten.
function asegurarEncabezados(hoja, columnasDelEnvio) {
  const actuales = hoja.getLastRow() > 0
    ? hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].filter(String)
    : [];
  const nuevas = columnasDelEnvio.filter((c) => actuales.indexOf(c) === -1);
  if (nuevas.length > 0) {
    hoja.getRange(1, actuales.length + 1, 1, nuevas.length).setValues([nuevas]);
  }
  const todas = actuales.concat(nuevas);
  // Encabezado con los colores del Grupo de Pronóstico, fijo al hacer scroll.
  hoja.getRange(1, 1, 1, todas.length)
    .setFontWeight("bold").setBackground("#003f6b").setFontColor("#ffffff").setWrap(true);
  hoja.setFrozenRows(1);
  return todas;
}

function buscarFilaPorId(hoja, encabezados, id) {
  const indice = encabezados.indexOf(COLUMNA_ID);
  if (!id || indice === -1 || hoja.getLastRow() < 2) return null;
  const ids = hoja.getRange(2, indice + 1, hoja.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) return i + 2; // +2: la fila 1 es el encabezado
  }
  return null;
}

function prepararValor(columna, valor) {
  if (valor === undefined || valor === null) return "";
  if (columna === COLUMNA_FECHA) return new Date(valor); // así la hoja la trata como fecha
  // Si una respuesta empieza con =, +, - o @, Sheets la tomaría como fórmula.
  // Con el apóstrofo adelante se guarda como texto tal cual.
  if (typeof valor === "string" && /^[=+\-@]/.test(valor)) return "'" + valor;
  return valor;
}

function responderJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
