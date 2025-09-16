// REAL API endpoint for latest sensor data - NO MORE FAKE DATA
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

interface SensorData {
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  health_events: number;
  timestamp: number;
  device_id: string;
  signature?: string;
  encrypted?: boolean;
}

// Real database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'houston_ej_ai',
  user: process.env.DB_USER || 'houston',
  password: process.env.DB_PASSWORD || 'ej_ai_2024',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SensorData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try to get real data from TimescaleDB first
    const dbResult = await pool.query(`
      SELECT 
        pm25, pm10, temperature, humidity, health_events, 
        EXTRACT(EPOCH FROM time) * 1000 as timestamp,
        device_id, signature, encrypted
      FROM air_quality 
      ORDER BY time DESC 
      LIMIT 1
    `);

    if (dbResult.rows.length > 0) {
      const row = dbResult.rows[0];
      return res.status(200).json({
        pm25: parseFloat(row.pm25) || 0,
        pm10: parseFloat(row.pm10) || 0,
        temperature: parseFloat(row.temperature) || 0,
        humidity: parseFloat(row.humidity) || 0,
        health_events: parseInt(row.health_events) || 0,
        timestamp: parseInt(row.timestamp) || Date.now(),
        device_id: row.device_id || 'houston_sensor_001',
        signature: row.signature,
        encrypted: row.encrypted || false
      });
    }

    // Fallback to CSV file (legacy support)
    const csvPath = path.join(process.cwd(), 'data', 'air_quality_data.csv');
    
    if (fs.existsSync(csvPath)) {
      const csvData = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvData.trim().split('\n');
      if (lines.length > 1) {
        const lastLine = lines[lines.length - 1];
        const [timestamp, pm25, pm10, temperature, humidity, device_id, health_events] = lastLine.split(',');
        
        return res.status(200).json({
          pm25: parseFloat(pm25) || 0,
          pm10: parseFloat(pm10) || 0,
          temperature: parseFloat(temperature) || 0,
          humidity: parseFloat(humidity) || 0,
          health_events: parseInt(health_events) || 0,
          timestamp: parseInt(timestamp) || Date.now(),
          device_id: device_id || 'houston_sensor_001'
        });
      }
    }

    // No data available
    return res.status(404).json({ error: 'No sensor data available' });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  }
}