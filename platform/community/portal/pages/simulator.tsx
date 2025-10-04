// Air Quality Simulator - What-if analysis for policy interventions
import React, { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';

interface SimulationParams {
  baselinePM25: number;
  industrialReduction: number;
  trafficReduction: number;
  weatherFactor: number;
}

interface SimulationResult {
  projectedPM25: number;
  healthBenefit: number;
  costSavings: number;
  livesImproved: number;
}

export default function Simulator(): JSX.Element {
  const [params, setParams] = useState<SimulationParams>({
    baselinePM25: 35,
    industrialReduction: 0,
    trafficReduction: 0,
    weatherFactor: 1.0
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const runSimulation = (): void => {
    setIsSimulating(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // Simplified model - in production this would call a backend API
      const industrialImpact = params.baselinePM25 * (params.industrialReduction / 100) * 0.6;
      const trafficImpact = params.baselinePM25 * (params.trafficReduction / 100) * 0.4;
      const projectedPM25 = Math.max(0, (params.baselinePM25 - industrialImpact - trafficImpact) * params.weatherFactor);
      
      const healthBenefit = ((params.baselinePM25 - projectedPM25) / params.baselinePM25) * 100;
      const costSavings = healthBenefit * 50000; // $50k per percent improvement
      const livesImproved = Math.round(healthBenefit * 100);
      
      setResult({
        projectedPM25,
        healthBenefit,
        costSavings,
        livesImproved
      });
      setIsSimulating(false);
    }, 1000);
  };

  const handleSliderChange = (field: keyof SimulationParams, value: number): void => {
    setParams(prev => ({ ...prev, [field]: value }));
    setResult(null); // Clear previous results
  };

  const getAQILevel = (pm25: number): string => {
    if (pm25 <= 12) return 'Good';
    if (pm25 <= 35) return 'Moderate';
    if (pm25 <= 55) return 'Unhealthy for Sensitive';
    return 'Unhealthy';
  };

  const getAQIColor = (pm25: number): string => {
    if (pm25 <= 12) return 'text-green-600';
    if (pm25 <= 35) return 'text-yellow-600';
    if (pm25 <= 55) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <>
      <Head>
        <title>Air Quality Simulator - Houston EJ-AI Platform</title>
        <meta name="description" content="Simulate policy interventions and their impact on air quality" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <Header />
        
        <main className="max-w-7xl mx-auto py-6 px-4" role="main">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔬 Air Quality Simulator
            </h1>
            <p className="text-gray-600">
              Model the impact of policy interventions on air quality and public health
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Simulation Controls */}
            <section className="bg-white rounded-lg shadow p-6" aria-labelledby="controls-heading">
              <h2 id="controls-heading" className="text-xl font-semibold mb-6">
                Simulation Parameters
              </h2>
              
              <form onSubmit={(e) => { e.preventDefault(); runSimulation(); }} className="space-y-6">
                {/* Baseline PM2.5 */}
                <div>
                  <label htmlFor="baseline-pm25" className="block text-sm font-medium text-gray-700 mb-2">
                    Baseline PM2.5: <span className="font-bold">{params.baselinePM25.toFixed(1)} µg/m³</span>
                  </label>
                  <input
                    id="baseline-pm25"
                    type="range"
                    min="10"
                    max="100"
                    step="0.5"
                    value={params.baselinePM25}
                    onChange={(e) => handleSliderChange('baselinePM25', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    aria-label="Baseline PM2.5 concentration"
                    aria-valuemin={10}
                    aria-valuemax={100}
                    aria-valuenow={params.baselinePM25}
                    aria-valuetext={`${params.baselinePM25.toFixed(1)} micrograms per cubic meter`}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Industrial Reduction */}
                <div>
                  <label htmlFor="industrial-reduction" className="block text-sm font-medium text-gray-700 mb-2">
                    Industrial Emission Reduction: <span className="font-bold">{params.industrialReduction}%</span>
                  </label>
                  <input
                    id="industrial-reduction"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={params.industrialReduction}
                    onChange={(e) => handleSliderChange('industrialReduction', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    aria-label="Industrial emission reduction percentage"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={params.industrialReduction}
                    aria-valuetext={`${params.industrialReduction} percent reduction`}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Traffic Reduction */}
                <div>
                  <label htmlFor="traffic-reduction" className="block text-sm font-medium text-gray-700 mb-2">
                    Traffic Reduction: <span className="font-bold">{params.trafficReduction}%</span>
                  </label>
                  <input
                    id="traffic-reduction"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={params.trafficReduction}
                    onChange={(e) => handleSliderChange('trafficReduction', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    aria-label="Traffic volume reduction percentage"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={params.trafficReduction}
                    aria-valuetext={`${params.trafficReduction} percent reduction`}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Weather Factor */}
                <div>
                  <label htmlFor="weather-factor" className="block text-sm font-medium text-gray-700 mb-2">
                    Weather Conditions: <span className="font-bold">{params.weatherFactor.toFixed(1)}x</span>
                  </label>
                  <input
                    id="weather-factor"
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={params.weatherFactor}
                    onChange={(e) => handleSliderChange('weatherFactor', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    aria-label="Weather impact factor"
                    aria-valuemin={0.5}
                    aria-valuemax={1.5}
                    aria-valuenow={params.weatherFactor}
                    aria-valuetext={`${params.weatherFactor.toFixed(1)} times baseline`}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Good (0.5x)</span>
                    <span>Poor (1.5x)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSimulating}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Run simulation with current parameters"
                >
                  {isSimulating ? '⏳ Simulating...' : '🔬 Run Simulation'}
                </button>
              </form>
            </section>

            {/* Results Panel */}
            <section className="bg-white rounded-lg shadow p-6" aria-labelledby="results-heading" aria-live="polite">
              <h2 id="results-heading" className="text-xl font-semibold mb-6">
                Simulation Results
              </h2>
              
              {result ? (
                <div className="space-y-6">
                  {/* Projected PM2.5 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Projected PM2.5</div>
                    <div className={`text-3xl font-bold ${getAQIColor(result.projectedPM25)}`}>
                      {result.projectedPM25.toFixed(1)} µg/m³
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {getAQILevel(result.projectedPM25)} - {((1 - result.projectedPM25 / params.baselinePM25) * 100).toFixed(1)}% improvement
                    </div>
                  </div>

                  {/* Health Benefit */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-700 mb-1">Health Benefit</div>
                    <div className="text-3xl font-bold text-green-600">
                      {result.healthBenefit.toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      Reduction in health risks
                    </div>
                  </div>

                  {/* Lives Improved */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-700 mb-1">People Benefiting</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {result.livesImproved.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      Residents with improved air quality
                    </div>
                  </div>

                  {/* Cost Savings */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-700 mb-1">Annual Cost Savings</div>
                    <div className="text-3xl font-bold text-purple-600">
                      ${(result.costSavings / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm text-purple-600 mt-1">
                      Healthcare & productivity gains
                    </div>
                  </div>

                  {/* Comparison */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Comparison</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Baseline PM2.5:</span>
                        <span className="font-medium">{params.baselinePM25.toFixed(1)} µg/m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Projected PM2.5:</span>
                        <span className="font-medium text-green-600">{result.projectedPM25.toFixed(1)} µg/m³</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-900">Net Change:</span>
                        <span className="text-green-600">-{(params.baselinePM25 - result.projectedPM25).toFixed(1)} µg/m³</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p>Adjust parameters and run simulation to see results</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Model Information */}
          <aside className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6" role="complementary" aria-labelledby="model-info-heading">
            <h2 id="model-info-heading" className="text-lg font-semibold text-yellow-900 mb-2">
              ℹ️ About This Model
            </h2>
            <p className="text-yellow-800 text-sm mb-2">
              This simulator uses simplified modeling based on peer-reviewed research on air quality interventions. 
              The model assumes:
            </p>
            <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1">
              <li>Industrial sources contribute ~60% of PM2.5</li>
              <li>Traffic sources contribute ~40% of PM2.5</li>
              <li>Weather can amplify or reduce pollution by ±50%</li>
              <li>Health benefits scale linearly with pollution reduction</li>
            </ul>
            <p className="text-yellow-800 text-sm mt-2">
              For actual policy decisions, consult with environmental scientists and use comprehensive modeling tools.
            </p>
          </aside>
        </main>
      </div>
    </>
  );
}
