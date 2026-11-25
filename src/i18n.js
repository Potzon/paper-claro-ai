// =========================================================================
// Internationalization (English is the default language, Spanish is an alternative)
// =========================================================================
// - The static texts live in index.html in English (they are the source of truth).
//   Elements carry data-i18n="key" (innerHTML) and/or data-i18n-attr="attr:key; attr2:key2".
//   On startup the English text is read from the DOM into I18N.en, so it is never duplicated here.
// - I18N.en below only holds the strings that are built from JavaScript.
// - I18N.es holds the Spanish translation of everything (static + dynamic).
// - Values used through data-i18n are trusted static HTML (they may contain <strong>, <span>...).
//   Values used through t() in app.js are inserted as plain text.
const I18N = {
    en: {
        // ---- Providers ----
        'hint.gemini': 'Get one at aistudio.google.com/apikey',
        'hint.openai': 'Starts with sk-… (platform.openai.com/api-keys)',
        'hint.anthropic': 'Starts with sk-ant-… (console.anthropic.com)',
        'hint.grok': 'Starts with xai-… (console.x.ai)',
        'hint.openrouter': 'Starts with sk-or-… Gives access to many models with a single key.',
        'hint.groq': 'Starts with gsk_… (console.groq.com/keys)',
        'hint.ollama': 'No key needed. Ollama must allow this page\'s origin (OLLAMA_ORIGINS).',
        'hint.custom': 'Enter the base URL and the model of your service (LM Studio, vLLM, Together, Mistral…).',

        // ---- Header / status ----
        'api.setup': 'Set up API',
        'search.on': 'Web search active (Gemini)',
        'search.off': 'No web search: it will answer from the model\'s own knowledge',
        'count.one': '1 paper analyzed',
        'count.many': '{n} papers analyzed',
        'btn.analyze': 'Explain Paper with AI',
        'btn.analyzing': 'Analyzing paper...',

        // ---- Settings modal ----
        'settings.show': 'Show',
        'settings.hide': 'Hide',
        'settings.saved': 'Provider configured',
        'settings.incomplete': 'Saved, but some details are missing',
        'settings.keysDeleted': 'Keys deleted',
        'settings.needConfig': 'Set up a provider and your API key to analyze papers.',
        'models.enterKey': 'Enter your API key to see the available models.',
        'models.enterBase': 'Enter the base URL to be able to list the models.',
        'models.loading': 'Loading models…',
        'models.empty': 'The key is valid but returned no models. Type the name by hand.',
        'models.pick': 'Choose from the list ({n} models)…',
        'models.available': '{n} models available with this key. You can also type the name by hand.',
        'models.failed': 'Could not load the list ({error}). Type the model name by hand.',
        'models.netError': 'network or CORS error',

        // ---- Libraries loaded on demand ----
        'lib.loadFail': 'Could not load {name}. Check your connection.',

        // ---- Input / files ----
        'counter': '{words} words · {chars} characters',
        'file.badFormat': 'Unsupported format. Please upload a .pdf or .txt file.',
        'file.readingTxt': 'Reading text file...',
        'file.loadingPdf': 'Loading PDF reader...',
        'file.processingPdf': 'Processing PDF pages...',
        'file.extractingPage': 'Extracting page {i} of {n}...',
        'file.noText': 'Could not extract readable text from the file (it may be a scanned PDF without OCR). Try pasting the text manually.',
        'file.metaPdfOne': '1 page · {words} words extracted',
        'file.metaPdfMany': '{pages} pages · {words} words extracted',
        'file.metaTxt': 'Text file · {words} words',
        'file.ready': 'File "{name}" ready to analyze',
        'file.readError': 'An error occurred while reading the file.',

        // ---- Provider requests ----
        'err.connect': 'Could not connect to the provider (network, CORS or wrong base URL).',
        'err.badKey': 'Invalid API key or missing permissions.',
        'err.api': 'API error ({status}): {detail}',

        // ---- Analysis ----
        'val.title': 'Enter the title of a paper, its authors or the topic of the study you want explained.',
        'val.text': 'Paste a longer fragment of the abstract or the article (at least 30 characters) so it can be analyzed properly.',
        'val.file': 'First select or drag a .pdf or .txt file to extract its content.',
        'src.search': '🔍 Academic Search',
        'src.model': '🧠 Model knowledge',
        'src.text': '📄 Provided Text',
        'src.pdf': '📎 PDF · {pages} pp.',
        'src.txt': '📎 TXT File',
        'truncated': '[Note: Text truncated due to maximum length]',
        'err.noContent': 'No content was received from the model. Try rephrasing your query.',
        'err.analysis': 'The analysis could not be completed: {error}. Check the API settings and try again.',
        'err.analysisFallback': 'connection error with the provider',
        'toast.generated': 'Explanation generated successfully',

        // ---- Chat ----
        'err.noReply': 'No reply was received from the assistant.',
        'chat.avatar': 'AI',
        'chat.error': '⚠️ Sorry, there was a problem processing your question ({error}). Please try again.',
        'chat.errorFallback': 'network error',

        // ---- History / utilities ----
        'toast.historyCleared': 'Session history cleared',
        'toast.copied': 'Explanation copied to the clipboard',
        'toast.copyFail': 'Could not copy automatically',
        'toast.downloaded': 'Markdown (.md) file downloaded',
        'md.header': '> Generated by **PaperClaro AI** · {level} · {focus}',
        'slug.fallback': 'explained-paper',

        // ---- Loading state ----
        'load.1.title': 'Reading and structuring the paper...',
        'load.1.sub': 'Identifying the central hypothesis, context and scientific problem',
        'load.2.title': 'Breaking down the methodology and findings...',
        'load.2.sub': 'Evaluating experiments, metrics and main results',
        'load.3.title': 'Tuning the pedagogical rigor...',
        'load.3.sub': 'Writing the explanation at {level}',
        'load.4.title': 'Formatting structure and formulas...',
        'load.4.sub': 'Preparing clear sections and the interactive chat',

        // ---- Levels and focuses ----
        'lvl.simple.name': 'Simple Level (ELI5)',
        'lvl.university.name': 'University Level',
        'lvl.researcher.name': 'Researcher Level',
        'fcs.full.name': 'Full Analysis',
        'fcs.tldr.name': 'Executive Summary (TL;DR)',
        'fcs.glossary.name': 'Glossary & Concepts',
        'fcs.critique.name': 'Critical Reading',
        'fcs.full.short': 'Full',
        'fcs.tldr.short': 'TL;DR',
        'fcs.glossary.short': 'Glossary',
        'fcs.critique.short': 'Critique',

        // ---- One-click examples (the query that is sent to the model) ----
        'ex.transformers.query': 'Attention Is All You Need - Ashish Vaswani et al. (2017), Google Brain / NeurIPS: The Transformer architecture, based exclusively on self-attention mechanisms with no recurrent or convolutional networks.',
        'ex.alphafold.query': 'Highly accurate protein structure prediction with AlphaFold - John Jumper et al. (2021), DeepMind, Nature: Prediction of three-dimensional protein structures at atomic accuracy using the Evoformer and spatial attention.',
        'ex.dna.query': 'Molecular Structure of Nucleic Acids: A Structure for Deoxyribose Nucleic Acid - James D. Watson and Francis H. C. Crick (1953), Nature: The discovery of the DNA double helix and complementary base pairing.',

        // ---- Suggested chat questions (the full text that is sent to the model) ----
        'chat.q1.full': 'What limitations or weaknesses does this method have?',
        'chat.q2.full': 'How does it compare to previous work in its field?',
        'chat.q3.full': 'Explain the methodology step by step in a clear way',
        'chat.q4.full': 'What practical applications does this discovery have?',

        // ---- Prompts sent to the model (they also decide the language of the answer) ----
        'prompt.level.simple': `EXPLANATION LEVEL — SIMPLE (POPULAR SCIENCE / ELI5):
- Explain the study as if talking to a curious person with no technical background in that discipline.
- Use clear everyday analogies (in quote blocks "> Analogy: ...") to ground complex concepts.
- Avoid unnecessary academic jargon; if you must use a technical term, immediately translate it into plain language.
- Warm, clear, pedagogical and engaging tone.`,

        'prompt.level.university': `EXPLANATION LEVEL — UNIVERSITY (BALANCED):
- Address a university student or a science/engineering/humanities professional.
- Keep conceptual rigor and terminological precision, explaining the "why" and the "how" behind each mechanism or finding.
- Include equations or key notation only when they add conceptual clarity (using LaTeX format $...$ or $$...$$).
- Structured, didactic and academically sound tone.`,

        'prompt.level.researcher': `EXPLANATION LEVEL — RESEARCHER (TECHNICAL AND IN-DEPTH):
- Address a researcher, PhD student or specialist in the field.
- Analyze in depth the architecture or experimental design, variables, objective functions, quantitative metrics, ablations, baselines and statistical validity.
- Include key mathematical formulations in LaTeX ($...$ and $$...$$) when they are central to the contribution.
- Rigorous, analytical, precise tone without excessive simplification.`,

        'prompt.focus.full': `OUTPUT FOCUS — STRUCTURED FULL ANALYSIS:
Organize your answer with exactly these 5 sections in Markdown (using ## headings):
## 1. What it is about in one sentence
(A single crystal-clear sentence, in bold, capturing the essence of the study).
## 2. The problem it solves
(Prior context, bottleneck or scientific gap that motivated the research).
## 3. Methodology: how they did it
(Experimental design, architecture, data or proposed approach, step by step).
## 4. Key findings
(Main results, empirical evidence, comparisons and relevant metrics).
## 5. Impact and limitations
(Significance for the field, applications, and limitations or future work).`,

        'prompt.focus.tldr': `OUTPUT FOCUS — EXECUTIVE SUMMARY (TL;DR):
- Start with a highlighted block (> **30-second summary:** ...) of at most 3 lines.
- Continue with a list of 5 to 7 high-impact key points (**Key idea:** direct explanation).
- Finish with a short section **## Why this study matters**.`,

        'prompt.focus.glossary': `OUTPUT FOCUS — GLOSSARY AND KEY CONCEPTS:
- Start with a short narrative concept map in 1 paragraph explaining how the pieces of the paper connect.
- Present between 8 and 12 fundamental concepts, techniques, metrics or mechanisms of the study as sections or a structured list.
- For each term include: **Clear definition**, **Role in this paper** and **Example or analogy**.`,

        'prompt.focus.critique': `OUTPUT FOCUS — CRITICAL READING:
Organize the critical analysis into 4 clear sections:
## 1. Methodological strengths and solid contributions
## 2. Possible biases, assumptions and blind spots
## 3. Limits to generalization or scalability
## 4. Open questions for future research`,

        'prompt.system': `You are PaperClaro AI, a distinguished science communicator and analyst of scientific literature writing in English.
Your mission is to turn complex scientific papers into exceptionally clear, rigorous and well-structured explanations in ENGLISH.

MANDATORY FORMATTING RULES:
1. ALWAYS start with an H1 heading (# Exact or Descriptive Paper Title) on the first line. If you know the main authors and the year, include them in a short italic subtitle right below (e.g. *Vaswani et al., 2017 · NeurIPS*).
2. Write the whole answer in impeccable English, with excellent visual hierarchy (strategic bold, clean lists, comparison tables when they add value).
3. For mathematical formulas, use standard LaTeX delimiters: $...$ for inline formulas and $$...$$ for centered blocks.
4. If the user provides the text of a paper, rely faithfully on that document without inventing data that is not in it. If they ask for a paper by title or topic, use verified and accurate information.

{level}

{focus}`,

        'prompt.userTitle': 'Identify and explain the following scientific study or paper: "{query}". Give only real, verifiable facts; if you are not sure the paper exists or about any detail, say so explicitly instead of making it up.',
        'prompt.userDoc': 'Analyze and explain the following scientific article provided by the user:\n\n--- START OF DOCUMENT ---\n{text}\n--- END OF DOCUMENT ---',
        'prompt.chatCtxTitle': 'Analyzed paper: "{title}" (Original query: "{query}").',
        'prompt.chatCtxDoc': 'Analyzed scientific document ("{title}"):\n\n{text}',
        'prompt.chatSystem': `You are PaperClaro AI, an expert science tutor who answers in English.
Answer the user's question relying rigorously on the scientific paper analyzed in this conversation ("{title}").
- Keep a pedagogical, clear tone adapted to the level "{level}".
- If the user asks something the paper does not directly specify, say so with academic honesty and provide relevant scientific context, making the distinction clear.
- Use clean Markdown (lists, bold) and LaTeX formulas ($...$) if useful.`
    },

    es: {
        // ---- Static texts (index.html) ----
        'meta.title': 'PaperClaro AI — Explicador Inteligente de Papers Científicos',
        'nav.openHistory': 'Abrir historial de papers',
        'brand.html': 'PaperClaro <span class="text-indigo-700">AI</span>',
        'brand.badge': 'Lectura Científica',
        'brand.tagline': 'Explicador inteligente de artículos e investigaciones',
        'lang.label': 'Idioma',
        'api.btnTitle': 'Configurar proveedor de IA y clave de API',
        'btn.newPaper': 'Nuevo Paper',
        'side.title': 'Historial de Sesión',
        'side.clear': 'Limpiar historial',
        'side.clearShort': 'Limpiar',
        'side.close': 'Cerrar panel',
        'side.confirmQ': '¿Eliminar todo el historial de esta sesión?',
        'side.confirmYes': 'Sí, borrar',
        'common.cancel': 'Cancelar',
        'side.emptyTitle': 'Tu biblioteca está vacía',
        'side.emptyBody': 'Los papers que analices aparecerán aquí para que puedas volver a consultarlos y chatear con ellos.',
        'side.tipTitle': 'Tip de lectura',
        'side.tipBody': 'Empieza con el nivel <strong>Sencillo</strong> para captar la intuición y luego cambia a <strong>Investigador</strong> para revisar la metodología.',
        'hero.title': 'Entiende cualquier estudio científico con claridad',
        'hero.sub': 'Busca por título, pega el resumen o sube un PDF. Adapta la profundidad y conversa con el artículo.',
        'ex.label': 'Ejemplos rápidos (1 clic):',
        'ex.transformers.label': 'Attention Is All You Need (Transformers)',
        'ex.alphafold.label': 'AlphaFold (Plegamiento de Proteínas)',
        'ex.dna.label': 'La Estructura del ADN (Watson y Crick)',
        'input.tablist': 'Modo de entrada del paper',
        'input.tabTitle': 'Pedir por Título o Tema',
        'input.tabText': 'Pegar Texto / Abstract',
        'input.tabFile': 'Subir PDF o TXT',
        'input.titleLabel': 'Título del paper, autores o tema de investigación',
        'input.titlePlaceholder': 'Ej. \'Attention Is All You Need\', \'CRISPR-Cas9 Doudna Charpentier\', o describe el estudio...',
        'input.clearField': 'Limpiar campo',
        'input.pressEnter': 'Pulsa Enter para analizar',
        'input.textLabel': 'Pega el abstract, metodología o texto completo del artículo',
        'input.clearText': 'Limpiar texto',
        'input.textPlaceholder': 'Pega aquí el contenido del paper científico (en español, inglés u otro idioma; PaperClaro AI lo explicará en español)...',
        'input.textHint': 'Admite abstracts, secciones técnicas o artículos extensos',
        'input.fileLabel': 'Sube el archivo del paper (.pdf o .txt)',
        'input.drop': 'Arrastra tu archivo PDF o TXT aquí, o <span class="text-indigo-700 underline">haz clic para seleccionarlo</span>',
        'input.dropHint': 'Extracción local privada directamente en tu navegador mediante PDF.js',
        'file.remove': 'Quitar archivo',
        'level.heading': '1. Nivel de Explicación',
        'focus.heading': '2. Enfoque de Salida',
        'lvl.simple.short': 'Sencillo',
        'lvl.university.short': 'Universitario',
        'lvl.researcher.short': 'Investigador',
        'lvl.simple.desc': 'ELI5, analogías cotidianas y cero jerga innecesaria.',
        'lvl.university.desc': 'Claro, estructurado y con rigor conceptual accesible.',
        'lvl.researcher.desc': 'Técnico, metodología, métricas y rigor estadístico.',
        'fcs.full.btn': 'Análisis Completo',
        'fcs.tldr.btn': 'Resumen Ejecutivo',
        'fcs.glossary.btn': 'Glosario y Conceptos',
        'fcs.critique.btn': 'Lectura Crítica',
        'fcs.full.desc': '5 secciones estructuradas clave.',
        'fcs.tldr.desc': 'Puntos directos y concisos (TL;DR).',
        'fcs.glossary.desc': 'Desglose de terminología técnica.',
        'fcs.critique.desc': 'Fortalezas, sesgos y limitaciones.',
        'result.copy': 'Copiar',
        'result.download': 'Descargar .md',
        'result.switch': 'Cambiar perspectiva al instante:',
        'quick.simple': '🌱 Sencillo',
        'quick.university': '🎓 Universitario',
        'quick.researcher': '🔬 Investigador',
        'quick.glossary': '📖 Glosario',
        'quick.critique': '⚖️ Crítica',
        'result.sources': 'Fuentes bibliográficas y referencias consultadas',
        'chat.title': 'Pregúntale al Paper',
        'chat.subtitle': 'Resuelve dudas específicas manteniendo el contexto completo de este estudio',
        'chat.active': 'Contexto activo',
        'chat.suggested': 'Preguntas sugeridas:',
        'chat.q1.label': '¿Qué limitaciones tiene este método?',
        'chat.q2.label': '¿Cómo se compara con trabajos anteriores?',
        'chat.q3.label': 'Explícame la metodología paso a paso',
        'chat.q4.label': '¿Qué aplicaciones prácticas tiene?',
        'chat.empty': 'Haz clic en una pregunta sugerida o escribe tu propia consulta abajo para profundizar en este estudio.',
        'chat.typing': 'PaperClaro AI está analizando el paper para responder...',
        'chat.placeholder': 'Escribe una pregunta sobre este paper...',
        'chat.send': 'Preguntar',
        'settings.title': 'Proveedor de IA',
        'settings.intro': 'Usa tu propia clave de API. Las llamadas van directamente desde tu navegador al proveedor.',
        'settings.close': 'Cerrar',
        'settings.provider': 'Proveedor',
        'settings.key': 'Clave de API',
        'settings.model': 'Modelo',
        'settings.loadModels': 'Cargar modelos de mi clave',
        'settings.base': 'URL base (API compatible con OpenAI)',
        'settings.remember': '<strong class="text-slate-800">Recordar la clave en este navegador.</strong> Si no lo marcas, solo se guarda mientras la pestaña siga abierta. Se almacena en texto plano en el navegador; no marques esto en un equipo compartido.',
        'settings.forget': 'Borrar todas las claves guardadas',
        'settings.save': 'Guardar',

        // ---- Provider names that differ ----
        'prov.ollama.label': 'Ollama (local, sin clave)',
        'prov.custom.name': 'Otra API (OpenAI)',
        'prov.custom.label': 'Otra API compatible con OpenAI',

        // ---- Dynamic texts (app.js) ----
        'hint.gemini': 'Consíguela en aistudio.google.com/apikey',
        'hint.openai': 'Empieza por sk-… (platform.openai.com/api-keys)',
        'hint.anthropic': 'Empieza por sk-ant-… (console.anthropic.com)',
        'hint.grok': 'Empieza por xai-… (console.x.ai)',
        'hint.openrouter': 'Empieza por sk-or-… Da acceso a muchos modelos con una sola clave.',
        'hint.groq': 'Empieza por gsk_… (console.groq.com/keys)',
        'hint.ollama': 'No necesita clave. Ollama debe permitir el origen de esta página (OLLAMA_ORIGINS).',
        'hint.custom': 'Indica la URL base y el modelo de tu servicio (LM Studio, vLLM, Together, Mistral…).',

        'api.setup': 'Configurar API',
        'search.on': 'Búsqueda web activa (Gemini)',
        'search.off': 'Sin búsqueda web: responderá con el conocimiento del modelo',
        'count.one': '1 paper analizado',
        'count.many': '{n} papers analizados',
        'btn.analyze': 'Explicar Paper con IA',
        'btn.analyzing': 'Analizando paper...',

        'settings.show': 'Mostrar',
        'settings.hide': 'Ocultar',
        'settings.saved': 'Proveedor configurado',
        'settings.incomplete': 'Guardado, pero faltan datos',
        'settings.keysDeleted': 'Claves eliminadas',
        'settings.needConfig': 'Configura un proveedor y tu clave de API para poder analizar papers.',
        'models.enterKey': 'Introduce la clave de API para ver los modelos disponibles.',
        'models.enterBase': 'Indica la URL base para poder listar los modelos.',
        'models.loading': 'Cargando modelos…',
        'models.empty': 'La clave es válida pero no devolvió modelos. Escribe el nombre a mano.',
        'models.pick': 'Elegir de la lista ({n} modelos)…',
        'models.available': '{n} modelos disponibles con esta clave. También puedes escribir el nombre a mano.',
        'models.failed': 'No se pudo cargar la lista ({error}). Escribe el nombre del modelo a mano.',
        'models.netError': 'error de red o CORS',

        'lib.loadFail': 'No se pudo cargar {name}. Revisa tu conexión.',

        'counter': '{words} palabras · {chars} caracteres',
        'file.badFormat': 'Formato no compatible. Por favor, sube un archivo .pdf o .txt.',
        'file.readingTxt': 'Leyendo archivo de texto...',
        'file.loadingPdf': 'Cargando lector de PDF...',
        'file.processingPdf': 'Procesando páginas del PDF...',
        'file.extractingPage': 'Extrayendo página {i} de {n}...',
        'file.noText': 'No se pudo extraer texto legible del archivo (puede ser un PDF escaneado como imagen sin OCR). Prueba pegando el texto manualmente.',
        'file.metaPdfOne': '1 página · {words} palabras extraídas',
        'file.metaPdfMany': '{pages} páginas · {words} palabras extraídas',
        'file.metaTxt': 'Archivo de texto · {words} palabras',
        'file.ready': 'Archivo "{name}" listo para analizar',
        'file.readError': 'Ocurrió un error al leer el archivo.',

        'err.connect': 'No se pudo conectar con el proveedor (red, CORS o URL base incorrecta).',
        'err.badKey': 'Clave de API no válida o sin permisos.',
        'err.api': 'Error de API ({status}): {detail}',

        'val.title': 'Escribe el título de un paper, sus autores o el tema del estudio que quieres que te explique.',
        'val.text': 'Pega un fragmento más amplio del abstract o del artículo (al menos 30 caracteres) para poder analizarlo bien.',
        'val.file': 'Selecciona o arrastra primero un archivo .pdf o .txt para extraer su contenido.',
        'src.search': '🔍 Búsqueda Académica',
        'src.model': '🧠 Conocimiento del modelo',
        'src.text': '📄 Texto Proporcionado',
        'src.pdf': '📎 PDF · {pages} págs.',
        'src.txt': '📎 Archivo TXT',
        'truncated': '[Nota: Texto recortado por extensión máxima]',
        'err.noContent': 'No se recibió contenido del modelo. Intenta reformular tu consulta.',
        'err.analysis': 'No se pudo completar el análisis: {error}. Revisa la configuración de la API e inténtalo de nuevo.',
        'err.analysisFallback': 'error de conexión con el proveedor',
        'toast.generated': 'Explicación generada correctamente',

        'err.noReply': 'No se recibió respuesta del asistente.',
        'chat.avatar': 'IA',
        'chat.error': '⚠️ Lo siento, ocurrió un problema al procesar tu pregunta ({error}). Por favor, inténtalo de nuevo.',
        'chat.errorFallback': 'error de red',

        'toast.historyCleared': 'Historial de sesión limpiado',
        'toast.copied': 'Explicación copiada al portapapeles',
        'toast.copyFail': 'No se pudo copiar automáticamente',
        'toast.downloaded': 'Archivo Markdown (.md) descargado',
        'md.header': '> Generado por **PaperClaro AI** · {level} · {focus}',
        'slug.fallback': 'paper-explicado',

        'load.1.title': 'Leyendo y estructurando el paper...',
        'load.1.sub': 'Identificando hipótesis central, contexto y problema científico',
        'load.2.title': 'Desglosando la metodología y hallazgos...',
        'load.2.sub': 'Evaluando experimentos, métricas y resultados principales',
        'load.3.title': 'Adaptando el rigor pedagógico...',
        'load.3.sub': 'Redactando explicación en {level}',
        'load.4.title': 'Formateando estructura y fórmulas...',
        'load.4.sub': 'Preparando secciones claras y chat interactivo',

        'lvl.simple.name': 'Nivel Sencillo (ELI5)',
        'lvl.university.name': 'Nivel Universitario',
        'lvl.researcher.name': 'Nivel Investigador',
        'fcs.full.name': 'Análisis Completo',
        'fcs.tldr.name': 'Resumen Ejecutivo (TL;DR)',
        'fcs.glossary.name': 'Glosario y Conceptos',
        'fcs.critique.name': 'Lectura Crítica',
        'fcs.full.short': 'Análisis',
        'fcs.tldr.short': 'Resumen',
        'fcs.glossary.short': 'Glosario',
        'fcs.critique.short': 'Lectura',

        'ex.transformers.query': 'Attention Is All You Need - Ashish Vaswani et al. (2017), Google Brain / NeurIPS: La arquitectura Transformer basada exclusivamente en mecanismos de autoatención (Self-Attention) sin redes recurrentes ni convolucionales.',
        'ex.alphafold.query': 'Highly accurate protein structure prediction with AlphaFold - John Jumper et al. (2021), DeepMind, Nature: Predicción de estructuras tridimensionales de proteínas a precisión atómica mediante Evoformer y atención espacial.',
        'ex.dna.query': 'Molecular Structure of Nucleic Acids: A Structure for Deoxyribose Nucleic Acid - James D. Watson y Francis H. C. Crick (1953), Nature: El descubrimiento de la doble hélice del ADN y el emparejamiento complementario de bases.',

        'chat.q1.full': '¿Qué limitaciones o debilidades tiene este método?',
        'chat.q2.full': '¿Cómo se compara con trabajos anteriores en su campo?',
        'chat.q3.full': 'Explícame la metodología paso a paso de forma clara',
        'chat.q4.full': '¿Qué aplicaciones prácticas tiene este descubrimiento?',

        'prompt.level.simple': `NIVEL DE EXPLICACIÓN — SENCILLO (DIVULGATIVO / ELI5):
- Explica el estudio como si hablaras con una persona curiosa sin formación técnica en esa disciplina.
- Usa analogías cotidianas claras (en bloques de cita "> Analogía: ...") para aterrizar los conceptos complejos.
- Evita jerga académica innecesaria; si debes mencionar un término técnico, tradúcelo inmediatamente al lenguaje común.
- Tono cercano, claro, pedagógico y estimulante.`,

        'prompt.level.university': `NIVEL DE EXPLICACIÓN — UNIVERSITARIO (EQUILIBRADO):
- Dirígete a un estudiante universitario o profesional de ciencias/ingeniería/humanidades.
- Mantén rigor conceptual y precisión terminológica, explicando el "porqué" y el "cómo" detrás de cada mecanismo o hallazgo.
- Incluye ecuaciones o notación clave solo cuando aporten claridad conceptual (usando formato LaTeX $...$ o $$...$$).
- Tono estructurado, didáctico y académicamente sólido.`,

        'prompt.level.researcher': `NIVEL DE EXPLICACIÓN — INVESTIGADOR (TÉCNICO Y PROFUNDO):
- Dirígete a un investigador, doctorando o especialista del área.
- Analiza en profundidad la arquitectura o diseño experimental, variables, funciones objetivo, métricas cuantitativas, ablaciones, línea base (baselines) y validez estadística.
- Incluye formulaciones matemáticas clave en LaTeX ($...$ y $$...$$) cuando formen parte central del aporte.
- Tono riguroso, analítico, preciso y sin simplificaciones excesivas.`,

        'prompt.focus.full': `ENFOQUE DE SALIDA — ANÁLISIS COMPLETO ESTRUCTURADO:
Organiza tu respuesta exactamente con estas 5 secciones en Markdown (usando encabezados ##):
## 1. De qué trata en una frase
(Una única oración cristalina, destacada en negrita, que capture la esencia del estudio).
## 2. El problema que resuelve
(Contexto previo, cuello de botella o vacío científico que motivó la investigación).
## 3. Metodología: Cómo lo hicieron
(Diseño experimental, arquitectura, datos o enfoque propuesto paso a paso).
## 4. Hallazgos principales
(Resultados clave, evidencia empírica, comparativas y métricas relevantes).
## 5. Impacto y limitaciones
(Trascendencia en el campo, aplicaciones y limitaciones o trabajo futuro).`,

        'prompt.focus.tldr': `ENFOQUE DE SALIDA — RESUMEN EJECUTIVO (TL;DR):
- Comienza con un bloque destacado (> **Resumen en 30 segundos:** ...) de máximo 3 líneas.
- Continúa con una lista de 5 a 7 puntos clave de alto impacto (**Idea clave:** explicación directa).
- Finaliza con una breve sección **## Por qué importa este estudio**.`,

        'prompt.focus.glossary': `ENFOQUE DE SALIDA — GLOSARIO Y CONCEPTOS CLAVE:
- Comienza con un breve mapa conceptual narrativo de 1 párrafo explicando cómo se conectan las piezas del paper.
- Presenta entre 8 y 12 conceptos, técnicas, métricas o mecanismos fundamentales del estudio en secciones o lista estructurada.
- Para cada término incluye: **Definición clara**, **Rol en este paper** y **Ejemplo o analogía**.`,

        'prompt.focus.critique': `ENFOQUE DE SALIDA — LECTURA CRÍTICA:
Organiza el análisis crítico en 4 secciones claras:
## 1. Fortalezas metodológicas y aportes sólidos
## 2. Posibles sesgos, supuestos y puntos ciegos
## 3. Limitaciones de generalización o escalabilidad
## 4. Preguntas abiertas para futura investigación`,

        'prompt.system': `Eres PaperClaro AI, un prestigioso divulgador y analista de literatura científica en español.
Tu misión es transformar artículos científicos complejos en explicaciones extraordinariamente claras, rigurosas y bien estructuradas en ESPAÑOL.

REGLAS OBLIGATORIAS DE FORMATO:
1. Comienza SIEMPRE con un encabezado H1 (# Título Exacto o Descriptivo del Paper) en la primera línea. Si conoces los autores principales y el año, inclúyelos en un subtítulo corto justo debajo en cursiva (ej. *Vaswani et al., 2017 · NeurIPS*).
2. Escribe toda la respuesta en español impecable, con excelente jerarquía visual (negritas estratégicas, listas limpias, tablas comparativas si aportan valor).
3. Para fórmulas matemáticas, utiliza delimitadores estándar LaTeX: $...$ para fórmulas en línea y $$...$$ para bloques centrados.
4. Si el usuario proporciona el texto de un paper, básate fielmente en ese documento sin inventar datos que no estén allí. Si pide un paper por título o tema, utiliza información verificada y precisa.

{level}

{focus}`,

        'prompt.userTitle': 'Identifica y explica el siguiente estudio o paper científico: "{query}". Ofrece solo datos reales y verificables; si no estás seguro de que el paper exista o de algún detalle, dilo explícitamente en lugar de inventarlo.',
        'prompt.userDoc': 'Analiza y explica el siguiente artículo científico proporcionado por el usuario:\n\n--- INICIO DEL DOCUMENTO ---\n{text}\n--- FIN DEL DOCUMENTO ---',
        'prompt.chatCtxTitle': 'Paper analizado: "{title}" (Consulta original: "{query}").',
        'prompt.chatCtxDoc': 'Documento científico analizado ("{title}"):\n\n{text}',
        'prompt.chatSystem': `Eres PaperClaro AI, un tutor científico experto que responde en español.
Responde a la pregunta del usuario basándote rigurosamente en el paper científico analizado en esta conversación ("{title}").
- Mantén un tono pedagógico, claro y adaptado al nivel "{level}".
- Si el usuario pregunta algo que el paper no especifica directamente, indícalo con honestidad académica y aporta contexto científico relevante aclarando la distinción.
- Usa Markdown limpio (listas, negritas) y fórmulas LaTeX ($...$) si son útiles.`
    }
};

