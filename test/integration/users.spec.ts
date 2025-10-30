// Test de integración de la API - Endpoints de usuarios
// Este archivo prueba los endpoints HTTP usando supertest

import request from 'supertest';
import { app } from '../../src/api';
import { connectDB, disconnectDB, clearDB } from '../db-handler';

// Función principal que ejecuta todos los tests de la API
async function runAPITests() {
  console.log('\nEjecutando tests de la API de usuarios...\n');
  
  try {
    // Conectar a la base de datos de prueba
    await connectDB();
    
    // Test 1: POST /users - Crear usuario válido
    await testCreateUser();
    
    // Test 2: POST /users - Aplicar valores por defecto
    await testDefaultValues();
    
    // Test 3: POST /users - Convertir email a minúsculas
    await testEmailLowercase();
    
    // Test 4: POST /users - Fallo sin username
    await testFailWithoutUsername();
    
    // Test 5: POST /users - Fallo sin email
    await testFailWithoutEmail();
    
    // Test 6: POST /users - Fallo sin password
    await testFailWithoutPassword();
    
    // Test 7: POST /users - Fallo con email inválido
    await testInvalidEmail();
    
    // Test 8: POST /users - Fallo con username duplicado
    await testDuplicateUsername();
    
    // Test 9: POST /users - Fallo con email duplicado
    await testDuplicateEmail();
    
    // Test 10: Rutas no definidas devuelven 501
    await testUndefinedRoutes();
    
    console.log('\nTodos los tests de la API pasaron correctamente\n');
    
  } catch (error) {
    console.error('\nError en los tests:', error);
    process.exit(1);
  } finally {
    // Desconectar de la base de datos
    await disconnectDB();
  }
}

// Test 1: Crear usuario válido
// Verifica que POST /users crea un usuario y devuelve status 201
async function testCreateUser() {
  await clearDB();
  console.log('Test 1: POST /users - Crear usuario válido');
  
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  const response = await request(app)
    .post('/users')
    .send(userData);

  if (response.status !== 201) {
    throw new Error(`Esperaba status 201, recibió ${response.status}`);
  }
  if (!response.body._id) {
    throw new Error('Respuesta no contiene _id');
  }
  if (response.body.username !== userData.username) {
    throw new Error('Username no coincide');
  }
  if (response.body.email !== userData.email) {
    throw new Error('Email no coincide');
  }
  if (!response.body.createdAt) {
    throw new Error('Respuesta no contiene createdAt');
  }

  console.log('   OK Usuario creado correctamente (status 201)');
}

// Test 2: Valores por defecto
// Verifica que los campos opcionales tengan sus valores por defecto
async function testDefaultValues() {
  await clearDB();
  console.log('Test 2: POST /users - Valores por defecto');
  
  const response = await request(app)
    .post('/users')
    .send({
      username: 'defaultuser',
      email: 'default@example.com',
      password: 'password123'
    });

  if (response.status !== 201) {
    throw new Error(`Esperaba status 201, recibió ${response.status}`);
  }
  if (response.body.profileImage !== '') {
    throw new Error('profileImage no es cadena vacía');
  }
  if (response.body.settings.language !== 'es') {
    throw new Error('language no es "es"');
  }
  if (response.body.settings.notifications.trades !== true) {
    throw new Error('notifications.trades no es true');
  }

  console.log('   OK Valores por defecto aplicados correctamente');
}

// Test 3: Email a minúsculas
// Verifica que el email se convierta automáticamente a minúsculas
async function testEmailLowercase() {
  await clearDB();
  console.log('Test 3: POST /users - Email convertido a minúsculas');
  
  const response = await request(app)
    .post('/users')
    .send({
      username: 'lowercasetest',
      email: 'TEST@EXAMPLE.COM',
      password: 'password123'
    });

  if (response.status !== 201) {
    throw new Error(`Esperaba status 201, recibió ${response.status}`);
  }
  if (response.body.email !== 'test@example.com') {
    throw new Error('Email no convertido a minúsculas');
  }

  console.log('   OK Email convertido a minúsculas correctamente');
}

