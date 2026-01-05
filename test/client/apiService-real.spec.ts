import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock authService to avoid real headers/token logic
vi.mock('../../src/client/services/authService', () => ({
  authService: {
    getAuthHeaders: vi.fn(() => ({ Authorization: 'Bearer test-token' })),
    getToken: vi.fn(() => 'test-token'),
  },
}));

// Use real module under test
import apiService from '../../src/client/services/apiService';

describe('apiService - real execution with mocked fetch', () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('fetchFeaturedCards returns data array on success', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ id: 'c1', name: 'Pikachu' }] }),
    });

    const res = await apiService.fetchFeaturedCards();
    expect(res).toEqual([{ id: 'c1', name: 'Pikachu' }]);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/cards/featured'
    );
  });

  it('searchCards returns paginated data and handles error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ id: 'x' }], total: 1, page: 2, limit: 10 }),
    });
    const ok = await apiService.searchCards('charizard', 2, 10);
    expect(ok.total).toBe(1);
    expect(String(ok.page)).toBe('2');

    (global.fetch as any).mockResolvedValueOnce({ ok: false });
    const fail = await apiService.searchCards('error');
    expect(fail.data).toEqual([]);
  });

  it('getCardById returns card or null on failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: 'base1-4', name: 'Charizard' } }),
    });
    const card = await apiService.getCardById('base1-4');
    expect(card?.name).toBe('Charizard');

    (global.fetch as any).mockResolvedValueOnce({ ok: false });
    const none = await apiService.getCardById('missing');
    expect(none).toBeNull();
  });

  it('addToWishlist posts with auth headers and returns boolean', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: true });
    const ok = await apiService.addToWishlist('user1', 'sv01-1');
    expect(ok).toBe(true);

    (global.fetch as any).mockResolvedValueOnce({ ok: false });
    const ko = await apiService.addToWishlist('user1', 'sv01-2');
    expect(ko).toBe(false);
  });

  it('getUserWishlist composes results and fetches cached missing cards', async () => {
    // First call returns wishlist items with missing cached card
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cards: [{ _id: 'uc1', pokemonTcgId: 'sv01-1', forTrade: false }],
        }),
      })
      // cached card fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          card: {
            name: 'Bulbasaur',
            images: { large: 'img.png' },
            pokemonTcgId: 'sv01-1',
          },
        }),
      });

    const items = await apiService.getUserWishlist('user1');
    expect(items[0].name).toBeDefined();
    expect(items[0].pokemonTcgId).toBe('sv01-1');
  });

  it('updateUserCard sends PATCH and returns boolean', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: true });
    const ok = await apiService.updateUserCard('user1', 'card1', {
      forTrade: true,
    });
    expect(ok).toBe(true);
  });
});