const LANGS = ['en', 'es'];
const DEFAULT_LANG = 'en';
const LANG_STORE = 'paperclaro.lang.v1';
const LOCALES = { en: 'en-US', es: 'es-ES' };

let currentLang = DEFAULT_LANG;

function readStoredLang() {
    try {
        const v = window.localStorage.getItem(LANG_STORE);
        return LANGS.includes(v) ? v : null;
    } catch (e) { return null; }
}

// Returns the translation of `key` (current language, then English) or `undefined` if there is none.
function lookup(key, lang = currentLang) {
    return I18N[lang]?.[key] ?? I18N[DEFAULT_LANG][key];
}

// t('count.many', { n: 3 }) -> "3 papers analyzed". Unknown keys are returned as-is to make them easy to spot.
function t(key, vars) {
    const str = lookup(key);
    if (str === undefined) return key;
    return vars ? str.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? vars[name] : m)) : str;
}

function locale() { return LOCALES[currentLang]; }
function formatNumber(n) { return n.toLocaleString(locale()); }

// Reads every static English text from the DOM once, so index.html stays the single source for them.
function captureEnglish() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        I18N.en[el.dataset.i18n] ??= el.innerHTML.trim();
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
        parseAttrSpec(el).forEach(([attr, key]) => { I18N.en[key] ??= el.getAttribute(attr); });
    });
}

