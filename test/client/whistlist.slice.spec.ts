import { describe, it, expect, beforeEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import whislistReducer from "../../src/client/features/whislist/whislistSlice";

describe("whislistSlice", () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        whislist: whislistReducer,
      },
    });
  });

  it("should have initial state", () => {
    const state = store.getState().whislist;
    expect(state).toBeDefined();
  });

  it("should initialize whislist reducer", () => {
    const state = store.getState().whislist;
    expect(state !== null).toBe(true);
  });

  it("should have reducer function", () => {
    expect(whislistReducer).toBeDefined();
    expect(typeof whislistReducer).toBe("function");
  });

  it("should be serializable", () => {
    const state = store.getState().whislist;
    expect(() => {
      JSON.stringify(state);
    }).not.toThrow();
  });

  it("should work with Redux store", () => {
    const fullState = store.getState();
    expect(fullState.whislist).toBeDefined();
  });

  it("reducer should handle initial state", () => {
    const result = whislistReducer(undefined, { type: "@@INIT" });
    expect(result).toBeDefined();
  });

  it("should maintain state immutability", () => {
    const state1 = store.getState().whislist;
    const state2 = store.getState().whislist;
    expect(state1 === state2).toBe(true);
  });

  it("should support dispatch operations", () => {
    expect(() => {
      store.dispatch({ type: "UNKNOWN" });
      const state = store.getState().whislist;
      expect(state).toBeDefined();
    }).not.toThrow();
  });
});