// Test 4: Fallo sin username
// Verifica que devuelva error 500 si no se envía username
async function testFailWithoutUsername() {
  await clearDB();
  console.log('Test 4: POST /users - Fallo sin username (500)');
  
  const response = await request(app)
    .post('/users')
    .send({
      email: 'test@example.com',
      password: 'password123'
    });

  if (response.status !== 500) {
    throw new Error(`Esperaba status 500, recibió ${response.status}`);
  }

  console.log('   OK Error 500 devuelto correctamente');
}

// Test 5: Fallo sin email
// Verifica que devuelva error 500 si no se envía email
async function testFailWithoutEmail() {
  await clearDB();
  console.log('Test 5: POST /users - Fallo sin email (500)');
  
  const response = await request(app)
    .post('/users')
    .send({
      username: 'testuser',
      password: 'password123'
    });

  if (response.status !== 500) {
    throw new Error(`Esperaba status 500, recibió ${response.status}`);
  }

  console.log('   OK Error 500 devuelto correctamente');
}

// Test 6: Fallo sin password
// Verifica que devuelva error 500 si no se envía password
async function testFailWithoutPassword() {
  await clearDB();
  console.log('Test 6: POST /users - Fallo sin password (500)');
  
  const response = await request(app)
    .post('/users')
    .send({
      username: 'testuser',
      email: 'test@example.com'
    });

  if (response.status !== 500) {
    throw new Error(`Esperaba status 500, recibió ${response.status}`);
  }

  console.log('   OK Error 500 devuelto correctamente');
}

// Test 7: Email inválido
// Verifica que devuelva error 500 con formato de email inválido
async function testInvalidEmail() {
  await clearDB();
  console.log('Test 7: POST /users - Email inválido (500)');
  
  const response = await request(app)
    .post('/users')
    .send({
      username: 'testuser',
      email: 'invalid-email',
      password: 'password123'
    });

  if (response.status !== 500) {
    throw new Error(`Esperaba status 500, recibió ${response.status}`);
  }

  console.log('   OK Error 500 devuelto correctamente');
}

// Test 8: Username duplicado
// Verifica que no se permita crear usuarios con username duplicado
async function testDuplicateUsername() {
  await clearDB();
  console.log('Test 8: POST /users - Username duplicado (500)');
  
  // Crear primer usuario
  await request(app)
    .post('/users')
    .send({
      username: 'duplicate',
      email: 'test1@example.com',
      password: 'password123'
    });

  // Intentar crear duplicado
  const response = await request(app)
    .post('/users')
    .send({
      username: 'duplicate',
      email: 'test2@example.com',
      password: 'password123'
    });

  if (response.status !== 500) {
    throw new Error(`Esperaba status 500, recibió ${response.status}`);
  }

  console.log('   OK Username duplicado rechazado correctamente');
}

// Test 9: Email duplicado
// Verifica que no se permita crear usuarios con email duplicado
async function testDuplicateEmail() {
  await clearDB();
  console.log('Test 9: POST /users - Email duplicado (500)');
  
  // Crear primer usuario
  await request(app)
    .post('/users')
    .send({
      username: 'user1',
      email: 'duplicate@example.com',
      password: 'password123'
    });

  // Intentar crear duplicado
  const response = await request(app)
    .post('/users')
    .send({
      username: 'user2',
      email: 'duplicate@example.com',
      password: 'password123'
    });

  if (response.status !== 500) {
    throw new Error(`Esperaba status 500, recibió ${response.status}`);
  }

  console.log('   OK Email duplicado rechazado correctamente');
}

// Test 10: Rutas no definidas
// Verifica que las rutas no definidas devuelvan status 501
async function testUndefinedRoutes() {
  await clearDB();
  console.log('Test 10: Rutas no definidas (501)');
  
  // GET a ruta indefinida
  const getResponse = await request(app).get('/undefined-route');
  if (getResponse.status !== 501) {
    throw new Error(`GET esperaba 501, recibió ${getResponse.status}`);
  }
  
  // POST a ruta indefinida
  const postResponse = await request(app).post('/undefined-route');
  if (postResponse.status !== 501) {
    throw new Error(`POST esperaba 501, recibió ${postResponse.status}`);
  }

  console.log('   OK Rutas indefinidas devuelven 501 correctamente');
}

// Ejecutar los tests
runAPITests();
