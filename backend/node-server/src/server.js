const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const Redis = require('redis');
const ffi = require('ffi-napi');
const ref = require('ref-napi');

// Import native C++ module
const nativeProcessor = ffi.Library('./cpp-engine/build/libdata_processor.so', {
    'create_processor': ['pointer', []],
    'destroy_processor': ['void', ['pointer']],
    'get_visualization_data': ['string', ['pointer', 'string']],
    'update_real_time_data': ['void', ['pointer', 'pointer', 'int']]
});

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
        
        this.redis = Redis.createClient({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379
        });
        
        this.dataProcessor = nativeProcessor.create_processor();
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
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
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
        // High-performance data endpoints
        this.app.get('/api/research/visualization-data/:category', async (req, res) => {
            try {
                const { category } = req.params;
                const cached = await this.redis.get(`viz_data:${category}`);
                
                if (cached) {
                    res.json(JSON.parse(cached));
                    return;
                }
                
                const data = nativeProcessor.get_visualization_data(
                    this.dataProcessor, 
                    category
                );
                
                const parsedData = JSON.parse(data);
                
                // Cache for 5 minutes
                await this.redis.setex(`viz_data:${category}`, 300, data);
                
                res.json(parsedData);
            } catch (error) {
                console.error('Error getting visualization data:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        
        this.app.get('/api/research/network-topology', async (req, res) => {
            try {
                const networkData = await this.generateNetworkTopology();
                res.json(networkData);
            } catch (error) {
                console.error('Error generating network topology:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        
        this.app.post('/api/research/update-metrics', async (req, res) => {
            try {
                const { metrics } = req.body;
                
                // Convert metrics to native array for C++ processing
                const buffer = Buffer.alloc(metrics.length * 8);
                metrics.forEach((value, index) => {
                    buffer.writeDoubleLE(value, index * 8);
                });
                
                nativeProcessor.update_real_time_data(
                    this.dataProcessor,
                    buffer,
                    metrics.length
                );
                
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
        
        // AI Research Analytics Integration
        this.app.get('/api/analytics/trends/:category', async (req, res) => {
            try {
                const response = await fetch(
                    `${process.env.JAVA_SERVICE_URL}/api/analytics/research-trends?category=${req.params.category}&timeframe=${req.query.timeframe || 24}`
                );
                const data = await response.json();
                res.json(data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                res.status(500).json({ error: 'Analytics service unavailable' });
            }
        });
        
        // Serve static files for development
        this.app.use(express.static('public'));
        
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage()
            });
        });
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
        setInterval(async () => {
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
        
        // Get fresh data from native processor
        const data = nativeProcessor.get_visualization_data(this.dataProcessor, category);
        const parsedData = JSON.parse(data);
        
        // Add real-time enhancements
        return {
            ...parsedData,
            real_time_metrics: this.generateSimulatedMetrics(),
            network_activity: Math.random() * 100,
            processing_timestamp: Date.now()
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
        nativeProcessor.destroy_processor(this.dataProcessor);
        this.redis.quit();
        this.server.close();
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    server.shutdown();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    server.shutdown();
    process.exit(0);
});

const server = new HighPerformanceWebServer();
server.start();

module.exports = HighPerformanceWebServer;