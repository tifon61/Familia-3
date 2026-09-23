// Esquemas meteorológicos dibujados en SVG. No usan imágenes externas: todo
// son formas (path, line, circle) posicionadas en un "lienzo" de 400x260.
// El viewBox hace que el dibujo escale solo al ancho disponible.

function Flecha({ id, color }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill={color} />
    </marker>
  )
}

function Lienzo({ titulo, children, leyenda }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900">
      <svg viewBox="0 0 400 260" className="block h-auto w-full" role="img" aria-label={titulo}>
        {children}
      </svg>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-700/60 px-3 py-2 text-xs text-slate-400">
        <span className="font-medium text-slate-300">{titulo}</span>
        {leyenda}
      </figcaption>
    </figure>
  )
}

function Muestra({ color, texto, linea }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={linea ? 'h-0.5 w-4' : 'h-2.5 w-2.5 rounded-sm'} style={{ background: color }} />
      {texto}
    </span>
  )
}

/* ---------- Situación 1: Frente frío ---------- */
function MapaFrente() {
  // Línea del frente de A a B. Calculamos triángulos a lo largo de ella,
  // apuntando hacia el noreste (hacia donde avanza el frente).
  const A = { x: 70, y: 40 }
  const B = { x: 250, y: 235 }
  const largo = Math.hypot(B.x - A.x, B.y - A.y)
  const dir = { x: (B.x - A.x) / largo, y: (B.y - A.y) / largo }
  const normal = { x: -dir.y, y: dir.x } // perpendicular
  // Queremos que la normal apunte hacia arriba-derecha (NE)
  const n = normal.x > 0 ? normal : { x: -normal.x, y: -normal.y }
  const triangulos = []
  for (let t = 0.08; t < 0.95; t += 0.14) {
    const p = { x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t }
    const p1 = { x: p.x - dir.x * 9, y: p.y - dir.y * 9 }
    const p2 = { x: p.x + dir.x * 9, y: p.y + dir.y * 9 }
    const punta = { x: p.x + n.x * 13, y: p.y + n.y * 13 }
    triangulos.push(`M${p1.x},${p1.y} L${punta.x},${punta.y} L${p2.x},${p2.y} Z`)
  }

  return (
    <Lienzo
      titulo="Esquema sinóptico · pasaje de frente frío"
      leyenda={<>
        <Muestra color="#38bdf8" texto="Frente frío" linea />
        <Muestra color="#fb923c" texto="Viento N previo" linea />
        <Muestra color="#7dd3fc" texto="Viento S/SO post-frontal" linea />
      </>}
    >
      <defs>
        <Flecha id="fr-calido" color="#fb923c" />
        <Flecha id="fr-frio" color="#7dd3fc" />
        <Flecha id="fr-avance" color="#38bdf8" />
        <linearGradient id="fr-fondo" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7c2d12" stopOpacity="0.45" />
          <stop offset="0.55" stopColor="#0f172a" stopOpacity="0" />
          <stop offset="1" stopColor="#0c4a6e" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="url(#fr-fondo)" />
      {/* Grilla lat/lon */}
      {[65, 130, 195].map((y) => <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#334155" strokeWidth="0.5" />)}
      {[100, 200, 300].map((x) => <line key={x} y1="0" y2="260" x1={x} x2={x} stroke="#334155" strokeWidth="0.5" />)}

      <path d={`M${A.x},${A.y} L${B.x},${B.y}`} stroke="#38bdf8" strokeWidth="3" fill="none" />
      {triangulos.map((d, i) => <path key={i} d={d} fill="#38bdf8" />)}

      {/* Sector cálido: viento del norte (sopla hacia el sur) */}
      {[[250, 50], [320, 70], [300, 140], [360, 170]].map(([x, y], i) => (
        <line key={i} x1={x} y1={y} x2={x} y2={y + 40} stroke="#fb923c" strokeWidth="2.5" markerEnd="url(#fr-calido)" className="flujo" />
      ))}
      {/* Sector frío: viento del S/SO (sopla hacia el N/NE) */}
      {[[40, 200], [100, 230], [60, 130]].map(([x, y], i) => (
        <line key={i} x1={x} y1={y} x2={x + 28} y2={y - 38} stroke="#7dd3fc" strokeWidth="3" markerEnd="url(#fr-frio)" className="flujo" />
      ))}
      {/* Dirección de avance del frente */}
      <line x1="175" y1="120" x2="215" y2="85" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#fr-avance)" />

      <text x="390" y="22" fill="#fdba74" fontSize="12" fontWeight="600" textAnchor="end">Aire cálido y seco</text>
      <text x="390" y="36" fill="#fdba74" fontSize="10" textAnchor="end">31 °C · HR 18 %</text>
      <text x="20" y="250" fill="#bae6fd" fontSize="12" fontWeight="600">Aire frío · ráfagas</text>
      <text x="330" y="235" fill="#f87171" fontSize="22" fontWeight="700">B</text>
      <text x="358" y="252" fill="#94a3b8" fontSize="9">N ↑</text>
    </Lienzo>
  )
}

/* ---------- Situación 2: Alta presión ---------- */
function MapaAlta() {
  const isobaras = [
    { rx: 42, ry: 25, hpa: 1028 },
    { rx: 85, ry: 50, hpa: 1024 },
    { rx: 128, ry: 75, hpa: 1020 },
    { rx: 170, ry: 99, hpa: 1016 },
  ]
  const cx = 205
  const cy = 148
  return (
    <Lienzo
      titulo="Mapa sinóptico de presión en superficie"
      leyenda={<>
        <Muestra color="#a5b4fc" texto="Isobaras (hPa)" linea />
        <Muestra color="#e2e8f0" texto="Giro antihorario (Hem. Sur)" linea />
        <Muestra color="#fbbf24" texto="Subsidencia" linea />
      </>}
    >
      <defs>
        <Flecha id="al-giro" color="#e2e8f0" />
        <Flecha id="al-baja" color="#fbbf24" />
        <radialGradient id="al-fondo" cx="0.47" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#312e81" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="260" fill="url(#al-fondo)" />
      {isobaras.map(({ rx, ry, hpa }) => (
        <g key={hpa}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
          <rect x={cx - 14} y={cy + ry - 7} width="28" height="13" rx="3" fill="#0f172a" />
          <text x={cx} y={cy + ry + 3} fill="#c7d2fe" fontSize="9" textAnchor="middle">{hpa}</text>
        </g>
      ))}
      {/* Circulación antihoraria alrededor del anticiclón (Hemisferio Sur) */}
      <path d={`M${cx - 104},${cy - 20} A108 62 0 0 0 ${cx - 20},${cy + 60}`} fill="none" stroke="#e2e8f0" strokeWidth="2" markerEnd="url(#al-giro)" className="flujo" />
      <path d={`M${cx + 104},${cy + 20} A108 62 0 0 0 ${cx + 20},${cy - 60}`} fill="none" stroke="#e2e8f0" strokeWidth="2" markerEnd="url(#al-giro)" className="flujo" />
      {/* Aire que desciende en el centro */}
      {[-18, 0, 18].map((dx) => (
        <line key={dx} x1={cx + dx} y1={cy - 50} x2={cx + dx} y2={cy - 26} stroke="#fbbf24" strokeWidth="2" markerEnd="url(#al-baja)" className="flujo" />
      ))}
      <text x={cx} y={cy + 8} fill="#60a5fa" fontSize="28" fontWeight="800" textAnchor="middle">A</text>
      <text x="14" y="22" fill="#cbd5e1" fontSize="11" fontWeight="600">Anticiclón post-frontal</text>
      <text x="14" y="36" fill="#94a3b8" fontSize="9">Isobaras espaciadas → viento débil</text>
      <text x="358" y="252" fill="#94a3b8" fontSize="9">N ↑</text>
    </Lienzo>
  )
}

/* ---------- Situación 3: Circulación de valle ---------- */
function EsquemaValle() {
  return (
    <Lienzo
      titulo="Corte transversal del valle · 15:00 hs"
      leyenda={<>
        <Muestra color="#fbbf24" texto="Viento anabático (ascendente)" linea />
        <Muestra color="#f97316" texto="Foco de incendio" />
      </>}
    >
      <defs>
        <Flecha id="va-sube" color="#fbbf24" />
        <linearGradient id="va-cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c4a6e" stopOpacity="0.6" />
          <stop offset="1" stopColor="#0f172a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="va-ladera" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#365314" />
          <stop offset="0.5" stopColor="#1a2e05" />
          <stop offset="1" stopColor="#3f6212" />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="url(#va-cielo)" />
      {/* Sol */}
      <circle cx="330" cy="40" r="18" fill="#fde047" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180
        return <line key={a} x1={330 + Math.cos(r) * 24} y1={40 + Math.sin(r) * 24} x2={330 + Math.cos(r) * 32} y2={40 + Math.sin(r) * 32} stroke="#fde047" strokeWidth="2" />
      })}
      {/* Relieve: dos laderas y el fondo del valle */}
      <path d="M0,60 L40,50 L200,225 L360,40 L400,55 L400,260 L0,260 Z" fill="url(#va-ladera)" stroke="#65a30d" strokeWidth="1.5" />
      {/* Río en el fondo */}
      <ellipse cx="200" cy="228" rx="16" ry="3" fill="#38bdf8" opacity="0.8" />
      {/* Flechas paralelas a las laderas, hacia las cumbres */}
      <line x1="172" y1="172" x2="90" y2="82" stroke="#fbbf24" strokeWidth="3" markerEnd="url(#va-sube)" className="flujo" />
      <line x1="228" y1="172" x2="310" y2="77" stroke="#fbbf24" strokeWidth="3" markerEnd="url(#va-sube)" className="flujo" />
      <line x1="200" y1="200" x2="200" y2="130" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#va-sube)" className="flujo" opacity="0.6" />
      {/* Foco de incendio en la ladera baja */}
      <g transform="translate(258,156)">
        <path d="M0,0 C-8,-10 -2,-18 2,-26 C4,-16 12,-14 8,0 Z" fill="#f97316" />
        <path d="M2,0 C-2,-6 1,-11 3,-15 C5,-9 8,-7 6,0 Z" fill="#fde047" />
      </g>
      <text x="14" y="22" fill="#cbd5e1" fontSize="11" fontWeight="600">Laderas soleadas → aire cálido asciende</text>
      <text x="14" y="36" fill="#94a3b8" fontSize="9">Sin viento sinóptico · 15:00 hs</text>
      <text x="200" y="250" fill="#94a3b8" fontSize="9" textAnchor="middle">fondo del valle</text>
    </Lienzo>
  )
}

