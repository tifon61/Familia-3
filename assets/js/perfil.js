const params = new URLSearchParams(location.search);
const idFamiliar = params.get("id");

let familiar = null;

async function iniciar() {
  const resp = await fetch("data/familiares.json");
  const seed = await resp.json();
  const { posts, ubicaciones, perfiles } = await Api.obtenerDatos();

  const ubicacion = ubicaciones.find((u) => u.familiarId === idFamiliar);
  const perfil = perfiles.find((p) => p.familiarId === idFamiliar);
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

  if (perfil) {
    familiar = {
      ...familiar,
      nombre: perfil.nombre || familiar.nombre,
      avatar: perfil.avatar || familiar.avatar,
      bio: perfil.bio || familiar.bio
    };
  }

  renderHeader();
  setInterval(renderHora, 1000);
  renderHora();

  renderHistorico(posts.filter((p) => p.familiarId === idFamiliar));
  configurarEdicionPerfil();

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

function configurarEdicionPerfil() {
  const btnToggle = document.getElementById("btn-toggle-editar");
  const form = document.getElementById("form-perfil");

  if (!Api.backendConfigurado()) {
    btnToggle.style.display = "none";
    return;
  }

  form.nombre.value = familiar.nombre;
  form.bio.value = familiar.bio || "";

  btnToggle.addEventListener("click", () => {
    form.style.display = form.style.display === "none" ? "block" : "none";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const boton = form.querySelector("button[type=submit]");
    boton.disabled = true;
    boton.textContent = "Guardando...";

    try {
      const archivo = form.avatarArchivo.files[0];
      let avatarBase64 = null;
      let avatarFileName = null;
      let avatarMimeType = null;

      if (archivo) {
        avatarBase64 = await Api.archivoABase64(archivo);
        avatarFileName = archivo.name;
        avatarMimeType = archivo.type;
      }

      await Api.publicar({
        familiarId: idFamiliar,
        perfil: {
          nombre: form.nombre.value.trim(),
          bio: form.bio.value.trim(),
          avatarBase64,
          avatarFileName,
          avatarMimeType
        }
      });

      location.reload();
    } catch (err) {
      alert("No se pudo guardar: " + err.message);
    } finally {
      boton.disabled = false;
      boton.textContent = "Guardar";
    }
  });
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
    ? `<iframe class="video-embed" src="https://drive.google.com/file/d/${p.fileId}/preview" allow="autoplay" allowfullscreen></iframe>`
    : p.driveUrl
      ? `<img src="${p.driveUrl}" alt="${p.titulo}" loading="lazy">`
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
