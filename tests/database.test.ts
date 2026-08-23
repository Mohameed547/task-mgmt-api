import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase, getDatabaseState } from '../src/config/database';
import { startServer } from '../src/server';

jest.mock('mongoose');

describe('Database Configuration Module', () => {
  const mockConnect = mongoose.connect as jest.Mock;
  const mockDisconnect = mongoose.disconnect as jest.Mock;
  const mockSet = mongoose.set as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock behavior for connection object
    (mongoose as unknown as { connection: { host: string; name: string; readyState: number; on: jest.Mock } }).connection = {
      host: 'localhost',
      name: 'test_db',
      readyState: 1,
      on: jest.fn(),
    };
  });

  describe('connectDatabase', () => {
    it('should successfully connect to MongoDB using provided URI', async () => {
      mockConnect.mockResolvedValueOnce(mongoose);

      const result = await connectDatabase('mongodb://localhost:27017/test_db');

      expect(mockSet).toHaveBeenCalledWith('strictQuery', true);
      expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost:27017/test_db');
      expect(result).toBe(mongoose);
    });

    it('should throw an error and log when mongoose.connect fails', async () => {
      const connectionError = new Error('Failed to connect to MongoDB instance');
      mockConnect.mockRejectedValueOnce(connectionError);

      await expect(connectDatabase('mongodb://invalid-uri')).rejects.toThrow(
        'Failed to connect to MongoDB instance'
      );
    });
  });

  describe('disconnectDatabase', () => {
    it('should call mongoose.disconnect when connection state is active', async () => {
      mockDisconnect.mockResolvedValueOnce(undefined);

      await disconnectDatabase();

      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });

    it('should handle error when mongoose.disconnect throws', async () => {
      const disconnectError = new Error('Disconnection error');
      mockDisconnect.mockRejectedValueOnce(disconnectError);

      await expect(disconnectDatabase()).rejects.toThrow('Disconnection error');
    });
  });

  describe('getDatabaseState', () => {
    it('should return current connection readyState integer', () => {
      const state = getDatabaseState();
      expect(state).toBe(1);
    });
  });

  describe('Server Startup Behavior on DB Failure', () => {
    it('should abort server startup and throw error when database connection fails', async () => {
      mockConnect.mockRejectedValueOnce(new Error('Connection timeout'));

      await expect(startServer()).rejects.toThrow('Connection timeout');
    });
  });
});
