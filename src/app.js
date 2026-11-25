// =========================================================================
// PaperClaro AI: application logic and AI provider layer.
// UI texts and model prompts come from src/i18n.js (English by default, Spanish as an alternative).
// =========================================================================

// =========================================================================
// 1. GLOBAL CONFIGURATION AND APPLICATION STATE
// =========================================================================
// Supported providers. `kind` decides the request format:
//   gemini    -> Google generateContent
//   anthropic -> Anthropic Messages API
//   openai    -> /chat/completions (OpenAI and any compatible API)
// Names/labels are in English; Spanish overrides live in i18n.js ('prov.<id>.<field>'),
// and the key hints are 'hint.<id>'.
const PROVIDERS = {
    gemini:     { name: 'Gemini', color: '#8E75B2', icon: 'M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81', label: 'Google Gemini',            kind: 'gemini',    model: 'gemini-3-flash-preview', search: true },
    openai:     { name: 'OpenAI', color: '#412991', icon: 'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z', label: 'OpenAI',                   kind: 'openai',    model: 'gpt-4o-mini', base: 'https://api.openai.com/v1' },
    anthropic:  { name: 'Claude', color: '#D97757', icon: 'm4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z', label: 'Anthropic (Claude)',       kind: 'anthropic', model: 'claude-sonnet-5-5' },
    grok:       { name: 'Grok', color: '#000000', evenodd: true, icon: 'M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815', label: 'Grok (xAI)',                 kind: 'openai',    model: 'grok-4', base: 'https://api.x.ai/v1' },
    openrouter: { name: 'OpenRouter', color: '#6566F1', icon: 'M18.654 3.87a5.087 5.087 0 110 10.174L23.7 19.09c.64.641.187 1.737-.72 1.737H8.48a8.479 8.479 0 010-16.958h10.175zM8.479 7.26a5.087 5.087 0 100 10.176 5.087 5.087 0 000-10.175z', label: 'OpenRouter',               kind: 'openai',    model: 'openai/gpt-4o-mini', modelsPublic: true, base: 'https://openrouter.ai/api/v1' },
    groq:       { name: 'Groq', color: '#F55036', icon: 'M12.036 2c-3.853-.035-7 3-7.036 6.781-.035 3.782 3.055 6.872 6.908 6.907h2.42v-2.566h-2.292c-2.407.028-4.38-1.866-4.408-4.23-.029-2.362 1.901-4.298 4.308-4.326h.1c2.407 0 4.358 1.915 4.365 4.278v6.305c0 2.342-1.944 4.25-4.323 4.279a4.375 4.375 0 01-3.033-1.252l-1.851 1.818A7 7 0 0012.029 22h.092c3.803-.056 6.858-3.083 6.879-6.816v-6.5C18.907 4.963 15.817 2 12.036 2z', label: 'Groq',                     kind: 'openai',    model: 'llama-3.3-70b-versatile', base: 'https://api.groq.com/openai/v1' },
    ollama:     { name: 'Ollama (local)', color: '#000000', icon: 'M16.361 10.26a.894.894 0 0 0-.558.47l-.072.148.001.207c0 .193.004.217.059.353.076.193.152.312.291.448.24.238.51.3.872.205a.86.86 0 0 0 .517-.436.752.752 0 0 0 .08-.498c-.064-.453-.33-.782-.724-.897a1.06 1.06 0 0 0-.466 0zm-9.203.005c-.305.096-.533.32-.65.639a1.187 1.187 0 0 0-.06.52c.057.309.31.59.598.667.362.095.632.033.872-.205.14-.136.215-.255.291-.448.055-.136.059-.16.059-.353l.001-.207-.072-.148a.894.894 0 0 0-.565-.472 1.02 1.02 0 0 0-.474.007Zm4.184 2c-.131.071-.223.25-.195.383.031.143.157.288.353.407.105.063.112.072.117.136.004.038-.01.146-.029.243-.02.094-.036.194-.036.222.002.074.07.195.143.253.064.052.076.054.255.059.164.005.198.001.264-.03.169-.082.212-.234.15-.525-.052-.243-.042-.28.087-.355.137-.08.281-.219.324-.314a.365.365 0 0 0-.175-.48.394.394 0 0 0-.181-.033c-.126 0-.207.03-.355.124l-.085.053-.053-.032c-.219-.13-.259-.145-.391-.143a.396.396 0 0 0-.193.032zm.39-2.195c-.373.036-.475.05-.654.086-.291.06-.68.195-.951.328-.94.46-1.589 1.226-1.787 2.114-.04.176-.045.234-.045.53 0 .294.005.357.043.524.264 1.16 1.332 2.017 2.714 2.173.3.033 1.596.033 1.896 0 1.11-.125 2.064-.727 2.493-1.571.114-.226.169-.372.22-.602.039-.167.044-.23.044-.523 0-.297-.005-.355-.045-.531-.288-1.29-1.539-2.304-3.072-2.497a6.873 6.873 0 0 0-.855-.031zm.645.937a3.283 3.283 0 0 1 1.44.514c.223.148.537.458.671.662.166.251.26.508.303.82.02.143.01.251-.043.482-.08.345-.332.705-.672.957a3.115 3.115 0 0 1-.689.348c-.382.122-.632.144-1.525.138-.582-.006-.686-.01-.853-.042-.57-.107-1.022-.334-1.35-.68-.264-.28-.385-.535-.45-.946-.03-.192.025-.509.137-.776.136-.326.488-.73.836-.963.403-.269.934-.46 1.422-.512.187-.02.586-.02.773-.002zm-5.503-11a1.653 1.653 0 0 0-.683.298C5.617.74 5.173 1.666 4.985 2.819c-.07.436-.119 1.04-.119 1.503 0 .544.064 1.24.155 1.721.02.107.031.202.023.208a8.12 8.12 0 0 1-.187.152 5.324 5.324 0 0 0-.949 1.02 5.49 5.49 0 0 0-.94 2.339 6.625 6.625 0 0 0-.023 1.357c.091.78.325 1.438.727 2.04l.13.195-.037.064c-.269.452-.498 1.105-.605 1.732-.084.496-.095.629-.095 1.294 0 .67.009.803.088 1.266.095.555.288 1.143.503 1.534.071.128.243.393.264.407.007.003-.014.067-.046.141a7.405 7.405 0 0 0-.548 1.873c-.062.417-.071.552-.071.991 0 .56.031.832.148 1.279L3.42 24h1.478l-.05-.091c-.297-.552-.325-1.575-.068-2.597.117-.472.25-.819.498-1.296l.148-.29v-.177c0-.165-.003-.184-.057-.293a.915.915 0 0 0-.194-.25 1.74 1.74 0 0 1-.385-.543c-.424-.92-.506-2.286-.208-3.451.124-.486.329-.918.544-1.154a.787.787 0 0 0 .223-.531c0-.195-.07-.355-.224-.522a3.136 3.136 0 0 1-.817-1.729c-.14-.96.114-2.005.69-2.834.563-.814 1.353-1.336 2.237-1.475.199-.033.57-.028.776.01.226.04.367.028.512-.041.179-.085.268-.19.374-.431.093-.215.165-.333.36-.576.234-.29.46-.489.822-.729.413-.27.884-.467 1.352-.561.17-.035.25-.04.569-.04.319 0 .398.005.569.04a4.07 4.07 0 0 1 1.914.997c.117.109.398.457.488.602.034.057.095.177.132.267.105.241.195.346.374.43.14.068.286.082.503.045.343-.058.607-.053.943.016 1.144.23 2.14 1.173 2.581 2.437.385 1.108.276 2.267-.296 3.153-.097.15-.193.27-.333.419-.301.322-.301.722-.001 1.053.493.539.801 1.866.708 3.036-.062.772-.26 1.463-.533 1.854a2.096 2.096 0 0 1-.224.258.916.916 0 0 0-.194.25c-.054.109-.057.128-.057.293v.178l.148.29c.248.476.38.823.498 1.295.253 1.008.231 2.01-.059 2.581a.845.845 0 0 0-.044.098c0 .006.329.009.732.009h.73l.02-.074.036-.134c.019-.076.057-.3.088-.516.029-.217.029-1.016 0-1.258-.11-.875-.295-1.57-.597-2.226-.032-.074-.053-.138-.046-.141.008-.005.057-.074.108-.152.376-.569.607-1.284.724-2.228.031-.26.031-1.378 0-1.628-.083-.645-.182-1.082-.348-1.525a6.083 6.083 0 0 0-.329-.7l-.038-.064.131-.194c.402-.604.636-1.262.727-2.04a6.625 6.625 0 0 0-.024-1.358 5.512 5.512 0 0 0-.939-2.339 5.325 5.325 0 0 0-.95-1.02 8.097 8.097 0 0 1-.186-.152.692.692 0 0 1 .023-.208c.208-1.087.201-2.443-.017-3.503-.19-.924-.535-1.658-.98-2.082-.354-.338-.716-.482-1.15-.455-.996.059-1.8 1.205-2.116 3.01a6.805 6.805 0 0 0-.097.726c0 .036-.007.066-.015.066a.96.96 0 0 1-.149-.078A4.857 4.857 0 0 0 12 3.03c-.832 0-1.687.243-2.456.698a.958.958 0 0 1-.148.078c-.008 0-.015-.03-.015-.066a6.71 6.71 0 0 0-.097-.725C8.997 1.392 8.337.319 7.46.048a2.096 2.096 0 0 0-.585-.041Zm.293 1.402c.248.197.523.759.682 1.388.03.113.06.244.069.292.007.047.026.152.041.233.067.365.098.76.102 1.24l.002.475-.12.175-.118.178h-.278c-.324 0-.646.041-.954.124l-.238.06c-.033.007-.038-.003-.057-.144a8.438 8.438 0 0 1 .016-2.323c.124-.788.413-1.501.696-1.711.067-.05.079-.049.157.013zm9.825-.012c.17.126.358.46.498.888.28.854.36 2.028.212 3.145-.019.14-.024.151-.057.144l-.238-.06a3.693 3.693 0 0 0-.954-.124h-.278l-.119-.178-.119-.175.002-.474c.004-.669.066-1.19.214-1.772.157-.623.434-1.185.68-1.382.078-.062.09-.063.159-.012z', label: 'Ollama (local, no key)', kind: 'openai',   model: 'llama3.1', base: 'http://localhost:11434/v1', baseEditable: true, keyOptional: true },
    opencode:   { name: 'OpenCode (local)', color: '#000000', evenodd: true, icon: 'M16 6H8v12h8V6zm4 16H4V2h16v20z', label: 'OpenCode (local)', kind: 'opencode', model: '', base: 'http://127.0.0.1:49374', baseEditable: true, localOnly: true },
    custom:     { name: 'Other API (OpenAI)', mark: '⚙', badge: 'bg-slate-500', label: 'Other OpenAI-compatible API', kind: 'openai', model: '', base: '', baseEditable: true, keyOptional: true }
};

