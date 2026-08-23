import request from 'supertest';
import app from '../src/app';

describe('GET /api/health', () => {
  it('should return 200 OK with server health and database status information', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message', 'Server is healthy');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('uptime');
    expect(response.body.data).toHaveProperty('timestamp');
    expect(response.body.data).toHaveProperty('environment');
    expect(response.body.data).toHaveProperty('database');
  });

  it('should return 404 for an unknown API route', async () => {
    const response = await request(app).get('/api/unknown-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', 'fail');
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Route not found');
  });
});
