-- Houston EJ-AI Platform - Real database schema
-- Hardened to run on vanilla PostgreSQL while remaining compatible with TimescaleDB when available

DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS timescaledb;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'TimescaleDB extension not available (%), continuing with vanilla PostgreSQL.', SQLERRM;
END;
$$;

DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pgcrypto extension not available (%); signatures will use plain text hashes.', SQLERRM;
END;
$$;

-- Air quality sensor data (time-series)
CREATE TABLE IF NOT EXISTS air_quality (
    time TIMESTAMPTZ NOT NULL,
    device_id TEXT NOT NULL,
    pm25 REAL NOT NULL CHECK (pm25 >= 0 AND pm25 <= 1000),
    pm10 REAL NOT NULL CHECK (pm10 >= 0 AND pm10 <= 2000),
    temperature REAL NOT NULL CHECK (temperature >= -50 AND temperature <= 80),
    humidity REAL NOT NULL CHECK (humidity >= 0 AND humidity <= 100),
    health_events INTEGER DEFAULT 0 CHECK (health_events >= 0),
    signature TEXT,
    encrypted BOOLEAN DEFAULT FALSE,
    location_lat REAL,
    location_lng REAL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (time, device_id)
);

DO $$
BEGIN
    PERFORM create_hypertable('air_quality', 'time', if_not_exists => TRUE);
EXCEPTION
    WHEN undefined_function THEN
        RAISE NOTICE 'create_hypertable() unavailable; keeping standard table.';
    WHEN OTHERS THEN
        RAISE NOTICE 'Unable to create hypertable (%).', SQLERRM;
END;
$$;

-- Compensation claims (blockchain transactions)
CREATE TABLE IF NOT EXISTS compensation_claims (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL CHECK (length(wallet_address) = 42),
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0 AND amount <= 1.00),
    claim_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    transaction_hash TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    pm25_trigger REAL,
    device_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Device registry
CREATE TABLE IF NOT EXISTS devices (
    device_id TEXT PRIMARY KEY,
    device_name TEXT NOT NULL,
    location_name TEXT,
    location_lat REAL,
    location_lng REAL,
    owner_wallet TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet summaries for compensation tracking
CREATE TABLE IF NOT EXISTS user_wallets (
    wallet_address TEXT PRIMARY KEY CHECK (length(wallet_address) = 42),
    total_claims INTEGER DEFAULT 0,
    total_earned NUMERIC(10,2) DEFAULT 0.00,
    first_claim TIMESTAMPTZ,
    last_claim TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_air_quality_time ON air_quality (time DESC);
CREATE INDEX IF NOT EXISTS idx_air_quality_device ON air_quality (device_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_air_quality_pm25 ON air_quality (pm25, time DESC);
CREATE INDEX IF NOT EXISTS idx_compensation_wallet ON compensation_claims (wallet_address, claim_time DESC);
CREATE INDEX IF NOT EXISTS idx_compensation_status ON compensation_claims (status, claim_time DESC);
CREATE INDEX IF NOT EXISTS idx_compensation_tx ON compensation_claims (transaction_hash);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices (status, last_seen DESC);

-- Aggregation views
CREATE OR REPLACE VIEW air_quality_hourly AS
SELECT
    date_trunc('hour', time) AS hour,
    device_id,
    AVG(pm25) AS avg_pm25,
    AVG(pm10) AS avg_pm10,
    AVG(temperature) AS avg_temperature,
    AVG(humidity) AS avg_humidity,
    SUM(health_events) AS total_health_events,
    COUNT(*) AS reading_count
FROM air_quality
GROUP BY hour, device_id
ORDER BY hour DESC;

CREATE OR REPLACE VIEW compensation_summary AS
SELECT
    DATE(claim_time) AS claim_date,
    COUNT(*) AS total_claims,
    SUM(amount) AS total_amount,
    COUNT(DISTINCT wallet_address) AS unique_wallets,
    AVG(pm25_trigger) AS avg_pm25_trigger
FROM compensation_claims
WHERE status = 'confirmed'
GROUP BY claim_date
ORDER BY claim_date DESC;

-- Functions for data validation
CREATE OR REPLACE FUNCTION validate_air_quality_reading()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.pm25 > NEW.pm10 THEN
        RAISE EXCEPTION 'PM2.5 cannot be greater than PM10';
    END IF;

    UPDATE devices
        SET last_seen = NEW.time
        WHERE device_id = NEW.device_id;

    IF NOT FOUND THEN
        INSERT INTO devices (device_id, device_name, status, last_seen)
        VALUES (NEW.device_id, NEW.device_id, 'active', NEW.time)
        ON CONFLICT (device_id) DO UPDATE SET last_seen = EXCLUDED.last_seen;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'validate_air_quality'
    ) THEN
        CREATE TRIGGER validate_air_quality
            BEFORE INSERT ON air_quality
            FOR EACH ROW EXECUTE FUNCTION validate_air_quality_reading();
    END IF;
END;
$$;

-- Function to update wallet statistics
CREATE OR REPLACE FUNCTION update_wallet_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' THEN
        INSERT INTO user_wallets (wallet_address, total_claims, total_earned, first_claim, last_claim)
        VALUES (NEW.wallet_address, 1, NEW.amount, NEW.claim_time, NEW.claim_time)
        ON CONFLICT (wallet_address)
        DO UPDATE SET
            total_claims = user_wallets.total_claims + 1,
            total_earned = user_wallets.total_earned + NEW.amount,
            last_claim = NEW.claim_time;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_wallet_stats_trigger'
    ) THEN
        CREATE TRIGGER update_wallet_stats_trigger
            AFTER INSERT OR UPDATE ON compensation_claims
            FOR EACH ROW EXECUTE FUNCTION update_wallet_stats();
    END IF;
END;
$$;

-- Deterministic baseline data to ensure analytics routes have material to process
INSERT INTO devices (device_id, device_name, location_name, location_lat, location_lng, status)
VALUES
    ('houston_sensor_001', 'Houston East Sensor', 'East Houston', 29.7604, -95.3698, 'active'),
    ('houston_sensor_002', 'Houston Ship Channel Sensor', 'Ship Channel', 29.7355, -95.2521, 'active'),
    ('houston_sensor_003', 'Houston Heights Sensor', 'Heights District', 29.8011, -95.4171, 'active')
ON CONFLICT (device_id) DO NOTHING;

INSERT INTO compensation_claims (wallet_address, amount, claim_time, transaction_hash, status, pm25_trigger, device_id)
VALUES
    ('0x6b2f1c4d8a9e0b5f3c1d7e2f4a9b6c3d8e1f2a3b', 0.25, NOW() - INTERVAL '12 hours', '0x9fa4c5e2d1b6a3c7e8f2b4d6a1c9e0f8b7a6c5d4', 'confirmed', 55.2, 'houston_sensor_001'),
    ('0x5c4a3b2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b', 0.40, NOW() - INTERVAL '3 hours', '0x7b3c5e1f9a6d4c2b0e8f1a3c5d7b9e0f2a4c6d8b', 'confirmed', 68.7, 'houston_sensor_002')
ON CONFLICT (transaction_hash) DO NOTHING;

GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO houston;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO houston;
