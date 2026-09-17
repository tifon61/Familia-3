// Backend de "Familia Alrededor del Mundo".
// Se pega en script.google.com, vinculado a una Google Sheet (ver SETUP.md).
//
// - doGet: devuelve todas las publicaciones guardadas en la hoja "Publicaciones".
// - doPost: recibe una publicación nueva (con o sin archivo adjunto en base64),
//   guarda el archivo en la carpeta de Drive indicada y agrega una fila a la hoja.

const SHEET_NAME = "Publicaciones";
const FOLDER_ID = "PON_AQUI_EL_ID_DE_TU_CARPETA_DE_DRIVE";

function doGet(e) {
  const sheet = obtenerHoja();
  const filas = sheet.getDataRange().getValues();
  const encabezados = filas.shift();

  const posts = filas
    .filter((fila) => fila.some((valor) => valor !== ""))
    .map((fila) => {
      const obj = {};
      encabezados.forEach((h, i) => (obj[h] = fila[i]));
      return obj;
    });

  return responderJson({ ok: true, posts });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { familiarId, tipo, titulo, descripcion, fileBase64, fileName, mimeType } = body;

    if (!familiarId) throw new Error("Falta familiarId");

    let driveUrl = "";
    let fileId = "";

    if (fileBase64) {
      const carpeta = DriveApp.getFolderById(FOLDER_ID);
      const bytes = Utilities.base64Decode(fileBase64);
      const blob = Utilities.newBlob(bytes, mimeType, fileName);
      const archivo = carpeta.createFile(blob);
      archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileId = archivo.getId();
      driveUrl = "https://drive.google.com/uc?export=view&id=" + fileId;
    }

    const sheet = obtenerHoja();
    const fecha = new Date().toISOString();
    sheet.appendRow([
      Utilities.getUuid(),
      familiarId,
      tipo || "nota",
      titulo || "",
      descripcion || "",
      driveUrl,
      fileId,
      fecha
    ]);

    return responderJson({ ok: true, driveUrl, fileId });
  } catch (err) {
    return responderJson({ ok: false, error: err.message });
  }
}

function obtenerHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "id",
      "familiarId",
      "tipo",
      "titulo",
      "descripcion",
      "driveUrl",
      "fileId",
      "fecha"
    ]);
  }
  return sheet;
}

function responderJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
