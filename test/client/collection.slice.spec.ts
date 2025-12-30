import { describe, it, expect, beforeEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import collectionReducer from "../../src/client/features/collection/collectionSlice";

describe("collectionSlice", () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        collection: collectionReducer,
      },
    });
  });

  it("should have initial state", () => {
    const state = store.getState().collection;
    expect(state).toBeDefined();
  });

  it("should initialize collection reducer", () => {
    const state = store.getState().collection;
    expect(state !== null).toBe(true);
  });

  it("should have reducer function", () => {
    expect(collectionReducer).toBeDefined();
    expect(typeof collectionReducer).toBe("function");
  });

  it("should be JSON serializable", () => {
    const state = store.getState().collection;
    expect(() => {
      JSON.stringify(state);
    }).not.toThrow();
  });

  it("should integrate with Redux store", () => {
    const fullState = store.getState();
    expect(fullState.collection).toBeDefined();
  });

  it("reducer should process undefined state", () => {
    const result = collectionReducer(undefined, { type: "@@INIT" });
    expect(result).toBeDefined();
  });

  it("should maintain referential equality", () => {
    const state1 = store.getState().collection;
    const state2 = store.getState().collection;
    expect(state1 === state2).toBe(true);
  });

  it("should support Redux operations", () => {
    expect(() => {
      store.dispatch({ type: "UNKNOWN_ACTION" });
      const state = store.getState().collection;
      expect(state).toBeDefined();
    }).not.toThrow();
  });
});
