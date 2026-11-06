# Más Aire · Generador de presupuestos y facturas

Página estática (sin servidor) para armar presupuestos/facturas con el formato
de Más Aire Acondicionado e imprimirlos o guardarlos como PDF.

## Archivos

| Archivo | Qué hace |
|---|---|
| `index.html` | La estructura: el formulario (izquierda/arriba) y la hoja A4 (derecha/abajo). |
| `estilos.css` | Cómo se ve. Los colores están como variables al principio (`--azul`, etc.). La parte `@media print` define qué sale al imprimir. |
| `app.js` | La lógica: guarda lo que cargás en un objeto `estado`, y `render()` redibuja la hoja cada vez que escribís. Incluye el pasaje de número a letras (`enLetras`). |
| `logo.png` | *(pendiente)* Si ponés el logo con este nombre en esta carpeta, aparece solo arriba del nombre. |

## Uso

1. Abrí `mas-aire/index.html` (o la URL de GitHub Pages `/mas-aire/`).
2. Completá cliente, fecha y trabajos. El importe por ítem es opcional: si lo
   ponés, el total se suma solo; si no, escribís el total a mano.
3. **Imprimir / Guardar PDF** → en el diálogo elegí "Guardar como PDF".

Lo cargado queda guardado en el navegador (localStorage) hasta que toques
"Nuevo", que además sugiere el número siguiente.

> Nota: la "Factura" que genera esta página es un comprobante interno. En
> Argentina una factura con validez fiscal se emite por ARCA (ex AFIP).
