// Header component with Houston Oil Airs branding
import React from 'react';

export default function Header() {
  return (
    <header className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🌮🌳</div>
            <div>
              <h1 className="text-2xl font-bold">
                Houston Oil Airs + EJ-AI Platform
              </h1>
              <p className="text-blue-200">
                Community-owned data • Dual-key encryption • Environmental Justice
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-blue-200">Version 2.0</div>
              <div className="text-xs text-blue-300">GPL-3.0 Licensed</div>
            </div>
            <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center">
              <span className="text-xl">🏭</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}