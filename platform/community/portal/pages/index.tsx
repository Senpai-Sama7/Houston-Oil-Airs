// Houston EJ-AI Community Portal - Main Page
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import AirQualityDashboard from '../components/AirQualityDashboard';
import VRViewer from '../components/VRViewer';
import CompensationPanel from '../components/CompensationPanel';

interface SensorData {
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  health_events: number;
  timestamp: number;
  device_id: string;
}

export default function Home(): JSX.Element {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sensorData, setSensorData] = useState<SensorData | null>(null);

  useEffect(() => {
    // Connect to real-time data stream
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sensors/latest');
        const data = await response.json();
        setSensorData(data);
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Houston EJ-AI Platform - Community Portal</title>
        <meta name="description" content="Community-owned environmental justice platform for Houston" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white">
          Skip to main content
        </a>
        
        <Header />
        
        {/* Quick Links */}
        <nav className="bg-white shadow-sm" aria-label="Quick links">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-4 py-2 overflow-x-auto">
              <Link
                href="/data-portal"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                📊 Data Portal
              </Link>
              <Link
                href="/simulator"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                🔬 Simulator
              </Link>
            </div>
          </div>
        </nav>
        
        <nav className="bg-white shadow-sm" aria-label="Main navigation">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-8">
              {[
                { id: 'dashboard', label: 'Live Data', icon: '📊' },
                { id: 'vr', label: 'VR Experience', icon: '🥽' },
                { id: 'compensation', label: 'Compensation', icon: '💰' },
                { id: 'legacy', label: 'Legacy Data', icon: '📈' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                  aria-label={`View ${tab.label}`}
                >
                  <span aria-hidden="true">{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <main id="main-content" className="max-w-7xl mx-auto py-6 px-4" role="main">
          {activeTab === 'dashboard' && (
            <AirQualityDashboard data={sensorData} />
          )}
          
          {activeTab === 'vr' && (
            <VRViewer />
          )}
          
          {activeTab === 'compensation' && (
            <CompensationPanel />
          )}
          
          {activeTab === 'legacy' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">📈 Legacy CSV Data</h2>
              <p className="text-gray-600 mb-4">
                Historical data from the original Houston-Oil-Airs sensors
              </p>
              <iframe 
                src="/legacy-graphs.html" 
                className="w-full h-96 border rounded"
                title="Legacy Data Visualization"
                aria-label="Legacy air quality data visualization"
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}