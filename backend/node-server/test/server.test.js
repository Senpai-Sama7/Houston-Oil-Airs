const request = require('supertest');

jest.mock('redis', () => ({
  createClient: () => ({
    connect: jest.fn().mockResolvedValue(),
    get: jest.fn().mockResolvedValue(null),
    setEx: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    quit: jest.fn(),
    isOpen: true
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

  test('liveness endpoint returns alive', async () => {
    const res = await request(app).get('/live');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('alive');
  });

  test('readiness endpoint returns ready when dependencies OK', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(['available', 'fallback']).toContain(res.body.native);
  });

  test('metrics endpoint returns prometheus text', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('app_requests_total');
  });

  test('analytics endpoint forwards upstream errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 502 });
    const res = await request(app).get('/api/analytics/trends/test');
    expect(res.status).toBe(502);
    expect(res.body).toEqual({ error: 'Analytics service error' });
  });
});
