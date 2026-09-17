const params = new URLSearchParams(location.search);
const idFamiliar = params.get("id");

let familiar = null;

async function iniciar() {
  const resp = await fetch("data/familiares.json");
  const seed = await resp.json();
  const { posts, ubicaciones } = await Api.obtenerDatos();

  const ubicacion = ubicaciones.find((u) => u.familiarId === idFamiliar);
  familiar = seed.find((f) => f.id === idFamiliar);

  if (!familiar) {
    document.getElementById("perfil-header").innerHTML = "<p>No se encontró ese perfil.</p>";
    return;
  }

  if (ubicacion) {
    familiar = {
      ...familiar,
      ciudad: ubicacion.ciudad || familiar.ciudad,
      pais: ubicacion.pais || familiar.pais,
      zonaHoraria: ubicacion.zonaHoraria || familiar.zonaHoraria
    };
  }

  renderHeader();
  setInterval(renderHora, 1000);
  renderHora();

  renderHistorico(posts.filter((p) => p.familiarId === idFamiliar));

  if (!Api.backendConfigurado()) {
    const aviso = document.getElementById("aviso-backend");
    aviso.style.display = "block";
    aviso.textContent =
      "El muro familiar todavía no está conectado a Google Drive. Seguí SETUP.md para activarlo.";
  }
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

function renderHistorico(publicaciones) {
  const cont = document.getElementById("historico");

  if (!Api.backendConfigurado()) {
    cont.innerHTML = "";
    return;
  }

  const ordenadas = [...publicaciones].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  if (ordenadas.length === 0) {
    cont.innerHTML = "<p class='muted'>Todavía no hay publicaciones. Publicá una desde la home.</p>";
    return;
  }

  cont.innerHTML = ordenadas.map(renderPublicacion).join("");
}

function renderPublicacion(p) {
  const lugar = [p.ciudad, p.pais].filter(Boolean).join(", ");
  const media = p.tipo === "video"
    ? `<video src="${p.driveUrl}" controls></video>`
    : p.driveUrl
      ? `<img src="${p.driveUrl}" alt="${p.titulo}">`
      : "";

  return `
    <div class="publicacion">
      ${media}
      <div class="contenido">
        <div class="fecha">${new Date(p.fecha).toLocaleString("es-AR")}${lugar ? " · " + lugar : ""}</div>
        <div class="descripcion">${p.titulo ? `<strong>${p.titulo}</strong><br>` : ""}${p.descripcion || ""}</div>
      </div>
    </div>`;
}

iniciar();
