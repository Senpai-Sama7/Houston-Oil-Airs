const request = require('supertest');
const HighPerformanceWebServer = require('../src/server');

describe('HighPerformanceWebServer', () => {
  let server;

  beforeAll(() => {
    server = new HighPerformanceWebServer();
  });

  afterAll(() => {
    server.shutdown();
  });

  test('health endpoint', async () => {
    const res = await request(server.app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('analytics proxy forwards upstream errors', async () => {
    const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({})
    });

    const res = await request(server.app).get('/api/analytics/trends/test');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: 'Analytics service error' });

    mockFetch.mockRestore();
  });
});
