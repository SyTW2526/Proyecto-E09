import { describe, it, beforeEach, expect, afterEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../src/server/api.js";
import { FriendTradeRoomInvite } from "../../src/server/models/FriendTrade.js";
import { User } from "../../src/server/models/User.js";

const baseUser1 = {
  username: "frienduser1_ft",
  email: "frienduser1@friend-trade.com",
  password: "password123",
};

const baseUser2 = {
  username: "frienduser2_ft",
  email: "frienduser2@friend-trade.com",
  password: "password123",
};

const baseUser3 = {
  username: "frienduser3_ft",
  email: "frienduser3@friend-trade.com",
  password: "password123",
};

let user1: any;
let user2: any;
let user3: any;
let token1: string;
let token2: string;
let token3: string;

beforeEach(async () => {
  await FriendTradeRoomInvite.deleteMany();
  await User.deleteMany();

  // Create users
  user1 = await User.create(baseUser1);
  user2 = await User.create(baseUser2);
  user3 = await User.create(baseUser3);

  // Login and get tokens
  const login1 = await request(app)
    .post("/login")
    .send({ email: baseUser1.email, password: baseUser1.password });
  token1 = login1.body.token;

  const login2 = await request(app)
    .post("/login")
    .send({ email: baseUser2.email, password: baseUser2.password });
  token2 = login2.body.token;

  const login3 = await request(app)
    .post("/login")
    .send({ email: baseUser3.email, password: baseUser3.password });
  token3 = login3.body.token;
});

afterEach(async () => {
  await FriendTradeRoomInvite.deleteMany();
  await User.deleteMany();
});

describe("GET /friend-trade-rooms/invites - Get Friend Trade Invites", () => {
  beforeEach(async () => {
    // Create some invites
    await FriendTradeRoomInvite.create({
      from: user1._id,
      to: user2._id,
    });

    await FriendTradeRoomInvite.create({
      from: user3._id,
      to: user1._id,
    });

    await FriendTradeRoomInvite.create({
      from: user1._id,
      to: user3._id,
    });
  });

  it("obtiene invitaciones recibidas y enviadas", async () => {
    const res = await request(app)
      .get("/friend-trade-rooms/invites")
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.received).toBeDefined();
    expect(res.body.sent).toBeDefined();
    expect(Array.isArray(res.body.received)).toBe(true);
    expect(Array.isArray(res.body.sent)).toBe(true);

    // user1 has received 1 invite from user3
    expect(res.body.received.length).toBe(1);
    expect(String(res.body.received[0].from._id)).toBe(String(user3._id));

    // user1 has sent 2 invites
    expect(res.body.sent.length).toBe(2);
  });

  it("rechaza solicitud sin autenticación", async () => {
    const res = await request(app)
      .get("/friend-trade-rooms/invites");

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("No autenticado");
  });

  it("devuelve arrays vacíos cuando no hay invitaciones", async () => {
    await FriendTradeRoomInvite.deleteMany();

    const res = await request(app)
      .get("/friend-trade-rooms/invites")
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.received.length).toBe(0);
    expect(res.body.sent.length).toBe(0);
  });

  it("popula correctamente la información de usuarios", async () => {
    const res = await request(app)
      .get("/friend-trade-rooms/invites")
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    
    // Check received invite has populated from user
    const receivedInvite = res.body.received[0];
    expect(receivedInvite.from.username).toBeDefined();
    expect(receivedInvite.from.email).toBeDefined();
    
    // Check sent invite has populated to user
    const sentInvite = res.body.sent[0];
    expect(sentInvite.to.username).toBeDefined();
    expect(sentInvite.to.email).toBeDefined();
  });
});

