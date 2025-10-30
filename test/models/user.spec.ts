// Test del modelo User - Verifica el correcto funcionamiento de la base de datos
// Este archivo prueba las operaciones CRUD y validaciones del modelo de usuario

import { User } from '../../src/models/User';
import { connectDB, disconnectDB, clearDB } from '../db-handler';

// Función principal que ejecuta todos los tests
async function runUserTests() {
  console.log('\nEjecutando tests del modelo User...\n');
  
  try {
    // Conectar a la base de datos de prueba
    await connectDB();
    
    // Test 1: Crear un usuario válido
    await testCreateValidUser();
    
    // Test 2: Validar que los valores por defecto se apliquen correctamente
    await testDefaultValues();
    
    // Test 3: Verificar que el email se convierta a minúsculas
    await testEmailLowercase();
    
    // Test 4: Verificar que falle sin username
    await testFailWithoutUsername();
    
    // Test 5: Verificar que falle sin email
    await testFailWithoutEmail();
    
    // Test 6: Verificar que falle con email inválido
    await testInvalidEmail();
    
    // Test 7: Verificar que no permita usernames duplicados
    await testDuplicateUsername();
    
    // Test 8: Buscar un usuario por username
    await testFindByUsername();
    
    // Test 9: Actualizar configuraciones de usuario
    await testUpdateSettings();
    
    // Test 10: Agregar amigos a un usuario
    await testAddFriends();
    
    console.log('\nTodos los tests del modelo User pasaron correctamente\n');
    
  } catch (error) {
    console.error('\nError en los tests:', error);
    process.exit(1);
  } finally {
    // Desconectar de la base de datos
    await disconnectDB();
  }
}

// Test 1: Crear un usuario válido
// Verifica que se puede crear un usuario con todos los campos requeridos
async function testCreateValidUser() {
  await clearDB();
  console.log('Test 1: Crear usuario válido');
  
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  const user = new User(userData);
  const savedUser = await user.save();

  if (!savedUser._id) throw new Error('El usuario no tiene _id');
  if (savedUser.username !== userData.username) throw new Error('Username no coincide');
  if (savedUser.email !== userData.email) throw new Error('Email no coincide');
  if (!savedUser.createdAt) throw new Error('No tiene createdAt');
  
  console.log('   OK Usuario creado correctamente');
}

// Test 2: Validar valores por defecto
// Verifica que los campos opcionales tengan sus valores por defecto
async function testDefaultValues() {
  await clearDB();
  console.log('Test 2: Valores por defecto');
  
  const user = new User({
    username: 'defaultuser',
    email: 'default@example.com',
    password: 'pass123'
  });
  
  const saved = await user.save();
  
  if (saved.profileImage !== '') throw new Error('profileImage debería ser cadena vacía');
  if (!saved.settings) throw new Error('settings no existe');
  if (saved.settings.language !== 'es') throw new Error('language debería ser "es"');
  if (!saved.settings.notifications) throw new Error('notifications no existe');
  if (saved.settings.notifications.trades !== true) throw new Error('notifications.trades debería ser true');
  if (saved.friends.length !== 0) throw new Error('friends debería estar vacío');
  
  console.log('   OK Valores por defecto aplicados correctamente');
}

// Test 3: Email a minúsculas
// Verifica que los emails se conviertan automáticamente a minúsculas
async function testEmailLowercase() {
  await clearDB();
  console.log('Test 3: Email convertido a minúsculas');
  
  const user = new User({
    username: 'lowercasetest',
    email: 'TEST@EXAMPLE.COM',
    password: 'pass123'
  });
  
  const saved = await user.save();
  
  if (saved.email !== 'test@example.com') {
    throw new Error('Email no se convirtió a minúsculas');
  }
  
  console.log('   OK Email convertido correctamente');
}

// Test 4: Fallo sin username
// Verifica que no se pueda crear un usuario sin username (campo requerido)
async function testFailWithoutUsername() {
  await clearDB();
  console.log('Test 4: Fallo sin username');
  
  const user = new User({
    email: 'test@example.com',
    password: 'pass123'
  });
  
  try {
    await user.save();
    throw new Error('Debería haber fallado sin username');
  } catch (error: any) {
    if (error.message === 'Debería haber fallado sin username') throw error;
    console.log('   OK Validación de username funciona');
  }
}

