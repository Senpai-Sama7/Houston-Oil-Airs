const path = require('path');
const fs = require('fs');
const request = require('supertest');
const redis = require('redis');
const { Pool } = require('pg');
const { GenericContainer, Wait } = require('testcontainers');

jest.setTimeout(120000);

describe('Houston EJ-AI backend integration', () => {
  let redisContainer;
  let postgresContainer;
  let redisClient;
  let pgPool;
  let serverInstance;
  let baseUrl;

  beforeAll(async () => {
    // Use environment variable for test password, with a secure default for CI
    const testPassword = process.env.TEST_DB_PASSWORD || 'test_password_do_not_use_in_prod';
    
    postgresContainer = await new GenericContainer('postgres:16-alpine')
      .withEnvironment({
        POSTGRES_DB: 'houston_ej_ai',
        POSTGRES_USER: 'houston',
        POSTGRES_PASSWORD: testPassword,
      })
      .withExposedPorts(5432)
      .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
      .start();

    redisContainer = await new GenericContainer('redis:7.2-alpine')
      .withExposedPorts(6379)
      .start();

    const pgConfig = {
      host: postgresContainer.getHost(),
      port: postgresContainer.getMappedPort(5432),
      database: 'houston_ej_ai',
      user: 'houston',
      password: testPassword,
    };

    pgPool = new Pool(pgConfig);

    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../../..', 'database', 'schema.sql'), 'utf8');
    await pgPool.query(schemaSql);

    const seedSql = fs.readFileSync(path.resolve(__dirname, '../../..', 'database', 'seed_data.sql'), 'utf8');
    await pgPool.query(seedSql);

    const redisUrl = `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`;
    redisClient = redis.createClient({ url: redisUrl });
    await redisClient.connect();
    await redisClient.flushAll();

    process.env.REDIS_HOST = redisContainer.getHost();
    process.env.REDIS_PORT = String(redisContainer.getMappedPort(6379));
    process.env.DB_HOST = pgConfig.host;
    process.env.DB_PORT = String(pgConfig.port);
    process.env.DB_NAME = pgConfig.database;
    process.env.DB_USER = pgConfig.user;
    process.env.DB_PASSWORD = pgConfig.password;

    const RealHighPerformanceWebServer = require('../src/server');
    serverInstance = new RealHighPerformanceWebServer();
    await serverInstance.start(0);
    const address = serverInstance.server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    if (serverInstance) {
      await serverInstance.shutdown();
    }
    if (redisClient) {
      await redisClient.quit();
    }
    if (pgPool) {
      await pgPool.end();
    }
    if (redisContainer) {
      await redisContainer.stop();
    }
    if (postgresContainer) {
      await postgresContainer.stop();
    }
  });

  describe('health', () => {
    test('GET /live returns alive status', async () => {
      const response = await request(baseUrl).get('/live');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('alive');
    });

    test('GET /ready returns ready status with dependencies', async () => {
      const response = await request(baseUrl).get('/ready');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ready');
      expect(response.body.database).toBe('connected');
      expect(response.body.redis).toBe('connected');
    });
  });

  describe('metrics', () => {
    test('GET /metrics exposes Prometheus text', async () => {
      const response = await request(baseUrl).get('/metrics');
      expect(response.status).toBe(200);
      expect(response.text).toContain('houston_sensor_readings_total');
      expect(response.text).toContain('houston_active_devices');
    });

    test('GET /metrics.json exposes structured payload', async () => {
      const response = await request(baseUrl).get('/metrics.json');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('requests_total');
      expect(response.body).toHaveProperty('uptime_seconds');
      expect(response.body).toHaveProperty('readings_last_24h');
    });
  });

  describe('research endpoints', () => {
    test('GET /api/research/visualization-data/alignment returns seeded data', async () => {
      const response = await request(baseUrl).get('/api/research/visualization-data/alignment');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.research_points)).toBe(true);
      expect(response.body.total_count).toBeGreaterThan(0);
    });

    test('GET /api/research/network-topology returns network graph', async () => {
      const response = await request(baseUrl).get('/api/research/network-topology');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.nodes)).toBe(true);
      expect(Array.isArray(response.body.edges)).toBe(true);
    });
  });
});
