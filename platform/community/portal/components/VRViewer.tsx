// VR pollution plume viewer - simplified version
import React from 'react';

export default function VRViewer() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">🥽 VR Pollution Experience</h2>
      <p className="text-gray-600 mb-4">
        Walk inside the pollution plume. Interactive 3D visualization coming soon.
      </p>
      
      <div className="h-96 bg-gradient-to-b from-red-900 via-orange-500 to-yellow-300 rounded-lg overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🏭</div>
            <div className="text-2xl font-bold mb-2">Houston EJ-AI Platform</div>
            <div className="text-lg">3D Pollution Visualization</div>
            <div className="mt-4 text-sm opacity-75">
              Interactive VR experience with Three.js coming in next update
            </div>
          </div>
        </div>
        
        {/* Animated pollution particles */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-red-500 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute top-20 right-20 w-3 h-3 bg-orange-500 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/3 w-5 h-5 bg-yellow-500 rounded-full opacity-40 animate-ping"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-red-600 rounded-full opacity-70 animate-bounce"></div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-3 rounded">
          <div className="text-red-800 font-semibold">🔴 High Pollution</div>
          <div className="text-sm text-red-600">PM2.5 &gt; 35 µg/m³</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded">
          <div className="text-yellow-800 font-semibold">🟡 Moderate</div>
          <div className="text-sm text-yellow-600">PM2.5 12-35 µg/m³</div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-green-800 font-semibold">🟢 Good</div>
          <div className="text-sm text-green-600">PM2.5 &lt; 12 µg/m³</div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          🥽 Launch Full VR Experience (Coming Soon)
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Next Update:</strong> Full Three.js/WebGL VR experience with:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Interactive 3D pollution plumes</li>
          <li>Walk-through contaminated areas</li>
          <li>Real-time sensor data visualization</li>
          <li>Mobile and desktop VR support</li>
        </ul>
      </div>
    </div>
  );
}