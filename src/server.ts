import { Server } from 'http';
import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';

let server: Server;

export const startServer = async (): Promise<Server | undefined> => {
  try {
    logger.info('Initializing application startup...');
    // Attempt database connection first
    await connectDatabase();

    // Start Express server ONLY after database connection succeeds
    return new Promise((resolve) => {
      server = app.listen(env.PORT, () => {
        logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
        logger.info(`Health check available at http://localhost:${env.PORT}/api/health`);
        resolve(server);
      });
    });
  } catch (error) {
    logger.error('CRITICAL: Database connection failed. Aborting server startup.', error);
    // Exit process with failure code if called as entry point
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

// Handle Graceful Shutdown
export const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => {
        logger.info('HTTP server closed.');
        resolve();
      });
    });
  }
  await disconnectDatabase();
  if (process.env.NODE_ENV !== 'test') {
    process.exit(0);
  }
};

// Register uncaught handlers if executed as main module
if (require.main === module) {
  process.on('uncaughtException', (error: Error) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', reason);
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  startServer();
}
