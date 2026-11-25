# PaperClaro IA

Explicador de papers científicos con IA. Busca un paper por título, pega su abstract o sube un PDF, y obtén una explicación en español adaptada a tu nivel, con chat para hacerle preguntas.

Es una aplicación 100 % de cliente: HTML, CSS y JavaScript, sin servidor ni cuentas. **Tú pones tu propia clave de API.**

## Características

- Tres formas de entrada: título o tema, texto pegado o PDF/TXT (el PDF se lee en tu navegador).
- Tres niveles (sencillo, universitario, investigador) y cuatro enfoques (análisis completo, resumen, glosario, lectura crítica).
- Chat de seguimiento que mantiene el contexto del paper.
- Fórmulas matemáticas con KaTeX y exportación a Markdown.
- Varios proveedores: **Google Gemini, OpenAI, Anthropic (Claude), OpenRouter, Groq, Ollama (local)** y cualquier API compatible con OpenAI.
- Al introducir la clave, la app consulta al proveedor qué modelos tiene disponibles y los ofrece en un desplegable (también puedes escribir el nombre a mano).

## Uso

Abre `index.html` en el navegador (o sírvelo con cualquier servidor estático), pulsa **Configurar API**, elige proveedor y pega tu clave.

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
```

`dist/styles.css` está incluido en el repositorio para poder publicar el sitio sin paso de compilación (por ejemplo, con GitHub Pages).

Estructura:

```
index.html          marcado de la página
src/app.js          lógica de la aplicación y capa de proveedores de IA
src/input.css       estilos propios + directivas de Tailwind
tailwind.config.js  configuración de Tailwind
dist/styles.css     CSS compilado
```

> **Ollama Cloud:** su API no admite llamadas directas desde el navegador (CORS). Para usar sus modelos, inicia sesión con `ollama signin` en tu Ollama local y elige el proveedor "Ollama (local)" con un modelo `-cloud`.

## Créditos y marcas

Los logotipos de los proveedores se muestran solo para identificarlos en el selector. Son marcas de sus respectivos propietarios (Google, OpenAI, Anthropic, OpenRouter, Groq, Ollama), con los que este proyecto no está afiliado ni respaldado. Los trazos SVG proceden de [Simple Icons](https://simpleicons.org) (CC0) y [LobeHub Icons](https://github.com/lobehub/lobe-icons) (MIT).

## Licencia

[Apache License 2.0](LICENSE). Copyright 2026 Potzon. Consulta [NOTICE](NOTICE).
