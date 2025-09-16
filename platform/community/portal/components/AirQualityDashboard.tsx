// Real-time air quality dashboard
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SensorData {
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  health_events: number;
  timestamp: number;
  device_id: string;
}

interface Props {
  data: SensorData | null;
}

export default function AirQualityDashboard({ data }: Props) {
  const getAQIColor = (pm25: number) => {
    if (pm25 <= 12) return 'text-green-600';
    if (pm25 <= 35) return 'text-yellow-600';
    if (pm25 <= 55) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAQILevel = (pm25: number) => {
    if (pm25 <= 12) return 'Good';
    if (pm25 <= 35) return 'Moderate';
    if (pm25 <= 55) return 'Unhealthy for Sensitive';
    return 'Unhealthy';
  };

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">📊 Real-Time Air Quality</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">PM2.5</div>
            <div className={`text-2xl font-bold ${getAQIColor(data.pm25)}`}>
              {data.pm25.toFixed(1)} µg/m³
            </div>
            <div className="text-sm text-gray-500">
              {getAQILevel(data.pm25)}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">PM10</div>
            <div className="text-2xl font-bold text-blue-600">
              {data.pm10.toFixed(1)} µg/m³
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Temperature</div>
            <div className="text-2xl font-bold text-orange-600">
              {data.temperature.toFixed(1)}°C
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Health Events</div>
            <div className="text-2xl font-bold text-red-600">
              {data.health_events}
            </div>
            <div className="text-sm text-gray-500">
              Inhaler uses/hour
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="text-sm text-gray-600">
            Last updated: {new Date(data.timestamp).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            Device: {data.device_id}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🚨 Community Health Alert</h3>
        {data.pm25 > 35 ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div>
                <div className="font-semibold text-red-800">
                  Air Quality Alert - Unhealthy Levels Detected
                </div>
                <div className="text-red-700">
                  PM2.5 levels are {data.pm25.toFixed(1)} µg/m³. 
                  Consider staying indoors and using air purifiers.
                </div>
                <div className="text-sm text-red-600 mt-2">
                  💰 Compensation available - Click the Compensation tab
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">✅</div>
              <div className="text-green-800">
                Air quality is currently at acceptable levels
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}