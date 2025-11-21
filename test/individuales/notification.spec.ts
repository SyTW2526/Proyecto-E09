import { describe, it, beforeEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../src/server/api.js";
import { Notification } from "../../src/server/models/Notification.js";
import { User } from "../../src/server/models/User.js";

beforeEach(async () => {
  await Notification.deleteMany();
  await User.deleteMany();
});

describe("GET /notifications/:userId", () => {
  it("devuelve todas las notificaciones del usuario paginadas", async () => {
    const user = await User.create({
      username: "pepe",
      email: "pepe@example.com",
      password: "pikachu123",
    });

    await Notification.insertMany([
      {
        userId: user._id,
        type: "trade",
        title: "Nuevo intercambio",
        message: "Alguien quiere intercambiar contigo",
        isRead: false,
      },
      {
        userId: user._id,
        type: "trade",
        title: "Solicitud de amistad",
        message: "Alguien te ha añadido como amigo",
        isRead: true,
      },
    ]);

    const res = await request(app)
      .get(`/notifications/${user._id}?limit=10&skip=0`)
      .expect(200);

    expect(Array.isArray(res.body.notifications)).toBe(true);
    expect(res.body.notifications.length).toBe(2);
    expect(res.body.total).toBe(2);
    expect(res.body.unread).toBe(1);
  });

  it("devuelve [] si no hay notificaciones", async () => {
    const user = await User.create({
      username: "pepa",
      email: "pepa@example.com",
      password: "pikachu123",
    });

    const res = await request(app)
      .get(`/notifications/${user._id}`)
      .expect(200);

    expect(Array.isArray(res.body.notifications)).toBe(true);
    expect(res.body.notifications.length).toBe(0);
    expect(res.body.total).toBe(0);
  });

  it("devuelve 400 si el ID es inválido", async () => {
    const res = await request(app)
      .get(`/notifications/invalid-id`)
      .expect(400);

    expect(res.body).toHaveProperty("error");
  });
});

describe("PATCH /notifications/:notificationId/read", () => {
  it("marca una notificación como leída", async () => {
    const user = await User.create({
      username: "pepe",
      email: "pepe@example.com",
      password: "pikachu123",
    });

    const notification = await Notification.create({
      userId: user._id,
      type: "trade",
      title: "Nuevo intercambio",
      message: "Test",
      isRead: false,
    });

    const res = await request(app)
      .patch(`/notifications/${notification._id}/read`)
      .expect(200);

    expect(res.body.isRead).toBe(true);
  });

  it("devuelve 404 si la notificación no existe", async () => {
    const res = await request(app)
      .patch(`/notifications/${new mongoose.Types.ObjectId()}/read`)
      .expect(404);

    expect(res.body.error).toBe("Notificación no encontrada");
  });

  it("devuelve 400 si el ID es inválido", async () => {
    const res = await request(app)
      .patch(`/notifications/invalid-id/read`)
      .expect(400);

    expect(res.body).toHaveProperty("error");
  });
});

describe("PATCH /notifications/:userId/read-all", () => {
  it("marca todas las notificaciones como leídas", async () => {
    const user = await User.create({
      username: "pepe",
      email: "pepe@example.com",
      password: "pikachu123",
    });

    await Notification.insertMany([
      {
        userId: user._id,
        type: "trade",
        title: "Test 1",
        message: "Mensaje 1",
        isRead: false,
      },
      {
        userId: user._id,
        type: "trade",
        title: "Test 2",
        message: "Mensaje 2",
        isRead: false,
      },
    ]);

    const res = await request(app)
      .patch(`/notifications/${user._id}/read-all`)
      .expect(200);

    expect(res.body.message).toContain("marcadas como leídas");
    expect(res.body.modifiedCount).toBe(2);
  });

  it("devuelve 400 si el ID es inválido", async () => {
    const res = await request(app)
      .patch(`/notifications/invalid-id/read-all`)
      .expect(400);

    expect(res.body).toHaveProperty("error");
  });
});

describe("DELETE /notifications/:notificationId", () => {
  it("elimina una notificación correctamente", async () => {
    const user = await User.create({
      username: "pepe",
      email: "pepe@example.com",
      password: "pikachu123",
    });

    const notification = await Notification.create({
      userId: user._id,
      type: "trade",
      title: "Test",
      message: "Test",
      isRead: false,
    });

    const res = await request(app)
      .delete(`/notifications/${notification._id}`)
      .expect(200);

    expect(res.body.message).toContain("eliminada");

    const check = await Notification.findById(notification._id);
    expect(check).toBeNull();
  });

  it("devuelve 404 si no existe", async () => {
    const res = await request(app)
      .delete(`/notifications/${new mongoose.Types.ObjectId()}`)
      .expect(404);

    expect(res.body.error).toBe("Notificación no encontrada");
  });

  it("devuelve 400 si el ID es inválido", async () => {
    const res = await request(app)
      .delete(`/notifications/invalid-id`)
      .expect(400);

    expect(res.body).toHaveProperty("error");
  });
});
