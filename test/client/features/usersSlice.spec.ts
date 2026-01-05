import { describe, it, expect, beforeEach } from 'vitest';
import usersReducer, {
  fetchUserById,
  fetchUserFriends,
  addFriend,
  removeFriend,
  logoutUser,
} from '../../../src/client/features/users/usersSlice';
import { User } from '../../../src/client/types';

describe('usersSlice', () => {
  let initialState: any;

  beforeEach(() => {
    initialState = {
      currentUser: null,
      friends: [],
      loading: false,
      error: null,
    };
  });

  it('debería tener el estado inicial correcto', () => {
    const state = usersReducer(undefined, { type: 'unknown' });
    expect(state.currentUser).toBeNull();
    expect(state.friends).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('fetchUserById', () => {
    it('debería setear loading a true en pending', () => {
      const action = { type: fetchUserById.pending.type };
      const state = usersReducer(initialState, action as any);
      expect(state.loading).toBe(true);
    });

    it('debería cargar usuario en fulfilled', () => {
      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
      } as User;
      const action = {
        type: fetchUserById.fulfilled.type,
        payload: mockUser,
      };
      const state = usersReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      expect(state.currentUser).toEqual(mockUser);
    });

    it('debería setear error en rejected', () => {
      const action = {
        type: fetchUserById.rejected.type,
        error: { message: 'User not found' },
      };
      const state = usersReducer(initialState, action as any);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('User not found');
    });

    it('debería usar mensaje de error por defecto si falta', () => {
      const action = {
        type: fetchUserById.rejected.type,
        error: {},
      };
      const state = usersReducer(initialState, action as any);
      expect(state.error).toBe('Error al cargar usuario');
    });

    it('debería reemplazar usuario actual al cargar uno nuevo', () => {
      const user1: User = { id: '1', username: 'user1' } as User;
      const user2: User = { id: '2', username: 'user2' } as User;

      let state = usersReducer(initialState, {
        type: fetchUserById.fulfilled.type,
        payload: user1,
      } as any);
      expect(state.currentUser.id).toBe('1');

      state = usersReducer(state, {
        type: fetchUserById.fulfilled.type,
        payload: user2,
      } as any);
      expect(state.currentUser.id).toBe('2');
    });

    it('debería mantener estado previo en pending', () => {
      const previousState = {
        ...initialState,
        currentUser: { id: '1', username: 'user' } as User,
        friends: [{ id: '2', username: 'friend' } as User],
      };
      const action = { type: fetchUserById.pending.type };
      const state = usersReducer(previousState, action as any);
      expect(state.loading).toBe(true);
      expect(state.currentUser).toBeDefined();
      expect(state.friends.length).toBe(1);
    });

    it('debería manejar error en rejected sin mensaje', () => {
      const action = {
        type: fetchUserById.rejected.type,
        error: {},
      };
      const state = usersReducer(initialState, action as any);
      expect(state.error).toBe('Error al cargar usuario');
    });
  });

  describe('fetchUserFriends', () => {
    it('debería cargar lista de amigos en fulfilled', () => {
      const mockFriends: User[] = [
        { id: '2', username: 'friend1' } as User,
        { id: '3', username: 'friend2' } as User,
      ];
      const action = {
        type: fetchUserFriends.fulfilled.type,
        payload: mockFriends,
      };
      const state = usersReducer(initialState, action as any);
      expect(state.friends).toEqual(mockFriends);
      expect(state.friends.length).toBe(2);
    });

    it('debería cargar lista vacía de amigos', () => {
      const action = {
        type: fetchUserFriends.fulfilled.type,
        payload: [],
      };
      const state = usersReducer(initialState, action as any);
      expect(state.friends).toEqual([]);
    });

    it('debería reemplazar amigos previos', () => {
      const friends1: User[] = [{ id: '2', username: 'friend1' } as User];
      const friends2: User[] = [
        { id: '3', username: 'friend2' } as User,
        { id: '4', username: 'friend3' } as User,
      ];

      let state = usersReducer(initialState, {
        type: fetchUserFriends.fulfilled.type,
        payload: friends1,
      } as any);
      expect(state.friends.length).toBe(1);

      state = usersReducer(state, {
        type: fetchUserFriends.fulfilled.type,
        payload: friends2,
      } as any);
      expect(state.friends.length).toBe(2);
      expect(state.friends[0].id).toBe('3');
    });
  });

  describe('addFriend', () => {
    it('debería agregar amigo en fulfilled', () => {
      const newFriend: User = { id: '2', username: 'newfriend' } as User;
      const action = {
        type: addFriend.fulfilled.type,
        payload: newFriend,
      };
      const state = usersReducer(initialState, action as any);
      expect(state.friends).toContain(newFriend);
      expect(state.friends.length).toBe(1);
    });

    it('debería agregar múltiples amigos', () => {
      const friend1: User = { id: '2', username: 'friend1' } as User;
      const friend2: User = { id: '3', username: 'friend2' } as User;

      let state = usersReducer(initialState, {
        type: addFriend.fulfilled.type,
        payload: friend1,
      } as any);
      expect(state.friends.length).toBe(1);

      state = usersReducer(state, {
        type: addFriend.fulfilled.type,
        payload: friend2,
      } as any);
      expect(state.friends.length).toBe(2);
    });

    it('debería mantener usuario actual al agregar amigo', () => {
      const currentUser: User = { id: '1', username: 'user1' } as User;
      const newFriend: User = { id: '2', username: 'friend' } as User;

      let state = {
        ...initialState,
        currentUser,
      };

      state = usersReducer(state, {
        type: addFriend.fulfilled.type,
        payload: newFriend,
      } as any);

      expect(state.currentUser).toEqual(currentUser);
      expect(state.friends).toContain(newFriend);
    });
  });

  describe('removeFriend', () => {
    it('debería remover amigo en fulfilled', () => {
      const friends: User[] = [
        { id: '2', username: 'friend1' } as User,
        { id: '3', username: 'friend2' } as User,
      ];

      let state = {
        ...initialState,
        friends,
      };

      state = usersReducer(state, {
        type: removeFriend.fulfilled.type,
        payload: '2',
      } as any);

      expect(state.friends.length).toBe(1);
      expect(state.friends.some((f) => f.id === '2')).toBe(false);
      expect(state.friends[0].id).toBe('3');
    });

    it('debería manejar remoción de amigo inexistente', () => {
      const friends: User[] = [
        { id: '2', username: 'friend1' } as User,
        { id: '3', username: 'friend2' } as User,
      ];

      let state = {
        ...initialState,
        friends,
      };

      state = usersReducer(state, {
        type: removeFriend.fulfilled.type,
        payload: '999',
      } as any);

      expect(state.friends.length).toBe(2);
    });

    it('debería remover último amigo', () => {
      const friends: User[] = [{ id: '2', username: 'friend' } as User];

      let state = {
        ...initialState,
        friends,
      };

      state = usersReducer(state, {
        type: removeFriend.fulfilled.type,
        payload: '2',
      } as any);

      expect(state.friends.length).toBe(0);
    });

    it('debería remover amigos específicos de varios', () => {
      const friends: User[] = [
        { id: '2', username: 'friend1' } as User,
        { id: '3', username: 'friend2' } as User,
        { id: '4', username: 'friend3' } as User,
      ];

      let state = {
        ...initialState,
        friends,
      };

      state = usersReducer(state, {
        type: removeFriend.fulfilled.type,
        payload: '3',
      } as any);

      expect(state.friends.length).toBe(2);
      expect(state.friends.some((f) => f.id === '3')).toBe(false);
      expect(state.friends[0].id).toBe('2');
      expect(state.friends[1].id).toBe('4');
    });
  });

  describe('logoutUser', () => {
    it('debería limpiar usuario actual en logout', () => {
      const currentUser: User = { id: '1', username: 'user' } as User;
      let state = {
        ...initialState,
        currentUser,
      };

      state = usersReducer(state, logoutUser());
      expect(state.currentUser).toBeNull();
    });

    it('debería limpiar amigos en logout', () => {
      const friends: User[] = [
        { id: '2', username: 'friend1' } as User,
        { id: '3', username: 'friend2' } as User,
      ];

      let state = {
        ...initialState,
        friends,
      };

      state = usersReducer(state, logoutUser());
      expect(state.friends).toEqual([]);
    });

    it('debería limpiar usuario y amigos juntos en logout', () => {
      const currentUser: User = { id: '1', username: 'user' } as User;
      const friends: User[] = [{ id: '2', username: 'friend' } as User];

      let state = {
        ...initialState,
        currentUser,
        friends,
      };

      state = usersReducer(state, logoutUser());
      expect(state.currentUser).toBeNull();
      expect(state.friends).toEqual([]);
      expect(state.loading).toBe(false);
    });
  });

  describe('Casos combinados', () => {
    it('debería manejar flujo de cargar usuario y amigos', () => {
      const currentUser: User = { id: '1', username: 'user' } as User;
      const friends: User[] = [
        { id: '2', username: 'friend1' } as User,
        { id: '3', username: 'friend2' } as User,
      ];

      let state = usersReducer(initialState, {
        type: fetchUserById.fulfilled.type,
        payload: currentUser,
      } as any);
      expect(state.currentUser).toEqual(currentUser);

      state = usersReducer(state, {
        type: fetchUserFriends.fulfilled.type,
        payload: friends,
      } as any);
      expect(state.friends.length).toBe(2);
    });

    it('debería manejar agregar amigo después de cargar', () => {
      const friends: User[] = [{ id: '2', username: 'friend1' } as User];
      const newFriend: User = { id: '3', username: 'friend2' } as User;

      let state = usersReducer(initialState, {
        type: fetchUserFriends.fulfilled.type,
        payload: friends,
      } as any);
      expect(state.friends.length).toBe(1);

      state = usersReducer(state, {
        type: addFriend.fulfilled.type,
        payload: newFriend,
      } as any);
      expect(state.friends.length).toBe(2);
    });

    it('debería manejar logout completo', () => {
      const currentUser: User = { id: '1', username: 'user' } as User;
      const friends: User[] = [
        { id: '2', username: 'friend1' } as User,
        { id: '3', username: 'friend2' } as User,
      ];

      let state = usersReducer(initialState, {
        type: fetchUserById.fulfilled.type,
        payload: currentUser,
      } as any);
      state = usersReducer(state, {
        type: fetchUserFriends.fulfilled.type,
        payload: friends,
      } as any);
      expect(state.currentUser).toEqual(currentUser);
      expect(state.friends.length).toBe(2);

      state = usersReducer(state, logoutUser());
      expect(state.currentUser).toBeNull();
      expect(state.friends).toEqual([]);
    });

    it('debería manejar agregar y remover amigos en secuencia', () => {
      let state = usersReducer(initialState, {
        type: addFriend.fulfilled.type,
        payload: { id: '2', username: 'friend1' } as User,
      } as any);
      expect(state.friends.length).toBe(1);

      state = usersReducer(state, {
        type: addFriend.fulfilled.type,
        payload: { id: '3', username: 'friend2' } as User,
      } as any);
      expect(state.friends.length).toBe(2);

      state = usersReducer(state, {
        type: removeFriend.fulfilled.type,
        payload: '2',
      } as any);
      expect(state.friends.length).toBe(1);
      expect(state.friends[0].id).toBe('3');
    });
  });
});
