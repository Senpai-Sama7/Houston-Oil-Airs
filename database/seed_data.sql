BEGIN;

TRUNCATE TABLE air_quality RESTART IDENTITY;
TRUNCATE TABLE compensation_claims RESTART IDENTITY;
TRUNCATE TABLE user_wallets RESTART IDENTITY;

INSERT INTO air_quality (time, device_id, pm25, pm10, temperature, humidity, health_events, signature, encrypted, location_lat, location_lng)
VALUES
    ('2025-09-19T08:00:00Z', 'houston_sensor_001', 25.5, 42.1, 30.2, 68.0, 1, '0x4d1f3c6a9270', false, 29.7604, -95.3698),
    ('2025-09-19T08:05:00Z', 'houston_sensor_002', 38.4, 55.9, 31.0, 64.7, 2, '0x9b4c817ad5ee', true, 29.7355, -95.2521),
    ('2025-09-19T08:10:00Z', 'houston_sensor_003', 28.1, 49.3, 29.8, 66.5, 0, '0x7fdd21c39480', false, 29.8011, -95.4171),
    ('2025-09-19T08:15:00Z', 'houston_sensor_001', 41.7, 62.0, 30.5, 67.2, 3, '0x5a2c44b18d11', true, 29.7604, -95.3698),
    ('2025-09-19T08:20:00Z', 'houston_sensor_002', 33.2, 51.6, 30.1, 65.3, 1, '0x6c3f110bd24a', false, 29.7355, -95.2521);

INSERT INTO compensation_claims (wallet_address, amount, claim_time, transaction_hash, status, pm25_trigger, device_id)
VALUES
    ('0x8a0b0fd9e4cbd8174fe65f0ff95a3ad50a6a1f01', 0.35, '2025-09-19T08:30:00Z', '0x913f6bc9555db2a192b7af92b3df617f084dcf68', 'confirmed', 41.7, 'houston_sensor_001'),
    ('0x4be7fa8ca613bf16a5cc7618c6e4a6fcb5dbbb13', 0.27, '2025-09-19T08:45:00Z', '0x0f58c2c2d61db22b99559fc08d2d63f5e87ff320', 'pending', 38.4, 'houston_sensor_002'),
    ('0x0a9b3f4c2d5ef671890c4b53a7d8c900fadc1b22', 0.41, '2025-09-19T09:05:00Z', '0x6b4f1d68e12cd548b823f89144b5e874703c3387', 'confirmed', 45.2, 'houston_sensor_001');

COMMIT;
