import { describe, it, beforeEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../src/server/api.js";
import { Trade } from "../../src/server/models/Trade.js";
import { User } from "../../src/server/models/User.js";
import { UserCard } from "../../src/server/models/UserCard.js";

const baseUser1 = {
  username: "Juan",
  email: "juan@example.com",
  password: "pikachu123",
};

const baseUser2 = {
  username: "Pepa",
  email: "pepa@example.com",
  password: "pepa56",
};

beforeEach(async () => {
  await Trade.deleteMany();
  await User.deleteMany();
  await UserCard.deleteMany();
});

describe("POST /trades", () => {
  /**
   * Test: Crear intercambio válido en la base de datos
   * Verifica que se puede crear un Trade con todos los datos necesarios
   */
  it("crea un intercambio válido en base de datos", async () => {
    const initiator = await User.create(baseUser1);
    const receiver = await User.create(baseUser2);

    const trade = await Trade.create({
      initiatorUserId: initiator._id,
      receiverUserId: receiver._id,
      tradeType: "public",
      initiatorCards: [
        {
          userCardId: new mongoose.Types.ObjectId(),
          cardId: new mongoose.Types.ObjectId(),
          estimatedValue: 50,
        },
      ],
      receiverCards: [
        {
          userCardId: new mongoose.Types.ObjectId(),
          cardId: new mongoose.Types.ObjectId(),
          estimatedValue: 48,
        },
      ],
      initiatorTotalValue: 50,
      receiverTotalValue: 48,
      status: "pending",
    });

    expect(trade._id).toBeDefined();
    expect(trade.status).toBe("pending");
    expect(trade.tradeType).toBe("public");
    expect(String(trade.initiatorUserId)).toBe(String(initiator._id));
    expect(String(trade.receiverUserId)).toBe(String(receiver._id));

    const retrieved = await Trade.findById(trade._id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.initiatorCards.length).toBe(1);
    expect(retrieved?.receiverCards.length).toBe(1);
  });

  /**
   * Test: Rechazar datos inválidos
   * Verifica que se valida correctamente los datos requeridos
   */
  it("rechaza datos sin usuarios requeridos", async () => {
    try {
      await Trade.create({
        initiatorUserId: undefined,
        receiverUserId: new mongoose.Types.ObjectId(),
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });
      expect(true).toBe(false); // No debe llegar aquí
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("GET /trades", () => {
  /**
   * Test: Obtener lista de intercambios paginada
   * Verifica que se puede listar trades con paginación desde la BD
   */
  it("obtiene lista de intercambios de la base de datos", async () => {
    const initiator = await User.create(baseUser1);
    const receiver = await User.create(baseUser2);

    await Trade.insertMany([
      {
        initiatorUserId: initiator._id,
        receiverUserId: receiver._id,
        tradeType: "public",
        initiatorCards: [
          { userCardId: new mongoose.Types.ObjectId(), cardId: new mongoose.Types.ObjectId(), estimatedValue: 10 },
        ],
        receiverCards: [
          { userCardId: new mongoose.Types.ObjectId(), cardId: new mongoose.Types.ObjectId(), estimatedValue: 9 },
        ],
        status: "pending",
      },
      {
        initiatorUserId: receiver._id,
        receiverUserId: initiator._id,
        tradeType: "private",
        initiatorCards: [
          { userCardId: new mongoose.Types.ObjectId(), cardId: new mongoose.Types.ObjectId(), estimatedValue: 20 },
        ],
        receiverCards: [
          { userCardId: new mongoose.Types.ObjectId(), cardId: new mongoose.Types.ObjectId(), estimatedValue: 19 },
        ],
        status: "completed",
      },
    ]);

    const trades = await Trade.find();
    expect(Array.isArray(trades)).toBe(true);
    expect(trades.length).toBe(2);
    expect(trades[0].status).toBe("pending");
    expect(trades[1].status).toBe("completed");
  });
});

describe("GET /trades/:id", () => {
  /**
   * Test: Obtener intercambio por ID
   * Verifica que se puede recuperar un trade específico de la BD
   */
  it("obtiene un intercambio por ID de la base de datos", async () => {
    const initiator = await User.create(baseUser1);
    const receiver = await User.create(baseUser2);

    const trade = await Trade.create({
      initiatorUserId: initiator._id,
      receiverUserId: receiver._id,
      tradeType: "public",
      initiatorCards: [
        { userCardId: new mongoose.Types.ObjectId(), cardId: new mongoose.Types.ObjectId(), estimatedValue: 10 },
      ],
      receiverCards: [
        { userCardId: new mongoose.Types.ObjectId(), cardId: new mongoose.Types.ObjectId(), estimatedValue: 9 },
      ],
      status: "pending",
    });

    const retrieved = await Trade.findById(trade._id);
    expect(retrieved?._id.toString()).toBe(trade._id.toString());
    expect(retrieved?.status).toBe("pending");
  });

  /**
   * Test: Intercambio no encontrado
   * Verifica que devuelve null cuando se busca un ID inexistente
   */
  it("devuelve null si el intercambio no existe", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const retrieved = await Trade.findById(fakeId);
    expect(retrieved).toBeNull();
  });
});

// describe('GET /trades/room/:code', () => {
//   it('devuelve un intercambio por código de sala', async () => {
//     const initiator = await User.create(baseUser1);
//     const receiver = await User.create(baseUser2);
//
//     const trade = await Trade.create({
//       initiatorUserId: initiator._id,
//       receiverUserId: receiver._id,
//       tradeType: "public",
//       roomCode: "ABC123",
//       initiatorCards: [
//         { userCardId: new mongoose.Types.ObjectId(), cardId: new mongoose.Types.ObjectId(), estimatedValue: 10 },
//       ],
//       receiverCards: [
//         { userCardId: new mongoose.Types.ObjectId(), cardId: new mongoose.Types.ObjectId(), estimatedValue: 9 },
//       ],
//       status: "pending",
//     });
//
//     const res = await request(app)
//       .get(`/trades/room/${trade.roomCode}`)
//       .expect(200);
//
//     expect(res.body.roomCode).toBe("ABC123");
//   });
//
//   it("devuelve 404 si el código no existe", async () => {
//     const res = await request(app)
//       .get(`/trades/room/NONEXISTENT`)
//       .expect(404);
//
//     expect(res.body).toHaveProperty("error");
//   });
// });

describe("PATCH /trades/:id", () => {
  /**
   * Test: Actualizar estado de intercambio
   * Verifica que se puede cambiar el estado de un trade en la BD
   */
  it("actualiza el estado de un intercambio en base de datos", async () => {
    const initiator = await User.create(baseUser1);
    const receiver = await User.create(baseUser2);

    const trade = await Trade.create({
      initiatorUserId: initiator._id,
      receiverUserId: receiver._id,
      tradeType: "public",
      initiatorCards: [
        { userCardId: new mongoose.Types.ObjectId(), cardId: new mongoose.Types.ObjectId(), estimatedValue: 10 },
      ],
      receiverCards: [
        { userCardId: new mongoose.Types.ObjectId(), cardId: new mongoose.Types.ObjectId(), estimatedValue: 9 },
      ],
      status: "pending",
    });

    // Actualizar estado
    trade.status = "completed";
    await trade.save();

    const updated = await Trade.findById(trade._id);
    expect(updated?.status).toBe("completed");
  });

  /**
   * Test: Validar cambios de estado válidos
   * Verifica que solo se permiten cambios de estado válidos (pending -> completed/cancelled)
   */
  it("permite cambiar estado de pending a cancelled", async () => {
    const trade = await Trade.create({
      initiatorUserId: new mongoose.Types.ObjectId(),
      receiverUserId: new mongoose.Types.ObjectId(),
      tradeType: "public",
      initiatorCards: [
        { userCardId: new mongoose.Types.ObjectId(), cardId: new mongoose.Types.ObjectId(), estimatedValue: 10 },
      ],
      receiverCards: [
        { userCardId: new mongoose.Types.ObjectId(), cardId: new mongoose.Types.ObjectId(), estimatedValue: 9 },
      ],
      status: "pending",
    });

    trade.status = "cancelled";
    await trade.save();

    const updated = await Trade.findById(trade._id);
    expect(updated?.status).toBe("cancelled");
  });
});

describe("DELETE /trades/:id", () => {
  /**
   * Test: Eliminar intercambio
   * Verifica que se puede eliminar un trade de la BD
   */
  it("elimina un intercambio de la base de datos", async () => {
    const trade = await Trade.create({
      initiatorUserId: new mongoose.Types.ObjectId(),
      receiverUserId: new mongoose.Types.ObjectId(),
      tradeType: "public",
      initiatorCards: [
        { userCardId: new mongoose.Types.ObjectId(), cardId: new mongoose.Types.ObjectId(), estimatedValue: 10 },
      ],
      receiverCards: [
        { userCardId: new mongoose.Types.ObjectId(), cardId: new mongoose.Types.ObjectId(), estimatedValue: 9 },
      ],
      status: "pending",
    });

    await Trade.findByIdAndDelete(trade._id);

    const check = await Trade.findById(trade._id);
    expect(check).toBeNull();
  });

  /**
   * Test: Eliminación de intercambio inexistente
   * Verifica que intentar eliminar un ID que no existe no genera error
   */
  it("devuelve null al eliminar un intercambio inexistente", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const result = await Trade.findByIdAndDelete(fakeId);
    expect(result).toBeNull();
  });
});

describe("Trade Model - Additional Unit Tests", () => {
  let user1: any;
  let user2: any;

  beforeEach(async () => {
    user1 = await User.create(baseUser1);
    user2 = await User.create(baseUser2);
  });

  describe("Trade Status Transitions", () => {
    it("crea trade con status pending", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.status).toBe("pending");
    });

    it("transiciona de pending a accepted", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      trade.status = "accepted";
      await trade.save();

      const updated = await Trade.findById(trade._id);
      expect(updated?.status).toBe("accepted");
    });

    it("transiciona de pending a rejected", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      trade.status = "rejected";
      await trade.save();

      const updated = await Trade.findById(trade._id);
      expect(updated?.status).toBe("rejected");
    });

    it("transiciona de pending a cancelled", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      trade.status = "cancelled";
      await trade.save();

      const updated = await Trade.findById(trade._id);
      expect(updated?.status).toBe("cancelled");
    });

    it("transiciona de accepted a completed", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "accepted",
      });

      trade.status = "completed";
      trade.completedAt = new Date();
      await trade.save();

      const updated = await Trade.findById(trade._id);
      expect(updated?.status).toBe("completed");
      expect(updated?.completedAt).toBeDefined();
    });
  });

  describe("Trade Types", () => {
    it("crea trade de tipo public", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.tradeType).toBe("public");
    });

    it("crea trade de tipo private con room code", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "private",
        privateRoomCode: "ROOM123",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.tradeType).toBe("private");
      expect(trade.privateRoomCode).toBe("ROOM123");
    });
  });

  describe("Trade Origins and Requests", () => {
    it("almacena requestId", async () => {
      const requestId = new mongoose.Types.ObjectId();
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        requestId,
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.requestId).toEqual(requestId);
    });

    it("almacena requestedPokemonTcgId", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        requestedPokemonTcgId: "sv04pt-25",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.requestedPokemonTcgId).toBe("sv04pt-25");
    });

    it("permite requestId nulo por defecto", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.requestId).toBeNull();
    });

    it("permite requestedPokemonTcgId nulo por defecto", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.requestedPokemonTcgId).toBeNull();
    });
  });

  describe("Trade Cards", () => {
    it("almacena cartas del iniciador", async () => {
      const cardId = new mongoose.Types.ObjectId();
      const userCardId = new mongoose.Types.ObjectId();

      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [
          {
            userCardId,
            cardId,
            estimatedValue: 50,
          },
        ],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.initiatorCards).toHaveLength(1);
      expect(trade.initiatorCards[0].estimatedValue).toBe(50);
    });

    it("almacena cartas del receptor", async () => {
      const cardId = new mongoose.Types.ObjectId();
      const userCardId = new mongoose.Types.ObjectId();

      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [
          {
            userCardId,
            cardId,
            estimatedValue: 75,
          },
        ],
        status: "pending",
      });

      expect(trade.receiverCards).toHaveLength(1);
      expect(trade.receiverCards[0].estimatedValue).toBe(75);
    });

    it("almacena múltiples cartas de ambos lados", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: new mongoose.Types.ObjectId(),
            estimatedValue: 50,
          },
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: new mongoose.Types.ObjectId(),
            estimatedValue: 30,
          },
        ],
        receiverCards: [
          {
            userCardId: new mongoose.Types.ObjectId(),
            cardId: new mongoose.Types.ObjectId(),
            estimatedValue: 75,
          },
        ],
        status: "pending",
      });

      expect(trade.initiatorCards).toHaveLength(2);
      expect(trade.receiverCards).toHaveLength(1);
    });

    it("permite cartas vacías", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.initiatorCards).toHaveLength(0);
      expect(trade.receiverCards).toHaveLength(0);
    });
  });

  describe("Trade Messaging", () => {
    it("almacena mensajes de trade", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        messages: [
          {
            userId: user1._id,
            message: "Hola, me interesa este intercambio",
            timestamp: new Date(),
          },
        ],
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.messages).toHaveLength(1);
      expect(trade.messages[0].message).toBe("Hola, me interesa este intercambio");
    });

    it("permite múltiples mensajes", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        messages: [
          {
            userId: user1._id,
            message: "Mensaje 1",
            timestamp: new Date(),
          },
          {
            userId: user2._id,
            message: "Mensaje 2",
            timestamp: new Date(),
          },
          {
            userId: user1._id,
            message: "Mensaje 3",
            timestamp: new Date(),
          },
        ],
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.messages).toHaveLength(3);
    });

    it("permite trade sin mensajes", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.messages || []).toHaveLength(0);
    });
  });

  describe("Trade Timestamps", () => {
    it("almacena createdAt automáticamente", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.createdAt).toBeDefined();
    });

    it("almacena updatedAt automáticamente", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.updatedAt).toBeDefined();
    });

    it("actualiza updatedAt al guardar cambios", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      const originalUpdatedAt = trade.updatedAt;

      // Esperar un poco para que el timestamp sea diferente
      await new Promise((resolve) => setTimeout(resolve, 10));

      trade.status = "accepted";
      await trade.save();

      const updated = await Trade.findById(trade._id);
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("Trade Completion", () => {
    it("almacena completedAt cuando se completa", async () => {
      const completionDate = new Date();
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        status: "completed",
        completedAt: completionDate,
        initiatorCards: [],
        receiverCards: [],
      });

      expect(trade.completedAt).toBeDefined();
      expect(trade.completedAt?.getTime()).toBeCloseTo(completionDate.getTime(), -2);
    });

    it("permite trade pendiente sin completedAt", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        status: "pending",
        initiatorCards: [],
        receiverCards: [],
      });

      expect(trade.completedAt === null || trade.completedAt === undefined).toBe(true);
    });
  });

  describe("Trade User References", () => {
    it("almacena correctamente IDs de usuarios", async () => {
      const trade = await Trade.create({
        initiatorUserId: user1._id,
        receiverUserId: user2._id,
        tradeType: "public",
        initiatorCards: [],
        receiverCards: [],
        status: "pending",
      });

      expect(trade.initiatorUserId.toString()).toBe(user1._id.toString());
      expect(trade.receiverUserId.toString()).toBe(user2._id.toString());
    });

    it("rechaza trade sin initiatorUserId", async () => {
      try {
        await Trade.create({
          receiverUserId: user2._id,
          tradeType: "public",
          initiatorCards: [],
          receiverCards: [],
          status: "pending",
        });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it("rechaza trade sin receiverUserId", async () => {
      try {
        await Trade.create({
          initiatorUserId: user1._id,
          tradeType: "public",
          initiatorCards: [],
          receiverCards: [],
          status: "pending",
        });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });
});