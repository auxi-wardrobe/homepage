// Build-time machine translation (EN -> target lang) via Gemini, with a
// committed on-disk cache so only new/changed strings ever cost an API call and
// builds stay deterministic + cheap. If GOOGLE_STUDIO_KEY is unset, every call
// returns the source text unchanged (the build never hard-fails).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = join(__dirname, '..', 'i18n', 'vi-cache.json');
// Provider-aware: prefer OpenAI (the backend's funded prod key), fall back to
// Gemini (Google AI Studio). Override with TRANSLATE_PROVIDER / TRANSLATE_MODEL.
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const GEMINI_KEY = process.env.GOOGLE_STUDIO_KEY || '';
const PROVIDER = process.env.TRANSLATE_PROVIDER || (OPENAI_KEY ? 'openai' : GEMINI_KEY ? 'gemini' : '');
const MODEL = process.env.TRANSLATE_MODEL || (PROVIDER === 'gemini' ? 'gemini-2.0-flash' : 'gpt-4o-mini');

let cache = {};
let dirty = false;
try { cache = JSON.parse(readFileSync(CACHE_FILE, 'utf8')); } catch { cache = {}; }

const LANG_NAME = { vi: 'Vietnamese', fr: 'French' };

function keyFor(format, lang, text) {
  return createHash('sha1').update(`${lang}\n${format}\n${text}`).digest('hex');
}

function promptFor(format, langName, text) {
  const rules =
    `Context: this is content for Macgie, a personal-wardrobe & outfit app ` +
    `(fashion, styling, capsule wardrobes, getting dressed). Use natural fashion/lifestyle ` +
    `vocabulary — e.g. "capsule wardrobe" -> "tủ đồ capsule", "outfit" -> "trang phục", ` +
    `"wardrobe" -> "tủ đồ". Translate the following ` +
    `${format === 'markdown' ? 'Markdown' : 'website UI text'} from English to ${langName}. ` +
    `Return ONLY the translation — no quotes, no notes, no explanations. Keep the brand ` +
    `name "Macgie" / "macgie" unchanged. Do NOT translate code, URLs, HTML tags, or ` +
    `placeholders like {name}. ` +
    (format === 'markdown'
      ? 'Preserve every Markdown structure, link, image, and code block exactly.\n\n'
      : 'Keep it natural and concise.\n\n');
  return rules + text;
}

async function callOpenAI(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are a professional website localizer. Output only the translation, nothing else.' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const out = json?.choices?.[0]?.message?.content;
  if (!out) throw new Error('OpenAI: empty response');
  return out.trim();
}

async function callGemini(prompt) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const res = await fetch(`${endpoint}?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const out = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!out) throw new Error('Gemini: empty response');
  return out.trim();
}

const callProvider = (prompt) => (PROVIDER === 'gemini' ? callGemini(prompt) : callOpenAI(prompt));

/**
 * Translate one string. `format` is 'text' or 'markdown'.
 * Returns the source unchanged when there is no API key or on repeated failure
 * (a failed translation is NOT cached, so a later build retries it).
 */
const pending = new Map(); // in-flight dedup: identical strings requested concurrently share one call

export async function translate(text, { format = 'text', targetLang = 'vi' } = {}) {
  const src = typeof text === 'string' ? text : '';
  if (!src.trim()) return src;
  const k = keyFor(format, targetLang, src);
  if (cache[k] != null) return cache[k];
  if (!PROVIDER) return src;
  if (pending.has(k)) return pending.get(k);

  const prompt = promptFor(format, LANG_NAME[targetLang] || targetLang, src);
  const job = (async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const out = await callProvider(prompt);
        cache[k] = out;
        dirty = true;
        return out;
      } catch (err) {
        if (attempt === 1) {
          console.warn(`[translate] fallback to source (${targetLang}): ${String(err).slice(0, 120)}`);
          return src;
        }
      }
    }
    return src;
  })();
  pending.set(k, job);
  try {
    return await job;
  } finally {
    pending.delete(k);
  }
}

export const translateText = (t, lang = 'vi') => translate(t, { format: 'text', targetLang: lang });
export const translateMarkdown = (t, lang = 'vi') => translate(t, { format: 'markdown', targetLang: lang });

/** Persist any newly-translated strings. Call once at the end of a build. */
export function flushCache() {
  if (!dirty) return;
  const sorted = Object.fromEntries(Object.keys(cache).sort().map((k) => [k, cache[k]]));
  mkdirSync(dirname(CACHE_FILE), { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(sorted, null, 2) + '\n');
  dirty = false;
}

export const hasKey = () => Boolean(PROVIDER);
export const provider = () => PROVIDER;