// Name/label of a provider in the current language (falls back to the English text in PROVIDERS).
function provText(id, field) {
    return lookup(`prov.${id}.${field}`) ?? PROVIDERS[id][field];
}

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
        if (PROVIDERS[meta.provider] && !providerDisabled(meta.provider)) llm.provider = meta.provider;
        llm.remember = !!meta.remember;
        llm.models = meta.models || {};
        llm.bases = meta.bases || {};
    } catch (e) { /* corrupt settings: ignored */ }
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

// Cleans a pasted base URL: trims, drops a trailing slash and a pasted endpoint path
// ("https://x/v1/chat/completions" or ".../models" -> "https://x/v1").
function normalizeBase(raw) {
    return (raw || '').trim().replace(/\/+$/, '').replace(/\/(chat\/completions|models)$/i, '').replace(/\/+$/, '');
}

// Providers that talk to a configurable server: OpenAI-compatible APIs and the local OpenCode service.
function usesBase(p) { return p.kind === 'openai' || p.kind === 'opencode'; }

// Base URL actually used for a provider: fixed for the official APIs, editable for Ollama / "Other API".
function providerBase(id) {
    const p = PROVIDERS[id];
    return normalizeBase(p.baseEditable ? (llm.bases[id] ?? p.base ?? '') : (p.base ?? ''));
}

const LOOPBACK_HOST = /^(localhost|127(\.\d+){3}|\[::1\])$/i;
const LAN_HOST = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)|\.local$/i;

// True when the page comes from a real site (GitHub Pages, a domain...) and not from this computer or from disk.
function isHosted() {
    const { protocol, hostname } = window.location;
    return (protocol === 'http:' || protocol === 'https:') && !LOOPBACK_HOST.test(hostname);
}

// OpenCode only accepts pages served from localhost:PORT, so a hosted copy of the app can never use it.
function providerDisabled(id) { return !!PROVIDERS[id].localOnly && isHosted(); }

// A request in no-cors mode succeeds (opaque) whenever something answers, even if CORS forbids reading the reply:
// it tells "server not running" apart from "server running but it rejects this page's origin".
async function serverAnswers(base) {
    try {
        await fetch(`${new URL(base).origin}/`, { mode: 'no-cors' });
        return true;
    } catch (e) { return false; }
}

// Returns the i18n key of the problem with a base URL, or null if it looks fine.
function baseProblem(base) {
    if (!base) return null;
    let url;
    try { url = new URL(base); } catch (e) { return 'base.badScheme'; }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return 'base.badScheme';
    if (url.protocol === 'http:' && !LOOPBACK_HOST.test(url.hostname)) {
        if (window.location.protocol === 'https:') return 'base.mixed';   // the browser blocks it
        if (!LAN_HOST.test(url.hostname)) return 'base.insecure';          // the key would travel in plain text
    }
    return null;
}

