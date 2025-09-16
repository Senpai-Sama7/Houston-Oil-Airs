// Houston EJ-AI Community Portal - Main Page
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import AirQualityDashboard from '../components/AirQualityDashboard';
import VRViewer from '../components/VRViewer';
import CompensationPanel from '../components/CompensationPanel';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sensorData, setSensorData] = useState(null);

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
        <meta name="description" content="Community-owned environmental justice platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <Header />
        
        <nav className="bg-white shadow-sm">
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
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 px-4">
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
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}