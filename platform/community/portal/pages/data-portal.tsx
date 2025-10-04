// Data Portal - Accessible data exploration and analysis
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';

interface DataSet {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  recordCount: number;
  category: string;
}

export default function DataPortal(): JSX.Element {
  const [datasets, setDatasets] = useState<DataSet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Mock data - in production this would fetch from API
    const mockDatasets: DataSet[] = [
      {
        id: '1',
        name: 'Air Quality Sensors',
        description: 'Real-time PM2.5, PM10, and pollutant measurements from community sensors',
        lastUpdated: '2024-01-15',
        recordCount: 150000,
        category: 'environment'
      },
      {
        id: '2',
        name: 'Health Events',
        description: 'Anonymized respiratory health incidents correlated with air quality',
        lastUpdated: '2024-01-14',
        recordCount: 5000,
        category: 'health'
      },
      {
        id: '3',
        name: 'Compensation History',
        description: 'Environmental justice compensation payments to affected residents',
        lastUpdated: '2024-01-15',
        recordCount: 1200,
        category: 'financial'
      },
      {
        id: '4',
        name: 'Facility Emissions',
        description: 'Industrial facility emissions data from EPA and state agencies',
        lastUpdated: '2024-01-10',
        recordCount: 25000,
        category: 'environment'
      }
    ];
    setDatasets(mockDatasets);
  }, []);

  const filteredDatasets = datasets.filter(ds => {
    const matchesCategory = selectedCategory === 'all' || ds.category === selectedCategory;
    const matchesSearch = ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ds.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'environment', label: 'Environmental' },
    { value: 'health', label: 'Health' },
    { value: 'financial', label: 'Financial' }
  ];

  return (
    <>
      <Head>
        <title>Data Portal - Houston EJ-AI Platform</title>
        <meta name="description" content="Access and explore environmental justice data" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <Header />
        
        <main className="max-w-7xl mx-auto py-6 px-4" role="main">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 Data Portal
            </h1>
            <p className="text-gray-600">
              Access, explore, and download environmental justice data with privacy protection
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6" role="search" aria-label="Dataset search and filters">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Datasets
                </label>
                <input
                  id="search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or description..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Search datasets by name or description"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Filter datasets by category"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600" aria-live="polite" aria-atomic="true">
              Showing {filteredDatasets.length} of {datasets.length} datasets
            </div>
          </div>

          {/* Dataset List */}
          <div className="space-y-4" role="list" aria-label="Available datasets">
            {filteredDatasets.map(dataset => (
              <article
                key={dataset.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                role="listitem"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {dataset.name}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {dataset.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Last Updated:</span>
                        <time dateTime={dataset.lastUpdated}>
                          {new Date(dataset.lastUpdated).toLocaleDateString()}
                        </time>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">Records:</span>
                        {dataset.recordCount.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {dataset.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label={`View ${dataset.name} dataset`}
                    >
                      View
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      aria-label={`Download ${dataset.name} dataset`}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredDatasets.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center" role="status" aria-live="polite">
              <p className="text-gray-600">No datasets found matching your criteria.</p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6" role="complementary" aria-label="Privacy notice">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              🔒 Privacy Protection
            </h2>
            <p className="text-blue-800 text-sm">
              All data is anonymized using k-anonymity and differential privacy techniques to protect individual privacy 
              while maintaining statistical accuracy. Personal identifiers are removed, and sensitive information is 
              aggregated to prevent re-identification.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