function currentCfg() {
    const p = PROVIDERS[llm.provider];
    return {
        ...p,
        id: llm.provider,
        model: (llm.models[llm.provider] ?? p.model ?? '').trim(),
        base: providerBase(llm.provider),
        key: (llm.keys[llm.provider] || '').trim()
    };
}

function isConfigured() {
    const c = currentCfg();
    if (!c.model) return false;
    if (usesBase(c) && !c.base) return false;
    return c.keyOptional || !!c.key;
}

function searchAvailable() { return !!PROVIDERS[llm.provider].search; }

function updateProviderUI() {
    const c = currentCfg();
    const ok = isConfigured();
    document.getElementById('apiStatusDot').className = `w-2 h-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-500'}`;
    document.getElementById('apiStatusText').textContent = ok
        ? `${provText(c.id, 'label').split(' (')[0]} · ${c.model}`
        : t('api.setup');
    document.getElementById('searchStatusText').textContent = t(searchAvailable() ? 'search.on' : 'search.off');
}

// ---- Settings modal ----
let modalProvider = null;

function stashModalFields() {
    if (!modalProvider) return;
    llm.keys[modalProvider] = document.getElementById('cfgKey').value.trim();
    llm.models[modalProvider] = document.getElementById('cfgModel').value.trim();
    if (PROVIDERS[modalProvider].baseEditable) llm.bases[modalProvider] = normalizeBase(document.getElementById('cfgBase').value);
}

// OpenCode has no API key: the field takes a pairing code, which is exchanged for a token.
function renderKeyLabel() {
    const p = modalProvider && PROVIDERS[modalProvider];
    document.getElementById('cfgKeyLabelText').textContent = t(p?.kind === 'opencode' ? 'settings.pairingCode' : 'settings.key');
}

function renderKeyToggleLabel() {
    const hidden = document.getElementById('cfgKey').type === 'password';
    document.getElementById('cfgKeyToggle').textContent = t(hidden ? 'settings.show' : 'settings.hide');
}

function fillModalFields() {
    const p = PROVIDERS[modalProvider];
    document.getElementById('cfgKey').value = llm.keys[modalProvider] || '';
    document.getElementById('cfgModel').value = llm.models[modalProvider] ?? p.model ?? '';
    document.getElementById('cfgBase').value = llm.bases[modalProvider] ?? p.base ?? '';
    document.getElementById('cfgBaseWrap').classList.toggle('hidden', !p.baseEditable);
    renderBaseWarning();
    document.getElementById('cfgKeyHint').textContent = t(`hint.${modalProvider}`);
    renderKeyLabel();
    loadModels();
}

// Warning under the base URL field (bad scheme, http from an https page, key over plain http)
function renderBaseWarning() {
    const el = document.getElementById('cfgBaseWarning');
    const p = modalProvider && PROVIDERS[modalProvider];
    const problem = p?.baseEditable ? baseProblem(normalizeBase(document.getElementById('cfgBase').value)) : null;
    el.textContent = problem ? t(problem) : '';
    el.classList.toggle('hidden', !problem);
}

// The base URL field was edited: clean it up, re-check it and list the models again.
function onBaseChange() {
    const input = document.getElementById('cfgBase');
    input.value = normalizeBase(input.value);
    renderBaseWarning();
    loadModels();
}

// ---- List of available models for the key ----
let modelsReqId = 0;
let modelsTimer = null;
let modelsStatus = null; // { key, vars } of the text shown under the model field, so it can be re-translated
const NON_CHAT_MODEL = /embed|whisper|tts|dall-e|moderation|transcribe|realtime|image|audio|rerank/i;
const MODELS_WARN = ['models.failed', 'models.localDown', 'models.localDownFile', 'models.localOrigin', 'models.empty', 'models.badBase',
    'models.opencodeDown', 'models.opencodeBadCode'];
const MIN_KEY_LENGTH = 8; // while typing/pasting, shorter text is not sent to the provider

// Whether listing models needs a key (local servers and providers with a public catalog do not).
function modelsNeedKey(p) { return !p.keyOptional && !p.modelsPublic; }

function setModelsStatus(key, vars) {
    modelsStatus = key ? { key, vars } : null;
    renderModelsStatus();
}

function renderModelsStatus() {
    const status = document.getElementById('cfgModelStatus');
    const sel = document.getElementById('cfgModelSelect');
    const key = modelsStatus?.key;
    status.textContent = key ? t(key, modelsStatus.vars) : '';
    status.className = 'text-[11px] ' + (MODELS_WARN.includes(key) ? 'text-amber-700'
        : key === 'models.available' ? 'text-emerald-700' : 'text-slate-500');
    if (key === 'models.available' && sel.options.length) {
        sel.options[0].text = t('models.pick', modelsStatus.vars);
        sel.options[sel.options.length - 1].text = t('models.other');
    }
}

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

// Free OpenCode models cost nothing per token
function isFreeOpenCodeModel(m) {
    return m.providerID === 'opencode' && Array.isArray(m.cost) && m.cost.length > 0 && m.cost.every(c => c.input === 0 && c.output === 0);
}

