import { describe, it, beforeEach, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server/api';
import { User } from '../../src/server/models/User';

beforeEach(async () => {
  await User.deleteMany();
});
describe('GET /users', () => {
  it('devuelve la lista de usuarios paginada', async () => {
    await User.insertMany([
      { username: 'user1', email: 'user1@example.com', password: 'pass1' },
      { username: 'user2', email: 'user2@example.com', password: 'pass2' },
    ]);

    const res = await request(app).get('/users?page=1&limit=1');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(res.body.users.length).toBe(1);
    expect(res.body.totalResults).toBe(2);
    expect(res.body.page).toBe(1);
  });

  it('devuelve 404 si no hay usuarios', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /users/:identifier', () => {
  it('devuelve un usuario por username', async () => {
    await new User({ username: 'pepe', email: 'pepe@example.com', password: '123' }).save();
    const res = await request(app).get('/users/pepe');
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('pepe');
  });

  it('devuelve un usuario por id', async () => {
    const user = await new User({ username: 'pepa', email: 'pepa@example.com', password: '123' }).save();
    const res = await request(app).get(`/users/${user._id}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('pepa');
  });

  it('devuelve 404 si el usuario no existe', async () => {
    const res = await request(app).get('/users/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('POST /users', () => {
 it('crea un usuario válido', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        username: 'pepe',
        email: 'pepe@example.com',
        password: 'pikachu123',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.username).toBe('pepe');
    expect(res.body.email).toBe('pepe@example.com');
    const user = await User.findOne({ username: 'pepe' });
    expect(user).not.toBeNull();
    expect(user?.email).toBe('pepe@example.com');
  });

  it('falla sin username', async () => {
    const res = await request(app)
      .post('/users')
      .send({ email: 'pepe@example.com', password: '123' });
    expect(res.status).toBe(500);
  });

  it('falla sin email', async () => {
    const res = await request(app)
      .post('/users')
      .send({ username: 'pepe', password: '123' });
    expect(res.status).toBe(500);
  });

  it('falla sin password', async () => {
    const res = await request(app)
      .post('/users')
      .send({ username: 'pepe', email: 'pepe@example.com' });
    expect(res.status).toBe(500);
  });

  it('rechaza email inválido', async () => {
    const res = await request(app)
      .post('/users')
      .send({ username: 'pepe', email: 'invalid', password: '123' });
    expect(res.status).toBe(500);
  });

  it('rechaza username duplicado', async () => {
    await request(app).post('/users').send({ username: 'pepe', email: 'pepe@example.com', password: '123' });
    const res = await request(app).post('/users').send({ username: 'pepe', email: 'other@example.com', password: '123' });
    expect(res.status).toBe(500);
  });

  it('rechaza email duplicado', async () => {
    await request(app).post('/users').send({ username: 'pepe', email: 'pepe@example.com', password: '123' });
    const res = await request(app).post('/users').send({ username: 'pepa', email: 'pepe@example.com', password: '123' });
    expect(res.status).toBe(500);
  });
});

describe('GET /users', () => {
  it('devuelve lista paginada', async () => {
    await User.insertMany([
      { username: 'u1', email: 'u1@example.com', password: '1' },
      { username: 'u2', email: 'u2@example.com', password: '2' }
    ]);
    const res = await request(app).get('/users?page=1&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBe(1);
    expect(res.body.totalResults).toBe(2);
  });

  it('devuelve 404 si no hay usuarios', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(404);
  });
});

describe('GET /users/:identifier', () => {
  it('por username', async () => {
    await new User({ username: 'pepe', email: 'pepe@example.com', password: '123' }).save();
    const res = await request(app).get('/users/pepe');
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('pepe');
  });

  it('por id', async () => {
    const user = await new User({ username: 'pepa', email: 'pepa@example.com', password: '123' }).save();
    const res = await request(app).get(`/users/${user._id}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('pepa');
  });

  it('no encontrado', async () => {
    const res = await request(app).get('/users/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /users/:identifier', () => {
  it('actualiza usuario por id', async () => {
    const user = await new User({ username: 'pepe', email: 'pepe@example.com', password: '123' }).save();
    const res = await request(app)
      .patch(`/users/${user._id}`)
      .send({ username: 'red' });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('red');
  });

  it('actualiza usuario por username', async () => {
    await new User({ username: 'brock', email: 'brock@example.com', password: '123' }).save();
    const res = await request(app)
      .patch('/users/brock')
      .send({ email: 'new@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('new@example.com');
  });

  it('rechaza campos no permitidos', async () => {
    const user = await new User({ username: 'gary', email: 'gary@example.com', password: '123' }).save();
    const res = await request(app)
      .patch(`/users/${user._id}`)
      .send({ invalidField: 'x' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /users/:identifier', () => {
  it('elimina por id', async () => {
    const user = await new User({ username: 'del', email: 'del@example.com', password: '123' }).save();
    const res = await request(app).delete(`/users/${user._id}`);
    expect(res.status).toBe(200);
  });

  it('elimina por username', async () => {
    await new User({ username: 'remove', email: 'remove@example.com', password: '123' }).save();
    const res = await request(app).delete('/users/remove');
    expect(res.status).toBe(200);
  });

  it('devuelve 404 si no existe', async () => {
    const res = await request(app).delete('/users/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('POST /users/:identifier/friends/:friendIdentifier', () => {
  it('agrega amigo', async () => {
    const u1 = await new User({ username: 'pepe', email: 'pepe@example.com', password: '123' }).save();
    const u2 = await new User({ username: 'pepa', email: 'pepa@example.com', password: '123' }).save();
    const res = await request(app).post(`/users/${u1.username}/friends/${u2.username}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Amigo agregado');
  });

  it('falla si no existe', async () => {
    const u1 = await new User({ username: 'pepe', email: 'pepe@example.com', password: '123' }).save();
    const res = await request(app).post(`/users/${u1.username}/friends/ghost`);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /users/:identifier/friends/:friendIdentifier', () => {
  it('elimina amigo', async () => {
    const u1 = await new User({ username: 'pepe', email: 'pepe@example.com', password: '123' }).save();
    const u2 = await new User({ username: 'pepa', email: 'pepa@example.com', password: '123' }).save();
    u1.friends.push(u2._id);
    await u1.save();
    const res = await request(app).delete(`/users/${u1.username}/friends/${u2.username}`);
    expect(res.status).toBe(200);
  });
});

describe('POST /users/:identifier/block/:blockedIdentifier', () => {
  it('bloquea usuario', async () => {
    const u1 = await new User({ username: 'pepe', email: 'pepe@example.com', password: '123' }).save();
    const u2 = await new User({ username: 'teamrocket', email: 'rocket@example.com', password: '123' }).save();
    const res = await request(app).post(`/users/${u1.username}/block/${u2.username}`);
    expect(res.status).toBe(200);
  });

  it('falla si no existe', async () => {
    const u1 = await new User({ username: 'pepe', email: 'pepe@example.com', password: '123' }).save();
    const res = await request(app).post(`/users/${u1.username}/block/nonexistent`);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /users/:identifier/block/:blockedIdentifier', () => {
  it('desbloquea usuario', async () => {
    const u1 = await new User({ username: 'pepe', email: 'pepe@example.com', password: '123' }).save();
    const u2 = await new User({ username: 'teamrocket', email: 'rocket@example.com', password: '123' }).save();
    u1.blockedUsers.push(u2._id);
    await u1.save();
    const res = await request(app).delete(`/users/${u1.username}/block/${u2.username}`);
    expect(res.status).toBe(200);
  });
});
