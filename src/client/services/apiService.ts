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
      const res = await fetch(`${API_BASE_URL}/users/${userId}/wishlist/${cardId}`, {
        method: "DELETE",
        headers: { ...authService.getAuthHeaders() },
      });
      return res.ok;
    } catch (err) {
      console.error("Error:", err);
      return false;
    }
  }

  async getUserWishlist(username: string): Promise<UserOwnedCard[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/usercards/${username}/wishlist`);
      if (!res.ok) throw new Error("Error obteniendo wishlist del usuario");

      const data = await res.json();

      const results = [] as any[];
      for (const item of data.cards) {
        let card = item.cardId || {};

        // If card object is missing but we have pokemonTcgId, try to fetch cached card from our API
        if ((!card || Object.keys(card).length === 0) && item.pokemonTcgId) {
          try {
            const resp = await fetch(`${API_BASE_URL}/cards/tcg/${item.pokemonTcgId}`);
            if (resp.ok) {
              const payload = await resp.json();
              // endpoint returns { source, card } when found in cache
              card = payload.card ?? payload;
            }
          } catch (e) {
            // ignore - we'll fallback to constructing an image URL below
          }
        }

        // derive image from multiple possible shapes
        let image = card.imageUrl || card.imageUrlHiRes || card.image || '';
        if (!image && card.images) {
          image = card.images.large || card.images.small || '';
        }

        // fallback: construct tcgdex asset url from pokemonTcgId if present
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
          forTrade: item.forTrade
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
      for (const item of data.cards) {
        let card = item.cardId || {};

        if ((!card || Object.keys(card).length === 0) && item.pokemonTcgId) {
          try {
            const resp = await fetch(`${API_BASE_URL}/cards/tcg/${item.pokemonTcgId}`);
            if (resp.ok) {
              const payload = await resp.json();
              card = payload.card ?? payload;
            }
          } catch (e) {}
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
          rarity: card.rarity,
          forTrade: item.forTrade
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