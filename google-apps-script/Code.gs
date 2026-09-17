// Backend de "Familia Alrededor del Mundo".
// Se pega en script.google.com, vinculado a una Google Sheet (ver SETUP.md).
//
// Maneja dos cosas, cada una en su propia hoja (se crean solas la primera vez):
// - "Ubicaciones": dónde está cada familiar ahora mismo (lo último que reportó).
// - "Publicaciones": el muro familiar (fotos/videos/notas con ubicación y fecha).
//
// - doGet: devuelve { posts, ubicaciones } para armar el mapa y el muro.
// - doPost: recibe un "check-in" (ubicación) y/o una publicación nueva.

const SHEET_PUBLICACIONES = "Publicaciones";
const SHEET_UBICACIONES = "Ubicaciones";
const FOLDER_ID = "PON_AQUI_EL_ID_DE_TU_CARPETA_DE_DRIVE";

const ENCABEZADOS_PUBLICACIONES = [
  "id", "familiarId", "tipo", "titulo", "descripcion",
  "ciudad", "pais", "driveUrl", "fileId", "fecha"
];

const ENCABEZADOS_UBICACIONES = [
  "familiarId", "ciudad", "pais", "lat", "lon", "zonaHoraria", "actualizadoEn"
];

function doGet(e) {
  return responderJson({
    ok: true,
    posts: obtenerFilas(SHEET_PUBLICACIONES, ENCABEZADOS_PUBLICACIONES),
    ubicaciones: obtenerFilas(SHEET_UBICACIONES, ENCABEZADOS_UBICACIONES)
  });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { familiarId, ubicacion, titulo, descripcion, fileBase64, fileName, mimeType } = body;

    if (!familiarId) throw new Error("Falta familiarId");

    if (ubicacion && ubicacion.ciudad) {
      actualizarUbicacion(familiarId, ubicacion);
    }

    let resultadoPost = null;
    const hayContenido = titulo || descripcion || fileBase64;
    if (hayContenido) {
      resultadoPost = crearPublicacion(familiarId, ubicacion, titulo, descripcion, fileBase64, fileName, mimeType);
    }

    return responderJson({ ok: true, post: resultadoPost });
  } catch (err) {
    return responderJson({ ok: false, error: err.message });
  }
}

function actualizarUbicacion(familiarId, ubicacion) {
  const sheet = obtenerHoja(SHEET_UBICACIONES, ENCABEZADOS_UBICACIONES);
  const filas = sheet.getDataRange().getValues();

  const fila = [
    familiarId,
    ubicacion.ciudad || "",
    ubicacion.pais || "",
    ubicacion.lat || "",
    ubicacion.lon || "",
    ubicacion.zonaHoraria || "",
    new Date().toISOString()
  ];

  let indiceExistente = -1;
  for (let i = 1; i < filas.length; i++) {
    if (filas[i][0] === familiarId) {
      indiceExistente = i;
      break;
    }
  }

  if (indiceExistente > -1) {
    sheet.getRange(indiceExistente + 1, 1, 1, fila.length).setValues([fila]);
  } else {
    sheet.appendRow(fila);
  }
}

function crearPublicacion(familiarId, ubicacion, titulo, descripcion, fileBase64, fileName, mimeType) {
  let driveUrl = "";
  let fileId = "";
  let tipo = "nota";

  if (fileBase64) {
    const carpeta = DriveApp.getFolderById(FOLDER_ID);
    const bytes = Utilities.base64Decode(fileBase64);
    const blob = Utilities.newBlob(bytes, mimeType, fileName);
    const archivo = carpeta.createFile(blob);
    archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    fileId = archivo.getId();
    driveUrl = "https://drive.google.com/uc?export=view&id=" + fileId;
    tipo = (mimeType || "").indexOf("video") === 0 ? "video" : "foto";
  }

  const sheet = obtenerHoja(SHEET_PUBLICACIONES, ENCABEZADOS_PUBLICACIONES);
  const fecha = new Date().toISOString();
  const id = Utilities.getUuid();

  sheet.appendRow([
    id,
    familiarId,
    tipo,
    titulo || "",
    descripcion || "",
    (ubicacion && ubicacion.ciudad) || "",
    (ubicacion && ubicacion.pais) || "",
    driveUrl,
    fileId,
    fecha
  ]);

  return { id, driveUrl, fileId, fecha };
}

function obtenerFilas(nombreHoja, encabezados) {
  const sheet = obtenerHoja(nombreHoja, encabezados);
  const filas = sheet.getDataRange().getValues();
  const encabezadosReales = filas.shift();

  return filas
    .filter((fila) => fila.some((valor) => valor !== ""))
    .map((fila) => {
      const obj = {};
      encabezadosReales.forEach((h, i) => (obj[h] = fila[i]));
      return obj;
    });
}

function obtenerHoja(nombre, encabezados) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(nombre);
  if (!sheet) {
    sheet = ss.insertSheet(nombre);
    sheet.appendRow(encabezados);
  }
  return sheet;
}

function responderJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