describe("POST /friend-trade-rooms/invite - Create Friend Trade Invite", () => {
  it("crea una invitación de friend trade válida", async () => {
    const res = await request(app)
      .post("/friend-trade-rooms/invite")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        toIdentifier: user2.username,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.invite._id).toBeDefined();
    expect(String(res.body.data.invite.from)).toBe(String(user1._id));
    expect(String(res.body.data.invite.to)).toBe(String(user2._id));
  });

  it("rechaza invitación sin autenticación", async () => {
    const res = await request(app)
      .post("/friend-trade-rooms/invite")
      .send({
        toIdentifier: user2.username,
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("No autenticado");
  });

  it("rechaza invitación sin toIdentifier", async () => {
    const res = await request(app)
      .post("/friend-trade-rooms/invite")
      .set("Authorization", `Bearer ${token1}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("toIdentifier es obligatorio");
  });

  it("rechaza invitación a usuario inexistente", async () => {
    const res = await request(app)
      .post("/friend-trade-rooms/invite")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        toIdentifier: "usuarioNoExiste123",
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("Usuario no encontrado");
  });

  it("rechaza invitación consigo mismo", async () => {
    const res = await request(app)
      .post("/friend-trade-rooms/invite")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        toIdentifier: user1.username,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("No puedes invitarte a ti mismo");
  });

  it("rechaza invitación duplicada", async () => {
    // Create first invite
    await request(app)
      .post("/friend-trade-rooms/invite")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        toIdentifier: user2.username,
      });

    // Try to create duplicate
    const res = await request(app)
      .post("/friend-trade-rooms/invite")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        toIdentifier: user2.username,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Ya existe una invitación");
  });
});

describe("POST /friend-trade-rooms/invite/:id/accept - Accept Friend Trade Invite", () => {
  let inviteId: string;

  beforeEach(async () => {
    const invite = await FriendTradeRoomInvite.create({
      from: user1._id,
      to: user2._id,
    });
    inviteId = invite._id.toString();
  });

  it("acepta una invitación de friend trade válida", async () => {
    const res = await request(app)
      .post(`/friend-trade-rooms/invite/${inviteId}/accept`)
      .set("Authorization", `Bearer ${token2}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain("Invitación aceptada");

    // Verify invite was marked as accepted
    const updated = await FriendTradeRoomInvite.findById(inviteId);
    expect(updated?.status).toBe("accepted");
  });

  it("rechaza aceptar sin autenticación", async () => {
    const res = await request(app)
      .post(`/friend-trade-rooms/invite/${inviteId}/accept`)
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("No autenticado");
  });

  it("rechaza si no es el usuario destino quien acepta", async () => {
    const res = await request(app)
      .post(`/friend-trade-rooms/invite/${inviteId}/accept`)
      .set("Authorization", `Bearer ${token1}`)
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Solo el usuario destinatario puede aceptar");
  });

  it("rechaza aceptar invitación inexistente", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post(`/friend-trade-rooms/invite/${fakeId}/accept`)
      .set("Authorization", `Bearer ${token2}`)
      .send({});

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("Invitación no encontrada");
  });

  it("rechaza ID inválido", async () => {
    const res = await request(app)
      .post(`/friend-trade-rooms/invite/invalidid/accept`)
      .set("Authorization", `Bearer ${token2}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("ID inválido");
  });
});

describe("POST /friend-trade-rooms/invite/:id/reject - Reject Friend Trade Invite", () => {
  let inviteId: string;

  beforeEach(async () => {
    const invite = await FriendTradeRoomInvite.create({
      from: user1._id,
      to: user2._id,
    });
    inviteId = invite._id.toString();
  });

  it("rechaza una invitación de friend trade válida", async () => {
    const res = await request(app)
      .post(`/friend-trade-rooms/invite/${inviteId}/reject`)
      .set("Authorization", `Bearer ${token2}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify invite was marked as rejected or deleted
    const updated = await FriendTradeRoomInvite.findById(inviteId);
    expect(updated?.status === "rejected" || updated === null).toBe(true);
  });

  it("rechaza rechazo sin autenticación", async () => {
    const res = await request(app)
      .post(`/friend-trade-rooms/invite/${inviteId}/reject`)
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("No autenticado");
  });

  it("rechaza si no es el usuario destino quien rechaza", async () => {
    const res = await request(app)
      .post(`/friend-trade-rooms/invite/${inviteId}/reject`)
      .set("Authorization", `Bearer ${token1}`)
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("Solo el usuario destinatario puede rechazar");
  });

  it("rechaza invitación inexistente", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post(`/friend-trade-rooms/invite/${fakeId}/reject`)
      .set("Authorization", `Bearer ${token2}`)
      .send({});

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("Invitación no encontrada");
  });
});