function parseModels(p, data) {
    let list;
    if (p.kind === 'opencode') {
        // Ids are "provider/model" (as `opencode models` prints them); free models go first
        list = (data?.data || [])
            .filter(m => m.enabled !== false && (m.capabilities?.output || ['text']).includes('text'))
            .map(m => ({ id: `${m.providerID}/${m.id}`, label: m.name || m.id, free: isFreeOpenCodeModel(m) }));
        list.forEach(m => { if (m.free) m.label += ` · ${t('models.free')}`; });
        return list.sort((a, b) => (b.free - a.free) || a.id.localeCompare(b.id));
    }
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

// Called while typing/pasting the key: waits for a pause and then lists the models by itself.
// (The base URL is not listed while typing: the key could be sent to a half-typed host. It uses `change`.)
function scheduleLoadModels() {
    clearTimeout(modelsTimer);
    modelsTimer = setTimeout(() => loadModels({ auto: true }), 600);
}

// One control at a time: the dropdown when the models are listed (its last option, "Other", reveals
// the text field), or just the text field when there is no list.
const CUSTOM_MODEL = '__custom__';

function updateModelFields() {
    const sel = document.getElementById('cfgModelSelect');
    const hasList = !sel.classList.contains('hidden');
    document.getElementById('cfgModel').classList.toggle('hidden', hasList && sel.value !== CUSTOM_MODEL);
}

function onModelSelectChange() {
    const sel = document.getElementById('cfgModelSelect');
    const input = document.getElementById('cfgModel');
    if (sel.value === CUSTOM_MODEL) {
        updateModelFields();
        input.focus();
    } else if (sel.value) {
        input.value = sel.value;
        updateModelFields();
    }
}

// fetch that marks connection failures (as opposed to HTTP errors) so callers can give a specific message
async function fetchNet(url, options) {
    try {
        return await fetch(url, options);
    } catch (netErr) {
        netErr.network = true;
        throw netErr;
    }
}

// "401 Incorrect API key" style error from a failed HTTP response
async function httpError(res) {
    const raw = await res.text().catch(() => '');
    let detail = raw;
    try { const j = JSON.parse(raw); detail = j.error?.message || j.message || raw; } catch (e) { /* plain text */ }
    return new Error(`${res.status} ${String(detail).slice(0, 150)}`);
}

// OpenCode: the key field holds a token, or a one-time pairing code. It is tried as a token first; if the
// service answers 401 it is redeemed as a pairing code (GET /auth/connect/<code> -> { token }) and retried.
async function fetchOpenCodeModels(key, base) {
    const list = (token) => fetchNet(`${base}/api/model`, { headers: { Authorization: openCodeAuth(token) } });
    let res = await list(key);
    let token = null;
    if (res.status === 401) {
        const redeemed = await fetchNet(`${base}/auth/connect/${encodeURIComponent(key)}`, { headers: { Accept: 'application/json' } });
        const body = redeemed.ok ? await redeemed.json().catch(() => null) : null;
        if (!body?.token) {
            const err = new Error('pairing code rejected');
            err.opencodeBadCode = true;
            throw err;
        }
        token = body.token;
        res = await list(token);
    }
    if (!res.ok) throw await httpError(res);
    return { data: await res.json(), token };
}

// A pairing code works once: from then on the token takes its place (stored like any other key).
function adoptOpenCodeToken(token) {
    llm.keys.opencode = token;
    persistSettings();
    if (modalProvider === 'opencode') document.getElementById('cfgKey').value = token;
}

async function loadModels({ auto = false } = {}) {
    clearTimeout(modelsTimer);
    if (!modalProvider) return;
    const p = PROVIDERS[modalProvider];
    const key = document.getElementById('cfgKey').value.trim();
    const base = p.baseEditable ? normalizeBase(document.getElementById('cfgBase').value) : (p.base ?? '');
    const sel = document.getElementById('cfgModelSelect');
    const modelInput = document.getElementById('cfgModel');
    const reqId = ++modelsReqId;
    sel.classList.add('hidden');
    updateModelFields();

    if ((modelsNeedKey(p) && !key) || (usesBase(p) && !base)) {
        setModelsStatus(usesBase(p) && !base && (key || !modelsNeedKey(p)) ? 'models.enterBase'
            : p.kind === 'opencode' ? 'models.enterCode' : 'models.enterKey');
        return;
    }
    if (usesBase(p) && baseProblem(base) === 'base.badScheme') {
        setModelsStatus('models.badBase');
        return;
    }
    // Half-typed key: wait for more input instead of sending it to the provider
    if (auto && key && key.length < MIN_KEY_LENGTH) {
        setModelsStatus(null);
        return;
    }
    setModelsStatus('models.loading');
    try {
        let data;
        if (p.kind === 'opencode') {
            const result = await fetchOpenCodeModels(key, base);
            data = result.data;
            if (result.token) adoptOpenCodeToken(result.token);
        } else {
            const req = modelsRequest(p, key, base);
            const res = await fetchNet(req.url, { headers: req.headers });
            if (!res.ok) throw await httpError(res);
            data = await res.json();
        }
        const models = parseModels(p, data);
        if (reqId !== modelsReqId) return; // the user changed provider/key in the meantime
        if (!models.length) { setModelsStatus('models.empty'); return; }
        let current = modelInput.value.trim();
        // Local servers only list what is installed: if the default model is not there, pick one that is
        if ((p.keyOptional || p.kind === 'opencode') && !models.some(m => m.id === current) && (!current || current === (p.model || ''))) {
            current = models[0].id;
            modelInput.value = current;
        }
        sel.innerHTML = '';
        const placeholder = new Option(t('models.pick', { n: models.length }), '');
        placeholder.disabled = true;
        sel.add(placeholder);
        models.forEach(m => sel.add(new Option(m.label && m.label !== m.id ? `${m.id} — ${m.label}` : m.id, m.id)));
        sel.add(new Option(t('models.other'), CUSTOM_MODEL));
        // A listed model is selected; anything else (a name typed by hand) shows the text field
        sel.value = models.some(m => m.id === current) ? current : (current ? CUSTOM_MODEL : '');
        sel.classList.remove('hidden');
        updateModelFields();
        setModelsStatus('models.available', { n: models.length });
    } catch (e) {
        if (reqId !== modelsReqId) return;
        if (e.opencodeBadCode) setModelsStatus('models.opencodeBadCode');
        else if (e.network && p.kind === 'opencode') setModelsStatus('models.opencodeDown', { base });
        // Opened from disk (file://) the browser sends `Origin: null`, which Ollama rejects: say so explicitly
        else if (e.network && p.keyOptional) {
            if (window.location.protocol === 'file:') setModelsStatus('models.localDownFile', { base });
            // Ollama answers but rejects this page: it needs OLLAMA_ORIGINS, and the message says exactly what to set
            else if (modalProvider === 'ollama' && await serverAnswers(base)) {
                if (reqId !== modelsReqId) return;
                setModelsStatus('models.localOrigin', { base, origin: window.location.origin });
            } else setModelsStatus('models.localDown', { base });
        }
        else setModelsStatus('models.failed', { error: e.message || t('models.netError') });
    }
}

function openSettings(message) {
    modalProvider = llm.provider;
    renderProviderGrid();
    document.getElementById('cfgRemember').checked = llm.remember;
    document.getElementById('cfgKey').type = 'password';
    renderKeyToggleLabel();
    fillModalFields();
    const err = document.getElementById('settingsError');
    err.textContent = message || '';
    err.classList.toggle('hidden', !message);
    document.getElementById('settingsModal').classList.remove('hidden');
    document.getElementById(modelsNeedKey(PROVIDERS[modalProvider]) ? 'cfgKey' : 'cfgModel').focus();
}

function closeSettings() {
    clearTimeout(modelsTimer);
    document.getElementById('settingsModal').classList.add('hidden');
    modalProvider = null;
}

function renderProviderGrid() {
    const grid = document.getElementById('cfgProviderGrid');
    grid.innerHTML = '';
    Object.entries(PROVIDERS).forEach(([id, p]) => {
        const on = id === modalProvider;
        const off = providerDisabled(id);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', String(on));
        btn.className = 'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-sm font-medium transition-colors ' +
            (off ? 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed'
                : on ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50');
        if (off) {
            btn.disabled = true;
            btn.title = t('provider.localOnlyTitle');
        }
        const mark = document.createElement('span');
        if (p.icon) {
            // Brand logo (monochrome SVG from simple-icons / LobeHub Icons) in the brand color
            mark.className = 'shrink-0 w-8 h-8 rounded-lg grid place-items-center bg-white border border-slate-200';
            const NS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(NS, 'svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('class', 'w-5 h-5');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('fill', p.color);
            if (p.evenodd) svg.setAttribute('fill-rule', 'evenodd'); // some logos (LobeHub) rely on even-odd fill
            const path = document.createElementNS(NS, 'path');
            path.setAttribute('d', p.icon);
            svg.appendChild(path);
            mark.appendChild(svg);
        } else {
            mark.className = `shrink-0 w-8 h-8 rounded-lg grid place-items-center text-sm font-bold text-white ${p.badge}`;
            mark.textContent = p.mark;
        }
        if (off) mark.classList.add('grayscale', 'opacity-50');
        const name = document.createElement('span');
        name.className = 'truncate';
        name.textContent = provText(id, 'name');
        btn.append(mark, name);
        if (off) {
            // "(local version only)" under the name, so it is clear why the option cannot be picked
            const note = document.createElement('span');
            note.className = 'block text-[11px] font-normal';
            note.textContent = `(${t('provider.localOnly')})`;
            name.className = 'min-w-0';
            name.replaceChildren(provText(id, 'name'), note);
        }
        btn.onclick = () => onProviderChange(id);
        grid.appendChild(btn);
    });
    document.getElementById('cfgHostedNote').classList.toggle('hidden', !isHosted());
}

function onProviderChange(id) {
    if (id === modalProvider || providerDisabled(id)) return;
    stashModalFields();
    modalProvider = id;
    renderProviderGrid();
    fillModalFields();
}

function toggleKeyVisibility() {
    const input = document.getElementById('cfgKey');
    input.type = input.type === 'password' ? 'text' : 'password';
    renderKeyToggleLabel();
}

function saveSettingsFromModal() {
    stashModalFields();
    llm.provider = modalProvider;
    llm.remember = document.getElementById('cfgRemember').checked;
    persistSettings();
    updateProviderUI();
    closeSettings();
    showToast(t(isConfigured() ? 'settings.saved' : 'settings.incomplete'), isConfigured() ? '✓' : '⚠️');
}

function forgetKeys() {
    llm.keys = {};
    persistSettings();
    if (modalProvider) document.getElementById('cfgKey').value = '';
    updateProviderUI();
    showToast(t('settings.keysDeleted'));
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('settingsModal').classList.contains('hidden')) closeSettings();
});

// ---- On-demand loading of heavy libraries (with SRI) ----
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
            el.onerror = () => { delete lazyCache[key]; reject(new Error(t('lib.loadFail', { name: key }))); };
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
    await loadScript(LAZY_LIBS.katexAuto); // auto-render requires katex to be loaded first
}

