/* =========================================================
   Más Aire · generador de presupuestos y facturas
   ---------------------------------------------------------
   Idea general (patrón "estado -> render"):
     1. Todo lo que cargás vive en un objeto llamado `estado`.
     2. Cada vez que cambia algo, llamamos a `render()`, que
        vuelve a escribir la hoja usando ese estado.
     3. También guardamos el estado en el navegador
        (localStorage), así si cerrás la página no se pierde.
   ========================================================= */

// Datos fijos de la empresa. Si cambia el teléfono, se cambia acá.
const CONFIG = {
  telefono: '221 400 4900',
  claveGuardado: 'masaire-borrador-v1',
};

const form = document.getElementById('form');
const listaItems = document.getElementById('items');

// Estado inicial (un documento vacío con un ítem)
function estadoVacio() {
  return {
    tipo: 'PRESUPUESTO',
    numero: '',
    rubro: 'TRABAJO ELÉCTRICO',
    cliente: '',
    contacto: '',
    fecha: hoyISO(),
    items: [{ detalle: '', importe: '' }],
    total: '',
    notas: '',
  };
}

let estado = cargar() || estadoVacio();

/* ---------------------------------------------------------
   Utilidades
   --------------------------------------------------------- */

// Fecha de hoy en formato AAAA-MM-DD (lo que usa <input type="date">)
function hoyISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // corrige zona horaria
  return d.toISOString().slice(0, 10);
}

// "2026-11-06" -> "06 / 11 / 2026"
function fechaLinda(iso) {
  if (!iso) return '____ / ____ / ______';
  const [a, m, d] = iso.split('-');
  return `${d} / ${m} / ${a}`;
}

// Convierte lo que escribe el usuario en número.
// Acepta "80000", "80.000", "80.000,50" (formato argentino).
function aNumero(texto) {
  if (texto === null || texto === undefined) return 0;
  let t = String(texto).trim().replace(/\$/g, '').replace(/\s/g, '');
  if (!t) return 0;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.'); // 80.000,50
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, ''); // 80.000
  const n = Number(t);
  return Number.isFinite(n) ? n : 0;
}

