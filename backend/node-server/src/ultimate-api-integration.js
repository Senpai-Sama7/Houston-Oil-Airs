// Ultimate API Pack Integration - Houston Oil Airs Platform
// Integrates FastAPI data services with Node.js backend

const axios = require('axios');

class UltimateAPIIntegration {
    constructor(fastApiUrl = 'http://localhost:8000') {
        this.fastApiUrl = fastApiUrl;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async makeRequest(endpoint) {
        const cacheKey = endpoint;
        const now = Date.now();

        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (now - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await axios.get(`${this.fastApiUrl}${endpoint}`, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Houston-Oil-Airs-Platform/1.0'
                }
            });

            // Cache the result
            this.cache.set(cacheKey, {
                data: response.data,
                timestamp: now
            });

            return response.data;
        } catch (error) {
            console.error(`Ultimate API request failed for ${endpoint}:`, error.message);
            throw new Error(`Data service unavailable: ${error.message}`);
        }
    }

    // Traffic & Transportation Data
    async getTrafficData() {
        return {
            speedSegments: await this.makeRequest('/transtar/speedsegments'),
            incidents: await this.makeRequest('/transtar/incidents'),
            laneClosures: await this.makeRequest('/transtar/lane_closures'),
            floodWarnings: await this.makeRequest('/transtar/roadway_flood_warnings')
        };
    }

    async getTransitData() {
        return {
            vehiclePositions: await this.makeRequest('/metro/vehicle_positions'),
            tripUpdates: await this.makeRequest('/metro/trip_updates')
        };
    }

    async getBikeShareData() {
        return await this.makeRequest('/bcycle/station_status');
    }

    // Environmental Data
    async getWaterData(county = '201', state = 'TX') {
        const sites = await this.makeRequest(`/usgs/sites?county_code=${county}&state=${state}`);
        return {
            sites: sites,
            siteCount: sites?.value?.timeSeries?.length || 0
        };
    }

    async getMarineData() {
        return {
            buoyData: await this.makeRequest('/ndbc/latest_observations'),
            marineWeather: await this.makeRequest('/ndbc/marine_forecast')
        };
    }

    async getWeatherData() {
        return {
            currentConditions: await this.makeRequest('/nws/current_conditions'),
            radarData: await this.makeRequest('/nws_nowcast/radar_latest'),
            weatherAlerts: await this.makeRequest('/nws/weather_alerts')
        };
    }

    async getAviationData() {
        return {
            metar: await this.makeRequest('/aviation/metar'),
            taf: await this.makeRequest('/aviation/taf')
        };
    }

    // Air Quality Data
    async getAirQualityData() {
        return {
            airNow: await this.makeRequest('/airnow/current_conditions'),
            purpleAir: await this.makeRequest('/purpleair/sensors'),
            aqicn: await this.makeRequest('/aqicn/houston')
        };
    }

    // Consolidated Houston Data Dashboard
    async getHoustonDataDashboard() {
        try {
            const [traffic, transit, bikeShare, airQuality, weather] = await Promise.allSettled([
                this.getTrafficData(),
                this.getTransitData(),
                this.getBikeShareData(),
                this.getAirQualityData(),
                this.getWeatherData()
            ]);

            return {
                timestamp: new Date().toISOString(),
                status: 'success',
                data: {
                    traffic: traffic.status === 'fulfilled' ? traffic.value : { error: traffic.reason?.message },
                    transit: transit.status === 'fulfilled' ? transit.value : { error: transit.reason?.message },
                    bikeShare: bikeShare.status === 'fulfilled' ? bikeShare.value : { error: bikeShare.reason?.message },
                    airQuality: airQuality.status === 'fulfilled' ? airQuality.value : { error: airQuality.reason?.message },
                    weather: weather.status === 'fulfilled' ? weather.value : { error: weather.reason?.message }
                },
                dataSourcesCount: {
                    traffic: traffic.status === 'fulfilled' ? 4 : 0, // speedSegments, incidents, closures, floods
                    transit: transit.status === 'fulfilled' ? 2 : 0, // vehicles, trips
                    environmental: 3, // water, marine, weather
                    airQuality: 3 // airnow, purpleair, aqicn
                }
            };
        } catch (error) {
            return {
                timestamp: new Date().toISOString(),
                status: 'error',
                error: error.message,
                data: null
            };
        }
    }

    // Health check for the Ultimate API service
    async healthCheck() {
        try {
            const response = await axios.get(`${this.fastApiUrl}/health`, { timeout: 5000 });
            return {
                ultimateApi: response.data?.ok ? 'healthy' : 'degraded',
                responseTime: response.headers['x-response-time'] || 'unknown',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                ultimateApi: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Cache management
    clearCache() {
        this.cache.clear();
    }

    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            oldestEntry: Math.min(...Array.from(this.cache.values()).map(v => v.timestamp)),
            newestEntry: Math.max(...Array.from(this.cache.values()).map(v => v.timestamp))
        };
    }
}

module.exports = UltimateAPIIntegration;