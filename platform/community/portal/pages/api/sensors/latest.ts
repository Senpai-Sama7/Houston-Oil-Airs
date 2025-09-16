// PRODUCTION API endpoint for latest sensor data - Enterprise-grade implementation
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { SensorData } from '../../../types';
import { handleApiError, logError, createErrorResponse } from '../../../utils/errorHandler';

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
  res: NextApiResponse<SensorData | { success: false; error: string; code?: string; timestamp: number }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed', timestamp: Date.now() });
  }

  try {
    // Production database query with comprehensive error handling
    const dbResult = await pool.query(`
      SELECT 
        pm25, pm10, temperature, humidity, health_events, 
        EXTRACT(EPOCH FROM time) * 1000 as timestamp,
        device_id, signature, encrypted
      FROM air_quality 
      WHERE time >= NOW() - INTERVAL '1 hour'
      ORDER BY time DESC 
      LIMIT 1
    `);

    if (dbResult.rows.length > 0) {
      const row = dbResult.rows[0];
      const sensorData: SensorData = {
        pm25: parseFloat(row.pm25) || 0,
        pm10: parseFloat(row.pm10) || 0,
        temperature: parseFloat(row.temperature) || 0,
        humidity: parseFloat(row.humidity) || 0,
        health_events: parseInt(row.health_events) || 0,
        timestamp: parseInt(row.timestamp) || Date.now(),
        device_id: row.device_id || 'houston_sensor_001',
        signature: row.signature,
        encrypted: row.encrypted || false
      };
      
      return res.status(200).json(sensorData);
    }

    // Fallback to CSV file (legacy support) with proper error handling
    const csvPath = path.join(process.cwd(), 'data', 'air_quality_data.csv');
    
    if (fs.existsSync(csvPath)) {
      const csvData = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvData.trim().split('\n');
      if (lines.length > 1) {
        const lastLine = lines[lines.length - 1];
        const [timestamp, pm25, pm10, temperature, humidity, device_id, health_events] = lastLine.split(',');
        
        const sensorData: SensorData = {
          pm25: parseFloat(pm25) || 0,
          pm10: parseFloat(pm10) || 0,
          temperature: parseFloat(temperature) || 0,
          humidity: parseFloat(humidity) || 0,
          health_events: parseInt(health_events) || 0,
          timestamp: parseInt(timestamp) || Date.now(),
          device_id: device_id || 'houston_sensor_001'
        };
        
        return res.status(200).json(sensorData);
      }
    }

    // No data available - return 404
    return res.status(404).json({ 
      success: false, 
      error: 'No sensor data available', 
      code: 'NO_DATA',
      timestamp: Date.now() 
    });

  } catch (error) {
    const apiError = handleApiError(error);
    logError(apiError, { endpoint: '/api/sensors/latest', method: req.method });
    
    return res.status(apiError.statusCode).json(createErrorResponse(apiError));
  }
}