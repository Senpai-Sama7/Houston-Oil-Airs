const request = require('supertest');

jest.mock('redis', () => ({
  createClient: () => ({
    connect: jest.fn().mockResolvedValue(),
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    quit: jest.fn()
  })
}), { virtual: true });

jest.mock('ffi-napi', () => ({
  Library: () => ({
    create_processor: () => ({}),
    destroy_processor: () => {},
    get_visualization_data: () => JSON.stringify({}),
    update_real_time_data: () => {}
  })
}), { virtual: true });

jest.mock('ref-napi', () => ({}), { virtual: true });

const HighPerformanceWebServer = require('../src/server');

describe('HighPerformanceWebServer', () => {
  let app;
  let server;

  beforeAll(() => {
    server = new HighPerformanceWebServer();
    app = server.app;
  });

  afterAll(() => {
    server.shutdown();
  });

  test('health endpoint returns status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('analytics endpoint forwards upstream errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 502 });
    const res = await request(app).get('/api/analytics/trends/test');
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'Analytics service error' });
  });
});
