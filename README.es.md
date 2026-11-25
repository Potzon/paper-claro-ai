# PaperClaro AI

[English](README.md)

Explicador de papers científicos con IA. Busca un paper por título, pega su abstract o sube un PDF, y obtén una explicación en español adaptada a tu nivel, con chat para hacerle preguntas.

Es una aplicación 100 % de cliente: HTML, CSS y JavaScript, sin servidor ni cuentas. **Tú pones tu propia clave de API.**

## Características

- Tres formas de entrada: título o tema, texto pegado o PDF/TXT (el PDF se lee en tu navegador).
- Tres niveles (sencillo, universitario, investigador) y cuatro enfoques (análisis completo, resumen, glosario, lectura crítica).
- Chat de seguimiento que mantiene el contexto del paper.
- Fórmulas matemáticas con KaTeX y exportación a Markdown.
- **Interfaz en inglés por defecto, con el castellano como alternativa.** Cambia con el selector EN / ES de la cabecera; la elección se recuerda en el navegador. El idioma también decide en qué idioma se genera la explicación y responde el chat.
- Varios proveedores: **Google Gemini, OpenAI, Anthropic (Claude), Grok (xAI), OpenRouter, Groq, Ollama (local)** y cualquier API compatible con OpenAI.
- Al introducir la clave, la app consulta al proveedor qué modelos tiene disponibles y los ofrece en un desplegable (también puedes escribir el nombre a mano).

## Uso

Sirve la carpeta con cualquier servidor estático (por ejemplo `python3 -m http.server 8000` y abre <http://localhost:8000>), pulsa **Configurar API**, elige proveedor y pega tu clave.

> La búsqueda web al pedir un paper por título solo está disponible con Gemini. Con el resto de proveedores el modelo responde con su propio conocimiento y puede equivocarse con papers poco conocidos: contrasta los datos importantes.

## Privacidad y seguridad

- Tu clave y el contenido de los papers van **directamente de tu navegador al proveedor que elijas**. No pasan por ningún servidor del proyecto.
- Por defecto la clave solo se guarda mientras la pestaña esté abierta. Si marcas "Recordar", se guarda **sin cifrar** en el almacenamiento del navegador: no lo hagas en un equipo compartido.
- Usa claves con límite de gasto cuando el proveedor lo permita.
- Las librerías externas se cargan desde CDN con versión fija y verificación de integridad (SRI). PDF.js y KaTeX solo se descargan cuando hacen falta.

## Desarrollo

Requiere Node.js solo para compilar el CSS de Tailwind.

```bash
npm install
npm run build   # genera dist/styles.css (minificado)
npm run watch   # recompila al editar
npm test        # ejecuta los tests (Node 20+)
```

`dist/styles.css` está incluido en el repositorio para poder publicar el sitio sin paso de compilación (por ejemplo, con GitHub Pages).

Estructura:

```
index.html          marcado de la página (textos en inglés, marcados con data-i18n)
src/i18n.js         traducciones (inglés / castellano), selector de idioma y prompts del modelo
src/app.js          lógica de la aplicación y capa de proveedores de IA
src/input.css       estilos propios + directivas de Tailwind
tailwind.config.js  configuración de Tailwind
dist/styles.css     CSS compilado
tests/              tests (node:test + jsdom)
.github/workflows/  CI: tests en Node 20 y 22, y comprobación de que dist/styles.css está al día
```

### Tests

`npm test` arranca el `index.html`, `src/i18n.js` y `src/app.js` reales en [jsdom](https://github.com/jsdom/jsdom) con un `fetch` simulado, así que no hace falta red ni clave de API (unos 6 segundos). Cubre:

- **Traducciones:** cada clave existe en los dos idiomas, los marcadores coinciden, no se cuela castellano en el código y existen todos los manejadores y ids.
- **Idioma:** inglés por defecto, cambio en caliente, elección recordada y que los prompts enviados al modelo siguen el idioma.
- **Proveedores:** formato de petición de Gemini, Anthropic y los compatibles con OpenAI (OpenAI, OpenRouter, Groq, Grok, Ollama, otras APIs), errores, reintentos y almacenamiento de la clave.
- **Modelos y URL base:** listado automático de modelos, selector único, Ollama local, normalización de URL y avisos.
- **Renderizado:** Markdown, protección de KaTeX y saneado de la salida del modelo (`marked` y `DOMPurify` se instalan en las mismas versiones que la página carga del CDN).

La CI (`.github/workflows/ci.yml`) ejecuta los tests en Node 20 y 22 y recompila el CSS para comprobar que el `dist/styles.css` del repositorio coincide con el código: si añades una clase de Tailwind, ejecuta `npm run build` y sube el resultado.

### Traducciones

- Los textos estáticos están en `index.html`, en inglés. Un elemento se traduce marcándolo con `data-i18n="clave"` (se sustituye su HTML) y/o `data-i18n-attr="placeholder:clave; title:otra.clave"` (atributos). El texto inglés se lee de la propia página, así que no se duplica.
- Los textos construidos desde JavaScript (avisos, estados, etiquetas) y los **prompts que se envían al modelo** están en `src/i18n.js` y se leen con `t('clave', { vars })`.
- `I18N.es` debe contener todas las claves. Para añadir un idioma: añade su diccionario a `I18N`, su código a `LANGS` / `LOCALES` y un botón con `data-lang` y `class="lang-btn"` junto a los existentes.

> **Ollama (local):** no abras `index.html` con doble clic (`file://`): el navegador envía `Origin: null` y Ollama responde 403. Sirve la carpeta, p. ej. `python3 -m http.server 8000` y abre <http://localhost:8000> (Ollama acepta por defecto los orígenes `localhost`). Para otra dirección o un sitio HTTPS, arranca Ollama con `OLLAMA_ORIGINS` apuntando a ese origen.

> **Ollama Cloud:** su API no admite llamadas directas desde el navegador (CORS). Para usar sus modelos, inicia sesión con `ollama signin` en tu Ollama local y elige el proveedor "Ollama (local)" con un modelo `-cloud`.

## Créditos y marcas

Los logotipos de los proveedores se muestran solo para identificarlos en el selector. Son marcas de sus respectivos propietarios (Google, OpenAI, Anthropic, xAI, OpenRouter, Groq, Ollama), con los que este proyecto no está afiliado ni respaldado. Los trazos SVG proceden de [Simple Icons](https://simpleicons.org) (CC0) y [LobeHub Icons](https://github.com/lobehub/lobe-icons) (MIT).

## Licencia

[Apache License 2.0](LICENSE). Copyright 2026 Potzon. Consulta [NOTICE](NOTICE).
