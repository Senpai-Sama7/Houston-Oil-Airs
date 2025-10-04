// Privacy-aware sensor data aggregation API
import type { NextApiRequest, NextApiResponse } from 'next';
import { aggregateSensorDataWithPrivacy, SensorReading } from '../../../utils/privacy';

interface AggregateResponse {
  success: true;
  data: {
    avgPM25: number;
    avgPM10: number;
    avgTemperature: number;
    avgHumidity: number;
    deviceCount: number;
    timeRange: { start: number; end: number };
  };
  privacyGuarantees: {
    epsilon: number;
    method: string;
    anonymized: boolean;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AggregateResponse | ErrorResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { sensorData, epsilon = 0.1 } = req.body as {
      sensorData: SensorReading[];
      epsilon?: number;
    };

    if (!sensorData || !Array.isArray(sensorData) || sensorData.length === 0) {
      res.status(400).json({ success: false, error: 'Invalid sensor data' });
      return;
    }

    // Apply differential privacy to aggregation
    const aggregated = aggregateSensorDataWithPrivacy(sensorData, epsilon);

    res.status(200).json({
      success: true,
      data: aggregated,
      privacyGuarantees: {
        epsilon,
        method: 'differential_privacy',
        anonymized: true
      }
    });
  } catch (error) {
    console.error('Aggregation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
