let familiares = [];
let mapa;
const markers = {};

async function iniciar() {
  const resp = await fetch("data/familiares.json");
  const seed = await resp.json();
  const { posts, ubicaciones } = await Api.obtenerDatos();

  familiares = fusionarUbicaciones(seed, ubicaciones);

  renderTarjetas();
  renderMapa();
  actualizarRelojes();
  setInterval(actualizarRelojes, 1000);

  renderFeed(posts);
  configurarCheckin();
}

// Combina los datos fijos del familiar (nombre, avatar, bio) con la última
// ubicación que reportó desde el formulario de check-in (si hay alguna).
function fusionarUbicaciones(seed, ubicaciones) {
  const porId = {};
  ubicaciones.forEach((u) => (porId[u.familiarId] = u));

  return seed.map((f) => {
    const u = porId[f.id];
    if (!u) return f;
    return {
      ...f,
      ciudad: u.ciudad || f.ciudad,
      pais: u.pais || f.pais,
      lat: u.lat || f.lat,
      lon: u.lon || f.lon,
      zonaHoraria: u.zonaHoraria || f.zonaHoraria
    };
  });
}

function renderTarjetas() {
  const cont = document.getElementById("tarjetas");
  cont.innerHTML = familiares
    .map(
      (f) => `
    <a class="tarjeta" href="perfil.html?id=${f.id}" data-id="${f.id}">
      <img class="avatar" src="${f.avatar}" alt="${f.nombre}">
      <div class="info">
        <div class="nombre">${f.nombre}</div>
        <div class="lugar">${f.ciudad}, ${f.pais}</div>
        <div class="hora" data-hora>--:--:--</div>
        <div class="desfase" data-desfase></div>
      </div>
    </a>`
    )
    .join("");
}

function renderMapa() {
  mapa = L.map("mapa", { scrollWheelZoom: false }).setView([10, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(mapa);

  familiares.forEach((f) => {
    const icon = L.divIcon({
      className: "",
      html: `<img class="marker-avatar" src="${f.avatar}" alt="${f.nombre}">`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
    const marker = L.marker([f.lat, f.lon], { icon }).addTo(mapa);
    marker.bindPopup(
      `<div class="popup-nombre">${f.nombre}</div>
       <div class="muted">${f.ciudad}, ${f.pais}</div>
       <div class="popup-hora" data-popup-hora="${f.id}">--:--:--</div>
       <a class="popup-link" href="perfil.html?id=${f.id}">Ver perfil →</a>`
    );
    markers[f.id] = marker;
  });
}

function actualizarRelojes() {
  familiares.forEach((f) => {
    const dt = Reloj.ahora(f.zonaHoraria);
    const horaTexto = Reloj.formatoHora(dt);
    const deNoche = Reloj.esDeNoche(dt);

    const tarjeta = document.querySelector(`.tarjeta[data-id="${f.id}"]`);
    if (tarjeta) {
      tarjeta.querySelector("[data-hora]").textContent = horaTexto;
      tarjeta.querySelector("[data-desfase]").textContent = Reloj.desfaseTexto(dt);
      tarjeta.classList.toggle("es-de-noche", deNoche);
    }

    const popup = document.querySelector(`[data-popup-hora="${f.id}"]`);
    if (popup) popup.textContent = horaTexto;

    const marker = markers[f.id];
    if (marker && (marker.getLatLng().lat !== f.lat || marker.getLatLng().lng !== f.lon)) {
      marker.setLatLng([f.lat, f.lon]);
    }
  });
}

function renderFeed(posts) {
  const cont = document.getElementById("feed");

  if (!Api.backendConfigurado()) {
    cont.innerHTML = "";
    return;
  }

  const ordenados = [...posts].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  if (ordenados.length === 0) {
    cont.innerHTML = "<p class='muted'>Todavía no hay publicaciones en el muro.</p>";
    return;
  }

  cont.innerHTML = ordenados.map(renderPublicacion).join("");
}

function renderPublicacion(p) {
  const f = familiares.find((fam) => fam.id === p.familiarId);
  const nombre = f ? f.nombre : p.familiarId;
  const avatar = f ? f.avatar : "";
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
        <div class="titulo">${avatar ? `<img class="mini-avatar" src="${avatar}" alt="">` : ""}${nombre}</div>
        <div class="fecha">${new Date(p.fecha).toLocaleString("es-AR")}${lugar ? " · " + lugar : ""}</div>
        <div class="descripcion">${p.titulo ? `<strong>${p.titulo}</strong><br>` : ""}${p.descripcion || ""}</div>
      </div>
    </div>`;
}

function configurarCheckin() {
  const aviso = document.getElementById("aviso-backend");
  const form = document.getElementById("form-checkin");
  const selectQuien = form.querySelector('[name="familiarId"]');
  const inputZona = form.querySelector('[name="zonaHoraria"]');

  selectQuien.innerHTML = familiares
    .map((f) => `<option value="${f.id}">${f.nombre}</option>`)
    .join("");
  inputZona.value = Api.zonaHorariaLocal();

  if (!Api.backendConfigurado()) {
    aviso.style.display = "block";
    aviso.textContent =
      "El muro familiar todavía no está conectado a Google Drive. " +
      "Seguí las instrucciones de SETUP.md para activarlo.";
    form.querySelector("button[type=submit]").disabled = true;
    return;
  }

  const btnGeo = document.getElementById("btn-geo");
  btnGeo.addEventListener("click", async () => {
    btnGeo.disabled = true;
    btnGeo.textContent = "Buscando...";
    try {
      const { lat, lon } = await Api.obtenerUbicacionActual();
      form.lat.value = lat;
      form.lon.value = lon;
      const lugar = await Api.geocodificarInverso(lat, lon);
      if (lugar) {
        if (lugar.ciudad) form.ciudad.value = lugar.ciudad;
        if (lugar.pais) form.pais.value = lugar.pais;
      }
    } catch (err) {
      alert("No se pudo obtener tu ubicación: " + err.message);
    } finally {
      btnGeo.disabled = false;
      btnGeo.textContent = "📍 Usar mi ubicación actual";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const boton = form.querySelector("button[type=submit]");
    boton.disabled = true;
    boton.textContent = "Publicando...";

    try {
      const archivo = form.archivo.files[0];
      let fileBase64 = null;
      let fileName = null;
      let mimeType = null;

      if (archivo) {
        fileBase64 = await Api.archivoABase64(archivo);
        fileName = archivo.name;
        mimeType = archivo.type;
      }

      await Api.publicar({
        familiarId: form.familiarId.value,
        ubicacion: {
          ciudad: form.ciudad.value.trim(),
          pais: form.pais.value.trim(),
          lat: form.lat.value || null,
          lon: form.lon.value || null,
          zonaHoraria: form.zonaHoraria.value
        },
        titulo: "",
        descripcion: form.descripcion.value.trim(),
        fileBase64,
        fileName,
        mimeType
      });

      form.reset();
      inputZona.value = Api.zonaHorariaLocal();
      location.reload();
    } catch (err) {
      alert("No se pudo publicar: " + err.message);
    } finally {
      boton.disabled = false;
      boton.textContent = "Publicar";
    }
  });
}

iniciar();
