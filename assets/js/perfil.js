const params = new URLSearchParams(location.search);
const idFamiliar = params.get("id");

let familiar = null;

async function iniciar() {
  const resp = await fetch("data/familiares.json");
  const familiares = await resp.json();
  familiar = familiares.find((f) => f.id === idFamiliar);

  if (!familiar) {
    document.getElementById("perfil-header").innerHTML =
      "<p>No se encontró ese perfil.</p>";
    return;
  }

  renderHeader();
  setInterval(renderHora, 1000);
  renderHora();

  configurarFormularioSubida();
  cargarHistorico();
}

function renderHeader() {
  document.getElementById("perfil-header").innerHTML = `
    <img class="avatar" src="${familiar.avatar}" alt="${familiar.nombre}">
    <div>
      <h1>${familiar.nombre}</h1>
      <div class="muted">${familiar.ciudad}, ${familiar.pais}</div>
      <div class="hora-grande" data-hora>--:--:--</div>
      <div class="muted" data-fecha></div>
      <p>${familiar.bio || ""}</p>
    </div>
  `;
  document.title = `${familiar.nombre} · Familia`;
}

function renderHora() {
  const dt = Reloj.ahora(familiar.zonaHoraria);
  const h = document.querySelector("[data-hora]");
  const d = document.querySelector("[data-fecha]");
  if (h) h.textContent = `${Reloj.formatoHora(dt)} (${Reloj.desfaseTexto(dt)})`;
  if (d) d.textContent = Reloj.formatoDia(dt);
}

function backendConfigurado() {
  return Boolean(window.APP_CONFIG && window.APP_CONFIG.APPS_SCRIPT_URL);
}

function configurarFormularioSubida() {
  const aviso = document.getElementById("aviso-backend");
  const form = document.getElementById("form-subir");

  if (!backendConfigurado()) {
    aviso.style.display = "block";
    aviso.textContent =
      "El histórico de fotos y videos todavía no está conectado a Google Drive. " +
      "Seguí las instrucciones de SETUP.md para activarlo.";
    form.querySelector("button").disabled = true;
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const boton = form.querySelector("button");
    boton.disabled = true;
    boton.textContent = "Subiendo...";

    try {
      const titulo = form.titulo.value.trim();
      const descripcion = form.descripcion.value.trim();
      const archivo = form.archivo.files[0];

      let fileBase64 = null;
      let fileName = null;
      let mimeType = null;
      let tipo = "nota";

      if (archivo) {
        fileBase64 = await archivoABase64(archivo);
        fileName = archivo.name;
        mimeType = archivo.type;
        tipo = archivo.type.startsWith("video") ? "video" : "foto";
      }

      const resp = await fetch(window.APP_CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          familiarId: idFamiliar,
          tipo,
          titulo,
          descripcion,
          fileBase64,
          fileName,
          mimeType
        })
      });

      const data = await resp.json();
      if (!data.ok) throw new Error(data.error || "Error desconocido");

      form.reset();
      await cargarHistorico();
    } catch (err) {
      alert("No se pudo subir: " + err.message);
    } finally {
      boton.disabled = false;
      boton.textContent = "Publicar";
    }
  });
}

function archivoABase64(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result.split(",")[1]);
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

async function cargarHistorico() {
  const cont = document.getElementById("historico");
  if (!backendConfigurado()) {
    cont.innerHTML = "";
    return;
  }

  cont.innerHTML = "<p class='muted'>Cargando histórico...</p>";
  try {
    const resp = await fetch(window.APP_CONFIG.APPS_SCRIPT_URL);
    const data = await resp.json();
    const publicaciones = (data.posts || [])
      .filter((p) => p.familiarId === idFamiliar)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (publicaciones.length === 0) {
      cont.innerHTML = "<p class='muted'>Todavía no hay publicaciones.</p>";
      return;
    }

    cont.innerHTML = publicaciones.map(renderPublicacion).join("");
  } catch (err) {
    cont.innerHTML = "<p class='muted'>No se pudo cargar el histórico.</p>";
  }
}

function renderPublicacion(p) {
  const media = p.tipo === "video"
    ? `<video src="${p.driveUrl}" controls></video>`
    : p.driveUrl
      ? `<img src="${p.driveUrl}" alt="${p.titulo}">`
      : "";

  return `
    <div class="publicacion">
      ${media}
      <div class="contenido">
        <div class="titulo">${p.titulo || "(sin título)"}</div>
        <div class="fecha">${new Date(p.fecha).toLocaleString("es-AR")}</div>
        <div class="descripcion">${p.descripcion || ""}</div>
      </div>
    </div>`;
}

iniciar();
