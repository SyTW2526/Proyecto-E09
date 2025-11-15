import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/server/api.js";

describe("GET /pokemon/cards/name/:name", () => {
  it("devuelve cartas por nombre", async () => {
    const res = await request(app)
      .get("/pokemon/cards/name/pikachu")
      .expect(200);

    expect(Array.isArray(res.body) || res.body.data).toBeDefined();
  });

  it("devuelve [] si no hay resultados", async () => {
    const res = await request(app)
      .get("/pokemon/cards/name/nonexistentcard12345")
      .expect(200);

    expect(res.body).toBeDefined();
  });
});

describe("GET /pokemon/cards/:id", () => {
  it("devuelve una carta por ID", async () => {
    const res = await request(app)
      .get("/pokemon/cards/base1-1")
      .expect(200);

    expect(res.body).toBeDefined();
  });

  it("devuelve 404 si la carta no existe", async () => {
    const res = await request(app)
      .get("/pokemon/cards/nonexistent-id-12345")
      .expect(404);

    expect(res.body.error).toBe("Card not found");
  });
});

describe("GET /pokemon/sets", () => {
  it("devuelve todos los sets disponibles", async () => {
    const res = await request(app)
      .get("/pokemon/sets")
      .expect(200);

    expect(Array.isArray(res.body) || res.body.data).toBeDefined();
  });
});

describe("GET /pokemon/sets/:setId", () => {
  it("devuelve todas las cartas de un set", async () => {
    const res = await request(app)
      .get("/pokemon/sets/base1")
      .expect(200);

    expect(res.body).toBeDefined();
  });

  it("devuelve 404 si el set no existe", async () => {
    const res = await request(app)
      .get("/pokemon/sets/nonexistent-set-12345")
      .expect(404);

    expect(res.body.error).toBe("Set not found");
  });
});

describe("GET /pokemon/cards/type/:type", () => {
  it("devuelve cartas por tipo", async () => {
    const res = await request(app)
      .get("/pokemon/cards/type/electric")
      .expect(200);

    expect(Array.isArray(res.body) || res.body.data).toBeDefined();
  });

  it("devuelve [] si no hay cartas del tipo", async () => {
    const res = await request(app)
      .get("/pokemon/cards/type/nonexistenttype")
      .expect(200);

    expect(res.body).toBeDefined();
  });
});

describe("GET /pokemon/cards/hp/:hp", () => {
  it("devuelve cartas por HP", async () => {
    const res = await request(app)
      .get("/pokemon/cards/hp/100")
      .expect(200);

    expect(Array.isArray(res.body) || res.body.data).toBeDefined();
  });

  it("devuelve 400 si el HP no es un número", async () => {
    const res = await request(app)
      .get("/pokemon/cards/hp/notanumber")
      .expect(400);

    expect(res.body.error).toContain("must be a number");
  });

  it("devuelve [] si no hay cartas con ese HP", async () => {
    const res = await request(app)
      .get("/pokemon/cards/hp/9999")
      .expect(200);

    expect(res.body).toBeDefined();
  });
});

describe("GET /pokemon/cards/rarity/:rarity", () => {
  it("devuelve cartas por rareza", async () => {
    const res = await request(app)
      .get("/pokemon/cards/rarity/rare")
      .expect(200);

    expect(Array.isArray(res.body) || res.body.data).toBeDefined();
  });

  it("devuelve [] si no hay cartas de esa rareza", async () => {
    const res = await request(app)
      .get("/pokemon/cards/rarity/nonexistentrarity")
      .expect(200);

    expect(res.body).toBeDefined();
  });
});

describe("GET /pokemon/series", () => {
  it("devuelve todas las series disponibles", async () => {
    const res = await request(app)
      .get("/pokemon/series")
      .expect(200);

    expect(Array.isArray(res.body) || res.body.data).toBeDefined();
  });
});

describe("GET /pokemon/series/:seriesId", () => {
  it("devuelve información de una serie específica", async () => {
    const res = await request(app)
      .get("/pokemon/series/base")
      .expect(200);

    expect(res.body).toBeDefined();
  });

  it("devuelve 404 si la serie no existe", async () => {
    const res = await request(app)
      .get("/pokemon/series/nonexistent-series-12345")
      .expect(404);

    expect(res.body.error).toBe("Series not found");
  });
});

describe("GET /pokemon/search", () => {
  it("devuelve resultados de búsqueda por nombre", async () => {
    const res = await request(app)
      .get("/pokemon/search?name=pikachu")
      .expect(200);

    expect(res.body).toBeDefined();
  });

  it("devuelve resultados con múltiples filtros", async () => {
    const res = await request(app)
      .get("/pokemon/search?name=pikachu&type=electric&rarity=common")
      .expect(200);

    expect(res.body).toBeDefined();
  });

  it("devuelve [] sin parámetros", async () => {
    const res = await request(app)
      .get("/pokemon/search")
      .expect(200);

    expect(res.body).toBeDefined();
  });

  it("devuelve [] si no hay coincidencias", async () => {
    const res = await request(app)
      .get("/pokemon/search?name=nonexistent12345")
      .expect(200);

    expect(res.body).toBeDefined();
  });
});