// Configure Marked.js
if (window.marked) {
    marked.setOptions({
        breaks: true,
        gfm: true
    });
}

// Security for model-generated HTML: links open in a new tab without referrer
if (window.DOMPurify) {
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        if (node.tagName === 'A' && node.hasAttribute('href')) {
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

// Main state
const appState = {
    activeTab: 'title',          // 'title' | 'text' | 'file'
    level: 'university',         // 'simple' | 'university' | 'researcher'
    focus: 'full',               // 'full' | 'tldr' | 'glossary' | 'critique'
    uploadedFile: null,          // { name, type, pages, text, wordCount }
    isAnalyzing: false,
    isChatting: false,
    sessions: [],                // Papers analyzed in this session
    activeSessionId: null        // ID of the paper shown on screen
};

// Level / focus identifiers are language-neutral; their labels come from the dictionary.
const LEVEL_ICONS = { simple: '🌱', university: '🎓', researcher: '🔬' };
const FOCUS_ICONS = { full: '📑', tldr: '⚡', glossary: '📖', critique: '⚖️' };

function levelLabel(level) {
    return { icon: LEVEL_ICONS[level], name: t(`lvl.${level}.name`), short: t(`lvl.${level}.short`) };
}

function focusLabel(focus) {
    return { icon: FOCUS_ICONS[focus], name: t(`fcs.${focus}.name`), short: t(`fcs.${focus}.short`) };
}

function activeSession() {
    return appState.sessions.find(s => s.id === appState.activeSessionId);
}

// =========================================================================
// 2. INITIALIZATION AND EVENT LISTENERS
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    updateProviderUI();
    setupEventListeners();
    updateSessionBadge();
});

// Called by i18n.js after the language changes: refreshes everything rendered from JavaScript.
function onLanguageChanged() {
    updateProviderUI();
    updateSessionBadge();
    updateTextCounter();
    renderUploadedFileMeta();
    if (!appState.isAnalyzing) document.getElementById('analyzeBtnText').textContent = t('btn.analyze');
    renderHistoryList();
    const session = activeSession();
    if (session) {
        renderResultMeta(session);
        renderChatMessages(session);
    }
    if (modalProvider) {
        renderProviderGrid();
        document.getElementById('cfgKeyHint').textContent = t(`hint.${modalProvider}`);
        renderKeyToggleLabel();
        renderModelsStatus();
        renderBaseWarning();
        renderKeyLabel();
    }
}