function parseAttrSpec(el) {
    return el.dataset.i18nAttr.split(';')
        .map(pair => pair.split(':').map(s => s.trim()))
        .filter(pair => pair.length === 2 && pair[0] && pair[1]);
}

function applyStaticTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const str = lookup(el.dataset.i18n);
        if (str !== undefined) el.innerHTML = str;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
        parseAttrSpec(el).forEach(([attr, key]) => {
            const str = lookup(key);
            if (str !== undefined) el.setAttribute(attr, str);
        });
    });
}

function renderLangSwitch() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const on = btn.dataset.lang === currentLang;
        btn.setAttribute('aria-pressed', String(on));
        btn.className = 'lang-btn px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors ' +
            (on ? 'bg-indigo-700 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900');
    });
}

function setLang(lang, { persist = true } = {}) {
    if (!LANGS.includes(lang)) return;
    currentLang = lang;
    document.documentElement.lang = lang;
    if (persist) {
        try { window.localStorage.setItem(LANG_STORE, lang); } catch (e) { /* private mode: not persisted */ }
    }
    applyStaticTranslations();
    renderLangSwitch();
    // app.js refreshes the texts it renders from JavaScript (status, history, results...)
    if (typeof onLanguageChanged === 'function') onLanguageChanged();
}

captureEnglish();
setLang(readStoredLang() ?? DEFAULT_LANG, { persist: false });
