import { PokemonCard, ApiResponse, PaginatedResponse, User, TradeStatus, UserOwnedCard } from '../types';
import { authService } from './authService';

const API_BASE_URL = 'http://localhost:3000'; // URL base de la API del servidor
const TCGDEX_URL = 'https://api.tcgdex.net/v2/en'; // API pública de tcgDex
class ApiService {
  async fetchFeaturedCards(): Promise<PokemonCard[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/cards/featured`);
      if (!res.ok) throw new Error("Error al obtener cartas destacadas");
      const data: ApiResponse<PokemonCard[]> = await res.json();
      return data.data;
    } catch (err) {
      console.error("Error:", err);
      return [];
    }
  }

  async searchCards(
    query: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<PokemonCard>> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/cards/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      if (!res.ok) throw new Error("Error buscando cartas");
      return await res.json();
    } catch (err) {
      console.error("Error:", err);
      return { data: [], total: 0, page, limit };
    }
  }

  async getCardById(id: string): Promise<PokemonCard | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/cards/${id}`);
      if (!res.ok) throw new Error("Error al obtener carta");
      const data: ApiResponse<PokemonCard> = await res.json();
      return data.data;
    } catch (err) {
      console.error("Error:", err);
      return null;
    }
  }

  async fetchFromTcgDex(endpoint: string): Promise<any> {
    try {
      const res = await fetch(`${TCGDEX_URL}/${endpoint}`);
      if (!res.ok) throw new Error("Error al conectar con TCGdex");
      return await res.json();
    } catch (err) {
      console.error("Error:", err);
      return null;
    }
  }

  async getTcgDexSets(): Promise<any[]> {
    return this.fetchFromTcgDex("sets");
  }

  async getTcgDexCard(setId: string, cardId: string): Promise<any> {
    return this.fetchFromTcgDex(`sets/${setId}/${cardId}`);
  }

  async addToCollection(userId: string, cardId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/collection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });
      return res.ok;
    } catch (err) {
      console.error("Error:", err);
      return false;
    }
  }

  async removeFromCollection(userId: string, cardId: string): Promise<boolean> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/users/${userId}/collection/${cardId}`,
        { method: "DELETE" }
      );
      return res.ok;
    } catch (err) {
      console.error("Error:", err);
      return false;
    }
  }

  async addFriend(userId: string, friendId: string): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/friends/${friendId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Error al añadir amigo");
      const data: ApiResponse<User> = await res.json();
      return data.data;
    } catch (err) {
      console.error("Error al añadir amigo:", err);
      return null;
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/friends/${friendId}`, {
        method: "DELETE",
      });
      return res.ok;
    } catch (err) {
      console.error("Error al eliminar amigo:", err);
      return false;
    }
  }

  async createTrade(data: {
    initiatorUserId: string;
    receiverUserId: string;
    tradeType?: "private" | "public";
    initiatorCards?: any[];
    receiverCards?: any[];
  }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/trades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error creando el intercambio");
      return await res.json();
    } catch (err) {
      console.error("Error creando trade:", err);
      throw err;
    }
  }

  async getUserTrades(userId: string): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/trades`);
      if (!res.ok) throw new Error("Error obteniendo intercambios del usuario");
      const data: ApiResponse<any[]> = await res.json();
      return data.data;
    } catch (err) {
      console.error("Error:", err);
      return [];
    }
  }

  async updateTradeStatus(
    tradeId: string,
    status: TradeStatus
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/trades/${tradeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Error actualizando estado del intercambio");
      return await res.json();
    } catch (err) {
      console.error("Error:", err);
      throw err;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (!res.ok) throw new Error("Error obteniendo usuario");
      const data: ApiResponse<User> = await res.json();
      return data.data;
    } catch (err) {
      console.error("Error:", err);
      return null;
    }
  }

  async getUserFriends(userId: string): Promise<User[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/friends`);
      if (!res.ok) throw new Error("Error obteniendo amigos");
      const data: ApiResponse<User[]> = await res.json();
      return data.data;
    } catch (err) {
      console.error("Error:", err);
      return [];
    }
  }

  async getWishlist(userId: string): Promise<PokemonCard[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/wishlist`);
      if (!res.ok) throw new Error("Error obteniendo wishlist");
      const data: ApiResponse<PokemonCard[]> = await res.json();
      return data.data;
    } catch (err) {
      console.error("Error:", err);
      return [];
    }
  }

  async addToWishlist(userId: string, cardId: string): Promise<boolean> {
    try {
      // Add card to user's cards with collectionType=wishlist.
      const res = await fetch(`${API_BASE_URL}/users/${userId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authService.getAuthHeaders() },
        body: JSON.stringify({ pokemonTcgId: cardId, collectionType: 'wishlist', autoFetch: true }),
      });
      return res.ok;
    } catch (err) {
      console.error("Error:", err);
      return false;
    }
  }

  async removeFromWishlist(userId: string, cardId: string): Promise<boolean> {
    try {
      // The server exposes deletion by userCard id under /usercards/:username/cards/:userCardId
      // We need to lookup the user's wishlist entries, find the matching userCard (by pokemonTcgId or cardId.pokemonTcgId)
      // and then call the existing delete route.
      const listRes = await fetch(`${API_BASE_URL}/usercards/${userId}/wishlist`);
      if (!listRes.ok) {
        // fallback: try the user-scoped endpoint
        const fallback = await fetch(`${API_BASE_URL}/users/${userId}/cards?collection=wishlist`);
        if (!fallback.ok) return false;
        const fallbackPayload = await fallback.json();
        const items = fallbackPayload.cards || fallbackPayload.results || [];
        const found = items.find((it: any) => (it.pokemonTcgId === cardId) || (it.cardId && it.cardId.pokemonTcgId === cardId));
        if (!found) return false;
        const delRes = await fetch(`${API_BASE_URL}/users/${userId}/cards/${found._id}`, {
          method: 'DELETE',
          headers: { ...authService.getAuthHeaders() }
        });
        return delRes.ok;
      }

      const payload = await listRes.json();
      const items = payload.cards || payload.results || [];
      const found = items.find((it: any) => (it.pokemonTcgId === cardId) || (it.cardId && it.cardId.pokemonTcgId === cardId));
      if (!found) return false;

      const delRes = await fetch(`${API_BASE_URL}/usercards/${userId}/cards/${found._id}`, {
        method: 'DELETE',
        headers: { ...authService.getAuthHeaders() },
      });
      return delRes.ok;
    } catch (err) {
      console.error('Error:', err);
      return false;
    }
  }

  async getUserWishlist(username: string): Promise<UserOwnedCard[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/usercards/${username}/wishlist`);
      if (!res.ok) throw new Error("Error obteniendo wishlist del usuario");

      const data = await res.json();

      const results = [] as any[];
      // Collect items and batch-fetch missing cached cards with limited concurrency
      const items = data.cards || [];
      // build list of tcgIds we need to fetch
      const missingIds: string[] = [];
      const itemCardMap = new Map<number, any>();
      items.forEach((item: any, idx: number) => {
        const card = item.cardId || {};
        if ((!card || Object.keys(card).length === 0) && item.pokemonTcgId) {
          missingIds.push(item.pokemonTcgId);
        }
        itemCardMap.set(idx, card);
      });

      // helper: fetch cached cards in batches to avoid opening too many simultaneous connections
      const fetchCached = async (ids: string[]) => {
        const map: Record<string, any> = {};
        const concurrency = 8;
        for (let i = 0; i < ids.length; i += concurrency) {
          const batch = ids.slice(i, i + concurrency);
          const promises = batch.map((id) =>
            fetch(`${API_BASE_URL}/cards/tcg/${id}`)
              .then((r) => (r.ok ? r.json().catch(() => null) : null))
              .catch(() => null)
          );
          const resolved = await Promise.all(promises);
          resolved.forEach((payload, j) => {
            const id = batch[j];
            if (payload) map[id] = payload.card ?? payload;
          });
        }
        return map;
      };

      const cachedById = missingIds.length ? await fetchCached(Array.from(new Set(missingIds))) : {};

      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        let card = itemCardMap.get(idx) || {};
        if ((!card || Object.keys(card).length === 0) && item.pokemonTcgId) {
          card = cachedById[item.pokemonTcgId] || {};
        }

        // derive image from multiple possible shapes
        let image = card.imageUrl || card.imageUrlHiRes || card.image || '';
        if (!image && card.images) {
          image = card.images.large || card.images.small || '';
        }

        const tcgId = item.pokemonTcgId || card.pokemonTcgId || '';
        if (!image && tcgId) {
          const [setCode, number] = tcgId.split('-');
          const series = setCode ? setCode.slice(0, 2) : '';
          if (setCode && number) {
            image = `https://assets.tcgdex.net/en/${series}/${setCode}/${number}/high.png`;
          }
        }

        results.push({
          id: item._id,
          name: card.name,
          image,
          rarity: card.rarity,
          forTrade: item.forTrade,
        });
      }

      return results;
    } catch (err) {
      console.error("Error wishlist:", err);
      return [];
    }
  }
  
  async getUserCollection(username: string): Promise<UserOwnedCard[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/usercards/${username}/collection`);
      if (!res.ok) throw new Error("Error obteniendo colección del usuario");

      const data = await res.json();

      const results = [] as any[];
      // Batch-fetch missing cached cards to avoid sequential fetches per item
      const items = data.cards || [];
      const missingIds: string[] = [];
      const itemCardMap = new Map<number, any>();
      items.forEach((item: any, idx: number) => {
        const card = item.cardId || {};
        if ((!card || Object.keys(card).length === 0) && item.pokemonTcgId) missingIds.push(item.pokemonTcgId);
        itemCardMap.set(idx, card);
      });

      const fetchCached = async (ids: string[]) => {
        const map: Record<string, any> = {};
        const concurrency = 8;
        for (let i = 0; i < ids.length; i += concurrency) {
          const batch = ids.slice(i, i + concurrency);
          const promises = batch.map((id) =>
            fetch(`${API_BASE_URL}/cards/tcg/${id}`)
              .then((r) => (r.ok ? r.json().catch(() => null) : null))
              .catch(() => null)
          );
          const resolved = await Promise.all(promises);
          resolved.forEach((payload, j) => {
            const id = batch[j];
            if (payload) map[id] = payload.card ?? payload;
          });
        }
        return map;
      };

      const cachedById = missingIds.length ? await fetchCached(Array.from(new Set(missingIds))) : {};

      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        let card = itemCardMap.get(idx) || {};
        if ((!card || Object.keys(card).length === 0) && item.pokemonTcgId) {
          card = cachedById[item.pokemonTcgId] || {};
        }

        let image = card.imageUrl || card.imageUrlHiRes || card.image || '';
        if (!image && card.images) {
          image = card.images.large || card.images.small || '';
        }

        const tcgId = item.pokemonTcgId || card.pokemonTcgId || '';
        if (!image && tcgId) {
          const [setCode, number] = tcgId.split('-');
          const series = setCode ? setCode.slice(0, 2) : '';
          if (setCode && number) {
            image = `https://assets.tcgdex.net/en/${series}/${setCode}/${number}/high.png`;
          }
        }

        results.push({
          id: item._id,
          name: card.name,
          image,
          set: card.set,
          rarity: card.rarity,
          forTrade: item.forTrade,
        });
      }

      return results;
    } catch (err) {
      console.error("Error colección:", err);
      return [];
    }
  }
}


export default new ApiService();