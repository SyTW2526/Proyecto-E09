import { PokemonCard, ApiResponse, PaginatedResponse, User, TradeStatus } from '../types';

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

  async getUserCollection(userId: string): Promise<PokemonCard[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/collection`);
      if (!res.ok) throw new Error("Error al obtener la colección");
      const data: ApiResponse<PokemonCard[]> = await res.json();
      return data.data;
    } catch (err) {
      console.error("Error:", err);
      return [];
    }
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
      const res = await fetch(`${API_BASE_URL}/users/${userId}/wishlist`, {
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

  async removeFromWishlist(userId: string, cardId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/wishlist/${cardId}`, {
        method: "DELETE",
      });
      return res.ok;
    } catch (err) {
      console.error("Error:", err);
      return false;
    }
  }
}

export default new ApiService();