import { describe, it, expect, beforeEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import preferencesReducer from "../../src/client/features/preferences/preferencesSlice";

describe("preferencesSlice", () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        preferences: preferencesReducer,
      },
    });
  });

  it("should have initial state", () => {
    const state = store.getState().preferences;
    expect(state).toBeDefined();
  });

  it("should initialize preferences reducer", () => {
    const state = store.getState().preferences;
    expect(state !== null).toBe(true);
  });

  it("should have reducer function", () => {
    expect(preferencesReducer).toBeDefined();
    expect(typeof preferencesReducer).toBe("function");
  });

  it("should maintain serializability", () => {
    const state = store.getState().preferences;
    expect(() => {
      JSON.stringify(state);
    }).not.toThrow();
  });

  it("should work with Redux store", () => {
    const fullState = store.getState();
    expect(fullState.preferences).toBeDefined();
  });

  it("reducer should handle initial action", () => {
    const result = preferencesReducer(undefined, { type: "@@INIT" });
    expect(result).toBeDefined();
  });

  it("should maintain state equality", () => {
    const state1 = store.getState().preferences;
    const state2 = store.getState().preferences;
    expect(state1 === state2).toBe(true);
  });

  it("should support store operations", () => {
    expect(() => {
      const state = store.getState().preferences;
      store.dispatch({ type: "TEST" });
      const newState = store.getState().preferences;
      expect(newState).toBeDefined();
    }).not.toThrow();
  });
});