function setupEventListeners() {
    // Mobile history button
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => toggleMobileSidebar(true));
    }

    // Title input: clear button and Enter key
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

    // Textarea: word counter and Ctrl+Enter
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

    // Drag & drop zone for PDF / TXT files
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
// 3. TABS, LEVELS, FOCUSES AND EXAMPLES
// =========================================================================
function switchInputTab(tabName) {
    appState.activeTab = tabName;
    hideValidation();

    const tabs = ['title', 'text', 'file'];
    tabs.forEach(tab => {
        const btn = document.getElementById(`tab-${tab}`);
        const panel = document.getElementById(`panel-${tab}`);
        const isActive = tab === tabName;

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

// One-click examples: the query comes from the dictionary ('ex.<key>.query') in the current language.
function loadExample(exampleKey) {
    const query = lookup(`ex.${exampleKey}.query`);
    if (!query || appState.isAnalyzing) return;

    switchInputTab('title');
    const titleInput = document.getElementById('paperTitleInput');
    titleInput.value = query;
    document.getElementById('clearTitleInputBtn').classList.remove('hidden');

    // Analyze right away for a smooth one-click experience
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
        t('counter', { words: formatNumber(words), chars: formatNumber(chars) });
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
// 4. PDF AND TXT EXTRACTION IN THE BROWSER
// =========================================================================
async function handleFileSelection(file) {
    hideValidation();
    const fileName = file.name;
    const lowerName = fileName.toLowerCase();

    if (!lowerName.endsWith('.pdf') && !lowerName.endsWith('.txt')) {
        showValidation(t('file.badFormat'));
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
            statusText.textContent = t('file.readingTxt');
            extractedText = (await file.text()).trim(); // a trailing newline must not count as a word
        } else if (lowerName.endsWith('.pdf')) {
            fileType = 'PDF';
            statusText.textContent = t('file.loadingPdf');
            await ensurePdfJs();
            statusText.textContent = t('file.processingPdf');
            const arrayBuffer = await file.arrayBuffer();
            // isEvalSupported:false mitigates CVE-2024-4367 (a malicious PDF could run JS in PDF.js < 4.2)
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer, isEvalSupported: false }).promise;
            pageCount = pdf.numPages;

            const maxPagesToRead = Math.min(pageCount, 45); // Reasonable limit for good performance
            const pageTexts = [];

            for (let i = 1; i <= maxPagesToRead; i++) {
                statusText.textContent = t('file.extractingPage', { i, n: maxPagesToRead });
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageStr = textContent.items.map(item => item.str).join(' ');
                pageTexts.push(pageStr);
            }

            extractedText = pageTexts.join('\n\n').replace(/\s+/g, ' ').trim();
        }

        if (!extractedText || extractedText.length < 40) {
            throw new Error(t('file.noText'));
        }

        const wordCount = extractedText.split(/\s+/).length;
        appState.uploadedFile = {
            name: fileName,
            type: fileType,
            pages: pageCount,
            text: extractedText,
            wordCount: wordCount
        };

        // Update the uploaded file card
        document.getElementById('fileTypeBadge').textContent = fileType;
        document.getElementById('uploadedFileName').textContent = fileName;
        renderUploadedFileMeta();
        document.getElementById('uploadedFilePreview').textContent =
            `"${extractedText.slice(0, 220)}..."`;

        document.getElementById('uploadedFileCard').classList.remove('hidden');
        showToast(t('file.ready', { name: fileName }));

    } catch (error) {
        appState.uploadedFile = null;
        document.getElementById('uploadedFileCard').classList.add('hidden');
        showValidation(error.message || t('file.readError'));
    } finally {
        parsingView.classList.add('hidden');
        defaultView.classList.remove('hidden');
        document.getElementById('fileInput').value = '';
    }
}

// "N pages · M words extracted" line of the uploaded file card (re-rendered when the language changes)
function renderUploadedFileMeta() {
    const f = appState.uploadedFile;
    if (!f) return;
    const words = formatNumber(f.wordCount);
    document.getElementById('uploadedFileMeta').textContent =
        f.type === 'PDF'
            ? t(f.pages === 1 ? 'file.metaPdfOne' : 'file.metaPdfMany', { pages: f.pages, words })
            : t('file.metaTxt', { words });
}

function removeUploadedFile() {
    appState.uploadedFile = null;
    document.getElementById('uploadedFileCard').classList.add('hidden');
    document.getElementById('fileInput').value = '';
}

// =========================================================================
// 5. AI PROVIDER INTEGRATION (ANALYSIS AND CONTEXTUAL CHAT)
// =========================================================================
// Abstraction layer: callLLM({ system, messages:[{role:'user'|'model', text}], search })
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
                throw new Error(t('err.connect'));
            }
            await new Promise(r => setTimeout(r, delay)); delay *= 2;
            continue;
        }

        if (response.ok) return response.json();

        // Only retry on rate limits or server errors; 400/401/403/404 are final.
        const retryable = response.status === 429 || response.status >= 500;
        if (retryable && attempt < maxRetries) {
            await new Promise(r => setTimeout(r, delay)); delay *= 2;
            continue;
        }
        const raw = await response.text().catch(() => '');
        let detail = raw;
        try { const j = JSON.parse(raw); detail = j.error?.message || j.message || raw; } catch (e) { /* plain text */ }
        if (response.status === 401 || response.status === 403) detail = `${t('err.badKey')} ${detail}`;
        throw new Error(t('err.api', { status: response.status, detail: String(detail).slice(0, 300) }));
    }
}

// ---- OpenCode (local service) ----
// Talks to the user's own OpenCode through its HTTP API: one session per model, and `generate` for plain text.
// The sessions are created WITHOUT a `permissions` list: with `deny *` the service answers every request with a
// "free usage limit" error. `generate` does not run the agent loop, so no tools are used anyway.
const OPENCODE_SESSIONS = 'paperclaro.opencode.sessions.v1';

// The token travels as the password of HTTP Basic auth (user "opencode"); Bearer is rejected.
function openCodeAuth(token) {
    const bytes = new TextEncoder().encode(`opencode:${token}`);
    return 'Basic ' + btoa(String.fromCharCode(...bytes));
}

// "opencode/big-pickle" -> { providerID: 'opencode', id: 'big-pickle' } (the id itself may contain "/")
function splitOpenCodeModel(model) {
    const i = model.indexOf('/');
    return i > 0 ? { providerID: model.slice(0, i), id: model.slice(i + 1) } : { providerID: 'opencode', id: model };
}

function readOpenCodeSessions() {
    try { return JSON.parse(safeStorage('sessionStorage')?.getItem(OPENCODE_SESSIONS) || '{}'); } catch (e) { return {}; }
}

function writeOpenCodeSessions(map) {
    safeStorage('sessionStorage')?.setItem(OPENCODE_SESSIONS, JSON.stringify(map));
}

async function openCodeFetch(cfg, path, init) {
    const headers = { 'Content-Type': 'application/json', 'Authorization': openCodeAuth(cfg.key) };
    try {
        return await fetch(`${cfg.base}${path}`, { ...init, headers });
    } catch (netErr) {
        // Only connection failures end up here: any other bug must not be reported as "service not running"
        throw new Error(t('err.opencodeDown', { base: cfg.base }));
    }
}

async function openCodeError(res) {
    if (res.status === 401) return new Error(t('err.opencodeAuth'));
    const raw = await res.text().catch(() => '');
    let detail = raw;
    try { const j = JSON.parse(raw); detail = j.message || j.error?.message || raw; } catch (e) { /* plain text */ }
    return new Error(t('err.api', { status: res.status, detail: String(detail).slice(0, 300) }));
}

async function createOpenCodeSession(cfg) {
    const res = await openCodeFetch(cfg, '/api/session', {
        method: 'POST',
        body: JSON.stringify({ title: 'PaperClaro AI', model: splitOpenCodeModel(cfg.model) })
    });
    if (!res.ok) throw await openCodeError(res);
    const id = (await res.json())?.data?.id;
    if (!id) throw new Error(t('err.noContent'));
    return id;
}

// `generate` takes a single prompt and keeps no history, so the whole conversation is sent every time.
function flattenConversation(system, messages) {
    if (messages.length === 1) return `${system}\n\n${messages[0].text}`;
    const turns = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n\n');
    return `${system}\n\nConversation so far:\n\n${turns}\n\nReply to the last User message as the Assistant.`;
}

