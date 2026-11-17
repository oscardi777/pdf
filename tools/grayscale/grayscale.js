// Conversión de PDF a escala de grises, 100% en el navegador.
//   - renderiza cada página con PDF.js a un DPI dado,
//   - la pasa a escala de grises en un <canvas>,
//   - y rearma un nuevo PDF con pdf-lib.

import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs";

// El worker de PDF.js también se carga por CDN (sin instalar nada).
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs";

// pdf-lib se expone como global "PDFLib" (se cargó con un <script> normal).
const { PDFDocument } = window.PDFLib;

const inputPdf = document.getElementById("inputPdf");
const dropzone = document.getElementById("dropzone");
const labelDrop = document.getElementById("labelDrop");
const btnConvertir = document.getElementById("btnConvertir");
const inputDpi = document.getElementById("dpi");
const estado = document.getElementById("estado");
const progreso = document.getElementById("progreso");
const descarga = document.getElementById("descarga");

let archivoPdf = null;

function mostrarEstado(texto) {
  estado.textContent = texto;
}

function seleccionarArchivo(file) {
  if (!file || file.type !== "application/pdf") {
    mostrarEstado("⚠️ Elige un archivo PDF válido.");
    return;
  }
  archivoPdf = file;
  labelDrop.textContent = `📄 ${file.name}`;
  btnConvertir.disabled = false;
  descarga.hidden = true;
  mostrarEstado("");
}

// --- Entrada de archivo: clic y arrastrar ---
inputPdf.addEventListener("change", (e) => seleccionarArchivo(e.target.files[0]));

["dragenter", "dragover"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.add("activo");
  })
);
["dragleave", "drop"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => {
    e.preventDefault();
    dropzone.classList.remove("activo");
  })
);
dropzone.addEventListener("drop", (e) => {
  seleccionarArchivo(e.dataTransfer.files[0]);
});

// --- Conversión ---
btnConvertir.addEventListener("click", convertir);

async function convertir() {
  if (!archivoPdf) return;

  const dpi = Math.min(Math.max(Number(inputDpi.value) || 200, 72), 400);
  const escala = dpi / 72; // 72 es el DPI base del PDF

  btnConvertir.disabled = true;
  descarga.hidden = true;
  progreso.hidden = false;
  progreso.value = 0;
  mostrarEstado("Leyendo PDF...");

  try {
    const buffer = await archivoPdf.arrayBuffer();
    const pdfOrigen = await pdfjsLib.getDocument({ data: buffer }).promise;
    const numPaginas = pdfOrigen.numPages;

    const pdfNuevo = await PDFDocument.create();

    for (let i = 1; i <= numPaginas; i++) {
      mostrarEstado(`Procesando página ${i} de ${numPaginas}...`);

      const pagina = await pdfOrigen.getPage(i);
      const viewport = pagina.getViewport({ scale: escala });

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext("2d");

      await pagina.render({ canvasContext: ctx, viewport }).promise;

      // Pasar a escala de grises (luminosidad ponderada).
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = img.data;
      for (let p = 0; p < d.length; p += 4) {
        const gris = Math.round(0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2]);
        d[p] = d[p + 1] = d[p + 2] = gris;
      }
      ctx.putImageData(img, 0, 0);

      // Insertar la página en grises en el PDF nuevo, al tamaño original en puntos.
      const jpg = canvas.toDataURL("image/jpeg", 0.9);
      const imgBytes = await fetch(jpg).then((r) => r.arrayBuffer());
      const imgEmbed = await pdfNuevo.embedJpg(imgBytes);

      const anchoPts = viewport.width / escala;
      const altoPts = viewport.height / escala;
      const nuevaPagina = pdfNuevo.addPage([anchoPts, altoPts]);
      nuevaPagina.drawImage(imgEmbed, { x: 0, y: 0, width: anchoPts, height: altoPts });

      progreso.value = Math.round((i / numPaginas) * 100);
    }

    mostrarEstado("Guardando PDF...");
    const bytes = await pdfNuevo.save();
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const nombreBase = archivoPdf.name.replace(/\.pdf$/i, "");
    descarga.href = url;
    descarga.download = `${nombreBase}_grayscale.pdf`;
    descarga.hidden = false;

    mostrarEstado("✅ Conversión completada.");
  } catch (err) {
    console.error(err);
    mostrarEstado("❌ Error al convertir el PDF. Revisa la consola.");
  } finally {
    btnConvertir.disabled = false;
    progreso.hidden = true;
  }
}
