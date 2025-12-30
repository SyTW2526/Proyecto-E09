import { describe, it, beforeEach, expect, afterEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../src/server/api.js";
import { TradeRequest } from "../../src/server/models/TradeRequest.js";
import { Trade } from "../../src/server/models/Trade.js";
import { User } from "../../src/server/models/User.js";
import { UserCard } from "../../src/server/models/UserCard.js";
import { Notification } from "../../src/server/models/Notification.js";
import { Card } from "../../src/server/models/Card.js";

const baseUser1 = {
  username: "testuser1_tr",
  email: "testuser1@trade-request.com",
  password: "password123",
};

const baseUser2 = {
  username: "testuser2_tr",
  email: "testuser2@trade-request.com",
  password: "password123",
};

let user1: any;
let user2: any;
let token1: string;
let token2: string;
let card: any;

beforeEach(async () => {
  await TradeRequest.deleteMany();
  await Trade.deleteMany();
  await User.deleteMany();
  await UserCard.deleteMany();
  await Notification.deleteMany();
  await Card.deleteMany();

  // Create users
  user1 = await User.create(baseUser1);
  user2 = await User.create(baseUser2);

  // Login and get tokens
  const login1 = await request(app)
    .post("/login")
    .send({ email: baseUser1.email, password: baseUser1.password });
  token1 = login1.body.token;

  const login2 = await request(app)
    .post("/login")
    .send({ email: baseUser2.email, password: baseUser2.password });
  token2 = login2.body.token;

  // Create a card for testing
  card = await Card.create({
    pokemonTcgId: "sv04.5-001",
    cardName: "Test Card",
    cardImage: "https://example.com/card.jpg",
    rarity: "Rare",
    estimatedValue: 50,
  });
});

afterEach(async () => {
  await TradeRequest.deleteMany();
  await Trade.deleteMany();
  await User.deleteMany();
  await UserCard.deleteMany();
  await Notification.deleteMany();
  await Card.deleteMany();
});

describe("POST /trade-requests - Create Trade Request", () => {
  it("crea una solicitud de intercambio manual válida", async () => {
    const res = await request(app)
      .post("/trade-requests")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        receiverIdentifier: user2.username,
        cardName: "Charizard",
        cardImage: "https://example.com/charizard.jpg",
        note: "Trading my duplicate",
        isManual: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tradeRequest._id).toBeDefined();
    expect(res.body.data.tradeRequest.receiverUserId).toBe(String(user2._id));
    expect(res.body.data.tradeRequest.cardName).toBe("Charizard");
    expect(res.body.data.tradeRequest.isManual).toBe(true);
  });

  it("crea una solicitud de intercambio con pokemonTcgId válida", async () => {
    const res = await request(app)
      .post("/trade-requests")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        receiverIdentifier: user2.username,
        pokemonTcgId: "sv04.5-001",
        isManual: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tradeRequest.pokemonTcgId).toBe("sv04.5-001");
    expect(res.body.data.tradeRequest.isManual).toBe(false);
  });

  it("rechaza solicitud sin receiverIdentifier", async () => {
    const res = await request(app)
      .post("/trade-requests")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        pokemonTcgId: "sv04.5-001",
        isManual: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("receiverIdentifier es obligatorio");
  });

  it("rechaza solicitud sin autenticación", async () => {
    const res = await request(app)
      .post("/trade-requests")
      .send({
        receiverIdentifier: user2.username,
        pokemonTcgId: "sv04.5-001",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("No autenticado");
  });

  it("rechaza solicitud de intercambio automático sin pokemonTcgId", async () => {
    const res = await request(app)
      .post("/trade-requests")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        receiverIdentifier: user2.username,
        isManual: false,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("pokemonTcgId es obligatorio");
  });

  it("rechaza solicitud con usuario receptor inválido", async () => {
    const res = await request(app)
      .post("/trade-requests")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        receiverIdentifier: "usuarioNoExistente123",
        pokemonTcgId: "sv04.5-001",
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("Usuario receptor no encontrado");
  });

  it("rechaza solicitud de intercambio consigo mismo", async () => {
    const res = await request(app)
      .post("/trade-requests")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        receiverIdentifier: user1.username,
        pokemonTcgId: "sv04.5-001",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("No puedes crear una solicitud contigo mismo");
  });
});

describe("GET /trade-requests - Get All Trade Requests", () => {
  beforeEach(async () => {
    // Create some trade requests
    await TradeRequest.create({
      senderUserId: user1._id,
      receiverUserId: user2._id,
      pokemonTcgId: "sv04.5-001",
      cardName: "Charizard",
      cardImage: "https://example.com/charizard.jpg",
      isManual: false,
    });

    await TradeRequest.create({
      senderUserId: user2._id,
      receiverUserId: user1._id,
      cardName: "Blastoise",
      cardImage: "https://example.com/blastoise.jpg",
      isManual: true,
    });
  });

  it("obtiene todas las solicitudes de intercambio paginadas", async () => {
    const res = await request(app)
      .get("/trade-requests?page=1&limit=10")
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toBeDefined();
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(10);
    expect(res.body.data.pagination.total).toBe(2);
  });

  it("rechaza solicitud sin autenticación", async () => {
    const res = await request(app)
      .get("/trade-requests?page=1&limit=10");

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("No autenticado");
  });

  it("devuelve lista vacía cuando no hay solicitudes", async () => {
    await TradeRequest.deleteMany();

    const res = await request(app)
      .get("/trade-requests?page=1&limit=10")
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(0);
    expect(res.body.data.pagination.total).toBe(0);
  });
});

describe("GET /trade-requests/:id - Get Trade Request by ID", () => {
  let tradeRequestId: string;

  beforeEach(async () => {
    const tr = await TradeRequest.create({
      senderUserId: user1._id,
      receiverUserId: user2._id,
      pokemonTcgId: "sv04.5-001",
      cardName: "Charizard",
      cardImage: "https://example.com/charizard.jpg",
      isManual: false,
    });
    tradeRequestId = tr._id.toString();
  });

  it("obtiene una solicitud de intercambio por ID", async () => {
    const res = await request(app)
      .get(`/trade-requests/${tradeRequestId}`)
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tradeRequest._id).toBe(tradeRequestId);
    expect(res.body.data.tradeRequest.cardName).toBe("Charizard");
  });

  it("rechaza ID inválido", async () => {
    const res = await request(app)
      .get(`/trade-requests/invalidid`)
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("ID inválido");
  });

  it("devuelve 404 para ID no encontrado", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/trade-requests/${fakeId}`)
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("Solicitud no encontrada");
  });
});

describe("POST /trade-requests/:id/accept - Accept Trade Request", () => {
  let tradeRequestId: string;

  beforeEach(async () => {
    const tr = await TradeRequest.create({
      senderUserId: user1._id,
      receiverUserId: user2._id,
      pokemonTcgId: "sv04.5-001",
      cardName: "Charizard",
      cardImage: "https://example.com/charizard.jpg",
      isManual: false,
      status: "pending",
    });
    tradeRequestId = tr._id.toString();
  });

  it("acepta una solicitud de intercambio válida", async () => {
    const res = await request(app)
      .post(`/trade-requests/${tradeRequestId}/accept`)
      .set("Authorization", `Bearer ${token2}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain("Solicitud aceptada");

    // Verify trade was created
    const trade = await Trade.findOne({
      initiatorUserId: user1._id,
      receiverUserId: user2._id,
    });
    expect(trade).toBeDefined();
  });

  it("rechaza aceptar con usuario no autenticado", async () => {
    const res = await request(app)
      .post(`/trade-requests/${tradeRequestId}/accept`)
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("No autenticado");
  });

  it("rechaza si no es el receptor quien acepta", async () => {
    const res = await request(app)
      .post(`/trade-requests/${tradeRequestId}/accept`)
      .set("Authorization", `Bearer ${token1}`)
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Solo el receptor puede aceptar");
  });
});

