import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Dedicated database configuration module for MongoDB connection management using Mongoose.
 */

/**
 * Establishes a connection to MongoDB.
 * Reads the connection URI from the environment configuration.
 * Throws an error if the URI is missing or if the connection attempt fails.
 *
 * @param customUri - Optional override URI (useful for testing environments)
 */
let listenersAttached = false;

export const connectDatabase = async (customUri?: string): Promise<typeof mongoose> => {
  const uri = customUri || env.MONGODB_URI;

  if (!uri) {
    const errorMessage = 'MongoDB connection error: MONGODB_URI environment variable is missing.';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    mongoose.set('strictQuery', true);

    const connection = await mongoose.connect(uri);
    const host = connection.connection.host || 'unknown host';
    const dbName = connection.connection.name || 'unknown db';

    logger.info(`MongoDB connected successfully [Host: ${host}, Database: ${dbName}]`);

    // Attach runtime connection event listeners once to prevent listener accumulation memory leaks
    if (!listenersAttached) {
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB runtime connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB connection lost. Connection state: disconnected.');
      });

      listenersAttached = true;
    }

    return connection;
  } catch (error) {
    logger.error('Failed to establish MongoDB connection:', error);
    throw error;
  }
};

/**
 * Disconnects from MongoDB cleanly.
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected successfully.');
    }
  } catch (error) {
    logger.error('Error during MongoDB disconnection:', error);
    throw error;
  }
};

/**
 * Returns the current database connection state.
 * 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
export const getDatabaseState = (): number => {
  return mongoose.connection.readyState;
};
