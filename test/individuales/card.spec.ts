import { describe, it, beforeEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../src/server/api.js";
import { Card } from "../../src/server/models/Card.js";

beforeEach(async () => {
  await Card.deleteMany();
});
beforeEach(async () => {
  await Card.deleteMany();
});

describe('GET /cards', () => {
  it('devuelve la lista paginada de cartas', async () => {
    await Card.insertMany([
      {
        pokemonTcgId: 'base1-1',
        name: 'Pikachu',
        rarity: 'Common',
        series: 'Base',
        set: 'Base Set',
        types: ['Electric'],
      },
      {
        pokemonTcgId: 'base1-2',
        name: 'Charizard',
        rarity: 'Rare',
        series: 'Base',
        set: 'Base Set',
        types: ['Fire'],
      },
    ]);

    const res = await request(app).get('/cards?page=1&limit=1').expect(200);

    expect(Array.isArray(res.body.cards)).toBe(true);
    expect(res.body.cards.length).toBe(1);
    expect(res.body.totalResults).toBe(2);
    expect(res.body.page).toBe(1);
  });

  it('aplica correctamente los filtros', async () => {
    await Card.insertMany([
      {
        pokemonTcgId: 'base1-3',
        name: 'Bulbasaur',
        rarity: 'Common',
        series: 'Base',
        set: 'Grass Set',
        types: ['Grass'],
      },
      {
        pokemonTcgId: 'base1-4',
        name: 'Ivysaur',
        rarity: 'Uncommon',
        series: 'Base',
        set: 'Grass Set',
        types: ['Grass'],
      },
      {
        pokemonTcgId: 'base1-5',
        name: 'Charmander',
        rarity: 'Common',
        series: 'Base',
        set: 'Fire Set',
        types: ['Fire'],
      },
    ]);

    const res = await request(app)
      .get('/cards?name=Bulb&rarity=Common&series=Base&set=Grass%20Set&type=Grass')
      .expect(200);

    expect(res.body.cards.length).toBe(1);
    expect(res.body.cards[0].name).toBe('Bulbasaur');
    expect(res.body.cards[0].rarity).toBe('Common');
    expect(res.body.cards[0].series).toBe('Base');
  });

  it('devuelve [] si no hay resultados', async () => {
    const res = await request(app).get('/cards?rarity=Mythical').expect(200);

    expect(Array.isArray(res.body.cards)).toBe(true);
    expect(res.body.cards.length).toBe(0);
    expect(res.body.totalResults).toBe(0);
  });
});

describe('GET /cards/:id', () => {
  it('devuelve una carta por _id', async () => {
    const card = await Card.create({
      pokemonTcgId: 'base1-7',
      name: 'Squirtle',
      rarity: 'Common',
      series: 'Base',
      set: 'Water Set',
      types: ['Water'],
    });

    const res = await request(app).get(`/cards/${card._id}`).expect(200);

    expect(res.body.name).toBe('Squirtle');
    expect(res.body._id).toBe(String(card._id));
  });

  it('devuelve 404 si no se encuentra la carta', async () => {
    const res = await request(app)
      .get(`/cards/${new mongoose.Types.ObjectId()}`)
      .expect(404);

    expect(res.body.error).toBe('Carta no encontrada');
  });
});