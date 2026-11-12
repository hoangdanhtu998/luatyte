import { test, expect } from '@playwright/test';
import {
  PROVIDERS, validateAiSettings, maskKey, publicView, buildChatRequest,
  applySettingsUpdate, resolveActive, DEFAULT_SETTINGS,
} from '../lib/ai-config.js';

test.describe('Lưu và chọn key provider', () => {
  test('dán key mới được lưu nhưng phản hồi không chứa key thô', () => {
    const result = applySettingsUpdate(DEFAULT_SETTINGS, {
      provider: 'freellmapi', baseUrl: 'http://127.0.0.1:31415/v1', model: 'auto', apiKey: 'fl-key-7777',
    });
    expect(result.ok).toBe(true);
    expect(result.value.keys.freellmapi).toBe('fl-key-7777');
    expect(JSON.stringify(publicView(result.value))).not.toContain('fl-key-7777');
  });

  test('ô key để trống giữ nguyên key đã lưu', () => {
    const saved = { ...DEFAULT_SETTINGS, provider: 'freellmapi', keys: { freellmapi: 'old-1111' } };
    const result = applySettingsUpdate(saved, {
      provider: 'freellmapi', baseUrl: 'http://127.0.0.1:31415/v1', model: 'auto', apiKey: '',
    });
    expect(result.value.keys.freellmapi).toBe('old-1111');
  });

  test('clearKey xóa key của provider', () => {
    const saved = { ...DEFAULT_SETTINGS, provider: 'freellmapi', keys: { freellmapi: 'old-1111' } };
    const result = applySettingsUpdate(saved, {
      provider: 'freellmapi', baseUrl: 'http://127.0.0.1:31415/v1', model: 'auto', clearKey: true,
    });
    expect(result.value.keys.freellmapi).toBeUndefined();
  });

  test('resolveActive dùng key đã lưu của provider đang chọn', () => {
    const active = resolveActive({ ...DEFAULT_SETTINGS, provider: 'freellmapi', keys: { freellmapi: 'k-2222' } }, {});
    expect(active.apiKey).toBe('k-2222');
    expect(active.kind).toBe('openai');
  });

  test('Anthropic không có key ở cả cài đặt lẫn biến môi trường thì chưa bật AI', () => {
    expect(resolveActive(DEFAULT_SETTINGS, {})).toBe(null);
  });

  test('Anthropic lấy key từ biến môi trường khi chưa lưu key', () => {
    const active = resolveActive(DEFAULT_SETTINGS, { ANTHROPIC_API_KEY: 'env-3333' });
    expect(active.apiKey).toBe('env-3333');
    expect(active.kind).toBe('anthropic');
  });

  test('FreeLLMAPI chạy localhost bật AI dù chưa có key', () => {
    const active = resolveActive({ ...DEFAULT_SETTINGS, provider: 'freellmapi' }, {});
    expect(active).not.toBe(null);
  });
});

test.describe('Cấu hình provider AI', () => {
  test('có preset Anthropic và FreeLLMAPI chạy cục bộ kèm danh sách model', () => {
    expect(PROVIDERS.anthropic.kind).toBe('anthropic');
    expect(PROVIDERS.anthropic.models.length).toBeGreaterThan(0);
    expect(PROVIDERS.freellmapi.kind).toBe('openai');
    expect(PROVIDERS.freellmapi.baseUrl).toBe('http://127.0.0.1:31415/v1');
    expect(PROVIDERS.freellmapi.models).toContain('auto');
  });

  test('provider không có trong preset bị từ chối', () => {
    const result = validateAiSettings({ provider: 'khong-co', model: 'x' });
    expect(result.ok).toBe(false);
    expect(result.errors.provider).toBeTruthy();
  });

  test('custom OpenAI-compatible phải dùng https, trừ localhost', () => {
    expect(validateAiSettings({ provider: 'custom', baseUrl: 'http://example.com/v1', model: 'm' }).ok).toBe(false);
    expect(validateAiSettings({ provider: 'custom', baseUrl: 'https://example.com/v1', model: 'm' }).ok).toBe(true);
    expect(validateAiSettings({ provider: 'custom', baseUrl: 'http://127.0.0.1:8000/v1', model: 'm' }).ok).toBe(true);
  });

  test('model rỗng hoặc quá dài bị từ chối', () => {
    expect(validateAiSettings({ provider: 'freellmapi', model: '' }).ok).toBe(false);
    expect(validateAiSettings({ provider: 'freellmapi', model: 'x'.repeat(101) }).ok).toBe(false);
  });

  test('maskKey chỉ để lộ 4 ký tự cuối', () => {
    expect(maskKey('sk-abcdefgh1234')).toBe('••••1234');
    expect(maskKey('')).toBe('');
  });

  test('publicView không bao giờ trả key thô', () => {
    const view = publicView({
      provider: 'freellmapi',
      baseUrl: 'http://127.0.0.1:31415/v1',
      model: 'auto',
      keys: { freellmapi: 'secret-key-9999' },
    });
    expect(JSON.stringify(view)).not.toContain('secret-key-9999');
    expect(view.keys.freellmapi.masked).toBe('••••9999');
    expect(view.keys.freellmapi.saved).toBe(true);
  });

  test('buildChatRequest tạo đúng URL và header cho OpenAI-compatible', () => {
    const req = buildChatRequest({
      provider: 'freellmapi',
      baseUrl: 'http://127.0.0.1:31415/v1',
      model: 'auto',
      apiKey: 'k',
      message: 'hi',
      context: '{}',
    });
    expect(req.url).toBe('http://127.0.0.1:31415/v1/chat/completions');
    expect(req.headers.authorization).toBe('Bearer k');
    expect(JSON.parse(req.body).model).toBe('auto');
  });
});

test.describe('API: cấu hình AI', () => {
  test('lưu key qua API nhưng GET chỉ trả bản đã che', async ({ request }) => {
    try {
      const put = await request.put('/api/ai/settings', {
        data: { provider: 'freellmapi', baseUrl: 'http://127.0.0.1:31415/v1', model: 'auto', apiKey: 'api-key-5555' },
      });
      expect(put.status()).toBe(200);
      expect(await put.text()).not.toContain('api-key-5555');

      const get = await request.get('/api/ai/settings');
      const body = await get.json();
      expect(body.provider).toBe('freellmapi');
      expect(body.keys.freellmapi.saved).toBe(true);
      expect(body.keys.freellmapi.masked).toBe('••••5555');
      expect(JSON.stringify(body)).not.toContain('api-key-5555');
      expect(body.presets.anthropic.models.length).toBeGreaterThan(0);
    } finally {
      // Trả về mặc định để các test UI sau không bị bật AI tới một server không tồn tại.
      await request.put('/api/ai/settings', {
        data: { provider: 'anthropic', model: 'claude-sonnet-5-5', clearKey: true },
      });
    }
  });

  test('provider lạ bị 400', async ({ request }) => {
    const response = await request.put('/api/ai/settings', { data: { provider: 'khong-co', model: 'x' } });
    expect(response.status()).toBe(400);
  });
});
