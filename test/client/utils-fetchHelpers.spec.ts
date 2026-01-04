import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import {
  getAuthToken,
  getAuthHeaders,
  authenticatedFetch,
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
  authenticatedDelete,
} from '../../src/client/utils/fetchHelpers';

// Mock localStorage and fetch for Node environment
const mockLocalStorage: Record<string, string> = {};

const originalFetch: any = (globalThis as any).fetch;

describe('fetchHelpers (client utils)', () => {
  beforeEach(() => {
    // Reset mocks
    for (const k of Object.keys(mockLocalStorage)) delete mockLocalStorage[k];

    // ensure localStorage exists; if not, stub it
    if (!(globalThis as any).localStorage) {
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => mockLocalStorage[key] || null,
        setItem: (key: string, value: string) =>
          (mockLocalStorage[key] = value),
        removeItem: (key: string) => delete mockLocalStorage[key],
        clear: () => {
          for (const k of Object.keys(mockLocalStorage))
            delete mockLocalStorage[k];
        },
        key: (index: number) => Object.keys(mockLocalStorage)[index] || null,
        length: 0,
      } as any);
    } else {
      // reset token in existing localStorage
      try {
        (globalThis as any).localStorage.removeItem('token');
      } catch {}
    }

    // spy on global fetch per-test to avoid affecting other suites
    const fetchImpl = vi.fn(async (input: any, init?: any) => {
      const url = typeof input === 'string' ? input : String(input);
      const ok = !url.includes('/error');
      return {
        ok,
        status: ok ? 200 : 500,
        json: async () => ({ success: ok, url, init }),
      } as Response;
    });
    vi.spyOn(globalThis as any, 'fetch').mockImplementation(fetchImpl as any);
  });

  afterAll(() => {
    // restore original fetch
    if (originalFetch) (globalThis as any).fetch = originalFetch;
  });

  it('getAuthToken returns empty when not set', () => {
    expect(getAuthToken()).toBe('');
  });

  it('getAuthToken returns token when present', () => {
    (globalThis as any).localStorage.setItem('token', 'abc123');
    expect(getAuthToken()).toBe('abc123');
  });

  it('getAuthHeaders includes Authorization and Content-Type', () => {
    (globalThis as any).localStorage.setItem('token', 'tkn');
    const headers = getAuthHeaders({ 'X-Custom': 'yes' }) as Record<
      string,
      string
    >;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Authorization']).toBe('Bearer tkn');
    expect(headers['X-Custom']).toBe('yes');
  });

  it('authenticatedFetch prefixes relative URL with API_BASE_URL', async () => {
    const res = await authenticatedFetch('/users/me');
    expect(res.ok).toBe(true);
    // Assert spy was called with a full URL and headers injected
    const calls = (globalThis.fetch as any).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [calledUrl, calledInit] = calls[calls.length - 1];
    expect(String(calledUrl)).toContain('/users/me');
    expect(calledInit.headers['Content-Type']).toBe('application/json');
    expect(calledInit.headers['Authorization']).toContain('Bearer');
  });

  it('authenticatedGet returns parsed JSON on OK', async () => {
    const payload = await authenticatedGet<any>('/ok');
    expect(payload.success).toBe(true);
  });

  it('authenticatedGet throws on non-OK', async () => {
    await expect(authenticatedGet<any>('/error')).rejects.toThrow(
      'HTTP error! status: 500'
    );
  });

  it('authenticatedPost sends JSON body and returns parsed JSON', async () => {
    const payload = await authenticatedPost<any>('/post', { a: 1 });
    expect(payload.success).toBe(true);
    expect((payload as any).init.method).toBe('POST');
  });

  it('authenticatedPut sends JSON body and returns parsed JSON', async () => {
    const payload = await authenticatedPut<any>('/put', { a: 2 });
    expect(payload.success).toBe(true);
    expect((payload as any).init.method).toBe('PUT');
  });

  it('authenticatedDelete returns parsed JSON', async () => {
    const payload = await authenticatedDelete<any>('/delete');
    expect(payload.success).toBe(true);
    expect((payload as any).init.method).toBe('DELETE');
  });
});
