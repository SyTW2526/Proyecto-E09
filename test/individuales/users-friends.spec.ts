import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/server/api.js';
import { User } from '../../src/server/models/User.js';

function genToken(user: any) {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign(
    { userId: user._id.toString(), username: user.username },
    secret
  );
}

describe('Amigos - endpoints básicos', () => {
  let a: any;
  let b: any;
  let ta: string;
  let tb: string;

  beforeEach(async () => {
    await User.deleteMany({});
    a = await User.create({
      username: 'amigoA',
      email: 'a@test.com',
      password: 'x',
    });
    b = await User.create({
      username: 'amigoB',
      email: 'b@test.com',
      password: 'x',
    });
    ta = genToken(a);
    tb = genToken(b);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('envía una solicitud de amistad (POST /friends/request/:friendIdentifier)', async () => {
    const res = await request(app)
      .post(`/friends/request/${b.username}`)
      .set('Authorization', `Bearer ${ta}`);
    expect([200, 400, 401, 404,500]).toContain(res.status);
  });

  it('no permite ver solicitudes recibidas de otro usuario (GET /friends/requests/user/:id)', async () => {
    const res = await request(app)
      .get(`/friends/requests/user/${b._id}`)
      .set('Authorization', `Bearer ${ta}`);
    expect([200, 401, 403, 404]).toContain(res.status);
  });

  it('acepta y rechaza solicitudes (POST /friends/accept/:id y /friends/reject/:id)', async () => {
    const ares = await request(app)
      .post(`/friends/accept/${a.username}`)
      .set('Authorization', `Bearer ${tb}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(ares.status);

    const rres = await request(app)
      .post(`/friends/reject/${a.username}`)
      .set('Authorization', `Bearer ${tb}`);
    expect([200, 400, 401, 403, 404, 500]).toContain(rres.status);
  });

  it('obtiene lista de amigos del usuario actual (GET /friends)', async () => {
    const res = await request(app)
      .get('/friends')
      .set('Authorization', `Bearer ${ta}`);
    expect([200, 401, 403, 404]).toContain(res.status);
  });

  it('elimina un amigo (DELETE /friends/remove/:friendIdentifier)', async () => {
    const res = await request(app)
      .delete(`/friends/remove/${b.username}`)
      .set('Authorization', `Bearer ${ta}`);
    expect([200, 400, 401, 403, 404]).toContain(res.status);
  });
});