describe("POST /trade-requests/:id/reject - Reject Trade Request", () => {
  let tradeRequestId: string;

  beforeEach(async () => {
    const tr = await TradeRequest.create({
      senderUserId: user1._id,
      receiverUserId: user2._id,
      pokemonTcgId: "sv04.5-001",
      cardName: "Charizard",
      cardImage: "https://example.com/charizard.jpg",
      isManual: false,
      status: "pending",
    });
    tradeRequestId = tr._id.toString();
  });

  it("rechaza una solicitud de intercambio válida", async () => {
    const res = await request(app)
      .post(`/trade-requests/${tradeRequestId}/reject`)
      .set("Authorization", `Bearer ${token2}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify request was rejected
    const updated = await TradeRequest.findById(tradeRequestId);
    expect(updated?.status).toBe("rejected");
  });

  it("rechaza rechazo sin autenticación", async () => {
    const res = await request(app)
      .post(`/trade-requests/${tradeRequestId}/reject`)
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("No autenticado");
  });

  it("rechaza si no es el receptor quien rechaza", async () => {
    const res = await request(app)
      .post(`/trade-requests/${tradeRequestId}/reject`)
      .set("Authorization", `Bearer ${token1}`)
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Solo el receptor puede rechazar");
  });
});

describe("DELETE /trade-requests/:id - Delete Trade Request", () => {
  let tradeRequestId: string;

  beforeEach(async () => {
    const tr = await TradeRequest.create({
      senderUserId: user1._id,
      receiverUserId: user2._id,
      pokemonTcgId: "sv04.5-001",
      cardName: "Charizard",
      cardImage: "https://example.com/charizard.jpg",
      isManual: false,
      status: "pending",
    });
    tradeRequestId = tr._id.toString();
  });

  it("elimina una solicitud de intercambio válida", async () => {
    const res = await request(app)
      .delete(`/trade-requests/${tradeRequestId}`)
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify request was deleted
    const deleted = await TradeRequest.findById(tradeRequestId);
    expect(deleted).toBeNull();
  });

  it("rechaza eliminar sin autenticación", async () => {
    const res = await request(app)
      .delete(`/trade-requests/${tradeRequestId}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("No autenticado");
  });

  it("rechaza si no es el remitente quien elimina", async () => {
    const res = await request(app)
      .delete(`/trade-requests/${tradeRequestId}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Solo el remitente puede eliminar");
  });
});
