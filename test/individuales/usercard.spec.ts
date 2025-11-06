import { describe, it, beforeEach, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/server/api.js";
import { User }from "../../src/server/models/User.js";
import { UserCard }from "../../src/server/models/UserCard.js";
import mongoose from "mongoose";

const baseUser = {
  username: "pepe",
  email: "pepe@example.com",
  password: "pikachu123",
};

beforeEach(async () => {
  await User.deleteMany();
  await UserCard.deleteMany();
});

describe("POST /usercards/:username/:type", () => {
  it("crea una carta en la colección de un usuario válido", async () => {
    const user = await User.create(baseUser);

    const res = await request(app)
      .post(`/usercards/${user.username}/collection`)
      .send({
        cardId: new mongoose.Types.ObjectId().toString(),
        pokemonTcgId: "xy7-54",
        notes: "Mi carta favorita",
      })
      .expect(201);

    expect(res.body.collectionType).toBe("collection");
    expect(res.body.userId).toBe(String(user._id));
  });
});

describe("GET /usercards/:username", () => {
  it("devuelve todas las cartas de un usuario", async () => {
    const user = await User.create(baseUser);

    await UserCard.insertMany([
      {
        userId: user._id,
        cardId: new mongoose.Types.ObjectId(),
        pokemonTcgId: "base1-1",
        collectionType: "collection",
      },
      {
        userId: user._id,
        cardId: new mongoose.Types.ObjectId(),
        pokemonTcgId: "base1-2",
        collectionType: "wishlist",
      },
    ]);

    const res = await request(app)
      .get(`/usercards/${user.username}`)
      .expect(200);
    expect(Array.isArray(res.body.cards)).toBe(true);
    expect(res.body.cards.length).toBe(2);
    expect(res.body.totalResults).toBe(2);
  });

  it("devuelve 404 si el usuario no existe", async () => {
    const res = await request(app).get(`/usercards/fakeuser`).expect(404);
    expect(res.body.error).toBe("Usuario no encontrado");
  });
});

describe("GET /usercards/:username/:type", () => {
  it("devuelve solo las cartas del tipo indicado", async () => {
    const user = await User.create(baseUser);

    await UserCard.insertMany([
      {
        userId: user._id,
        cardId: new mongoose.Types.ObjectId(),
        pokemonTcgId: "base1-1",
        collectionType: "collection",
      },
      {
        userId: user._id,
        cardId: new mongoose.Types.ObjectId(),
        pokemonTcgId: "base1-2",
        collectionType: "wishlist",
      },
    ]);

    const res = await request(app)
      .get(`/usercards/${user.username}/collection`)
      .expect(200);

    expect(res.body.cards.length).toBe(1);
    expect(res.body.cards[0].collectionType).toBe("collection");
  });

  it("devuelve 400 si el tipo es inválido", async () => {
    const user = await User.create(baseUser);
    const res = await request(app)
      .get(`/usercards/${user.username}/invalid`)
      .expect(400);
    expect(res.body.error).toBe("Tipo inválido");
  });
});

describe("PATCH /usercards/:username/cards/:userCardId", () => {
  it("actualiza una carta correctamente", async () => {
    const user = await User.create(baseUser);
    const card = await UserCard.create({
      userId: user._id,
      cardId: new mongoose.Types.ObjectId(),
      pokemonTcgId: "base1-3",
      collectionType: "collection",
      notes: "antigua",
    });

    const res = await request(app)
      .patch(`/usercards/${user.username}/cards/${card._id}`)
      .send({ notes: "actualizada" })
      .expect(200);

    expect(res.body.notes).toBe("actualizada");
  });

  it("devuelve 404 si el usuario no existe", async () => {
    const res = await request(app)
      .patch(`/usercards/unknown/cards/${new mongoose.Types.ObjectId()}`)
      .send({ notes: "test" })
      .expect(404);
    expect(res.body.error).toBe("Usuario no encontrado");
  });
});

describe("DELETE /usercards/:username/cards/:userCardId", () => {
  it("elimina una carta correctamente", async () => {
    const user = await User.create(baseUser);
    const card = await UserCard.create({
      userId: user._id,
      cardId: new mongoose.Types.ObjectId(),
      pokemonTcgId: "base1-4",
      collectionType: "wishlist",
    });

    const res = await request(app)
      .delete(`/usercards/${user.username}/cards/${card._id}`)
      .expect(200);

    expect(res.body.message).toBe("Carta eliminada correctamente");

    const check = await UserCard.findById(card._id);
    expect(check).toBeNull();
  });

  it("devuelve 404 si el usuario no existe", async () => {
    const res = await request(app)
      .delete(`/usercards/fake/cards/${new mongoose.Types.ObjectId()}`)
      .expect(404);
    expect(res.body.error).toBe("Usuario no encontrado");
  });
});