// 80000 -> "$ 80.000"   (Intl formatea números según el país)
function plata(n) {
  const tieneCentavos = Math.round(n * 100) % 100 !== 0;
  return '$ ' + n.toLocaleString('es-AR', {
    minimumFractionDigits: tieneCentavos ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

// Evita que alguien "rompa" el HTML escribiendo < o > en un campo
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/* ---------------------------------------------------------
   Número a letras (80000 -> "ochenta mil")
   Se arma por bloques de 3 cifras: millones | miles | resto
   --------------------------------------------------------- */
const UNIDADES = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho',
  'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco',
  'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
const DECENAS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const CENTENAS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
  'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

function hasta99(n) {
  if (n < 30) return UNIDADES[n];
  const d = Math.floor(n / 10), u = n % 10;
  return DECENAS[d] + (u ? ' y ' + UNIDADES[u] : '');
}

function hasta999(n) {
  if (n === 100) return 'cien';
  const c = Math.floor(n / 100), resto = n % 100;
  return [CENTENAS[c], hasta99(resto)].filter(Boolean).join(' ');
}

// Antes de "mil" o "millones" se dice "un"/"veintiún", no "uno"/"veintiuno"
function apocope(txt) {
  return txt.replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un');
}

function enLetras(numero) {
  const n = Math.floor(numero);
  if (n === 0) return 'cero';
  if (n >= 1e9) return n.toLocaleString('es-AR');

  const millones = Math.floor(n / 1e6);
  const miles = Math.floor((n % 1e6) / 1000);
  const resto = n % 1000;
  const partes = [];

  if (millones === 1) partes.push('un millón');
  else if (millones > 1) partes.push(apocope(hasta999(millones)) + ' millones');

  if (miles === 1) partes.push('mil');
  else if (miles > 1) partes.push(apocope(hasta999(miles)) + ' mil');

  if (resto) partes.push(hasta999(resto));

  let texto = partes.join(' ');
  const centavos = Math.round((numero - n) * 100);
  if (centavos) texto += ` con ${String(centavos).padStart(2, '0')}/100`;
  return texto;
}

/* ---------------------------------------------------------
   Cálculo del total
   Si algún ítem tiene importe -> el total es la suma.
   Si ninguno tiene -> se usa el total escrito a mano.
   --------------------------------------------------------- */
function calcularTotal() {
  const conImporte = estado.items.filter(it => aNumero(it.importe) > 0);
  if (conImporte.length) {
    return { monto: conImporte.reduce((s, it) => s + aNumero(it.importe), 0), automatico: true };
  }
  return { monto: aNumero(estado.total), automatico: false };
}

/* ---------------------------------------------------------
   Formulario de ítems (se dibuja desde el estado)
   --------------------------------------------------------- */
function dibujarItemsDelFormulario() {
  listaItems.innerHTML = estado.items.map((it, i) => `
    <li class="item" data-i="${i}">
      <textarea rows="2" data-campo="detalle" placeholder="Detalle del trabajo ${i + 1}">${esc(it.detalle)}</textarea>
      <input data-campo="importe" inputmode="decimal" placeholder="$ (opc.)" value="${esc(it.importe)}">
      <button type="button" class="item__borrar" title="Quitar ítem" aria-label="Quitar ítem ${i + 1}">✕</button>
    </li>`).join('');
}

/* ---------------------------------------------------------
   RENDER: escribe la hoja a partir del estado
   --------------------------------------------------------- */
function render() {
  const $ = id => document.getElementById(id);

  $('v-tel').textContent = 'Tel. ' + CONFIG.telefono;

  const nro = estado.numero ? ` N.º ${estado.numero}` : '';
  $('v-titulo').textContent = `${estado.tipo} DE ${estado.rubro || ''}`.trim() + nro;

  $('v-cliente').textContent = estado.cliente;
  $('v-contacto').textContent = estado.contacto;
  $('v-contacto-linea').style.display = estado.contacto ? '' : 'none';
  $('v-fecha').textContent = fechaLinda(estado.fecha);

  // La columna "Importe" aparece solo si algún ítem tiene precio
  const mostrarImporte = estado.items.some(it => aNumero(it.importe) > 0);
  $('v-thead').innerHTML =
    '<th class="col-item">Ítem</th><th>Detalle del trabajo</th>' +
    (mostrarImporte ? '<th class="col-importe">Importe</th>' : '');

  // Solo mostramos ítems que tengan algo escrito
  const visibles = estado.items.filter(it => it.detalle.trim() || aNumero(it.importe) > 0);
  $('v-items').innerHTML = visibles.map((it, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(it.detalle)}</td>
      ${mostrarImporte ? `<td class="col-importe">${aNumero(it.importe) ? plata(aNumero(it.importe)) : ''}</td>` : ''}
    </tr>`).join('') || `<tr><td>1</td><td style="color:#aaa">(cargá los trabajos en el formulario)</td>${mostrarImporte ? '<td></td>' : ''}</tr>`;

  const { monto, automatico } = calcularTotal();
  $('v-total').textContent = plata(monto);
  $('v-letras').textContent = `Pesos argentinos: ${enLetras(monto)}.`;
  $('v-notas').textContent = estado.notas;

  // En el formulario: si el total es automático, bloqueamos el campo y avisamos
  form.total.disabled = automatico;
  if (automatico) form.total.value = String(monto);
  $('ayuda-total').textContent = automatico
    ? 'Calculado automáticamente con la suma de los ítems.'
    : 'Escribí el total a mano (o poné importes en los ítems).';

  // El título de la pestaña = nombre sugerido del PDF al guardar
  document.title = `${estado.tipo === 'FACTURA' ? 'Factura' : 'Presupuesto'}${nro} - ${estado.cliente || 'Más Aire'}`;

  guardar();
}

/* ---------------------------------------------------------
   Guardar / cargar en el navegador
   --------------------------------------------------------- */
function guardar() {
  try { localStorage.setItem(CONFIG.claveGuardado, JSON.stringify(estado)); } catch (e) { /* modo privado */ }
}
function cargar() {
  try { return JSON.parse(localStorage.getItem(CONFIG.claveGuardado)); } catch (e) { return null; }
}

// Copia el estado a los campos del formulario (al abrir la página o al limpiar)
function llenarFormulario() {
  for (const campo of ['tipo', 'numero', 'rubro', 'cliente', 'contacto', 'fecha', 'total', 'notas']) {
    form[campo].value = estado[campo] ?? '';
  }
  dibujarItemsDelFormulario();
}

/* ---------------------------------------------------------
   Eventos: qué pasa cuando el usuario hace algo
   --------------------------------------------------------- */

// Un solo "escuchador" para todo el formulario (delegación de eventos)
form.addEventListener('input', (e) => {
  const el = e.target;
  const li = el.closest('.item');
  if (li) {
    estado.items[Number(li.dataset.i)][el.dataset.campo] = el.value;
  } else if (el.name) {
    estado[el.name] = el.value;
  }
  render();
});

listaItems.addEventListener('click', (e) => {
  if (!e.target.classList.contains('item__borrar')) return;
  const i = Number(e.target.closest('.item').dataset.i);
  estado.items.splice(i, 1);
  if (!estado.items.length) estado.items.push({ detalle: '', importe: '' });
  dibujarItemsDelFormulario();
  render();
});

document.getElementById('agregar').addEventListener('click', () => {
  estado.items.push({ detalle: '', importe: '' });
  dibujarItemsDelFormulario();
  render();
  listaItems.lastElementChild.querySelector('textarea').focus();
});

document.getElementById('imprimir').addEventListener('click', () => window.print());

document.getElementById('nuevo').addEventListener('click', () => {
  if (!confirm('¿Borrar todo y empezar un comprobante nuevo?')) return;
  // Si había número, sugerimos el siguiente (0001 -> 0002)
  const sig = estado.numero && /^\d+$/.test(estado.numero)
    ? String(Number(estado.numero) + 1).padStart(estado.numero.length, '0')
    : '';
  const tipo = estado.tipo;
  estado = estadoVacio();
  estado.tipo = tipo;
  estado.numero = sig;
  llenarFormulario();
  render();
});

// Arranque
llenarFormulario();
render();