async function callOpenCode(cfg, system, messages) {
    const prompt = flattenConversation(system, messages);
    const cacheKey = `${cfg.base}|${cfg.model}`;
    for (let attempt = 0; attempt < 2; attempt++) {
        const sessions = readOpenCodeSessions();
        // First try the session of this page; if the service forgot it (restart, deleted) make a new one
        let sessionId = attempt === 0 ? sessions[cacheKey] : null;
        if (!sessionId) {
            sessionId = await createOpenCodeSession(cfg);
            sessions[cacheKey] = sessionId;
            writeOpenCodeSessions(sessions);
        }
        const res = await openCodeFetch(cfg, `/api/session/${encodeURIComponent(sessionId)}/generate`, {
            method: 'POST',
            body: JSON.stringify({ prompt })
        });
        if (res.status === 404 && attempt === 0) continue;
        if (!res.ok) throw await openCodeError(res);
        const data = await res.json();
        return { text: data?.data?.text || '', sources: [] };
    }
    throw new Error(t('err.noContent'));
}

async function callLLM({ system, messages, search = false }) {
    const cfg = currentCfg();
    if (cfg.kind === 'opencode') return callOpenCode(cfg, system, messages);
    const req = buildRequest(cfg, system, messages, search && cfg.search);
    const data = await fetchWithRetry(req);
    return parseResponse(cfg, data);
}

// The prompts live in the dictionary: the UI language is also the language of the generated explanation.
function buildSystemInstruction(level, focus) {
    return t('prompt.system', {
        level: t(`prompt.level.${level}`),
        focus: t(`prompt.focus.${focus}`)
    });
}

function sourceLabel(session) {
    switch (session.sourceKind) {
        case 'search': return t('src.search');
        case 'model': return t('src.model');
        case 'text': return t('src.text');
        case 'pdf': return t('src.pdf', { pages: session.sourcePages });
        default: return t('src.txt');
    }
}

async function analyzePaper(overrideLevel = null, overrideFocus = null) {
    if (appState.isAnalyzing) return;

    if (overrideLevel) selectLevel(overrideLevel);
    if (overrideFocus) selectFocus(overrideFocus);

    hideValidation();

    // Determine the input from the active tab, or from the current session when regenerating
    let mode = appState.activeTab;
    let rawContent = '';
    let sourceKind = '';
    let sourcePages = null;
    let displayQueryTitle = '';

    if (overrideLevel || overrideFocus) {
        // Re-analyzing the currently active paper with new settings
        const currentSession = activeSession();
        if (currentSession) {
            mode = currentSession.mode;
            rawContent = currentSession.rawContent;
            sourceKind = currentSession.sourceKind;
            sourcePages = currentSession.sourcePages;
            displayQueryTitle = currentSession.displayQueryTitle;
        }
    }

    if (!rawContent) {
        if (mode === 'title') {
            const query = document.getElementById('paperTitleInput').value.trim();
            if (!query) {
                showValidation(t('val.title'));
                document.getElementById('paperTitleInput').focus();
                return;
            }
            rawContent = query;
            displayQueryTitle = query;
            sourceKind = searchAvailable() ? 'search' : 'model';
        } else if (mode === 'text') {
            const text = document.getElementById('paperTextInput').value.trim();
            if (!text || text.length < 30) {
                showValidation(t('val.text'));
                document.getElementById('paperTextInput').focus();
                return;
            }
            rawContent = text;
            displayQueryTitle = text.slice(0, 75) + (text.length > 75 ? '...' : '');
            sourceKind = 'text';
        } else if (mode === 'file') {
            if (!appState.uploadedFile || !appState.uploadedFile.text) {
                showValidation(t('val.file'));
                return;
            }
            rawContent = appState.uploadedFile.text;
            displayQueryTitle = appState.uploadedFile.name;
            sourceKind = appState.uploadedFile.type === 'PDF' ? 'pdf' : 'txt';
            sourcePages = appState.uploadedFile.pages;
        }
    }

    // Cap the length of the text sent, for stability (up to ~85,000 characters)
    const truncatedContent = rawContent.length > 85000
        ? rawContent.slice(0, 85000) + '\n\n' + t('truncated')
        : rawContent;

    if (!isConfigured()) {
        openSettings(t('settings.needConfig'));
        return;
    }

    const userPrompt = mode === 'title'
        ? t('prompt.userTitle', { query: truncatedContent })
        : t('prompt.userDoc', { text: truncatedContent });

    setLoadingState(true);

    try {
        // Web search (grounding) is only available with Gemini and when searching by title or topic
        const { text: generatedMarkdown, sources } = await callLLM({
            system: buildSystemInstruction(appState.level, appState.focus),
            messages: [{ role: 'user', text: userPrompt }],
            search: mode === 'title'
        });

        if (!generatedMarkdown) {
            throw new Error(t('err.noContent'));
        }

        // Clean title from the first generated H1 heading
        const extractedTitle = extractTitleFromMarkdown(generatedMarkdown, displayQueryTitle);

        // New entry in the session history
        const newSession = {
            id: 'paper_' + Date.now(),
            title: extractedTitle,
            displayQueryTitle: displayQueryTitle,
            mode: mode,
            rawContent: truncatedContent,
            sourceKind: sourceKind,
            sourcePages: sourcePages,
            level: appState.level,
            focus: appState.focus,
            markdown: generatedMarkdown,
            sources: sources,
            chatMessages: [], // Follow-up question history
            time: Date.now()
        };

        appState.sessions.unshift(newSession);
        appState.activeSessionId = newSession.id;

        renderHistoryList();
        renderActiveSession();
        showToast(t('toast.generated'));

    } catch (error) {
        showValidation(t('err.analysis', { error: error.message || t('err.analysisFallback') }));
    } finally {
        setLoadingState(false);
    }
}

// Quick level or focus change from the results header
function quickReanalyzeLevel(newLevel) {
    if (appState.isAnalyzing) return;
    analyzePaper(newLevel, null);
}

function quickReanalyzeFocus(newFocus) {
    if (appState.isAnalyzing) return;
    analyzePaper(null, newFocus);
}

