const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const Redis = require('redis');
let ffi, ref;
try {
  ffi = require('ffi-napi');
  ref = require('ref-napi');
} catch (e) {
  // Optional: FFI not available in some environments
}

// Import native C++ module (optionally)
// Controlled by env CPP_ENGINE_ENABLED (default on). Falls back to JS generator when unavailable.
let nativeLib = null;
let nativeEnabled = process.env.CPP_ENGINE_ENABLED !== '0';
if (nativeEnabled && ffi) {
  try {
    nativeLib = ffi.Library('../cpp-engine/build/libdata_processor.so', {
      'create_processor': ['pointer', []],
      'destroy_processor': ['void', ['pointer']],
      'get_visualization_data': ['string', ['pointer', 'string']],
      'update_real_time_data': ['void', ['pointer', 'pointer', 'int']]
    });
  } catch (e) {
    console.warn('Native library unavailable, falling back to JS:', e.message);
    nativeEnabled = false;
  }
}

class HighPerformanceWebServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"]
            }
        });
        
        const redisHost = process.env.REDIS_HOST || 'localhost';
        const redisPort = process.env.REDIS_PORT || 6379;
        this.redis = Redis.createClient({ url: `redis://${redisHost}:${redisPort}` });

        this.redis.on('error', (err) => console.error('Redis error:', err));
        this.redis.on('reconnecting', () => console.log('Redis reconnecting'));
        this.redis.connect().catch(err => console.error('Redis connection error:', err));
        
        this.nativeAvailable = !!nativeLib;
        this.dataProcessor = this.nativeAvailable ? nativeLib.create_processor() : null;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.setupRealTimeDataStreaming();
    }
    
    setupMiddleware() {
        // Security and performance middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'"],
                    styleSrc: ["'self'", "https:"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "ws:", "wss:"]
                }
            }
        }));
        
        this.app.use(compression({
            level: 6,
            threshold: 1024,
            filter: (req, res) => {
                return compression.filter(req, res);
            }
        }));
        
        this.app.use(cors({
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            credentials: true
        }));
        
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // limit each IP to 1000 requests per windowMs
            message: 'Too many requests from this IP'
        });
        this.app.use('/api/', limiter);
    }
    
    setupRoutes() {
        // Initialize per-route counters
        this.routeCounts = { viz: 0, network: 0, updateMetrics: 0, analytics: 0 };

        // High-performance data endpoints
        this.app.get('/api/research/visualization-data/:category', async (req, res) => {
            try {
                this.routeCounts.viz++;
                const { category } = req.params;
                const cached = await this.redis.get(`viz_data:${category}`);
                
                if (cached) {
                    res.json(JSON.parse(cached));
                    return;
                }
                
                let payload;
                if (this.nativeAvailable) {
                    const data = nativeLib.get_visualization_data(this.dataProcessor, category);
                    payload = JSON.parse(data);
                } else {
                    payload = this.buildVisualizationDataFallback(category);
                }
                // Cache for 5 minutes
                await this.redis.setEx(`viz_data:${category}`, 300, JSON.stringify(payload));
                res.json(payload);
            } catch (error) {
                console.error('Error getting visualization data:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        
        this.app.get('/api/research/network-topology', async (req, res) => {
            try {
                this.routeCounts.network++;
                const networkData = await this.generateNetworkTopology();
                res.json(networkData);
            } catch (error) {
                console.error('Error generating network topology:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        
        this.app.post('/api/research/update-metrics', async (req, res) => {
            try {
                this.routeCounts.updateMetrics++;
                const { metrics } = req.body || {};
                if (!Array.isArray(metrics) || metrics.length > 10000) {
                    return res.status(400).json({ error: 'Invalid metrics payload' });
                }
                for (const v of metrics) {
                    if (typeof v !== 'number' || !isFinite(v)) {
                        return res.status(400).json({ error: 'Metrics must be finite numbers' });
                    }
                }
                
                // Convert metrics to native array for C++ processing
                const buffer = Buffer.alloc(metrics.length * 8);
                metrics.forEach((value, index) => {
                    buffer.writeDoubleLE(value, index * 8);
                });
                
                if (this.nativeAvailable) {
                    nativeLib.update_real_time_data(
                        this.dataProcessor,
                        buffer,
                        metrics.length
                    );
                }
                
                // Notify connected clients
                this.io.emit('metrics_updated', { 
                    timestamp: Date.now(),
                    count: metrics.length 
                });
                
                res.json({ success: true, processed: metrics.length });
            } catch (error) {
                console.error('Error updating metrics:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        // Metrics endpoints (Prometheus and JSON)
        this.metrics = { requests: 0, startTime: Date.now() };
        this.app.use((req, res, next) => { this.metrics.requests++; next(); });
        this.app.get('/metrics', (req, res) => {
            res.set('Content-Type', 'text/plain; version=0.0.4');
            const lines = [];
            lines.push(`# HELP app_requests_total Total HTTP requests handled`);
            lines.push(`# TYPE app_requests_total counter`);
            lines.push(`app_requests_total ${this.metrics.requests}`);
            lines.push(`# HELP app_uptime_seconds Process uptime in seconds`);
            lines.push(`# TYPE app_uptime_seconds gauge`);
            lines.push(`app_uptime_seconds ${Math.round(process.uptime())}`);
            lines.push(`# HELP app_memory_rss_megabytes Resident set size in MB`);
            lines.push(`# TYPE app_memory_rss_megabytes gauge`);
            lines.push(`app_memory_rss_megabytes ${Math.round(process.memoryUsage().rss / 1048576)}`);
            lines.push(`# HELP app_native_mode Indicates if native engine is available (1=yes,0=no)`);
            lines.push(`# TYPE app_native_mode gauge`);
            lines.push(`app_native_mode ${this.nativeAvailable ? 1 : 0}`);
            lines.push(`# HELP app_route_requests_total Total requests per route`);
            lines.push(`# TYPE app_route_requests_total counter`);
            lines.push(`app_route_requests_total{route="viz"} ${this.routeCounts.viz}`);
            lines.push(`app_route_requests_total{route="network"} ${this.routeCounts.network}`);
            lines.push(`app_route_requests_total{route="update_metrics"} ${this.routeCounts.updateMetrics}`);
            lines.push(`app_route_requests_total{route="analytics_trends"} ${this.routeCounts.analytics}`);
            lines.push(`# HELP app_route_errors_total Total errors per route`);
            lines.push(`# TYPE app_route_errors_total counter`);
            lines.push(`app_route_errors_total{route="viz"} ${this.routeErrors.viz}`);
            lines.push(`app_route_errors_total{route="network"} ${this.routeErrors.network}`);
            lines.push(`app_route_errors_total{route="update_metrics"} ${this.routeErrors.updateMetrics}`);
            lines.push(`app_route_errors_total{route="analytics_trends"} ${this.routeErrors.analytics}`);
            lines.push(`# HELP app_route_duration_seconds_bucket Request duration histogram buckets per route`);
            lines.push(`# TYPE app_route_duration_seconds_bucket histogram`);
            const dumpHist = (key, buckets) => {
                for (let i = 0; i < this.durationBuckets.length; i++) {
                    const le = this.durationBuckets[i];
                    const count = buckets[i];
                    lines.push(`app_route_duration_seconds_bucket{route=\"${key}\",le=\"${le}\"} ${count}`);
                }
            };
            dumpHist('viz', this.routeDurations.viz);
            dumpHist('network', this.routeDurations.network);
            dumpHist('update_metrics', this.routeDurations.updateMetrics);
            dumpHist('analytics_trends', this.routeDurations.analytics);
            res.send(lines.join('\n'));
        });
        this.app.get('/metrics.json', (req, res) => {
            res.json({
                requests_total: this.metrics.requests,
                uptime_seconds: Math.round(process.uptime()),
                memory_rss_mb: Math.round(process.memoryUsage().rss / 1048576),
                native: this.nativeAvailable ? 'available' : 'fallback',
                route_counts: this.routeCounts,
                route_errors: this.routeErrors
            });
        });
        
        // AI Research Analytics Integration
        this.app.get('/api/analytics/trends/:category', async (req, res) => {
            try {
                this.routeCounts.analytics++;
                const response = await fetch(
                    `${process.env.JAVA_SERVICE_URL}/api/analytics/research-trends?category=${req.params.category}&timeframe=${req.query.timeframe || 24}`
                );
                if (!response.ok) {
                    return res.status(response.status).json({ error: 'Analytics service error' });
                }
                const data = await response.json();
                res.json(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                res.status(500).json({ error: 'Analytics service unavailable' });
            }
        });
        
        // Serve static files for development (if present)
        this.app.use(express.static('public'));
        
        // Liveness and readiness endpoints
        this.app.get('/live', (req, res) => {
            res.json({ status: 'alive', timestamp: new Date().toISOString() });
        });
        this.app.get('/ready', async (req, res) => {
            const ready = (this.redis?.isOpen === true);
            const details = {
                status: ready ? 'ready' : 'not_ready',
                redis: this.redis?.isOpen === true ? 'connected' : 'disconnected',
                native: this.nativeAvailable ? 'available' : 'fallback',
                timestamp: new Date().toISOString()
            };
            if (ready) return res.json(details);
            return res.status(503).json(details);
        });
        // Back-compat health alias
        this.app.get('/health', (req, res) => res.redirect(307, '/ready'));
    }
    
    setupWebSocket() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            
            socket.on('subscribe_to_category', (category) => {
                socket.join(`category:${category}`);
                console.log(`Client ${socket.id} subscribed to ${category}`);
            });
            
            socket.on('request_real_time_data', async (params) => {
                try {
                    const data = await this.getRealTimeData(params);
                    socket.emit('real_time_data', data);
                } catch (error) {
                    socket.emit('error', { message: 'Failed to get real-time data' });
                }
            });
            
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }
    
    setupRealTimeDataStreaming() {
        // Simulate real-time data updates
        this.streamingInterval = setInterval(async () => {
            try {
                const categories = ['alignment', 'fairness', 'interpretability', 'robustness', 'safety'];
                
                for (const category of categories) {
                    const simulatedMetrics = this.generateSimulatedMetrics();
                    
                    // Update native processor
                    const buffer = Buffer.alloc(simulatedMetrics.length * 8);
                    simulatedMetrics.forEach((value, index) => {
                        buffer.writeDoubleLE(value, index * 8);
                    });
                    
                    nativeProcessor.update_real_time_data(
                        this.dataProcessor,
                        buffer,
                        simulatedMetrics.length
                    );
                    
                    // Broadcast to subscribed clients
                    this.io.to(`category:${category}`).emit('data_update', {
                        category,
                        metrics: simulatedMetrics,
                        timestamp: Date.now()
                    });
                }
            } catch (error) {
                console.error('Error in real-time streaming:', error);
            }
        }, 2000); // Update every 2 seconds
    }
    
    async generateNetworkTopology() {
        const nodes = [];
        const edges = [];
        
        const categories = ['alignment', 'fairness', 'interpretability', 'robustness', 'safety', 'ethics'];
        
        // Generate nodes
        categories.forEach((category, categoryIndex) => {
            for (let i = 0; i < 15; i++) {
                nodes.push({
                    id: `${category}_${i}`,
                    label: `${category.charAt(0).toUpperCase() + category.slice(1)} Research ${i + 1}`,
                    category,
                    influence: Math.random(),
                    x: Math.cos(categoryIndex * Math.PI / 3) * (3 + Math.random() * 2),
                    y: Math.sin(categoryIndex * Math.PI / 3) * (3 + Math.random() * 2),
                    z: (Math.random() - 0.5) * 4
                });
            }
        });
        
        // Generate edges with realistic connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (Math.random() < 0.2) { // 20% connection probability
                    edges.push({
                        source: nodes[i].id,
                        target: nodes[j].id,
                        weight: Math.random(),
                        type: this.getEdgeType(nodes[i].category, nodes[j].category)
                    });
                }
            }
        }
        
        return { nodes, edges };
    }
    
    getEdgeType(cat1, cat2) {
        if (cat1 === cat2) return 'internal_collaboration';
        const types = ['cross_disciplinary', 'methodology_sharing', 'data_collaboration', 'theoretical_influence'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    generateSimulatedMetrics() {
        return Array.from({ length: 10 }, () => Math.random() * 2 - 1);
    }
    
    async getRealTimeData(params) {
        const { category, timeRange } = params;
        
        // Get fresh data from native processor or fallback
        let parsedData;
        if (this.nativeAvailable) {
            const data = nativeLib.get_visualization_data(this.dataProcessor, category);
            parsedData = JSON.parse(data);
        } else {
            parsedData = this.buildVisualizationDataFallback(category);
        }
        
        // Add real-time enhancements
        return {
            ...parsedData,
            real_time_metrics: this.generateSimulatedMetrics(),
            network_activity: Math.random() * 100,
            processing_timestamp: Date.now()
        };
    }
    
    buildVisualizationDataFallback(category) {
        // Construct a payload similar to C++ output
        const points = [];
        const count = 1500;
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;
            const conf = Math.random();
            points.push({
                pos: [x, y, z],
                confidence: conf,
                category,
                timestamp: Date.now() / 1000,
                meta: [Math.random(), Math.random(), Math.random()]
            });
        }
        return {
            research_points: points,
            total_count: count,
            generation_time: Date.now() / 1000
        };
    }
    
    start(port = process.env.PORT || 3001) {
        this.server.listen(port, () => {
            console.log(`🚀 Houston Oil Airs server running on port ${port}`);
            console.log(`🔗 WebSocket server ready for real-time connections`);
            console.log(`💾 Redis connection: ${this.redis.status}`);
        });
    }
    
    shutdown() {
        console.log('Shutting down server...');
        if (this.nativeAvailable && this.dataProcessor) {
            try { nativeLib.destroy_processor(this.dataProcessor); } catch (e) {}
        }
        this.redis.quit();
        clearInterval(this.streamingInterval);
        this.server.close();
    }
}

if (require.main === module) {
    const server = new HighPerformanceWebServer();

    // Graceful shutdown handlers are registered after server instantiation
    process.on('SIGINT', () => {
        console.log('Received SIGINT, shutting down gracefully...');
        try { server.shutdown(); } catch (e) { /* noop */ }
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('Received SIGTERM, shutting down gracefully...');
        try { server.shutdown(); } catch (e) { /* noop */ }
        process.exit(0);
    });

    server.start();
}

module.exports = HighPerformanceWebServer;
