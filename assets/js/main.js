let familiares = [];
let mapa;
const markers = {};

async function iniciar() {
  const resp = await fetch("data/familiares.json");
  familiares = await resp.json();

  renderTarjetas();
  renderMapa();
  actualizarRelojes();
  setInterval(actualizarRelojes, 1000);
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
  });
}

iniciar();
