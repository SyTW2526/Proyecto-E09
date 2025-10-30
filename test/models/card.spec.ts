// Test del modelo Card - Verifica el correcto funcionamiento de la base de datos
// Este archivo prueba las operaciones CRUD y validaciones del modelo de cartas

import { Card } from '../../src/models/Card';
import { connectDB, disconnectDB, clearDB } from '../db-handler';

// Función principal que ejecuta todos los tests
async function runCardTests() {
  console.log('\nEjecutando tests del modelo Card...\n');
  
  try {
    // Conectar a la base de datos de prueba
    await connectDB();
    
    // Test 1: Crear una carta válida
    await testCreateValidCard();
    
    // Test 2: Verificar valores por defecto
    await testDefaultMarketPrice();
    
    // Test 3: Verificar que falle sin pokemonTcgId
    await testFailWithoutPokemonTcgId();
    
    // Test 4: Verificar que falle sin name
    await testFailWithoutName();
    
    // Test 5: Verificar que no permita pokemonTcgId duplicado
    await testDuplicatePokemonTcgId();
    
    // Test 6: Buscar cartas por tipo
    await testFindByType();
    
    // Test 7: Ordenar cartas por precio
    await testSortByPrice();
    
    console.log('\nTodos los tests del modelo Card pasaron correctamente\n');
    
  } catch (error) {
    console.error('\nError en los tests:', error);
    process.exit(1);
  } finally {
    // Desconectar de la base de datos
    await disconnectDB();
  }
}

// Test 1: Crear una carta válida
// Verifica que se puede crear una carta con los campos requeridos
async function testCreateValidCard() {
  await clearDB();
  console.log('Test 1: Crear carta válida');
  
  const cardData = {
    pokemonTcgId: 'xy1-1',
    name: 'Pikachu',
    series: 'XY',
    set: 'XY Base Set',
    rarity: 'Common',
    types: ['Lightning']
  };

  const card = new Card(cardData);
  const savedCard = await card.save();

  if (!savedCard._id) throw new Error('La carta no tiene _id');
  if (savedCard.pokemonTcgId !== cardData.pokemonTcgId) throw new Error('pokemonTcgId no coincide');
  if (savedCard.name !== cardData.name) throw new Error('name no coincide');
  if (JSON.stringify(savedCard.types) !== JSON.stringify(cardData.types)) {
    throw new Error('types no coincide');
  }
  
  console.log('   OK Carta creada correctamente');
}

// Test 2: Valor por defecto de marketPrice
// Verifica que el precio de mercado tenga valor 0 por defecto
async function testDefaultMarketPrice() {
  await clearDB();
  console.log('Test 2: Precio de mercado por defecto');
  
  const card = new Card({
    pokemonTcgId: 'xy1-2',
    name: 'Charizard'
  });
  
  const saved = await card.save();
  
  if (saved.marketPrice !== 0) {
    throw new Error('marketPrice debería ser 0 por defecto');
  }
  
  console.log('   OK Precio por defecto aplicado correctamente');
}

// Test 3: Fallo sin pokemonTcgId
// Verifica que no se pueda crear una carta sin pokemonTcgId (campo requerido)
async function testFailWithoutPokemonTcgId() {
  await clearDB();
  console.log('Test 3: Fallo sin pokemonTcgId');
  
  const card = new Card({
    name: 'Pikachu'
  });
  
  try {
    await card.save();
    throw new Error('Debería haber fallado sin pokemonTcgId');
  } catch (error: any) {
    if (error.message === 'Debería haber fallado sin pokemonTcgId') throw error;
    console.log('   OK Validación de pokemonTcgId funciona');
  }
}

// Test 4: Fallo sin name
// Verifica que no se pueda crear una carta sin name (campo requerido)
async function testFailWithoutName() {
  await clearDB();
  console.log('Test 4: Fallo sin name');
  
  const card = new Card({
    pokemonTcgId: 'xy1-4'
  });
  
  try {
    await card.save();
    throw new Error('Debería haber fallado sin name');
  } catch (error: any) {
    if (error.message === 'Debería haber fallado sin name') throw error;
    console.log('   OK Validación de name funciona');
  }
}

// Test 5: pokemonTcgId duplicado
// Verifica que no se permitan pokemonTcgId duplicados (campo único)
async function testDuplicatePokemonTcgId() {
  await clearDB();
  console.log('Test 5: pokemonTcgId duplicado rechazado');
  
  await new Card({
    pokemonTcgId: 'xy1-5',
    name: 'Pikachu'
  }).save();
  
  const duplicate = new Card({
    pokemonTcgId: 'xy1-5',
    name: 'Raichu'
  });
  
  try {
    await duplicate.save();
    throw new Error('Debería haber fallado con pokemonTcgId duplicado');
  } catch (error: any) {
    if (error.message === 'Debería haber fallado con pokemonTcgId duplicado') throw error;
    console.log('   OK Validación de pokemonTcgId único funciona');
  }
}

// Test 6: Buscar por tipo
// Verifica que se puedan buscar cartas filtrando por tipo
async function testFindByType() {
  await clearDB();
  console.log('Test 6: Buscar cartas por tipo');
  
  const cards = [
    { pokemonTcgId: 'xy1-9', name: 'Pikachu', types: ['Lightning'] },
    { pokemonTcgId: 'xy1-10', name: 'Squirtle', types: ['Water'] },
    { pokemonTcgId: 'xy1-11', name: 'Zapdos', types: ['Lightning'] }
  ];

  for (const cardData of cards) {
    await new Card(cardData).save();
  }

  const lightningCards = await Card.find({ types: 'Lightning' });
  
  if (lightningCards.length !== 2) {
    throw new Error('Debería haber 2 cartas de tipo Lightning');
  }
  
  console.log('   OK Búsqueda por tipo funciona');
}

// Test 7: Ordenar por precio
// Verifica que las cartas se puedan ordenar por precio de mercado
async function testSortByPrice() {
  await clearDB();
  console.log('Test 7: Ordenar cartas por precio');
  
  const cards = [
    { pokemonTcgId: 'xy1-23', name: 'Card1', marketPrice: 10 },
    { pokemonTcgId: 'xy1-24', name: 'Card2', marketPrice: 50 },
    { pokemonTcgId: 'xy1-25', name: 'Card3', marketPrice: 25 }
  ];

  for (const cardData of cards) {
    await new Card(cardData).save();
  }

  const sortedCards = await Card.find().sort({ marketPrice: -1 });
  
  if (sortedCards[0].marketPrice !== 50) {
    throw new Error('Primera carta debería tener precio 50');
  }
  if (sortedCards[2].marketPrice !== 10) {
    throw new Error('Última carta debería tener precio 10');
  }
  
  console.log('   OK Ordenamiento por precio funciona');
}

// Ejecutar los tests
runCardTests();
