import mongoose from 'mongoose';

/**
 * Conecta a la base de datos de prueba
 */
export const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URL || 'mongodb://localhost:27017/test-db';
  
  try {
    await mongoose.connect(mongoUri);
    console.log('OK Connected to test database');
  } catch (error) {
    console.error('✗ Error connecting to test database:', error);
    throw error;
  }
};

/**
 * Desconecta de la base de datos
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('OK Disconnected from test database');
  } catch (error) {
    console.error('✗ Error disconnecting from test database:', error);
    throw error;
  }
};

/**
 * Limpia todas las colecciones de la base de datos
 */
export const clearDB = async (): Promise<void> => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    console.log('OK Database cleared');
  } catch (error) {
    console.error('✗ Error clearing database:', error);
    throw error;
  }
};

/**
 * Elimina una colección específica
 */
export const clearCollection = async (collectionName: string): Promise<void> => {
  try {
    const collection = mongoose.connection.collections[collectionName];
    if (collection) {
      await collection.deleteMany({});
      console.log(`OK Collection '${collectionName}' cleared`);
    }
  } catch (error) {
    console.error(`✗ Error clearing collection '${collectionName}':`, error);
    throw error;
  }
};
