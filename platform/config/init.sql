-- TimescaleDB initialization for Houston EJ-AI
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Air quality data table
CREATE TABLE IF NOT EXISTS air_quality (
    time TIMESTAMPTZ NOT NULL,
    device_id TEXT NOT NULL,
    pm25 REAL,
    pm10 REAL,
    temperature REAL,
    humidity REAL,
    health_events INTEGER DEFAULT 0,
    signature TEXT,
    encrypted BOOLEAN DEFAULT FALSE
);

-- Create hypertable for time-series data
SELECT create_hypertable('air_quality', 'time', if_not_exists => TRUE);

-- Compensation claims table
CREATE TABLE IF NOT EXISTS compensation_claims (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    claim_time TIMESTAMPTZ DEFAULT NOW(),
    transaction_id TEXT,
    status TEXT DEFAULT 'pending'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_air_quality_device_time ON air_quality (device_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_compensation_wallet ON compensation_claims (wallet_address);

-- Insert reference data
INSERT INTO air_quality (time, device_id, pm25, pm10, temperature, humidity, health_events, encrypted)
VALUES 
    (NOW() - INTERVAL '1 hour', 'houston_ej_ai_001', 25.5, 45.2, 28.3, 65.1, 2, true),
    (NOW() - INTERVAL '2 hours', 'houston_ej_ai_001', 32.1, 52.8, 27.9, 68.4, 3, true),
    (NOW() - INTERVAL '3 hours', 'houston_ej_ai_001', 18.7, 38.9, 29.1, 62.3, 1, true);

COMMIT;