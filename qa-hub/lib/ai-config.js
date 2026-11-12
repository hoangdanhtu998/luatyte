// Cấu hình provider AI: preset có sẵn model và đường dẫn, người dùng chỉ dán key.
// Key chỉ được lưu phía server và không bao giờ trả về dạng thô.

const MODEL_MAX = 100;
const DEFAULT_SYSTEM = 'Bạn là trợ lý QA. Trả lời bằng tiếng Việt, ngắn gọn, dựa trên dữ liệu được cung cấp.';
const MASK_PREFIX = '••••';
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

export const PROVIDERS = {
  anthropic: {
    label: 'Anthropic (Claude)',
    kind: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    models: ['claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-opus-5-5'],
    editableBaseUrl: false,
  },
  freellmapi: {
    label: 'FreeLLMAPI (app desktop trên máy, OpenAI-compatible)',
    kind: 'openai',
    baseUrl: 'http://127.0.0.1:31415/v1',
    models: ['auto'],
    editableBaseUrl: true,
  },
  custom: {
    label: 'Tùy chỉnh (OpenAI-compatible)',
    kind: 'openai',
    baseUrl: '',
    models: [],
    editableBaseUrl: true,
  },
};

export function maskKey(key) {
  if (typeof key !== 'string' || key.length === 0) return '';
  return `${MASK_PREFIX}${key.slice(-4)}`;
}

function isLocalUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' && LOCAL_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

function isHttpsUrl(url) {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

function checkBaseUrl(provider, baseUrl, errors) {
  if (provider.kind === 'anthropic') return;
  if (!baseUrl) {
    errors.baseUrl = 'Cần đường dẫn API';
    return;
  }
  if (!isHttpsUrl(baseUrl) && !isLocalUrl(baseUrl)) {
    errors.baseUrl = 'Đường dẫn từ xa phải dùng https; http chỉ cho localhost';
  }
}

export function validateAiSettings(body) {
  const errors = {};
  const provider = PROVIDERS[body?.provider];
  if (!provider) {
    errors.provider = `Provider phải là một trong: ${Object.keys(PROVIDERS).join(', ')}`;
    return { ok: false, errors };
  }
  const model = typeof body.model === 'string' ? body.model.trim() : '';
  if (model.length < 1 || model.length > MODEL_MAX) {
    errors.model = `Model từ 1 đến ${MODEL_MAX} ký tự`;
  }
  const baseUrl = provider.kind === 'anthropic'
    ? provider.baseUrl
    : (typeof body.baseUrl === 'string' ? body.baseUrl.trim().replace(/\/+$/, '') : '');
  checkBaseUrl(provider, baseUrl, errors);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { provider: body.provider, model, baseUrl } };
}

export const DEFAULT_SETTINGS = {
  provider: 'anthropic',
  baseUrl: '',
  model: 'claude-sonnet-5-5',
  keys: {},
  allowCodeToAi: false,
};

// Áp dụng thay đổi từ form: ô key trống giữ key cũ, clearKey xóa key.
export function applySettingsUpdate(current, body) {
  const check = validateAiSettings(body);
  if (!check.ok) return check;
  const keys = { ...current.keys };
  const { provider, baseUrl, model } = check.value;
  if (body.clearKey === true) {
    delete keys[provider];
  } else if (typeof body.apiKey === 'string' && body.apiKey.trim() !== '') {
    keys[provider] = body.apiKey.trim();
  }
  return { ok: true, value: { provider, baseUrl, model, keys, allowCodeToAi: body.allowCodeToAi === true } };
}

// Chọn cấu hình đang dùng. Trả null khi chưa đủ điều kiện để gọi AI.
export function resolveActive(settings, env) {
  const provider = PROVIDERS[settings.provider];
  if (!provider) return null;
  const apiKey = settings.keys?.[settings.provider]
    || (provider.kind === 'anthropic' ? env.ANTHROPIC_API_KEY : '')
    || '';
  const baseUrl = provider.kind === 'anthropic' ? provider.baseUrl : (settings.baseUrl || provider.baseUrl);
  if (provider.kind === 'anthropic' && !apiKey) return null;
  if (provider.kind === 'openai' && !apiKey && !isLocalUrl(baseUrl)) return null;
  return { kind: provider.kind, provider: settings.provider, baseUrl, model: settings.model, apiKey };
}

// Chỉ trả về trạng thái đã lưu key, không trả key thô.
export function publicView(settings) {
  const keys = {};
  for (const [id, key] of Object.entries(settings.keys ?? {})) {
    keys[id] = { saved: Boolean(key), masked: maskKey(key) };
  }
  return {
    provider: settings.provider,
    baseUrl: settings.baseUrl,
    model: settings.model,
    keys,
    allowCodeToAi: settings.allowCodeToAi === true,
  };
}

export function buildChatRequest({ provider, baseUrl, model, apiKey, message, context, system }) {
  const user = `Dữ liệu QA Hub (JSON):\n${context}\n\nCâu hỏi:\n${message}`;
  return {
    url: `${baseUrl}/chat/completions`,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 800,
      messages: [
        { role: 'system', content: system ?? DEFAULT_SYSTEM },
        { role: 'user', content: user },
      ],
    }),
    provider,
  };
}