/* ---------- Situación 4: Tormenta seca ---------- */
function EsquemaTormenta() {
  return (
    <Lienzo
      titulo="Cumulonimbus con virga · tormenta seca"
      leyenda={<>
        <Muestra color="#94a3b8" texto="Virga (no llega al suelo)" linea />
        <Muestra color="#fde047" texto="Descarga eléctrica" linea />
        <Muestra color="#f87171" texto="Ráfagas descendentes" linea />
      </>}
    >
      <defs>
        <Flecha id="to-rafaga" color="#f87171" />
        <linearGradient id="to-nube" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="to-cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e1b4b" stopOpacity="0.6" />
          <stop offset="1" stopColor="#7c2d12" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="url(#to-cielo)" />
      {/* Nube con yunque */}
      <path
        d="M60,40 Q200,10 340,38 Q300,48 262,52 Q290,70 280,100 Q300,125 262,138 L130,138 Q95,130 112,104 Q96,80 130,64 Q140,52 160,52 Q110,48 60,40 Z"
        fill="url(#to-nube)"
        opacity="0.95"
      />
      {/* Virga: estrías que se desvanecen antes del suelo */}
      {[140, 158, 176, 194, 212, 230, 248].map((x, i) => (
        <line key={x} x1={x} y1="140" x2={x - 6} y2={170 + (i % 3) * 8} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.7" />
      ))}
      {/* Rayo */}
      <path d="M300,110 L285,150 L298,150 L280,205 L318,140 L304,140 L318,110 Z" fill="#fde047" className="rayo" />
      {/* Ráfagas descendentes que se abren al llegar al suelo */}
      <line x1="190" y1="190" x2="110" y2="226" stroke="#f87171" strokeWidth="2.5" markerEnd="url(#to-rafaga)" className="flujo" />
      <line x1="195" y1="190" x2="270" y2="226" stroke="#f87171" strokeWidth="2.5" markerEnd="url(#to-rafaga)" className="flujo" />
      <line x1="192" y1="180" x2="192" y2="218" stroke="#f87171" strokeWidth="2.5" markerEnd="url(#to-rafaga)" className="flujo" />
      {/* Suelo con árboles secos */}
      <rect x="0" y="232" width="400" height="28" fill="#422006" />
      {[40, 70, 320, 355].map((x) => (
        <g key={x}>
          <rect x={x - 1.5} y="214" width="3" height="18" fill="#78350f" />
          <circle cx={x} cy="210" r="9" fill="#65a30d" opacity="0.8" />
        </g>
      ))}
      {/* Árbol alcanzado: humo de combustión interna */}
      <g>
        <rect x="286.5" y="210" width="3" height="22" fill="#78350f" />
        <circle cx="288" cy="206" r="8" fill="#854d0e" />
        <path d="M288,196 C282,186 294,180 288,168" stroke="#a8a29e" strokeWidth="2" fill="none" opacity="0.7" />
      </g>
      <text x="14" y="252" fill="#fde68a" fontSize="10">36 °C · HR 15 %</text>
      <text x="300" y="252" fill="#fca5a5" fontSize="9">combustión latente</text>
    </Lienzo>
  )
}

const visuales = {
  frente: MapaFrente,
  alta: MapaAlta,
  valle: EsquemaValle,
  tormenta: EsquemaTormenta,
}

export default function VisualEscenario({ tipo }) {
  const Componente = visuales[tipo]
  return Componente ? <Componente /> : null
}
