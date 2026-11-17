# 🛠️ Utilidades PDF

Colección de herramientas para trabajar con archivos PDF **directamente en el
navegador**. Todo el procesamiento ocurre en tu equipo: los archivos nunca se
suben a ningún servidor, así que es privado por diseño.

El sitio es 100% estático (HTML, CSS y JavaScript), pensado para publicarse en
**GitHub Pages** sin backend ni instalación de dependencias.

## Utilidades disponibles

| Herramienta | Descripción |
|-------------|-------------|
| 🌓 **Escala de grises** | Convierte un PDF a escala de grises con el DPI que elijas. |

> Más utilidades (unir, dividir, comprimir, rotar...) están planeadas. Cada una
> vive en su propia carpeta dentro de `tools/`.

## Cómo funciona

Las herramientas usan dos librerías cargadas por CDN (sin instalación):

- **[PDF.js](https://mozilla.github.io/pdf.js/)** para leer y renderizar páginas.
- **[pdf-lib](https://pdf-lib.js.org/)** para construir el PDF resultante.

## Estructura del proyecto

```
.
├── index.html              # Hub con las tarjetas de cada utilidad
├── styles.css              # Estilos compartidos por todo el sitio
├── tools/
│   └── grayscale/          # Utilidad: PDF a escala de grises
│       ├── index.html
│       └── grayscale.js
├── .nojekyll               # Evita el procesado Jekyll en GitHub Pages
├── .gitignore
└── README.md
```

## Probar en local

No hace falta instalar dependencias, pero sí conviene un servidor local, porque
abrir el HTML con `file://` hace que el navegador bloquee el *worker* de PDF.js.

```powershell
# Con Python (cualquier versión 3.x)
python -m http.server 8000
```

Luego abre <http://localhost:8000>. Para detener el servidor: `Ctrl + C`.

```powershell
# Alternativa con Node
npx serve
```

## Publicar en GitHub Pages

1. Crea el repositorio y sube estos archivos.
2. En **Settings → Pages**, elige la rama (`main`) y la carpeta raíz (`/root`).
3. El sitio quedará en `https://TU_USUARIO.github.io/NOMBRE_REPO/`.

## Añadir una nueva utilidad

1. Crea una carpeta en `tools/mi-utilidad/` con su `index.html` y su `.js`.
2. En los HTML de herramienta, enlaza los estilos con `../../styles.css`.
3. Añade una tarjeta en el `index.html` raíz (hay una plantilla comentada).
