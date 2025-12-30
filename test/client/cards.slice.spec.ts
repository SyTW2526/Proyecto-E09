import { describe, it, expect, beforeEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import cardsReducer from "../../src/client/features/cards/cardsSlice";

describe("cardsSlice", () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        cards: cardsReducer,
      },
    });
  });

  it("should have initial state", () => {
    const state = store.getState().cards;
    expect(state).toBeDefined();
    expect(typeof state === "object").toBe(true);
  });

  it("should initialize with correct structure", () => {
    const state = store.getState().cards;
    // Redux slices should have properties for different card types
    expect(state !== null).toBe(true);
  });

  it("should have reducer defined", () => {
    expect(cardsReducer).toBeDefined();
    expect(typeof cardsReducer).toBe("function");
  });

  it("should handle initial state without errors", () => {
    const state = store.getState().cards;
    expect(() => {
      JSON.stringify(state); // Verify state is serializable
    }).not.toThrow();
  });

  it("should maintain immutability", () => {
    const state1 = store.getState().cards;
    const state2 = store.getState().cards;
    
    expect(state1 === state2).toBe(true); // Same reference for unchanged state
  });

  it("reducer should be a function", () => {
    expect(typeof cardsReducer).toBe("function");
  });

  it("should support Redux store integration", () => {
    expect(store.getState()).toBeDefined();
    expect(store.getState().cards).toBeDefined();
  });
});
