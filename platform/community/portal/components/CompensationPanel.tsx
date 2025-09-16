// Micro-payment compensation panel
import React, { useState } from 'react';

export default function CompensationPanel() {
  const [walletAddress, setWalletAddress] = useState('');
  const [claimAmount, setClaimAmount] = useState(0.01);
  const [isEligible, setIsEligible] = useState(true);

  const handleClaim = async () => {
    if (!walletAddress) {
      alert('Please enter your wallet address');
      return;
    }

    try {
      const response = await fetch('/api/compensation/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          amount: claimAmount,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        alert(`Successfully claimed $${claimAmount.toFixed(2)}!`);
      } else {
        alert('Claim failed. Please try again.');
      }
    } catch (error) {
      console.error('Claim error:', error);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">💰 Environmental Justice Compensation</h2>
        <p className="text-gray-600 mb-6">
          When air quality is poor, residents receive micro-payments funded by polluters.
          This creates economic incentives for cleaner air.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-blue-800">Current Eligibility Status</div>
              <div className="text-blue-600">
                {isEligible ? '✅ Eligible for compensation' : '❌ Not currently eligible'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-800">
                ${claimAmount.toFixed(2)}
              </div>
              <div className="text-sm text-blue-600">Available to claim</div>
            </div>
          </div>
        </div>

        {isEligible && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address (for payment)
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your wallet address for payment"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleClaim}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-semibold"
            >
              💰 Claim ${claimAmount.toFixed(2)} Compensation
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Compensation History</h3>
        <div className="space-y-3">
          {[
            { date: '2024-01-15', amount: 0.01, reason: 'PM2.5 exceeded 35 µg/m³' },
            { date: '2024-01-14', amount: 0.02, reason: 'PM2.5 exceeded 55 µg/m³' },
            { date: '2024-01-13', amount: 0.01, reason: 'PM2.5 exceeded 35 µg/m³' }
          ].map((claim, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b">
              <div>
                <div className="font-medium">{claim.date}</div>
                <div className="text-sm text-gray-600">{claim.reason}</div>
              </div>
              <div className="text-green-600 font-semibold">
                +${claim.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="font-semibold">Total Earned</div>
            <div className="text-xl font-bold text-green-600">$0.04</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">ℹ️ How It Works</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <div className="mr-3">1️⃣</div>
            <div>Sensors detect poor air quality in your neighborhood</div>
          </div>
          <div className="flex items-start">
            <div className="mr-3">2️⃣</div>
            <div>Smart contracts automatically calculate compensation based on pollution levels</div>
          </div>
          <div className="flex items-start">
            <div className="mr-3">3️⃣</div>
            <div>Funds come from polluter fees and environmental justice grants</div>
          </div>
          <div className="flex items-start">
            <div className="mr-3">4️⃣</div>
            <div>Residents claim micro-payments directly to their wallets</div>
          </div>
        </div>
      </div>
    </div>
  );
}