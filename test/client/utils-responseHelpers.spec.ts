import { describe, it, expect } from 'vitest';
import {
  safeJsonParse,
  checkResponse,
  fetchJson,
} from '../../src/client/utils/responseHelpers';

function makeResponse(ok: boolean, body: any) {
  return {
    ok,
    json: async () => {
      if (body === 'throw') throw new Error('bad json');
      return body;
    },
    status: ok ? 200 : 500,
  } as Response;
}

describe('responseHelpers (client utils)', () => {
  it('safeJsonParse returns parsed data', async () => {
    const res = makeResponse(true, { a: 1 });
    const data = await safeJsonParse(res);
    expect((data as any).a).toBe(1);
  });

  it('safeJsonParse returns empty object on failing json', async () => {
    const res = makeResponse(true, 'throw');
    const data = await safeJsonParse(res);
    expect(typeof data).toBe('object');
  });

  it('checkResponse resolves for OK', async () => {
    const res = makeResponse(true, { ok: true });
    await expect(checkResponse(res)).resolves.toBeUndefined();
  });

  it('checkResponse throws with response error message', async () => {
    const res = makeResponse(false, { error: 'Boom' });
    await expect(checkResponse(res)).rejects.toThrow('Boom');
  });

  it('checkResponse throws with default message when no error provided', async () => {
    const res = makeResponse(false, { x: 1 });
    await expect(checkResponse(res, 'Default Err')).rejects.toThrow(
      'Default Err'
    );
  });

  it('fetchJson returns parsed JSON for OK', async () => {
    const res = makeResponse(true, { data: 42 });
    const data = await fetchJson(res);
    expect((data as any).data).toBe(42);
  });

  it('fetchJson throws when response not ok', async () => {
    const res = makeResponse(false, { error: 'X' });
    await expect(fetchJson(res)).rejects.toThrow('X');
  });
});