// =========================================================================
// 6. RESULT RENDERING, MARKDOWN AND MATH FORMULAS (KATEX)
// =========================================================================
function extractTitleFromMarkdown(md, fallback) {
    const h1Match = md.match(/^#\s+(.+)$/m);
    if (h1Match && h1Match[1]) {
        return h1Match[1].replace(/[*_`]/g, '').trim();
    }
    return fallback;
}

function renderMarkdownWithMath(containerEl, markdownText) {
    // Protect LaTeX blocks $$...$$ and $...$ so marked.js does not alter underscores or asterisks
    const mathBlocks = [];
    let protectedText = markdownText.replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
        const idx = mathBlocks.push(match) - 1;
        return `@@MATHBLOCK_${idx}@@`;
    });

    protectedText = protectedText.replace(/\$([^\n$]+?)\$/g, (match) => {
        const idx = mathBlocks.push(match) - 1;
        return `@@MATHINLINE_${idx}@@`;
    });

    // Parse Markdown and sanitize the HTML
    const rawHtml = window.marked ? marked.parse(protectedText) : protectedText;
    // Without DOMPurify no HTML is rendered (unsanitized HTML is never inserted).
    // img/style/form are forbidden: a remote image would allow leaking paper text to third parties.
    let cleanHtml = window.DOMPurify
        ? DOMPurify.sanitize(rawHtml, { FORBID_TAGS: ['img', 'style', 'form', 'input', 'button', 'iframe'] })
        : escapeHtml(markdownText);

    // Restore math expressions
    cleanHtml = cleanHtml.replace(/@@MATH(BLOCK|INLINE)_(\d+)@@/g, (_, __, indexStr) => {
        // The HTML is escaped: the formula is restored AFTER DOMPurify and, unescaped, it would allow HTML injection.
        return escapeHtml(mathBlocks[parseInt(indexStr, 10)] || '');
    });

    containerEl.innerHTML = cleanHtml;

    // KaTeX (~300 KB) is only downloaded the first time there is a formula to render
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
            // Without KaTeX (offline or irregular syntax) the formula is shown as text
        });
    }
}

// Level / focus / source badges and the highlighted quick-switch buttons of the results card
function renderResultMeta(session) {
    const lvlInfo = levelLabel(session.level);
    const fcsInfo = focusLabel(session.focus);
    document.getElementById('resultLevelBadge').textContent = `${lvlInfo.icon} ${lvlInfo.name}`;
    document.getElementById('resultFocusBadge').textContent = `${fcsInfo.icon} ${fcsInfo.name}`;
    document.getElementById('resultSourceBadge').textContent = sourceLabel(session);

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
}

function renderActiveSession() {
    const session = activeSession();
    if (!session) return;

    const resultSection = document.getElementById('resultSectionCard');
    resultSection.classList.remove('hidden');

    renderResultMeta(session);

    // Render the Markdown + KaTeX explanation
    const outputEl = document.getElementById('explanationOutput');
    renderMarkdownWithMath(outputEl, session.markdown);

    // Render the bibliographic sources, if any
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

    // Render the follow-up chat messages
    renderChatMessages(session);

    // Smoothly scroll to the results
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =========================================================================
// 7. CONTEXTUAL FOLLOW-UP CHAT ("ASK THE PAPER")
// =========================================================================
// The suggested questions are numbered (1-4); their full text is 'chat.q<N>.full' in the dictionary.
function askSuggestedQuestion(n) {
    if (appState.isChatting) return;
    const questionText = t(`chat.q${n}.full`);
    document.getElementById('chatInput').value = questionText;
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
    const session = activeSession();
    if (!session || appState.isChatting) return;

    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    const typingIndicator = document.getElementById('chatTypingIndicator');

    // Add the user's question to this session's chat history
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
        // Build the multi-turn history keeping the whole paper context
        const baseContextPrompt = session.mode === 'title'
            ? t('prompt.chatCtxTitle', { title: session.title, query: session.rawContent })
            : t('prompt.chatCtxDoc', { title: session.title, text: session.rawContent });

        const messages = [
            { role: 'user', text: baseContextPrompt },
            { role: 'model', text: session.markdown },
            // Previous follow-up turns (the last one is the current question)
            ...session.chatMessages.map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', text: msg.text }))
        ];

        const systemInstruction = t('prompt.chatSystem', {
            title: session.title,
            level: levelLabel(session.level).name
        });

        const { text: replyText } = await callLLM({ system: systemInstruction, messages });

        if (!replyText) {
            throw new Error(t('err.noReply'));
        }

        session.chatMessages.push({
            role: 'model',
            text: replyText
        });

        renderChatMessages(session);

    } catch (error) {
        session.chatMessages.push({
            role: 'model',
            text: t('chat.error', { error: error.message || t('chat.errorFallback') })
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
            avatar.textContent = t('chat.avatar');

            wrapper.appendChild(avatar);
            wrapper.appendChild(bubble);
        }
        container.appendChild(wrapper);
    });

    container.scrollTop = container.scrollHeight;
}

// =========================================================================
// 8. SIDE HISTORY OF THE SESSION
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
        const lvl = levelLabel(session.level);
        const fcs = focusLabel(session.focus);
        const time = new Date(session.time).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });

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
                <span class="text-[10px] text-slate-400 shrink-0">${escapeHtml(time)}</span>
            </div>
            <div class="flex flex-wrap items-center gap-1.5 mt-2">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-indigo-100/80 text-indigo-800">
                    ${lvl.icon} ${escapeHtml(lvl.short)}
                </span>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-100/80 text-emerald-800">
                    ${fcs.icon} ${escapeHtml(fcs.short)}
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
        textEl.textContent = count === 1 ? t('count.one') : t('count.many', { n: count });
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
    showToast(t('toast.historyCleared'));
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
// 9. COPY TO CLIPBOARD, DOWNLOAD .MD AND UI UTILITIES
// =========================================================================
function copyExplanation() {
    const session = activeSession();
    if (!session) return;

    // Temporary textarea + document.execCommand('copy') for full compatibility inside iframes
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = session.markdown;
    tempTextArea.style.position = 'fixed';
    tempTextArea.style.left = '-9999px';
    document.body.appendChild(tempTextArea);
    tempTextArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast(t('toast.copied'));
        } else {
            showToast(t('toast.copyFail'), '⚠️');
        }
    } catch (err) {
        showToast(t('toast.copyFail'), '⚠️');
    } finally {
        document.body.removeChild(tempTextArea);
    }
}

function downloadMarkdown() {
    const session = activeSession();
    if (!session) return;

    const slug = session.title
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48) || t('slug.fallback');

    const fileHeader = t('md.header', {
        level: levelLabel(session.level).name,
        focus: focusLabel(session.focus).name
    }) + '\n\n';
    const blob = new Blob([fileHeader + session.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `PaperClaro_${slug}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(t('toast.downloaded'));
}

let loadingStepInterval = null;

// Texts are computed on every tick so they follow a language change made while loading.
function showLoadingStep(idx) {
    const n = idx + 1;
    document.getElementById('loadingStepTitle').textContent = t(`load.${n}.title`);
    document.getElementById('loadingStepSubtitle').textContent =
        t(`load.${n}.sub`, { level: levelLabel(appState.level).name });
}

function setLoadingState(isLoading) {
    appState.isAnalyzing = isLoading;
    const analyzeBtn = document.getElementById('analyzeBtn');
    const analyzeBtnText = document.getElementById('analyzeBtnText');
    const loadingCard = document.getElementById('loadingStateCard');
    const resultCard = document.getElementById('resultSectionCard');

    analyzeBtn.disabled = isLoading;

    if (isLoading) {
        analyzeBtnText.textContent = t('btn.analyzing');
        resultCard.classList.add('hidden');
        loadingCard.classList.remove('hidden');
        loadingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const STEP_COUNT = 4;
        let stepIdx = 0;
        showLoadingStep(stepIdx);

        loadingStepInterval = setInterval(() => {
            stepIdx = (stepIdx + 1) % STEP_COUNT;
            showLoadingStep(stepIdx);
        }, 2400);
    } else {
        analyzeBtnText.textContent = t('btn.analyze');
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