// Test 5: Fallo sin email
// Verifica que no se pueda crear un usuario sin email (campo requerido)
async function testFailWithoutEmail() {
  await clearDB();
  console.log('Test 5: Fallo sin email');
  
  const user = new User({
    username: 'testuser',
    password: 'pass123'
  });
  
  try {
    await user.save();
    throw new Error('Debería haber fallado sin email');
  } catch (error: any) {
    if (error.message === 'Debería haber fallado sin email') throw error;
    console.log('   OK Validación de email funciona');
  }
}

// Test 6: Email inválido
// Verifica que no se acepten emails con formato inválido
async function testInvalidEmail() {
  await clearDB();
  console.log('Test 6: Email inválido rechazado');
  
  const user = new User({
    username: 'testuser',
    email: 'invalid-email',
    password: 'pass123'
  });
  
  try {
    await user.save();
    throw new Error('Debería haber fallado con email inválido');
  } catch (error: any) {
    if (error.message === 'Debería haber fallado con email inválido') throw error;
    console.log('   OK Validación de formato de email funciona');
  }
}

// Test 7: Username duplicado
// Verifica que no se permitan usernames duplicados (campo único)
async function testDuplicateUsername() {
  await clearDB();
  console.log('Test 7: Username duplicado rechazado');
  
  await new User({
    username: 'duplicate',
    email: 'test1@example.com',
    password: 'pass123'
  }).save();
  
  const duplicate = new User({
    username: 'duplicate',
    email: 'test2@example.com',
    password: 'pass123'
  });
  
  try {
    await duplicate.save();
    throw new Error('Debería haber fallado con username duplicado');
  } catch (error: any) {
    if (error.message === 'Debería haber fallado con username duplicado') throw error;
    console.log('   OK Validación de username único funciona');
  }
}

// Test 8: Buscar por username
// Verifica que se pueda buscar y encontrar un usuario por su username
async function testFindByUsername() {
  await clearDB();
  console.log('Test 8: Buscar usuario por username');
  
  await new User({
    username: 'findme',
    email: 'findme@example.com',
    password: 'pass123'
  }).save();
  
  const found = await User.findOne({ username: 'findme' });
  
  if (!found) throw new Error('Usuario no encontrado');
  if (found.username !== 'findme') throw new Error('Username incorrecto');
  
  console.log('   OK Búsqueda por username funciona');
}

// Test 9: Actualizar configuraciones
// Verifica que se puedan actualizar las configuraciones del usuario
async function testUpdateSettings() {
  await clearDB();
  console.log('Test 9: Actualizar configuraciones');
  
  const user = await new User({
    username: 'updatetest',
    email: 'update@example.com',
    password: 'pass123'
  }).save();
  
  if (!user.settings) throw new Error('settings no existe');
  if (!user.settings.notifications) throw new Error('notifications no existe');
  
  user.settings.language = 'en';
  user.settings.notifications.trades = false;
  const updated = await user.save();

  if (!updated.settings) throw new Error('settings no existe en updated');
  if (!updated.settings.notifications) throw new Error('notifications no existe en updated');
  if (updated.settings.language !== 'en') throw new Error('Language no actualizado');
  if (updated.settings.notifications.trades !== false) throw new Error('Notification no actualizada');  console.log('   OK Actualización de configuraciones funciona');
}

// Test 10: Agregar amigos
// Verifica que se puedan agregar relaciones de amistad entre usuarios
async function testAddFriends() {
  await clearDB();
  console.log('Test 10: Agregar amigos');
  
  const user1 = await new User({
    username: 'user1',
    email: 'user1@example.com',
    password: 'pass1'
  }).save();
  
  const user2 = await new User({
    username: 'user2',
    email: 'user2@example.com',
    password: 'pass2'
  }).save();
  
  user1.friends.push(user2._id);
  await user1.save();
  
  const updated = await User.findById(user1._id);
  
  if (!updated) throw new Error('Usuario no encontrado');
  if (updated.friends.length !== 1) throw new Error('No se agregó el amigo');
  if (updated.friends[0].toString() !== user2._id.toString()) {
    throw new Error('ID de amigo incorrecto');
  }
  
  console.log('   OK Agregar amigos funciona');
}

// Ejecutar los tests
runUserTests();
