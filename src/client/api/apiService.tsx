import { PokemonCard, ApiResponse, PaginatedResponse, User, TradeStatus } from '../types';

const API_BASE_URL = '/api'; // Tu backend Node.js
const TCGDEX_URL = 'https://api.tcgdex.net/v2/en'; // API pública de tcgDex

class ApiService {
  // Métodos para tu backend
  async fetchFeaturedCards(): Promise<PokemonCard[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cards/featured`);
      if (!response.ok) throw new Error('Error fetching featured cards');
      const data: ApiResponse<PokemonCard[]> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }

  async searchCards(query: string, page = 1, limit = 20): Promise<PaginatedResponse<PokemonCard>> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/cards/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      if (!response.ok) throw new Error('Error searching cards');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return { data: [], total: 0, page, limit };
    }
  }

  async getCardById(id: string): Promise<PokemonCard | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/cards/${id}`);
      if (!response.ok) throw new Error('Error fetching card');
      const data: ApiResponse<PokemonCard> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  // Métodos para tcgDex API (ejemplo)
  async fetchFromTcgDex(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${TCGDEX_URL}/${endpoint}`);
      if (!response.ok) throw new Error('Error fetching from tcgDex');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async getTcgDexSets(): Promise<any[]> {
    return this.fetchFromTcgDex('sets');
  }

  async getTcgDexCard(setId: string, cardId: string): Promise<any> {
    return this.fetchFromTcgDex(`sets/${setId}/${cardId}`);
  }

  // Métodos para colección del usuario
  async getUserCollection(userId: string): Promise<PokemonCard[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/collection`);
      if (!response.ok) throw new Error('Error fetching user collection');
      const data: ApiResponse<PokemonCard[]> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }

  async addToCollection(userId: string, cardId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/collection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId })
      });
      return response.ok;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }

  async removeFromCollection(userId: string, cardId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/collection/${cardId}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }

  // Métodos para intercambios
  async createTrade(fromUserId: string, toUserId: string, offeredCards: string[], requestedCards: string[]): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId, toUserId, offeredCards, requestedCards })
      });
      return response.ok;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }

  async getUserTrades(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/trades`);
      if (!response.ok) throw new Error('Error fetching user trades');
      const data: ApiResponse<any[]> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }

  async updateTradeStatus(tradeId: string, status: TradeStatus): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/trades/${tradeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return response.ok;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }
  //Métodos para usuarios
  async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`)
      if (!response.ok) throw new Error('Error fetching user')
      const data: ApiResponse<User> = await response.json()
      return data.data
    } catch (error) {
      console.error('Error:', error)
      return null
    }
  }

  async getUserFriends(userId: string): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/friends`)
      if (!response.ok) throw new Error('Error fetching friends')
      const data: ApiResponse<User[]> = await response.json()
      return data.data
    } catch (error) {
      console.error('Error:', error)
      return []
    }
  }

  async addFriend(userId: string, friendId: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/friends/${friendId}`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Error adding friend')
      const data: ApiResponse<User> = await response.json()
      return data.data
    } catch (error) {
      console.error('Error:', error)
      return null
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/friends/${friendId}`, {
        method: 'DELETE',
      })
      return response.ok
    } catch (error) {
      console.error('Error:', error)
      return false
    }
  }
  // Métodos para la wishlist del usuario
  async getWishlist(userId: string): Promise<PokemonCard[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/wishlist`)
      if (!response.ok) throw new Error('Error fetching wishlist')
      const data: ApiResponse<PokemonCard[]> = await response.json()
      return data.data
    } catch (error) {
      console.error('Error:', error)
      return []
    }
  }

  async addToWishlist(userId: string, cardId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId }),
      })
      return response.ok
    } catch (error) {
      console.error('Error:', error)
      return false
    }
  }

  async removeFromWishlist(userId: string, cardId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/wishlist/${cardId}`, {
        method: 'DELETE',
      })
      return response.ok
    } catch (error) {
      console.error('Error:', error)
      return false
    }
  }
}

export default new ApiService();