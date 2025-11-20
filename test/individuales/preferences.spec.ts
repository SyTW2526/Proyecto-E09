import { describe, it, beforeEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../src/server/api.js";
import { User } from "../../src/server/models/User.js";

beforeEach(async () => {
  await User.deleteMany();
});

describe("GET /users/:userId/preferences", () => {
  it("devuelve las preferencias del usuario", async () => {
    const user = await User.create({
      username: "pepe",
      email: "pepe@example.com",
      password: "pikachu123",
    });

    const res = await request(app)
      .get(`/users/${user._id}/preferences`)
      .expect(200);

    expect(res.body).toHaveProperty("language");
    expect(res.body).toHaveProperty("darkMode");
    expect(res.body).toHaveProperty("notifications");
    expect(res.body).toHaveProperty("privacy");
  });

  it("devuelve valores por defecto si no existen", async () => {
    const user = await User.create({
      username: "pepa",
      email: "pepa@example.com",
      password: "pikachu123",
    });

    const res = await request(app)
      .get(`/users/${user._id}/preferences`)
      .expect(200);

    expect(res.body.language).toBe("es");
    expect(res.body.darkMode).toBe(false);
  });

  it("devuelve 400 si el ID es inválido", async () => {
    const res = await request(app)
      .get(`/users/invalid-id/preferences`)
      .expect(400);

    expect(res.body.error).toContain("inválido");
  });

  it("devuelve 404 si el usuario no existe", async () => {
    const res = await request(app)
      .get(`/users/${new mongoose.Types.ObjectId()}/preferences`)
      .expect(404);

    expect(res.body.error).toBe("Usuario no encontrado");
  });
});

describe("PATCH /users/:userId/preferences", () => {
  it("actualiza el idioma correctamente", async () => {
    const user = await User.create({
      username: "pepe",
      email: "pepe@example.com",
      password: "pikachu123",
    });

    const res = await request(app)
      .patch(`/users/${user._id}/preferences`)
      .send({ language: "en" })
      .expect(200);

    expect(res.body.preferences.language).toBe("en");
  });

  it("actualiza darkMode correctamente", async () => {
    const user = await User.create({
      username: "pepe",
      email: "pepe@example.com",
      password: "pikachu123",
    });

    const res = await request(app)
      .patch(`/users/${user._id}/preferences`)
      .send({ darkMode: true })
      .expect(200);

    expect(res.body.preferences.darkMode).toBe(true);
  });

  it("actualiza notificaciones correctamente", async () => {
    const user = await User.create({
      username: "pepe",
      email: "pepe@example.com",
      password: "pikachu123",
    });

    const res = await request(app)
      .patch(`/users/${user._id}/preferences`)
      .send({ notifications: { trades: false, messages: true } })
      .expect(200);

    expect(res.body.message).toContain("actualizadas");
  });

  it("rechaza idioma inválido", async () => {
    const user = await User.create({
      username: "pepe",
      email: "pepe@example.com",
      password: "pikachu123",
    });

    const res = await request(app)
      .patch(`/users/${user._id}/preferences`)
      .send({ language: "invalid" })
      .expect(400);

    expect(res.body.error).toContain("inválido");
  });

  it("devuelve 400 si el ID es inválido", async () => {
    const res = await request(app)
      .patch(`/users/invalid-id/preferences`)
      .send({ language: "en" })
      .expect(400);

    expect(res.body.error).toContain("inválido");
  });

  it("devuelve 404 si el usuario no existe", async () => {
    const res = await request(app)
      .patch(`/users/${new mongoose.Types.ObjectId()}/preferences`)
      .send({ language: "en" })
      .expect(404);

    expect(res.body.error).toBe("Usuario no encontrado");
  });
});
