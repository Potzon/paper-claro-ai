        // =========================================================================
        // 1. CONFIGURACIÓN GLOBAL Y ESTADO DE LA APLICACIÓN
        // =========================================================================
        // Proveedores soportados. `kind` decide el formato de la petición:
        //   gemini    -> Google generateContent
        //   anthropic -> Anthropic Messages API
        //   openai    -> /chat/completions (OpenAI y cualquier API compatible)
        const PROVIDERS = {
            gemini:     { name: 'Gemini', color: '#8E75B2', icon: 'M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81', label: 'Google Gemini',            kind: 'gemini',    model: 'gemini-3-flash-preview', search: true,
                          keyHint: 'Consíguela en aistudio.google.com/apikey' },
            openai:     { name: 'OpenAI', color: '#412991', icon: 'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z', label: 'OpenAI',                   kind: 'openai',    model: 'gpt-4o-mini', base: 'https://api.openai.com/v1',
                          keyHint: 'Empieza por sk-… (platform.openai.com/api-keys)' },
            anthropic:  { name: 'Claude', color: '#D97757', icon: 'm4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z', label: 'Anthropic (Claude)',       kind: 'anthropic', model: 'claude-sonnet-5-5',
                          keyHint: 'Empieza por sk-ant-… (console.anthropic.com)' },
            openrouter: { name: 'OpenRouter', color: '#6566F1', icon: 'M18.654 3.87a5.087 5.087 0 110 10.174L23.7 19.09c.64.641.187 1.737-.72 1.737H8.48a8.479 8.479 0 010-16.958h10.175zM8.479 7.26a5.087 5.087 0 100 10.176 5.087 5.087 0 000-10.175z', label: 'OpenRouter',               kind: 'openai',    model: 'openai/gpt-4o-mini', base: 'https://openrouter.ai/api/v1',
                          keyHint: 'Empieza por sk-or-… Da acceso a muchos modelos con una sola clave.' },
            groq:       { name: 'Groq', color: '#F55036', icon: 'M12.036 2c-3.853-.035-7 3-7.036 6.781-.035 3.782 3.055 6.872 6.908 6.907h2.42v-2.566h-2.292c-2.407.028-4.38-1.866-4.408-4.23-.029-2.362 1.901-4.298 4.308-4.326h.1c2.407 0 4.358 1.915 4.365 4.278v6.305c0 2.342-1.944 4.25-4.323 4.279a4.375 4.375 0 01-3.033-1.252l-1.851 1.818A7 7 0 0012.029 22h.092c3.803-.056 6.858-3.083 6.879-6.816v-6.5C18.907 4.963 15.817 2 12.036 2z', label: 'Groq',                     kind: 'openai',    model: 'llama-3.3-70b-versatile', base: 'https://api.groq.com/openai/v1',
                          keyHint: 'Empieza por gsk_… (console.groq.com/keys)' },
            ollama:     { name: 'Ollama (local)', color: '#000000', icon: 'M16.361 10.26a.894.894 0 0 0-.558.47l-.072.148.001.207c0 .193.004.217.059.353.076.193.152.312.291.448.24.238.51.3.872.205a.86.86 0 0 0 .517-.436.752.752 0 0 0 .08-.498c-.064-.453-.33-.782-.724-.897a1.06 1.06 0 0 0-.466 0zm-9.203.005c-.305.096-.533.32-.65.639a1.187 1.187 0 0 0-.06.52c.057.309.31.59.598.667.362.095.632.033.872-.205.14-.136.215-.255.291-.448.055-.136.059-.16.059-.353l.001-.207-.072-.148a.894.894 0 0 0-.565-.472 1.02 1.02 0 0 0-.474.007Zm4.184 2c-.131.071-.223.25-.195.383.031.143.157.288.353.407.105.063.112.072.117.136.004.038-.01.146-.029.243-.02.094-.036.194-.036.222.002.074.07.195.143.253.064.052.076.054.255.059.164.005.198.001.264-.03.169-.082.212-.234.15-.525-.052-.243-.042-.28.087-.355.137-.08.281-.219.324-.314a.365.365 0 0 0-.175-.48.394.394 0 0 0-.181-.033c-.126 0-.207.03-.355.124l-.085.053-.053-.032c-.219-.13-.259-.145-.391-.143a.396.396 0 0 0-.193.032zm.39-2.195c-.373.036-.475.05-.654.086-.291.06-.68.195-.951.328-.94.46-1.589 1.226-1.787 2.114-.04.176-.045.234-.045.53 0 .294.005.357.043.524.264 1.16 1.332 2.017 2.714 2.173.3.033 1.596.033 1.896 0 1.11-.125 2.064-.727 2.493-1.571.114-.226.169-.372.22-.602.039-.167.044-.23.044-.523 0-.297-.005-.355-.045-.531-.288-1.29-1.539-2.304-3.072-2.497a6.873 6.873 0 0 0-.855-.031zm.645.937a3.283 3.283 0 0 1 1.44.514c.223.148.537.458.671.662.166.251.26.508.303.82.02.143.01.251-.043.482-.08.345-.332.705-.672.957a3.115 3.115 0 0 1-.689.348c-.382.122-.632.144-1.525.138-.582-.006-.686-.01-.853-.042-.57-.107-1.022-.334-1.35-.68-.264-.28-.385-.535-.45-.946-.03-.192.025-.509.137-.776.136-.326.488-.73.836-.963.403-.269.934-.46 1.422-.512.187-.02.586-.02.773-.002zm-5.503-11a1.653 1.653 0 0 0-.683.298C5.617.74 5.173 1.666 4.985 2.819c-.07.436-.119 1.04-.119 1.503 0 .544.064 1.24.155 1.721.02.107.031.202.023.208a8.12 8.12 0 0 1-.187.152 5.324 5.324 0 0 0-.949 1.02 5.49 5.49 0 0 0-.94 2.339 6.625 6.625 0 0 0-.023 1.357c.091.78.325 1.438.727 2.04l.13.195-.037.064c-.269.452-.498 1.105-.605 1.732-.084.496-.095.629-.095 1.294 0 .67.009.803.088 1.266.095.555.288 1.143.503 1.534.071.128.243.393.264.407.007.003-.014.067-.046.141a7.405 7.405 0 0 0-.548 1.873c-.062.417-.071.552-.071.991 0 .56.031.832.148 1.279L3.42 24h1.478l-.05-.091c-.297-.552-.325-1.575-.068-2.597.117-.472.25-.819.498-1.296l.148-.29v-.177c0-.165-.003-.184-.057-.293a.915.915 0 0 0-.194-.25 1.74 1.74 0 0 1-.385-.543c-.424-.92-.506-2.286-.208-3.451.124-.486.329-.918.544-1.154a.787.787 0 0 0 .223-.531c0-.195-.07-.355-.224-.522a3.136 3.136 0 0 1-.817-1.729c-.14-.96.114-2.005.69-2.834.563-.814 1.353-1.336 2.237-1.475.199-.033.57-.028.776.01.226.04.367.028.512-.041.179-.085.268-.19.374-.431.093-.215.165-.333.36-.576.234-.29.46-.489.822-.729.413-.27.884-.467 1.352-.561.17-.035.25-.04.569-.04.319 0 .398.005.569.04a4.07 4.07 0 0 1 1.914.997c.117.109.398.457.488.602.034.057.095.177.132.267.105.241.195.346.374.43.14.068.286.082.503.045.343-.058.607-.053.943.016 1.144.23 2.14 1.173 2.581 2.437.385 1.108.276 2.267-.296 3.153-.097.15-.193.27-.333.419-.301.322-.301.722-.001 1.053.493.539.801 1.866.708 3.036-.062.772-.26 1.463-.533 1.854a2.096 2.096 0 0 1-.224.258.916.916 0 0 0-.194.25c-.054.109-.057.128-.057.293v.178l.148.29c.248.476.38.823.498 1.295.253 1.008.231 2.01-.059 2.581a.845.845 0 0 0-.044.098c0 .006.329.009.732.009h.73l.02-.074.036-.134c.019-.076.057-.3.088-.516.029-.217.029-1.016 0-1.258-.11-.875-.295-1.57-.597-2.226-.032-.074-.053-.138-.046-.141.008-.005.057-.074.108-.152.376-.569.607-1.284.724-2.228.031-.26.031-1.378 0-1.628-.083-.645-.182-1.082-.348-1.525a6.083 6.083 0 0 0-.329-.7l-.038-.064.131-.194c.402-.604.636-1.262.727-2.04a6.625 6.625 0 0 0-.024-1.358 5.512 5.512 0 0 0-.939-2.339 5.325 5.325 0 0 0-.95-1.02 8.097 8.097 0 0 1-.186-.152.692.692 0 0 1 .023-.208c.208-1.087.201-2.443-.017-3.503-.19-.924-.535-1.658-.98-2.082-.354-.338-.716-.482-1.15-.455-.996.059-1.8 1.205-2.116 3.01a6.805 6.805 0 0 0-.097.726c0 .036-.007.066-.015.066a.96.96 0 0 1-.149-.078A4.857 4.857 0 0 0 12 3.03c-.832 0-1.687.243-2.456.698a.958.958 0 0 1-.148.078c-.008 0-.015-.03-.015-.066a6.71 6.71 0 0 0-.097-.725C8.997 1.392 8.337.319 7.46.048a2.096 2.096 0 0 0-.585-.041Zm.293 1.402c.248.197.523.759.682 1.388.03.113.06.244.069.292.007.047.026.152.041.233.067.365.098.76.102 1.24l.002.475-.12.175-.118.178h-.278c-.324 0-.646.041-.954.124l-.238.06c-.033.007-.038-.003-.057-.144a8.438 8.438 0 0 1 .016-2.323c.124-.788.413-1.501.696-1.711.067-.05.079-.049.157.013zm9.825-.012c.17.126.358.46.498.888.28.854.36 2.028.212 3.145-.019.14-.024.151-.057.144l-.238-.06a3.693 3.693 0 0 0-.954-.124h-.278l-.119-.178-.119-.175.002-.474c.004-.669.066-1.19.214-1.772.157-.623.434-1.185.68-1.382.078-.062.09-.063.159-.012z', label: 'Ollama (local, sin clave)', kind: 'openai',   model: 'llama3.1', base: 'http://localhost:11434/v1', keyOptional: true,
                          keyHint: 'No necesita clave. Ollama debe permitir el origen de esta página (OLLAMA_ORIGINS).' },
            custom:     { name: 'Otra API (OpenAI)', mark: '⚙', badge: 'bg-slate-500', label: 'Otra API compatible con OpenAI', kind: 'openai', model: '', base: '', keyOptional: true,
                          keyHint: 'Indica la URL base y el modelo de tu servicio (LM Studio, vLLM, Together, Mistral…).' }
        };

        const META_STORE = 'paperclaro.settings.v1';
        const KEYS_STORE = 'paperclaro.keys.v1';
        const llm = { provider: 'gemini', remember: false, models: {}, bases: {}, keys: {} };

        function safeStorage(kind) {
            try {
                const s = window[kind];
                s.setItem('__t', '1'); s.removeItem('__t');
                return s;
            } catch (e) { return null; }
        }

        function loadSettings() {
            const ls = safeStorage('localStorage'), ss = safeStorage('sessionStorage');
            try {
                const meta = JSON.parse(ls?.getItem(META_STORE) || '{}');
                if (PROVIDERS[meta.provider]) llm.provider = meta.provider;
                llm.remember = !!meta.remember;
                llm.models = meta.models || {};
                llm.bases = meta.bases || {};
            } catch (e) { /* ajustes corruptos: se ignoran */ }
            try {
                llm.keys = { ...JSON.parse(ss?.getItem(KEYS_STORE) || '{}'), ...JSON.parse(ls?.getItem(KEYS_STORE) || '{}') };
            } catch (e) { llm.keys = {}; }
        }

        function persistSettings() {
            const ls = safeStorage('localStorage'), ss = safeStorage('sessionStorage');
            const meta = { provider: llm.provider, remember: llm.remember, models: llm.models, bases: llm.bases };
            ls?.setItem(META_STORE, JSON.stringify(meta));
            const keysJson = JSON.stringify(llm.keys);
            if (llm.remember) { ls?.setItem(KEYS_STORE, keysJson); ss?.removeItem(KEYS_STORE); }
            else { ss?.setItem(KEYS_STORE, keysJson); ls?.removeItem(KEYS_STORE); }
        }

        function currentCfg() {
            const p = PROVIDERS[llm.provider];
            return {
                ...p,
                id: llm.provider,
                model: (llm.models[llm.provider] ?? p.model ?? '').trim(),
                base: (llm.bases[llm.provider] ?? p.base ?? '').trim().replace(/\/+$/, ''),
                key: (llm.keys[llm.provider] || '').trim()
            };
        }

        function isConfigured() {
            const c = currentCfg();
            if (!c.model) return false;
            if (c.kind === 'openai' && !c.base) return false;
            return c.keyOptional || !!c.key;
        }

        function searchAvailable() { return !!PROVIDERS[llm.provider].search; }

        function updateProviderUI() {
            const c = currentCfg();
            const ok = isConfigured();
            document.getElementById('apiStatusDot').className = `w-2 h-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-500'}`;
            document.getElementById('apiStatusText').textContent = ok ? `${c.label.split(' (')[0]} · ${c.model}` : 'Configurar API';
            document.getElementById('searchStatusText').textContent = searchAvailable()
                ? 'Búsqueda web activa (Gemini)'
                : 'Sin búsqueda web: responderá con el conocimiento del modelo';
        }

        // ---- Modal de ajustes ----
        let modalProvider = null;

        function stashModalFields() {
            if (!modalProvider) return;
            llm.keys[modalProvider] = document.getElementById('cfgKey').value.trim();
            llm.models[modalProvider] = document.getElementById('cfgModel').value.trim();
            llm.bases[modalProvider] = document.getElementById('cfgBase').value.trim();
        }

        function fillModalFields() {
            const p = PROVIDERS[modalProvider];
            document.getElementById('cfgKey').value = llm.keys[modalProvider] || '';
            document.getElementById('cfgModel').value = llm.models[modalProvider] ?? p.model ?? '';
            document.getElementById('cfgBase').value = llm.bases[modalProvider] ?? p.base ?? '';
            document.getElementById('cfgBaseWrap').classList.toggle('hidden', p.kind !== 'openai');
            document.getElementById('cfgKeyHint').textContent = p.keyHint + (p.keyOptional ? '' : '');
            loadModels();
        }

        // ---- Lista de modelos disponibles según la clave ----
        let modelsReqId = 0;
        const NON_CHAT_MODEL = /embed|whisper|tts|dall-e|moderation|transcribe|realtime|image|audio|rerank/i;

        function modelsRequest(p, key, base) {
            if (p.kind === 'gemini') {
                return { url: 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000', headers: { 'x-goog-api-key': key } };
            }
            if (p.kind === 'anthropic') {
                return {
                    url: 'https://api.anthropic.com/v1/models?limit=1000',
                    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }
                };
            }
            return { url: `${base}/models`, headers: key ? { 'Authorization': `Bearer ${key}` } : {} };
        }

        function parseModels(p, data) {
            let list;
            if (p.kind === 'gemini') {
                list = (data?.models || [])
                    .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
                    .map(m => ({ id: m.name.replace(/^models\//, ''), label: m.displayName }));
            } else if (p.kind === 'anthropic') {
                list = (data?.data || []).map(m => ({ id: m.id, label: m.display_name }));
            } else {
                list = (data?.data || data?.models || []).map(m => ({ id: m.id || m.name, label: '' })).filter(m => m.id);
                const chat = list.filter(m => !NON_CHAT_MODEL.test(m.id));
                if (chat.length) list = chat;
            }
            return list.sort((a, b) => a.id.localeCompare(b.id));
        }

        async function loadModels() {
            if (!modalProvider) return;
            const p = PROVIDERS[modalProvider];
            const key = document.getElementById('cfgKey').value.trim();
            const base = document.getElementById('cfgBase').value.trim().replace(/\/+$/, '');
            const sel = document.getElementById('cfgModelSelect');
            const status = document.getElementById('cfgModelStatus');
            const reqId = ++modelsReqId;
            sel.classList.add('hidden');

            if ((!key && !p.keyOptional) || (p.kind === 'openai' && !base)) {
                status.textContent = p.kind === 'openai' && !base && (key || p.keyOptional)
                    ? 'Indica la URL base para poder listar los modelos.'
                    : 'Introduce la clave de API para ver los modelos disponibles.';
                return;
            }
            status.textContent = 'Cargando modelos…';
            try {
                const req = modelsRequest(p, key, base);
                const res = await fetch(req.url, { headers: req.headers });
                if (!res.ok) {
                    const raw = await res.text().catch(() => '');
                    let detail = raw;
                    try { const j = JSON.parse(raw); detail = j.error?.message || j.message || raw; } catch (e) { /* texto plano */ }
                    throw new Error(`${res.status} ${String(detail).slice(0, 150)}`);
                }
                const models = parseModels(p, await res.json());
                if (reqId !== modelsReqId) return; // el usuario cambió de proveedor/clave mientras tanto
                if (!models.length) { status.textContent = 'La clave es válida pero no devolvió modelos. Escribe el nombre a mano.'; return; }
                const current = document.getElementById('cfgModel').value.trim();
                sel.innerHTML = '';
                sel.add(new Option(`Elegir de la lista (${models.length} modelos)…`, ''));
                models.forEach(m => sel.add(new Option(m.label && m.label !== m.id ? `${m.id} — ${m.label}` : m.id, m.id)));
                if (models.some(m => m.id === current)) sel.value = current;
                sel.classList.remove('hidden');
                status.textContent = `${models.length} modelos disponibles con esta clave. También puedes escribir el nombre a mano.`;
            } catch (e) {
                if (reqId !== modelsReqId) return;
                status.textContent = `No se pudo cargar la lista (${e.message || 'error de red o CORS'}). Escribe el nombre del modelo a mano.`;
            }
        }

        function openSettings(message) {
            modalProvider = llm.provider;
            renderProviderGrid();
            document.getElementById('cfgRemember').checked = llm.remember;
            document.getElementById('cfgKey').type = 'password';
            document.getElementById('cfgKeyToggle').textContent = 'Mostrar';
            fillModalFields();
            const err = document.getElementById('settingsError');
            err.textContent = message || '';
            err.classList.toggle('hidden', !message);
            document.getElementById('settingsModal').classList.remove('hidden');
            document.getElementById('cfgKey').focus();
        }

        function closeSettings() {
            document.getElementById('settingsModal').classList.add('hidden');
            modalProvider = null;
        }

        function renderProviderGrid() {
            const grid = document.getElementById('cfgProviderGrid');
            grid.innerHTML = '';
            Object.entries(PROVIDERS).forEach(([id, p]) => {
                const on = id === modalProvider;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.setAttribute('role', 'radio');
                btn.setAttribute('aria-checked', String(on));
                btn.className = 'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-sm font-medium transition-colors ' +
                    (on ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50');
                const mark = document.createElement('span');
                if (p.icon) {
                    // Logo de marca (SVG monocromo de simple-icons / LobeHub Icons) con el color de la marca
                    mark.className = 'shrink-0 w-8 h-8 rounded-lg grid place-items-center bg-white border border-slate-200';
                    const NS = 'http://www.w3.org/2000/svg';
                    const svg = document.createElementNS(NS, 'svg');
                    svg.setAttribute('viewBox', '0 0 24 24');
                    svg.setAttribute('class', 'w-5 h-5');
                    svg.setAttribute('aria-hidden', 'true');
                    svg.setAttribute('fill', p.color);
                    const path = document.createElementNS(NS, 'path');
                    path.setAttribute('d', p.icon);
                    svg.appendChild(path);
                    mark.appendChild(svg);
                } else {
                    mark.className = `shrink-0 w-8 h-8 rounded-lg grid place-items-center text-sm font-bold text-white ${p.badge}`;
                    mark.textContent = p.mark;
                }
                const name = document.createElement('span');
                name.className = 'truncate';
                name.textContent = p.name;
                btn.append(mark, name);
                btn.onclick = () => onProviderChange(id);
                grid.appendChild(btn);
            });
        }

        function onProviderChange(id) {
            if (id === modalProvider) return;
            stashModalFields();
            modalProvider = id;
            renderProviderGrid();
            fillModalFields();
        }

        function toggleKeyVisibility() {
            const input = document.getElementById('cfgKey');
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            document.getElementById('cfgKeyToggle').textContent = show ? 'Ocultar' : 'Mostrar';
        }

        function saveSettingsFromModal() {
            stashModalFields();
            llm.provider = modalProvider;
            llm.remember = document.getElementById('cfgRemember').checked;
            persistSettings();
            updateProviderUI();
            closeSettings();
            showToast(isConfigured() ? 'Proveedor configurado' : 'Guardado, pero faltan datos', isConfigured() ? '✓' : '⚠️');
        }

        function forgetKeys() {
            llm.keys = {};
            persistSettings();
            if (modalProvider) document.getElementById('cfgKey').value = '';
            updateProviderUI();
            showToast('Claves eliminadas');
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !document.getElementById('settingsModal').classList.contains('hidden')) closeSettings();
        });

        // ---- Carga bajo demanda de librerías pesadas (con SRI) ----
        const LAZY_LIBS = {
            pdfjs: {
                js: ['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'sha384-/1qUCSGwTur9vjf/z9lmu/eCUYbpOTgSjmpbMQZ1/CtX2v/WcAIKqRv+U1DUCG6e'],
                worker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
            },
            katexCss: ['https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css', 'sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+'],
            katexJs: ['https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js', 'sha384-7zkQWkzuo3B5mTepMUcHkMB5jZaolc2xDwL6VFqjFALcbeS9Ggm/Yr2r3Dy4lfFg'],
            katexAuto: ['https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js', 'sha384-43gviWU0YVjaDtb/GhzOouOXtZMP/7XUzwPTstBeZFe/+rCMvRwr4yROQP43s0Xk']
        };

        const lazyCache = {};
        function loadOnce(key, create) {
            if (!lazyCache[key]) {
                lazyCache[key] = new Promise((resolve, reject) => {
                    const el = create();
                    el.onload = () => resolve();
                    el.onerror = () => { delete lazyCache[key]; reject(new Error(`No se pudo cargar ${key}. Revisa tu conexión.`)); };
                    document.head.appendChild(el);
                });
            }
            return lazyCache[key];
        }
        function loadScript([src, integrity]) {
            return loadOnce(src, () => {
                const s = document.createElement('script');
                s.src = src; s.integrity = integrity; s.crossOrigin = 'anonymous';
                return s;
            });
        }
        function loadCss([href, integrity]) {
            return loadOnce(href, () => {
                const l = document.createElement('link');
                l.rel = 'stylesheet'; l.href = href; l.integrity = integrity; l.crossOrigin = 'anonymous';
                return l;
            });
        }
        async function ensurePdfJs() {
            await loadScript(LAZY_LIBS.pdfjs.js);
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = LAZY_LIBS.pdfjs.worker;
        }
        async function ensureKatex() {
            await Promise.all([loadCss(LAZY_LIBS.katexCss), loadScript(LAZY_LIBS.katexJs)]);
            await loadScript(LAZY_LIBS.katexAuto); // auto-render requiere katex ya cargado
        }

        // Configurar Marked.js
        if (window.marked) {
            marked.setOptions({
                breaks: true,
                gfm: true
            });
        }

        // Seguridad del HTML generado por el modelo: los enlaces abren en pestaña nueva sin referrer
        if (window.DOMPurify) {
            DOMPurify.addHook('afterSanitizeAttributes', (node) => {
                if (node.tagName === 'A' && node.hasAttribute('href')) {
                    node.setAttribute('target', '_blank');
                    node.setAttribute('rel', 'noopener noreferrer');
                }
            });
        }

        // Estado principal
        const appState = {
            activeTab: 'title',          // 'title' | 'text' | 'file'
            level: 'universitario',      // 'sencillo' | 'universitario' | 'investigador'
            focus: 'completo',           // 'completo' | 'tldr' | 'glosario' | 'critica'
            uploadedFile: null,          // { name, type, pages, text, wordCount }
            isAnalyzing: false,
            isChatting: false,
            sessions: [],                // Historial de papers analizados en la sesión
            activeSessionId: null        // ID del paper activo en pantalla
        };

        // Ejemplos precargados de 1 clic
        const PRELOADED_EXAMPLES = {
            transformers: {
                title: "Attention Is All You Need (Vaswani et al., 2017 - Arquitectura Transformer)",
                query: "Attention Is All You Need - Ashish Vaswani et al. (2017), Google Brain / NeurIPS: La arquitectura Transformer basada exclusivamente en mecanismos de autoatención (Self-Attention) sin redes recurrentes ni convolucionales."
            },
            alphafold: {
                title: "AlphaFold: Highly accurate protein structure prediction (Jumper et al., 2021)",
                query: "Highly accurate protein structure prediction with AlphaFold - John Jumper et al. (2021), DeepMind, Nature: Predicción de estructuras tridimensionales de proteínas a precisión atómica mediante Evoformer y atención espacial."
            },
            dna: {
                title: "Molecular Structure of Nucleic Acids: ADN (Watson & Crick, 1953)",
                query: "Molecular Structure of Nucleic Acids: A Structure for Deoxyribose Nucleic Acid - James D. Watson y Francis H. C. Crick (1953), Nature: El descubrimiento de la doble hélice del ADN y el emparejamiento complementario de bases."
            }
        };

        // Etiquetas legibles para la interfaz
        const LEVEL_LABELS = {
            sencillo: { icon: "🌱", name: "Nivel Sencillo (ELI5)" },
            universitario: { icon: "🎓", name: "Nivel Universitario" },
            investigador: { icon: "🔬", name: "Nivel Investigador" }
        };

        const FOCUS_LABELS = {
            completo: { icon: "📑", name: "Análisis Completo" },
            tldr: { icon: "⚡", name: "Resumen Ejecutivo (TL;DR)" },
            glosario: { icon: "📖", name: "Glosario y Conceptos" },
            critica: { icon: "⚖️", name: "Lectura Crítica" }
        };

        // =========================================================================
        // 2. INICIALIZACIÓN Y EVENT LISTENERS
        // =========================================================================
        document.addEventListener('DOMContentLoaded', () => {
            loadSettings();
            updateProviderUI();
            setupEventListeners();
            updateSessionBadge();
        });

        function setupEventListeners() {
            // Botón móvil historial
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            if (mobileMenuBtn) {
                mobileMenuBtn.addEventListener('click', () => toggleMobileSidebar(true));
            }

            // Input de título: botón limpiar y tecla Enter
            const titleInput = document.getElementById('paperTitleInput');
            const clearTitleBtn = document.getElementById('clearTitleInputBtn');
            titleInput.addEventListener('input', () => {
                clearTitleBtn.classList.toggle('hidden', titleInput.value.trim().length === 0);
                hideValidation();
            });
            titleInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    analyzePaper();
                }
            });

            // Textarea: contador de palabras y Ctrl+Enter
            const textInput = document.getElementById('paperTextInput');
            textInput.addEventListener('input', () => {
                updateTextCounter();
                hideValidation();
            });
            textInput.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    analyzePaper();
                }
            });

            // Zona Drag & Drop para archivos PDF / TXT
            const dropZone = document.getElementById('dropZone');
            const fileInput = document.getElementById('fileInput');

            dropZone.addEventListener('click', () => fileInput.click());

            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('border-indigo-600', 'bg-indigo-50/60');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('border-indigo-600', 'bg-indigo-50/60');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('border-indigo-600', 'bg-indigo-50/60');
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFileSelection(e.dataTransfer.files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    handleFileSelection(e.target.files[0]);
                }
            });
        }

        // =========================================================================
        // 3. GESTIÓN DE PESTAÑAS, NIVELES, ENFOQUES Y EJEMPLOS
        // =========================================================================
        function switchInputTab(tabName) {
            appState.activeTab = tabName;
            hideValidation();

            const tabs = ['title', 'text', 'file'];
            tabs.forEach(t => {
                const btn = document.getElementById(`tab-${t}`);
                const panel = document.getElementById(`panel-${t}`);
                const isActive = t === tabName;

                btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
                if (isActive) {
                    btn.className = 'input-tab-btn flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold bg-white text-indigo-800 shadow-xs transition-all';
                    panel.classList.remove('hidden');
                } else {
                    btn.className = 'input-tab-btn flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 transition-all';
                    panel.classList.add('hidden');
                }
            });
        }

        function selectLevel(level) {
            appState.level = level;
            document.querySelectorAll('.level-option').forEach(btn => {
                const isSelected = btn.dataset.level === level;
                if (isSelected) {
                    btn.className = 'level-option text-left p-3 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 transition-all';
                    btn.querySelector('div').className = 'flex items-center gap-1.5 font-semibold text-sm text-indigo-950';
                    btn.querySelector('p').className = 'text-[11px] text-indigo-800/80 mt-1 leading-snug';
                } else {
                    btn.className = 'level-option text-left p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-indigo-300 transition-all';
                    btn.querySelector('div').className = 'flex items-center gap-1.5 font-semibold text-sm text-slate-900';
                    btn.querySelector('p').className = 'text-[11px] text-slate-500 mt-1 leading-snug';
                }
            });
        }

        function selectFocus(focus) {
            appState.focus = focus;
            document.querySelectorAll('.focus-option').forEach(btn => {
                const isSelected = btn.dataset.focus === focus;
                if (isSelected) {
                    btn.className = 'focus-option text-left p-2.5 rounded-xl border-2 border-emerald-600 bg-emerald-50/50 transition-all';
                    btn.querySelector('div').className = 'flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-emerald-950';
                    btn.querySelector('p').className = 'text-[11px] text-emerald-800/80 mt-0.5';
                } else {
                    btn.className = 'focus-option text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-emerald-300 transition-all';
                    btn.querySelector('div').className = 'flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-slate-900';
                    btn.querySelector('p').className = 'text-[11px] text-slate-500 mt-0.5';
                }
            });
        }

        function loadExample(exampleKey) {
            const example = PRELOADED_EXAMPLES[exampleKey];
            if (!example || appState.isAnalyzing) return;

            switchInputTab('title');
            const titleInput = document.getElementById('paperTitleInput');
            titleInput.value = example.query;
            document.getElementById('clearTitleInputBtn').classList.remove('hidden');

            // Analizar inmediatamente para una experiencia fluida de 1 clic
            analyzePaper();
        }

        function clearTitleInput() {
            const input = document.getElementById('paperTitleInput');
            input.value = '';
            document.getElementById('clearTitleInputBtn').classList.add('hidden');
            input.focus();
        }

        function clearTextInput() {
            const input = document.getElementById('paperTextInput');
            input.value = '';
            updateTextCounter();
            input.focus();
        }

        function updateTextCounter() {
            const text = document.getElementById('paperTextInput').value.trim();
            const chars = text.length;
            const words = text ? text.split(/\s+/).length : 0;
            document.getElementById('textCharCounter').textContent =
                `${words.toLocaleString('es-ES')} palabras · ${chars.toLocaleString('es-ES')} caracteres`;
        }

        function resetToNewPaper(event) {
            if (event) event.preventDefault();
            appState.activeSessionId = null;
            renderHistoryList();
            document.getElementById('resultSectionCard').classList.add('hidden');
            document.getElementById('inputSectionCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (appState.activeTab === 'title') {
                document.getElementById('paperTitleInput').focus();
            }
        }

        // =========================================================================
        // 4. EXTRACCIÓN DE ARCHIVOS PDF Y TXT EN EL NAVEGADOR
        // =========================================================================
        async function handleFileSelection(file) {
            hideValidation();
            const fileName = file.name;
            const lowerName = fileName.toLowerCase();

            if (!lowerName.endsWith('.pdf') && !lowerName.endsWith('.txt')) {
                showValidation('Formato no compatible. Por favor, sube un archivo .pdf o .txt.');
                return;
            }

            const defaultView = document.getElementById('dropZoneDefault');
            const parsingView = document.getElementById('dropZoneParsing');
            const statusText = document.getElementById('pdfParsingStatus');

            defaultView.classList.add('hidden');
            parsingView.classList.remove('hidden');

            try {
                let extractedText = '';
                let pageCount = 1;
                let fileType = 'TXT';

                if (lowerName.endsWith('.txt')) {
                    statusText.textContent = 'Leyendo archivo de texto...';
                    extractedText = await file.text();
                } else if (lowerName.endsWith('.pdf')) {
                    fileType = 'PDF';
                    statusText.textContent = 'Cargando lector de PDF...';
                    await ensurePdfJs();
                    statusText.textContent = 'Procesando páginas del PDF...';
                    const arrayBuffer = await file.arrayBuffer();
                    // isEvalSupported:false mitiga CVE-2024-4367 (un PDF malicioso podía ejecutar JS en PDF.js < 4.2)
                    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer, isEvalSupported: false }).promise;
                    pageCount = pdf.numPages;

                    const maxPagesToRead = Math.min(pageCount, 45); // Límite razonable para rendimiento óptimo
                    const pageTexts = [];

                    for (let i = 1; i <= maxPagesToRead; i++) {
                        statusText.textContent = `Extrayendo página ${i} de ${maxPagesToRead}...`;
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageStr = textContent.items.map(item => item.str).join(' ');
                        pageTexts.push(pageStr);
                    }

                    extractedText = pageTexts.join('\n\n').replace(/\s+/g, ' ').trim();
                }

                if (!extractedText || extractedText.length < 40) {
                    throw new Error('No se pudo extraer texto legible del archivo (puede ser un PDF escaneado como imagen sin OCR). Prueba pegando el texto manualmente.');
                }

                const wordCount = extractedText.split(/\s+/).length;
                appState.uploadedFile = {
                    name: fileName,
                    type: fileType,
                    pages: pageCount,
                    text: extractedText,
                    wordCount: wordCount
                };

                // Actualizar tarjeta de archivo cargado
                document.getElementById('fileTypeBadge').textContent = fileType;
                document.getElementById('uploadedFileName').textContent = fileName;
                document.getElementById('uploadedFileMeta').textContent =
                    fileType === 'PDF'
                        ? `${pageCount} ${pageCount === 1 ? 'página' : 'páginas'} · ${wordCount.toLocaleString('es-ES')} palabras extraídas`
                        : `Archivo de texto · ${wordCount.toLocaleString('es-ES')} palabras`;
                document.getElementById('uploadedFilePreview').textContent =
                    `"${extractedText.slice(0, 220)}..."`;

                document.getElementById('uploadedFileCard').classList.remove('hidden');
                showToast(`Archivo "${fileName}" listo para analizar`);

            } catch (error) {
                appState.uploadedFile = null;
                document.getElementById('uploadedFileCard').classList.add('hidden');
                showValidation(error.message || 'Ocurrió un error al leer el archivo.');
            } finally {
                parsingView.classList.add('hidden');
                defaultView.classList.remove('hidden');
                document.getElementById('fileInput').value = '';
            }
        }

        function removeUploadedFile() {
            appState.uploadedFile = null;
            document.getElementById('uploadedFileCard').classList.add('hidden');
            document.getElementById('fileInput').value = '';
        }

        // =========================================================================
        // 5. INTEGRACIÓN CON LA API DE GEMINI (ANÁLISIS Y CHAT CONTEXTUAL)
        // =========================================================================
        // Capa de abstracción: callLLM({ system, messages:[{role:'user'|'model', text}], search })
        //   -> { text, sources:[{uri,title}] }
        function buildRequest(cfg, system, messages, search) {
            if (cfg.kind === 'gemini') {
                const body = {
                    contents: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
                    systemInstruction: { parts: [{ text: system }] }
                };
                if (search) body.tools = [{ google_search: {} }];
                return {
                    url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cfg.model)}:generateContent`,
                    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': cfg.key },
                    body
                };
            }
            if (cfg.kind === 'anthropic') {
                return {
                    url: 'https://api.anthropic.com/v1/messages',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': cfg.key,
                        'anthropic-version': '2023-06-01',
                        'anthropic-dangerous-direct-browser-access': 'true'
                    },
                    body: {
                        model: cfg.model,
                        max_tokens: 8192,
                        system,
                        messages: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
                    }
                };
            }
            // openai-compatible
            const headers = { 'Content-Type': 'application/json' };
            if (cfg.key) headers['Authorization'] = `Bearer ${cfg.key}`;
            return {
                url: `${cfg.base}/chat/completions`,
                headers,
                body: {
                    model: cfg.model,
                    messages: [
                        { role: 'system', content: system },
                        ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
                    ]
                }
            };
        }

        function parseResponse(cfg, data) {
            if (cfg.kind === 'gemini') {
                const cand = data?.candidates?.[0];
                const text = (cand?.content?.parts || []).filter(p => p.text && !p.thought).map(p => p.text).join('');
                const seen = new Set();
                const sources = (cand?.groundingMetadata?.groundingChunks || [])
                    .map(c => ({ uri: c.web?.uri, title: c.web?.title }))
                    .filter(s => s.uri && s.title && !seen.has(s.uri) && seen.add(s.uri));
                return { text, sources };
            }
            if (cfg.kind === 'anthropic') {
                const text = (data?.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
                return { text, sources: [] };
            }
            return { text: data?.choices?.[0]?.message?.content || '', sources: [] };
        }

        async function fetchWithRetry(req, maxRetries = 3) {
            let delay = 1000;
            for (let attempt = 0; ; attempt++) {
                let response;
                try {
                    response = await fetch(req.url, { method: 'POST', headers: req.headers, body: JSON.stringify(req.body) });
                } catch (netErr) {
                    if (attempt >= maxRetries) {
                        throw new Error('No se pudo conectar con el proveedor (red, CORS o URL base incorrecta).');
                    }
                    await new Promise(r => setTimeout(r, delay)); delay *= 2;
                    continue;
                }

                if (response.ok) return response.json();

                // Solo se reintenta ante límite de peticiones o errores del servidor; 400/401/403/404 son definitivos.
                const retryable = response.status === 429 || response.status >= 500;
                if (retryable && attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, delay)); delay *= 2;
                    continue;
                }
                const raw = await response.text().catch(() => '');
                let detail = raw;
                try { const j = JSON.parse(raw); detail = j.error?.message || j.message || raw; } catch (e) { /* texto plano */ }
                if (response.status === 401 || response.status === 403) detail = 'Clave de API no válida o sin permisos. ' + detail;
                throw new Error(`Error de API (${response.status}): ${String(detail).slice(0, 300)}`);
            }
        }

        async function callLLM({ system, messages, search = false }) {
            const cfg = currentCfg();
            const req = buildRequest(cfg, system, messages, search && cfg.search);
            const data = await fetchWithRetry(req);
            return parseResponse(cfg, data);
        }

        function buildSystemInstruction(level, focus) {
            const levelInstructions = {
                sencillo: `NIVEL DE EXPLICACIÓN — SENCILLO (DIVULGATIVO / ELI5):
- Explica el estudio como si hablaras con una persona curiosa sin formación técnica en esa disciplina.
- Usa analogías cotidianas claras (en bloques de cita "> Analogía: ...") para aterrizar los conceptos complejos.
- Evita jerga académica innecesaria; si debes mencionar un término técnico, tradúcelo inmediatamente al lenguaje común.
- Tono cercano, claro, pedagógico y estimulante.`,

                universitario: `NIVEL DE EXPLICACIÓN — UNIVERSITARIO (EQUILIBRADO):
- Dirígete a un estudiante universitario o profesional de ciencias/ingeniería/humanidades.
- Mantén rigor conceptual y precisión terminológica, explicando el "porqué" y el "cómo" detrás de cada mecanismo o hallazgo.
- Incluye ecuaciones o notación clave solo cuando aporten claridad conceptual (usando formato LaTeX $...$ o $$...$$).
- Tono estructurado, didáctico y académicamente sólido.`,

                investigador: `NIVEL DE EXPLICACIÓN — INVESTIGADOR (TÉCNICO Y PROFUNDO):
- Dirígete a un investigador, doctorando o especialista del área.
- Analiza en profundidad la arquitectura o diseño experimental, variables, funciones objetivo, métricas cuantitativas, ablaciones, línea base (baselines) y validez estadística.
- Incluye formulaciones matemáticas clave en LaTeX ($...$ y $$...$$) cuando formen parte central del aporte.
- Tono riguroso, analítico, preciso y sin simplificaciones excesivas.`
            };

            const focusInstructions = {
                completo: `ENFOQUE DE SALIDA — ANÁLISIS COMPLETO ESTRUCTURADO:
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

                tldr: `ENFOQUE DE SALIDA — RESUMEN EJECUTIVO (TL;DR):
- Comienza con un bloque destacado (> **Resumen en 30 segundos:** ...) de máximo 3 líneas.
- Continúa con una lista de 5 a 7 puntos clave de alto impacto (**Idea clave:** explicación directa).
- Finaliza con una breve sección **## Por qué importa este estudio**.`,

                glosario: `ENFOQUE DE SALIDA — GLOSARIO Y CONCEPTOS CLAVE:
- Comienza con un breve mapa conceptual narrativo de 1 párrafo explicando cómo se conectan las piezas del paper.
- Presenta entre 8 y 12 conceptos, técnicas, métricas o mecanismos fundamentales del estudio en secciones o lista estructurada.
- Para cada término incluye: **Definición clara**, **Rol en este paper** y **Ejemplo o analogía**.`,

                critica: `ENFOQUE DE SALIDA — LECTURA CRÍTICA:
Organiza el análisis crítico en 4 secciones claras:
## 1. Fortalezas metodológicas y aportes sólidos
## 2. Posibles sesgos, supuestos y puntos ciegos
## 3. Limitaciones de generalización o escalabilidad
## 4. Preguntas abiertas para futura investigación`
            };

            return `Eres PaperClaro IA, un prestigioso divulgador y analista de literatura científica en español.
Tu misión es transformar artículos científicos complejos en explicaciones extraordinariamente claras, rigurosas y bien estructuradas en ESPAÑOL.

REGLAS OBLIGATORIAS DE FORMATO:
1. Comienza SIEMPRE con un encabezado H1 (# Título Exacto o Descriptivo del Paper) en la primera línea. Si conoces los autores principales y el año, inclúyelos en un subtítulo corto justo debajo en cursiva (ej. *Vaswani et al., 2017 · NeurIPS*).
2. Escribe toda la respuesta en español impecable, con excelente jerarquía visual (negritas estratégicas, listas limpias, tablas comparativas si aportan valor).
3. Para fórmulas matemáticas, utiliza delimitadores estándar LaTeX: $...$ para fórmulas en línea y $$...$$ para bloques centrados.
4. Si el usuario proporciona el texto de un paper, básate fielmente en ese documento sin inventar datos que no estén allí. Si pide un paper por título o tema, utiliza información verificada y precisa.

${levelInstructions[level]}

${focusInstructions[focus]}`;
        }

        async function analyzePaper(overrideLevel = null, overrideFocus = null) {
            if (appState.isAnalyzing) return;

            if (overrideLevel) selectLevel(overrideLevel);
            if (overrideFocus) selectFocus(overrideFocus);

            hideValidation();

            // Determinar entrada según la pestaña activa o la sesión actual si se regenera
            let mode = appState.activeTab;
            let rawContent = '';
            let sourceLabel = '';
            let displayQueryTitle = '';

            if (overrideLevel || overrideFocus) {
                // Re-analizando el paper actualmente activo con nueva configuración
                const currentSession = appState.sessions.find(s => s.id === appState.activeSessionId);
                if (currentSession) {
                    mode = currentSession.mode;
                    rawContent = currentSession.rawContent;
                    sourceLabel = currentSession.sourceLabel;
                    displayQueryTitle = currentSession.displayQueryTitle;
                }
            }

            if (!rawContent) {
                if (mode === 'title') {
                    const query = document.getElementById('paperTitleInput').value.trim();
                    if (!query) {
                        showValidation('Escribe el título de un paper, sus autores o el tema del estudio que quieres que te explique.');
                        document.getElementById('paperTitleInput').focus();
                        return;
                    }
                    rawContent = query;
                    displayQueryTitle = query;
                    sourceLabel = searchAvailable() ? '🔍 Búsqueda Académica' : '🧠 Conocimiento del modelo';
                } else if (mode === 'text') {
                    const text = document.getElementById('paperTextInput').value.trim();
                    if (!text || text.length < 30) {
                        showValidation('Pega un fragmento más amplio del abstract o del artículo (al menos 30 caracteres) para poder analizarlo bien.');
                        document.getElementById('paperTextInput').focus();
                        return;
                    }
                    rawContent = text;
                    displayQueryTitle = text.slice(0, 75) + (text.length > 75 ? '...' : '');
                    sourceLabel = '📄 Texto Proporcionado';
                } else if (mode === 'file') {
                    if (!appState.uploadedFile || !appState.uploadedFile.text) {
                        showValidation('Selecciona o arrastra primero un archivo .pdf o .txt para extraer su contenido.');
                        return;
                    }
                    rawContent = appState.uploadedFile.text;
                    displayQueryTitle = appState.uploadedFile.name;
                    sourceLabel = appState.uploadedFile.type === 'PDF'
                        ? `📎 PDF · ${appState.uploadedFile.pages} págs.`
                        : `📎 Archivo TXT`;
                }
            }

            // Limitar longitud máxima del texto enviado para asegurar estabilidad (hasta ~85,000 caracteres)
            const truncatedContent = rawContent.length > 85000
                ? rawContent.slice(0, 85000) + '\n\n[Nota: Texto recortado por extensión máxima]'
                : rawContent;

            if (!isConfigured()) {
                openSettings('Configura un proveedor y tu clave de API para poder analizar papers.');
                return;
            }

            const userPrompt = mode === 'title'
                ? `Identifica y explica el siguiente estudio o paper científico: "${truncatedContent}". Ofrece solo datos reales y verificables; si no estás seguro de que el paper exista o de algún detalle, dilo explícitamente en lugar de inventarlo.`
                : `Analiza y explica el siguiente artículo científico proporcionado por el usuario:\n\n--- INICIO DEL DOCUMENTO ---\n${truncatedContent}\n--- FIN DEL DOCUMENTO ---`;

            setLoadingState(true);

            try {
                // La búsqueda web (grounding) solo está disponible con Gemini y al buscar por título o tema
                const { text: generatedMarkdown, sources } = await callLLM({
                    system: buildSystemInstruction(appState.level, appState.focus),
                    messages: [{ role: 'user', text: userPrompt }],
                    search: mode === 'title'
                });

                if (!generatedMarkdown) {
                    throw new Error('No se recibió contenido del modelo. Intenta reformular tu consulta.');
                }

                // Extraer título limpio desde el primer encabezado H1 generado
                const extractedTitle = extractTitleFromMarkdown(generatedMarkdown, displayQueryTitle);

                // Crear nueva entrada en el historial de sesión
                const newSession = {
                    id: 'paper_' + Date.now(),
                    title: extractedTitle,
                    displayQueryTitle: displayQueryTitle,
                    mode: mode,
                    rawContent: truncatedContent,
                    sourceLabel: sourceLabel,
                    level: appState.level,
                    focus: appState.focus,
                    markdown: generatedMarkdown,
                    sources: sources,
                    chatMessages: [], // Historial de preguntas de seguimiento
                    timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                };

                appState.sessions.unshift(newSession);
                appState.activeSessionId = newSession.id;

                renderHistoryList();
                renderActiveSession();
                showToast('Explicación generada correctamente');

            } catch (error) {
                showValidation(`No se pudo completar el análisis: ${error.message || 'error de conexión con el proveedor'}. Revisa la configuración de la API e inténtalo de nuevo.`);
            } finally {
                setLoadingState(false);
            }
        }

        // Cambio rápido de nivel o enfoque desde la cabecera de resultados
        function quickReanalyzeLevel(newLevel) {
            if (appState.isAnalyzing) return;
            analyzePaper(newLevel, null);
        }

        function quickReanalyzeFocus(newFocus) {
            if (appState.isAnalyzing) return;
            analyzePaper(null, newFocus);
        }

        // =========================================================================
        // 6. RENDERIZADO DE RESULTADOS, MARKDOWN Y FÓRMULAS MATEMÁTICAS (KATEX)
        // =========================================================================
        function extractTitleFromMarkdown(md, fallback) {
            const h1Match = md.match(/^#\s+(.+)$/m);
            if (h1Match && h1Match[1]) {
                return h1Match[1].replace(/[*_`]/g, '').trim();
            }
            return fallback;
        }

        function renderMarkdownWithMath(containerEl, markdownText) {
            // Proteger bloques LaTeX $$...$$ y $...$ para que marked.js no altere guiones bajos o asteriscos
            const mathBlocks = [];
            let protectedText = markdownText.replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
                const idx = mathBlocks.push(match) - 1;
                return `@@MATHBLOCK_${idx}@@`;
            });

            protectedText = protectedText.replace(/\$([^\n$]+?)\$/g, (match) => {
                const idx = mathBlocks.push(match) - 1;
                return `@@MATHINLINE_${idx}@@`;
            });

            // Parsear Markdown y sanitizar HTML
            const rawHtml = window.marked ? marked.parse(protectedText) : protectedText;
            // Sin DOMPurify no se renderiza HTML (nunca se inserta el HTML sin sanear).
            // Se prohíben img/style/form: una imagen remota permitiría filtrar texto del paper a terceros.
            let cleanHtml = window.DOMPurify
                ? DOMPurify.sanitize(rawHtml, { FORBID_TAGS: ['img', 'style', 'form', 'input', 'button', 'iframe'] })
                : escapeHtml(markdownText);

            // Restaurar expresiones matemáticas
            cleanHtml = cleanHtml.replace(/@@MATH(BLOCK|INLINE)_(\d+)@@/g, (_, __, indexStr) => {
                // Se escapa el HTML: la fórmula se restaura DESPUÉS de DOMPurify y, sin escapar, permitiría inyectar HTML.
                return escapeHtml(mathBlocks[parseInt(indexStr, 10)] || '');
            });

            containerEl.innerHTML = cleanHtml;

            // KaTeX (~300 KB) solo se descarga la primera vez que hay una fórmula que renderizar
            if (mathBlocks.length > 0) {
                ensureKatex().then(() => {
                    renderMathInElement(containerEl, {
                        delimiters: [
                            { left: '$$', right: '$$', display: true },
                            { left: '$', right: '$', display: false }
                        ],
                        throwOnError: false,
                        trust: false
                    });
                }).catch(() => {
                    // Sin KaTeX (offline o sintaxis irregular) se muestra la fórmula como texto
                });
            }
        }

        function renderActiveSession() {
            const session = appState.sessions.find(s => s.id === appState.activeSessionId);
            if (!session) return;

            const resultSection = document.getElementById('resultSectionCard');
            resultSection.classList.remove('hidden');

            // Actualizar insignias de metadatos
            const lvlInfo = LEVEL_LABELS[session.level];
            const fcsInfo = FOCUS_LABELS[session.focus];
            document.getElementById('resultLevelBadge').textContent = `${lvlInfo.icon} ${lvlInfo.name}`;
            document.getElementById('resultFocusBadge').textContent = `${fcsInfo.icon} ${fcsInfo.name}`;
            document.getElementById('resultSourceBadge').textContent = session.sourceLabel;

            // Resaltar botones rápidos activos
            document.querySelectorAll('.quick-lvl-btn').forEach(btn => {
                const active = btn.getAttribute('onclick').includes(`'${session.level}'`);
                btn.classList.toggle('bg-indigo-700', active);
                btn.classList.toggle('text-white', active);
                btn.classList.toggle('border-indigo-700', active);
                btn.classList.toggle('bg-white', !active);
                btn.classList.toggle('text-slate-700', !active);
            });

            document.querySelectorAll('.quick-fcs-btn').forEach(btn => {
                const active = btn.getAttribute('onclick').includes(`'${session.focus}'`);
                btn.classList.toggle('bg-emerald-700', active);
                btn.classList.toggle('text-white', active);
                btn.classList.toggle('border-emerald-700', active);
                btn.classList.toggle('bg-white', !active);
                btn.classList.toggle('text-slate-700', !active);
            });

            // Renderizar explicación Markdown + KaTeX
            const outputEl = document.getElementById('explanationOutput');
            renderMarkdownWithMath(outputEl, session.markdown);

            // Renderizar fuentes bibliográficas si existen
            const sourcesBox = document.getElementById('groundingSourcesBox');
            const sourcesList = document.getElementById('groundingSourcesList');
            if (session.sources && session.sources.length > 0) {
                sourcesList.innerHTML = '';
                session.sources.filter(src => /^https?:\/\//i.test(src.uri)).slice(0, 6).forEach(src => {
                    const a = document.createElement('a');
                    a.href = src.uri;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 transition-colors max-w-xs truncate';
                    a.innerHTML = `<span class="truncate">${escapeHtml(src.title)}</span><svg class="w-3 h-3 shrink-0 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>`;
                    sourcesList.appendChild(a);
                });
                sourcesBox.classList.remove('hidden');
            } else {
                sourcesBox.classList.add('hidden');
            }

            // Renderizar mensajes del chat de seguimiento
            renderChatMessages(session);

            // Desplazar suavemente hacia los resultados
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // =========================================================================
        // 7. CHAT CONTEXTUAL DE SEGUIMIENTO ("PREGÚNTALE AL PAPER")
        // =========================================================================
        function askSuggestedQuestion(questionText) {
            if (appState.isChatting) return;
            const input = document.getElementById('chatInput');
            input.value = questionText;
            sendFollowUpQuestion(questionText);
        }

        function handleChatSubmit(event) {
            event.preventDefault();
            const input = document.getElementById('chatInput');
            const question = input.value.trim();
            if (!question || appState.isChatting) return;
            sendFollowUpQuestion(question);
        }

        async function sendFollowUpQuestion(questionText) {
            const session = appState.sessions.find(s => s.id === appState.activeSessionId);
            if (!session || appState.isChatting) return;

            const input = document.getElementById('chatInput');
            const sendBtn = document.getElementById('chatSendBtn');
            const typingIndicator = document.getElementById('chatTypingIndicator');

            // Añadir pregunta del usuario al historial del chat de esta sesión
            session.chatMessages.push({
                role: 'user',
                text: questionText
            });

            input.value = '';
            renderChatMessages(session);

            appState.isChatting = true;
            input.disabled = true;
            sendBtn.disabled = true;
            typingIndicator.classList.remove('hidden');

            try {
                // Construir historial multi-turno manteniendo todo el contexto del paper
                const baseContextPrompt = session.mode === 'title'
                    ? `Paper analizado: "${session.title}" (Consulta original: "${session.rawContent}").`
                    : `Documento científico analizado ("${session.title}"):\n\n${session.rawContent}`;

                const messages = [
                    { role: 'user', text: baseContextPrompt },
                    { role: 'model', text: session.markdown },
                    // Turnos previos del chat de seguimiento (el último es la pregunta actual)
                    ...session.chatMessages.map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', text: msg.text }))
                ];

                const systemInstruction = `Eres PaperClaro IA, un tutor científico experto que responde en español.
Responde a la pregunta del usuario basándote rigurosamente en el paper científico analizado en esta conversación ("${session.title}").
- Mantén un tono pedagógico, claro y adaptado al nivel "${LEVEL_LABELS[session.level].name}".
- Si el usuario pregunta algo que el paper no especifica directamente, indícalo con honestidad académica y aporta contexto científico relevante aclarando la distinción.
- Usa Markdown limpio (listas, negritas) y fórmulas LaTeX ($...$) si son útiles.`;

                const { text: replyText } = await callLLM({ system: systemInstruction, messages });

                if (!replyText) {
                    throw new Error('No se recibió respuesta del asistente.');
                }

                session.chatMessages.push({
                    role: 'model',
                    text: replyText
                });

                renderChatMessages(session);

            } catch (error) {
                session.chatMessages.push({
                    role: 'model',
                    text: `⚠️ Lo siento, ocurrió un problema al procesar tu pregunta (${error.message || 'error de red'}). Por favor, inténtalo de nuevo.`
                });
                renderChatMessages(session);
            } finally {
                appState.isChatting = false;
                input.disabled = false;
                sendBtn.disabled = false;
                typingIndicator.classList.add('hidden');
                input.focus();
            }
        }

        function renderChatMessages(session) {
            const container = document.getElementById('chatMessagesContainer');
            const emptyPrompt = document.getElementById('chatEmptyPrompt');

            if (!session.chatMessages || session.chatMessages.length === 0) {
                container.innerHTML = '';
                container.appendChild(emptyPrompt);
                emptyPrompt.classList.remove('hidden');
                return;
            }

            container.innerHTML = '';

            session.chatMessages.forEach(msg => {
                const wrapper = document.createElement('div');
                if (msg.role === 'user') {
                    wrapper.className = 'flex justify-end';
                    wrapper.innerHTML = `
                        <div class="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-indigo-700 text-white px-4 py-3 text-sm shadow-2xs leading-relaxed">
                            ${escapeHtml(msg.text)}
                        </div>
                    `;
                } else {
                    wrapper.className = 'flex justify-start items-start gap-2.5';
                    const bubble = document.createElement('div');
                    bubble.className = 'max-w-[92%] sm:max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-slate-200 px-4 py-3.5 shadow-2xs prose-chat';
                    renderMarkdownWithMath(bubble, msg.text);

                    const avatar = document.createElement('div');
                    avatar.className = 'w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5';
                    avatar.textContent = 'IA';

                    wrapper.appendChild(avatar);
                    wrapper.appendChild(bubble);
                }
                container.appendChild(wrapper);
            });

            container.scrollTop = container.scrollHeight;
        }

        // =========================================================================
        // 8. GESTIÓN DEL HISTORIAL LATERAL DE LA SESIÓN
        // =========================================================================
        function renderHistoryList() {
            const listEl = document.getElementById('historyList');
            const emptyEl = document.getElementById('emptyHistoryState');
            const clearBtn = document.getElementById('clearHistoryBtn');

            updateSessionBadge();

            if (appState.sessions.length === 0) {
                listEl.innerHTML = '';
                listEl.appendChild(emptyEl);
                emptyEl.classList.remove('hidden');
                clearBtn.classList.add('hidden');
                return;
            }

            clearBtn.classList.remove('hidden');
            listEl.innerHTML = '';

            appState.sessions.forEach(session => {
                const isActive = session.id === appState.activeSessionId;
                const lvl = LEVEL_LABELS[session.level];
                const fcs = FOCUS_LABELS[session.focus];

                const item = document.createElement('button');
                item.type = 'button';
                item.onclick = () => {
                    appState.activeSessionId = session.id;
                    selectLevel(session.level);
                    selectFocus(session.focus);
                    renderHistoryList();
                    renderActiveSession();
                    toggleMobileSidebar(false);
                };

                item.className = isActive
                    ? 'w-full text-left p-3 rounded-xl bg-indigo-50/90 border border-indigo-300 shadow-2xs transition-all'
                    : 'w-full text-left p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 transition-all';

                item.innerHTML = `
                    <div class="flex items-start justify-between gap-2">
                        <p class="text-xs font-semibold ${isActive ? 'text-indigo-950' : 'text-slate-800'} line-clamp-2 leading-snug">
                            ${escapeHtml(session.title)}
                        </p>
                        <span class="text-[10px] text-slate-400 shrink-0">${session.timestamp}</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-1.5 mt-2">
                        <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-indigo-100/80 text-indigo-800">
                            ${lvl.icon} ${lvl.name.replace('Nivel ', '')}
                        </span>
                        <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-100/80 text-emerald-800">
                            ${fcs.icon} ${fcs.name.split(' ')[0]}
                        </span>
                    </div>
                `;

                listEl.appendChild(item);
            });
        }

        function updateSessionBadge() {
            const count = appState.sessions.length;
            const textEl = document.getElementById('sessionCountText');
            if (textEl) {
                textEl.textContent = count === 1 ? '1 paper analizado' : `${count} papers analizados`;
            }
        }

        function confirmClearHistory() {
            document.getElementById('clearConfirmBox').classList.remove('hidden');
        }

        function cancelClearHistory() {
            document.getElementById('clearConfirmBox').classList.add('hidden');
        }

        function executeClearHistory() {
            appState.sessions = [];
            appState.activeSessionId = null;
            cancelClearHistory();
            renderHistoryList();
            document.getElementById('resultSectionCard').classList.add('hidden');
            showToast('Historial de sesión limpiado');
        }

        function toggleMobileSidebar(open) {
            const sidebar = document.getElementById('historySidebar');
            const backdrop = document.getElementById('sidebarBackdrop');
            if (open) {
                sidebar.classList.remove('-translate-x-full');
                backdrop.classList.remove('hidden');
            } else {
                sidebar.classList.add('-translate-x-full');
                backdrop.classList.add('hidden');
            }
        }

        // =========================================================================
        // 9. COPIAR AL PORTAPAPELES, DESCARGAR .MD Y UTILIDADES UI
        // =========================================================================
        function copyExplanation() {
            const session = appState.sessions.find(s => s.id === appState.activeSessionId);
            if (!session) return;

            // Uso de textarea temporal + document.execCommand('copy') para compatibilidad total en iframes
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = session.markdown;
            tempTextArea.style.position = 'fixed';
            tempTextArea.style.left = '-9999px';
            document.body.appendChild(tempTextArea);
            tempTextArea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showToast('Explicación copiada al portapapeles');
                } else {
                    showToast('No se pudo copiar automáticamente', '⚠️');
                }
            } catch (err) {
                showToast('No se pudo copiar automáticamente', '⚠️');
            } finally {
                document.body.removeChild(tempTextArea);
            }
        }

        function downloadMarkdown() {
            const session = appState.sessions.find(s => s.id === appState.activeSessionId);
            if (!session) return;

            const slug = session.title
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 48) || 'paper-explicado';

            const fileHeader = `> Generado por **PaperClaro IA** · ${LEVEL_LABELS[session.level].name} · ${FOCUS_LABELS[session.focus].name}\n\n`;
            const blob = new Blob([fileHeader + session.markdown], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `PaperClaro_${slug}.md`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showToast('Archivo Markdown (.md) descargado');
        }

        let loadingStepInterval = null;
        function setLoadingState(isLoading) {
            appState.isAnalyzing = isLoading;
            const analyzeBtn = document.getElementById('analyzeBtn');
            const analyzeBtnText = document.getElementById('analyzeBtnText');
            const loadingCard = document.getElementById('loadingStateCard');
            const resultCard = document.getElementById('resultSectionCard');

            analyzeBtn.disabled = isLoading;

            if (isLoading) {
                analyzeBtnText.textContent = 'Analizando paper...';
                resultCard.classList.add('hidden');
                loadingCard.classList.remove('hidden');
                loadingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

                const steps = [
                    { title: 'Leyendo y estructurando el paper...', sub: 'Identificando hipótesis central, contexto y problema científico' },
                    { title: 'Desglosando la metodología y hallazgos...', sub: 'Evaluando experimentos, métricas y resultados principales' },
                    { title: 'Adaptando el rigor pedagógico...', sub: `Redactando explicación en ${LEVEL_LABELS[appState.level].name}` },
                    { title: 'Formateando estructura y fórmulas...', sub: 'Preparando secciones claras y chat interactivo' }
                ];
                let stepIdx = 0;
                document.getElementById('loadingStepTitle').textContent = steps[0].title;
                document.getElementById('loadingStepSubtitle').textContent = steps[0].sub;

                loadingStepInterval = setInterval(() => {
                    stepIdx = (stepIdx + 1) % steps.length;
                    document.getElementById('loadingStepTitle').textContent = steps[stepIdx].title;
                    document.getElementById('loadingStepSubtitle').textContent = steps[stepIdx].sub;
                }, 2400);
            } else {
                analyzeBtnText.textContent = 'Explicar Paper con IA';
                loadingCard.classList.add('hidden');
                if (loadingStepInterval) {
                    clearInterval(loadingStepInterval);
                    loadingStepInterval = null;
                }
            }
        }

        function showValidation(message) {
            const banner = document.getElementById('validationBanner');
            document.getElementById('validationMessage').textContent = message;
            banner.classList.remove('hidden');
        }

        function hideValidation() {
            document.getElementById('validationBanner').classList.add('hidden');
        }

        let toastTimer = null;
        function showToast(message, icon = '✓') {
            const toast = document.getElementById('toastNotification');
            document.getElementById('toastText').textContent = message;
            document.getElementById('toastIcon').textContent = icon;

            toast.classList.remove('translate-y-20', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');

            if (toastTimer) clearTimeout(toastTimer);
            toastTimer = setTimeout(() => {
                toast.classList.add('translate-y-20', 'opacity-0');
                toast.classList.remove('translate-y-0', 'opacity-100');
            }, 3000);
        }

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    
