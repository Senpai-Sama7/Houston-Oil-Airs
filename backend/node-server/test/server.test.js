const request = require('supertest');

// Real integration tests with actual Redis and PostgreSQL
const redis = require('redis');
const { Pool } = require('pg');

describe('Houston EJ-AI Backend Server', () => {
  let server;
  let redisClient;
  let pgPool;

  beforeAll(async () => {
    // Setup real connections for integration testing
    redisClient = redis.createClient({ url: 'redis://localhost:6380' });
    await redisClient.connect();
    
    pgPool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'houston_ej_ai_test',
      user: 'houston',
      password: 'ej_ai_2024',
    });

    const RealHighPerformanceWebServer = require('../src/server');
    server = new RealHighPerformanceWebServer();
    await server.start(3002);
  });

  afterAll(async () => {
    await redisClient.quit();
    await pgPool.end();
    server.shutdown();
  });

  describe('Health Endpoints', () => {
    test('GET /live should return alive status', async () => {
      const response = await request('http://localhost:3002')
        .get('/live')
        .expect(200);
      
      expect(response.body.status).toBe('alive');
    });

    test('GET /ready should return ready status', async () => {
      const response = await request('http://localhost:3002')
        .get('/ready')
        .expect(200);
      
      expect(response.body.status).toBe('ready');
      expect(response.body.database).toBe('connected');
      expect(response.body.redis).toBe('connected');
    });
  });

  describe('Metrics Endpoints', () => {
    test('GET /metrics should return Prometheus metrics', async () => {
      const response = await request('http://localhost:3002')
        .get('/metrics')
        .expect(200);
      
      expect(response.text).toContain('houston_sensor_readings_total');
      expect(response.text).toContain('houston_active_devices');
    });

    test('GET /metrics.json should return JSON metrics', async () => {
      const response = await request('http://localhost:3002')
        .get('/metrics.json')
        .expect(200);
      
      expect(response.body).toHaveProperty('requests_total');
      expect(response.body).toHaveProperty('uptime_seconds');
      expect(response.body.native).toBe('fallback');
    });
  });

  describe('API Endpoints', () => {
    test('GET /api/research/visualization-data/alignment should return real data', async () => {
      const response = await request('http://localhost:3002')
        .get('/api/research/visualization-data/alignment')
        .expect(200);
      
      expect(response.body).toHaveProperty('research_points');
      expect(response.body).toHaveProperty('total_count');
      expect(Array.isArray(response.body.research_points)).toBe(true);
    });

    test('GET /api/research/network-topology should return real network data', async () => {
      const response = await request('http://localhost:3002')
        .get('/api/research/network-topology')
        .expect(200);
      
      expect(response.body).toHaveProperty('nodes');
      expect(response.body).toHaveProperty('edges');
      expect(Array.isArray(response.body.nodes)).toBe(true);
      expect(Array.isArray(response.body.edges)).toBe(true);
    });
  });
});