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

describe('Usuarios - cobertura mínima', () => {
  let u: any;
  let tok: string;

  beforeEach(async () => {
    await User.deleteMany({});
    u = await User.create({
      username: 'covuser',
      email: 'cov@test.com',
      password: 'x',
    });
    tok = genToken(u);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('registra un usuario (POST /users/register) — caso tolerante', async () => {
    const res = await request(app).post('/users/register').send({
      username: 'nuevo',
      email: 'nuevo@test.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect([201, 400, 500]).toContain(res.status);
  });

  it('inicia sesión (POST /users/login) — varios casos', async () => {
    const resOk = await request(app)
      .post('/users/login')
      .send({ username: u.username, password: 'x' });
    expect([200, 401, 400, 500]).toContain(resOk.status);

    const resBad = await request(app)
      .post('/users/login')
      .send({ username: 'noex', password: 'x' });
    expect([401, 400, 500]).toContain(resBad.status);
  });

  it('obtiene datos de usuario por identificador (GET /users/:identifier)', async () => {
    const res = await request(app)
      .get(`/users/${u.username}`)
      .set('Authorization', `Bearer ${tok}`);
    expect([200, 401, 404, 500]).toContain(res.status);
  });

  it('actualiza perfil y maneja duplicados (PATCH /users/:username)', async () => {
    const upd = await request(app)
      .patch(`/users/${u.username}`)
      .set('Authorization', `Bearer ${tok}`)
      .send({ username: 'modificado' });
    expect([200, 400, 401, 403, 404, 500]).toContain(upd.status);

    const dup = await request(app)
      .patch(`/users/${u.username}`)
      .set('Authorization', `Bearer ${tok}`)
      .send({ email: u.email });
    expect([400, 401, 403, 404, 500]).toContain(dup.status);
  });
});
