import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/server/api.js";

// describe("POST /sync/cards", () => {
//   it("sincroniza las cartas correctamente", async () => {
//     const res = await request(app)
//       .post("/sync/cards")
//       .expect(200);
//
//     expect(res.body).toHaveProperty("message");
//     expect(res.body).toHaveProperty("total");
//     expect(res.body.message).toContain("Sincronización");
//   });
//
//   it("retorna el total de cartas sincronizadas", async () => {
//     const res = await request(app)
//       .post("/sync/cards")
//       .expect(200);
//
//     expect(typeof res.body.total).toBe("number");
//     expect(res.body.total).toBeGreaterThanOrEqual(0);
//   });
//
//   it("devuelve 500 si hay error", async () => {
//     // Este test podría fallar si el servicio externo está disponible
//     // pero es importante tener un caso para manejar errores
//     const res = await request(app).post("/sync/cards");
//
//     if (res.status === 500) {
//       expect(res.body).toHaveProperty("error");
//       expect(res.body).toHaveProperty("details");
//     } else {
//       expect(res.status).toBe(200);
//     }
//   });
// });
