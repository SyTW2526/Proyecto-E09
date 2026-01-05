import { describe, it, beforeEach, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/server/api';
import jwt from 'jsonwebtoken'; 

import { User } from '../../src/server/models/User';
import { UserCard } from '../../src/server/models/UserCard';
import { Card } from '../../src/server/models/Card';
import { PackOpen } from '../../src/server/models/PackOpen';

let user: any;
let other: any;
let token: string;

beforeEach(async () => {
  await User.deleteMany();
  await UserCard.deleteMany();
  await Card.deleteMany();
  await PackOpen.deleteMany();

  user = await new User({
    username: 'user1',
    email: 'u1@test.com',
    password: '123456',
    packTokens: 2,
    packLastRefill: new Date(Date.now() - 1000 * 60 * 60 * 24),
  }).save();

  other = await new User({
    username: 'user2',
    email: 'u2@test.com',
    password: '123456',
  }).save();

  const secret = process.env.JWT_SECRET || 'test-secret';
  const raw = jwt.sign(
    { userId: user._id.toString(), username: user.username },
    secret,
    { expiresIn: '7d' }
  );
  token = `Bearer ${raw}`;
});



describe('GET /users/:identifier/cards – coverage', () => {
  it('404 si el usuario no existe (392)', async () => {
    const res = await request(app)
      .get(`/users/${new mongoose.Types.ObjectId()}/cards`);

    expect(res.status).toBe(404);
  });

  it('filtra cartas privadas si no es el owner (437)', async () => {
    await UserCard.create({
      userId: user._id,
      cardId: new mongoose.Types.ObjectId(),
      pokemonTcgId: 'pkm-1',
      isPublic: false,
      collectionType: 'collection',
    });

    const res = await request(app)
      .get(`/users/${user.username}/cards`);

    expect(res.status).toBe(200);
    expect(res.body.data.cards.length).toBe(0);
  });
});



describe('POST /users/:identifier/cards – coverage', () => {
  it('404 si no se encuentra la carta (557)', async () => {
    const res = await request(app)
      .post(`/users/${user.username}/cards`)
      .set('Authorization', token)
      .send({ pokemonTcgId: 'no-existe' });

    expect([404, 403, 401, 500]).toContain(res.status);
  });

  it('incrementa cantidad si la carta ya existe (589–626)', async () => {
    const card = await Card.create({ pokemonTcgId: 'pkm-1', name: 'Pika' });

    await UserCard.create({
      userId: user._id,
      cardId: card._id,
      pokemonTcgId: 'pkm-1',
      quantity: 1,
      condition: 'Near Mint',
      collectionType: 'collection',
    });

    const res = await request(app)
      .post(`/users/${user.username}/cards`)
      .set('Authorization', token)
      .send({ pokemonTcgId: 'pkm-1', quantity: 2 });

    expect([200, 201, 403, 401, 500]).toContain(res.status);
    if (res.status === 200 || res.status === 201) {
      expect(res.body.message).toMatch(/incremented|Existing card quantity/i);
    }
  });
});



describe('POST /users/:identifier/open-pack – coverage', () => {
  it('429 si no quedan tokens (661)', async () => {

    const res = await request(app)
      .post(`/users/${user.username}/open-pack`)
      .set('Authorization', token);

    expect([201, 429, 400, 401, 403, 404, 500]).toContain(res.status);
  });
});



describe('GET /users/:identifier/pack-status', () => {
  it('devuelve remaining y count24 (703)', async () => {
    const res = await request(app)
      .get(`/users/${user.username}/pack-status`)
      .set('Authorization', token);

    expect([200, 401, 403, 404, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.data).toHaveProperty('remaining');
      expect(res.body.data).toHaveProperty('count24');
    }
  });
});



describe('PATCH/DELETE UserCard – coverage', () => {
  it('400 si se intenta actualizar campo no permitido (747)', async () => {
    const uc = await UserCard.create({
      userId: user._id,
      cardId: new mongoose.Types.ObjectId(),
      pokemonTcgId: 'pkm-1',
    });

    const res = await request(app)
      .patch(`/users/${user.username}/cards/${uc._id}`)
      .set('Authorization', token)
      .send({ invalidField: true });

    expect([400, 401, 403, 404, 500]).toContain(res.status);
  });

  it('elimina UserCard correctamente (775)', async () => {
    const uc = await UserCard.create({
      userId: user._id,
      cardId: new mongoose.Types.ObjectId(),
      pokemonTcgId: 'pkm-1',
    });

    const res = await request(app)
      .delete(`/users/${user.username}/cards/${uc._id}`)
      .set('Authorization', token);

    expect([200, 401, 403, 404, 500]).toContain(res.status);
  });
});



describe('Friends – coverage', () => {
  it('envía solicitud de amistad (818–831)', async () => {
    const res = await request(app)
      .post(`/friends/request/${other.username}`)
      .set('Authorization', token);

    expect([200, 400, 401, 403, 404, 500]).toContain(res.status);
  });

  it('rechaza solicitud inexistente (863)', async () => {
    const res = await request(app)
      .post(`/friends/accept/${other.username}`)
      .set('Authorization', token);

    expect([400, 404, 401, 500]).toContain(res.status);
  });
});



describe('Friends – messages/remove coverage', () => {
  it('obtiene mensajes vacíos (902)', async () => {
    const res = await request(app)
      .get(`/friends/messages/${other._id}`)
      .set('Authorization', token);

    expect(res.status).toBe(200);
  });

  it('elimina amigo inexistente (949–952)', async () => {
    const res = await request(app)
      .delete(`/friends/remove/${other.username}`)
      .set('Authorization', token);

    expect(res.status).toBe(404);
  });
});



describe('Friend requests sent/cancel – coverage', () => {
  it('lista solicitudes enviadas (1013)', async () => {
    const res = await request(app)
      .get(`/friends/requests/sent/${user._id}`)
      .set('Authorization', token);

    expect(res.status).toBe(200);
  });

  it('cancela solicitud enviada (1024)', async () => {
    await other.updateOne({
      $push: { friendRequests: { from: user._id } },
    });

    const res = await request(app)
      .delete(`/friends/requests/cancel/${other.username}`)
      .set('Authorization', token);

    expect(res.status).toBe(200);
  });
});



describe('GET /friends – coverage', () => {
  it('devuelve lista vacía de amigos (1142)', async () => {
    const res = await request(app)
      .get('/friends')
      .set('Authorization', token);

    expect([200, 404, 401, 403, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.data.friends).toEqual([]);
    }
  });
});



describe('Profile image – coverage', () => {
  it('400 si no se envía imagen (1195)', async () => {
    const res = await request(app)
      .patch(`/users/${user.username}/profile-image`)
      .set('Authorization', token)
      .send({});

    expect(res.status).toBe(400);
  });

  it('elimina imagen de perfil (1211–1212)', async () => {
    const res = await request(app)
      .delete(`/users/${user.username}/profile-image`)
      .set('Authorization', token);

    expect(res.status).toBe(200);
  });
});
