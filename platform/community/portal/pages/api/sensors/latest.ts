// API endpoint for latest sensor data
import type { NextApiRequest, NextApiResponse } from 'next';
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
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SensorData | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try to read from CSV file first (legacy support)
    const csvPath = path.join(process.cwd(), 'data', 'air_quality_data.csv');
    
    if (fs.existsSync(csvPath)) {
      const csvData = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvData.trim().split('\n');
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

    // Fallback to simulated data
    const simulatedData: SensorData = {
      pm25: Math.random() * 50 + 10, // 10-60 µg/m³
      pm10: Math.random() * 80 + 20, // 20-100 µg/m³
      temperature: Math.random() * 15 + 20, // 20-35°C
      humidity: Math.random() * 40 + 40, // 40-80%
      health_events: Math.floor(Math.random() * 5), // 0-4 events
      timestamp: Date.now(),
      device_id: 'houston_ej_ai_001'
    };

    res.status(200).json(simulatedData);
  } catch (error) {
    console.error('Error reading sensor data:', error);
    res.status(500).json({ error: 'Failed to read sensor data' });
  }
}