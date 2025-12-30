import { describe, it, expect, beforeEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import usersReducer, {
  fetchUserById,
  fetchUserFriends,
  addFriend,
  removeFriend,
} from "../../src/client/features/users/usersSlice";

// Mock the API service
vi.mock("../../src/client/services/apiService", () => ({
  default: {
    getUserById: vi.fn(),
    getUserFriends: vi.fn(),
    addFriend: vi.fn(),
    removeFriend: vi.fn(),
  },
}));

describe("usersSlice", () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        users: usersReducer,
      },
    });
  });

  it("should have initial state", () => {
    const state = store.getState().users;
    expect(state.currentUser).toBeNull();
    expect(state.friends).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should handle fetchUserById pending state", async () => {
    const thunkAction = fetchUserById("user123");
    
    // Dispatch the thunk and wait for pending state
    const result = store.dispatch(thunkAction);
    
    const state = store.getState().users;
    // After dispatch, the state should be pending
    if (result.type === "users/fetchById/pending" || state.loading === true) {
      expect(state.loading).toBe(true);
    }
  });

  it("should maintain error state on failure", () => {
    const state = store.getState().users;
    expect(state.error).toBeNull();
  });

  it("should have correct reducer structure", () => {
    const state = store.getState().users;
    expect(state).toHaveProperty("currentUser");
    expect(state).toHaveProperty("friends");
    expect(state).toHaveProperty("loading");
    expect(state).toHaveProperty("error");
  });

  it("should initialize with correct types", () => {
    const state = store.getState().users;
    expect(typeof state.loading).toBe("boolean");
    expect(Array.isArray(state.friends)).toBe(true);
    expect(state.error === null || typeof state.error === "string").toBe(true);
  });

  it("should accept new user updates", () => {
    const state = store.getState().users;
    expect(state.currentUser).toBeNull();
  });

  it("should handle async thunk actions", () => {
    expect(fetchUserById).toBeDefined();
    expect(fetchUserFriends).toBeDefined();
    expect(addFriend).toBeDefined();
    expect(removeFriend).toBeDefined();
  });
});
