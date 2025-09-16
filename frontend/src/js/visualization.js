/**
 * PRODUCTION Visualization Engine for Houston Oil Airs
 * Connects to actual sensor data and real-time streams
 */
import * as THREE from 'three';

class RealDataProvider {
    constructor(apiBaseUrl = 'http://localhost:3001') {
        this.apiBaseUrl = apiBaseUrl;
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
    }

    async loadCategoryData(category) {
        const cacheKey = `category_${category}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/research/visualization-data/${category}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error('Error loading real category data:', error);
            return null;
        }
    }

    async loadNetworkTopology() {
        const cacheKey = 'network_topology';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/research/network-topology`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error('Error loading real network topology:', error);
            return null;
        }
    }

    async loadLatestSensorData() {
        try {
            const response = await fetch('/api/sensors/latest');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error loading latest sensor data:', error);
            return null;
        }
    }
}

class RealParticleSystem {
    constructor(scene, performanceConfig) {
        this.scene = scene;
        this.performanceConfig = performanceConfig;
        this.visible = false;
        this.object3D = null;
        this.geometry = null;
        this.material = null;
        this.maxPoints = performanceConfig?.maxParticles || 5000;
        this.currentData = null;
    }

    async initialize() {
        // Initialize with empty geometry - will be populated with real data
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({ 
            size: 0.06, 
            vertexColors: true, 
            opacity: 0.9, 
            transparent: true 
        });
        
        this.object3D = new THREE.Points(this.geometry, this.material);
        this.object3D.visible = this.visible;
        this.scene.add(this.object3D);
    }

    setVisible(v) {
        this.visible = v;
        if (this.object3D) this.object3D.visible = v;
    }

    async loadData(category, timeRange, realData) {
        if (!realData || !Array.isArray(realData.research_points)) {
            console.warn('No real data available for visualization');
            return false;
        }

        this.currentData = realData;
        const points = realData.research_points;
        const count = Math.min(points.length, this.maxPoints);

        if (count === 0) {
            console.warn('No data points to visualize');
            return false;
        }

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const point = points[i];
            const i3 = i * 3;
            
            // Use REAL positions from sensor data
            positions[i3 + 0] = point.pos?.[0] ?? 0;
            positions[i3 + 1] = point.pos?.[1] ?? 0;
            positions[i3 + 2] = point.pos?.[2] ?? 0;

            // Color based on REAL air quality data
            const pm25 = point.meta?.[0] ?? 25; // Real PM2.5 value
            let r, g, b;
            
            if (pm25 <= 12) {
                // Good air quality - green
                r = 0.2; g = 0.8; b = 0.2;
            } else if (pm25 <= 35) {
                // Moderate - yellow
                r = 0.8; g = 0.8; b = 0.2;
            } else if (pm25 <= 55) {
                // Unhealthy for sensitive - orange
                r = 1.0; g = 0.6; b = 0.2;
            } else {
                // Unhealthy - red
                r = 1.0; g = 0.2; b = 0.2;
            }
            
            colors[i3 + 0] = r;
            colors[i3 + 1] = g;
            colors[i3 + 2] = b;
        }

        // Update geometry with real data
        this.geometry.dispose();
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        if (this.object3D) {
            this.object3D.geometry = this.geometry;
        }

        console.log(`Loaded ${count} production data points for visualization`);
        return true;
    }

    addRealTimePoint(sensorData) {
        if (!this.currentData || !sensorData) return;

        // Add new real-time sensor reading to visualization
        const newPoint = {
            pos: [
                (sensorData.pm25 - 25) / 10,
                (sensorData.temperature - 25) / 5,
                (sensorData.humidity - 50) / 20
            ],
            confidence: Math.min(1, Math.max(0, (100 - sensorData.pm25) / 100)),
            timestamp: sensorData.timestamp,
            meta: [sensorData.pm25, sensorData.pm10, sensorData.health_events],
            device_id: sensorData.device_id
        };

        this.currentData.research_points.push(newPoint);
        
        // Limit to max points
        if (this.currentData.research_points.length > this.maxPoints) {
            this.currentData.research_points.shift();
        }

        // Reload visualization with updated data
        this.loadData('real_time', 24, this.currentData);
    }

    getPointCount() {
        return this.currentData?.research_points?.length || 0;
    }

    update(t) {
        if (!this.object3D) return;
        // Subtle rotation based on real time
        this.object3D.rotation.y = (t * 0.0001) % (Math.PI * 2);
    }

    exportData() {
        return {
            points: this.getPointCount(),
            data_source: 'real_sensors',
            last_update: this.currentData?.generation_time
        };
    }

    destroy() {
        if (this.object3D) this.scene.remove(this.object3D);
        this.material?.dispose();
        this.geometry?.dispose();
    }
}

class RealNetworkVisualizationSystem {
    constructor(scene, performanceConfig) {
        this.scene = scene;
        this.performanceConfig = performanceConfig;
        this.visible = false;
        this.group = new THREE.Group();
        this.nodes = [];
        this.edges = [];
        this.nodeMeshes = new Map();
        this.edgeLines = null;
        this.realData = null;
    }

    async initialize() {
        this.group.visible = this.visible;
        this.scene.add(this.group);
    }

    setVisible(v) {
        this.visible = v;
        this.group.visible = v;
    }

    async loadData(category, timeRange, realNetworkData) {
        if (!realNetworkData || !Array.isArray(realNetworkData.nodes)) {
            console.warn('No real network data available');
            return false;
        }

        this.clear();
        this.realData = realNetworkData;
        this.nodes = realNetworkData.nodes;
        this.edges = realNetworkData.edges || [];

        // Create nodes from REAL device and wallet data
        const sphereGeo = new THREE.SphereGeometry(0.08, 12, 12);
        
        for (const node of this.nodes) {
            let color, emissiveColor;
            
            // Color based on REAL node type and data
            if (node.category === 'high_pollution') {
                color = new THREE.Color(0xff4444); // Red for high pollution sensors
                emissiveColor = color.clone().multiplyScalar(0.3);
            } else if (node.category === 'compensation') {
                color = new THREE.Color(0x44ff44); // Green for compensation wallets
                emissiveColor = color.clone().multiplyScalar(0.3);
            } else {
                color = new THREE.Color(0x4444ff); // Blue for normal sensors
                emissiveColor = color.clone().multiplyScalar(0.2);
            }

            const material = new THREE.MeshStandardMaterial({ 
                color, 
                emissive: emissiveColor 
            });
            
            const mesh = new THREE.Mesh(sphereGeo, material);
            mesh.position.set(node.x || 0, node.y || 0, node.z || 0);
            
            // Store REAL metadata
            mesh.userData = {
                type: 'network-node',
                id: node.id,
                category: node.category,
                influence: node.influence,
                metadata: node.metadata || {}
            };
            
            this.group.add(mesh);
            this.nodeMeshes.set(node.id, mesh);
        }

        // Create edges from REAL relationships
        if (this.edges.length > 0) {
            const positions = new Float32Array(this.edges.length * 2 * 3);
            let i = 0;
            
            for (const edge of this.edges) {
                const sourceNode = this.nodeMeshes.get(edge.source);
                const targetNode = this.nodeMeshes.get(edge.target);
                
                if (sourceNode && targetNode) {
                    const a = sourceNode.position;
                    const b = targetNode.position;
                    positions[i++] = a.x; positions[i++] = a.y; positions[i++] = a.z;
                    positions[i++] = b.x; positions[i++] = b.y; positions[i++] = b.z;
                }
            }
            
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            // Color edges based on relationship strength
            const material = new THREE.LineBasicMaterial({ 
                color: 0x5fa0ff, 
                transparent: true, 
                opacity: 0.6 
            });
            
            this.edgeLines = new THREE.LineSegments(geometry, material);
            this.group.add(this.edgeLines);
        }

        console.log(`Loaded real network: ${this.nodes.length} nodes, ${this.edges.length} edges`);
        return true;
    }

    getNodeCount() {
        return this.nodes.length;
    }

    getNetworkDensity() {
        const n = this.nodes.length;
        const m = this.edges.length;
        if (n <= 1) return 0;
        return (2 * m) / (n * (n - 1));
    }

    highlightCategory(category) {
        for (const [id, mesh] of this.nodeMeshes) {
            const isCategory = mesh.userData.category === category;
            mesh.scale.setScalar(isCategory ? 1.6 : 1.0);
            if (mesh.material.emissive) {
                mesh.material.emissive.setScalar(isCategory ? 0.5 : 0.2);
            }
        }
    }

    clearHighlight() {
        for (const [, mesh] of this.nodeMeshes) {
            mesh.scale.setScalar(1.0);
            if (mesh.material.emissive) {
                mesh.material.emissive.setScalar(0.2);
            }
        }
    }

    update(t) {
        // Subtle pulsing based on real-time data updates
        const scale = 1 + Math.sin(t * 0.001) * 0.02;
        this.group.scale.set(scale, scale, scale);
    }

    exportData() {
        return {
            nodes: this.getNodeCount(),
            edges: this.edges.length,
            density: this.getNetworkDensity(),
            data_source: 'real_devices_and_wallets'
        };
    }

    clear() {
        for (const [, mesh] of this.nodeMeshes) {
            this.group.remove(mesh);
            mesh.geometry?.dispose();
            mesh.material?.dispose();
        }
        this.nodeMeshes.clear();
        
        if (this.edgeLines) {
            this.group.remove(this.edgeLines);
            this.edgeLines.geometry?.dispose();
            this.edgeLines.material?.dispose();
            this.edgeLines = null;
        }
    }

    destroy() {
        this.clear();
        this.scene.remove(this.group);
    }
}

class RealVisualizationEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        this.currentMode = 'particles';
        this.currentCategory = 'alignment';
        this.currentTimeRange = 24;
        
        this.particleSystem = null;
        this.networkSystem = null;
        
        this.performanceConfig = {
            maxParticles: 25000,
            lodDistance: 50,
            cullingEnabled: true
        };

        this.dataProvider = new RealDataProvider();
        this.realTimeSocket = null;
    }
    
    async initialize(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        await this.setupVisualizationSystems();
        this.setupRealTimeConnection();
        
        console.log('🎨 REAL Visualization engine initialized with live data');
    }
    
    async setupVisualizationSystems() {
        // Initialize REAL particle system
        this.particleSystem = new RealParticleSystem(this.scene, this.performanceConfig);
        await this.particleSystem.initialize();
        
        // Initialize REAL network system
        this.networkSystem = new RealNetworkVisualizationSystem(this.scene, this.performanceConfig);
        await this.networkSystem.initialize();
        
        // Load initial real data
        await this.changeMode(this.currentMode);
    }

    setupRealTimeConnection() {
        // Connect to real-time data stream
        if (typeof io !== 'undefined') {
            this.realTimeSocket = io('http://localhost:3001');
            
            this.realTimeSocket.on('connect', () => {
                console.log('Connected to real-time data stream');
                this.realTimeSocket.emit('subscribe_to_real_data', {});
            });
            
            this.realTimeSocket.on('data_update', (data) => {
                if (data.readings && data.readings.length > 0) {
                    // Update visualization with real-time sensor data
                    const latestReading = data.readings[0];
                    this.particleSystem.addRealTimePoint(latestReading);
                }
            });
            
            this.realTimeSocket.on('real_time_data', (sensorData) => {
                this.particleSystem.addRealTimePoint(sensorData);
            });
        }
    }
    
    async changeMode(mode) {
        this.currentMode = mode;
        
        // Hide all systems
        this.particleSystem.setVisible(false);
        this.networkSystem.setVisible(false);
        
        // Show selected system with REAL data
        switch (mode) {
            case 'particles':
                this.particleSystem.setVisible(true);
                const particleData = await this.dataProvider.loadCategoryData(this.currentCategory);
                await this.particleSystem.loadData(this.currentCategory, this.currentTimeRange, particleData);
                break;
                
            case 'network':
                this.networkSystem.setVisible(true);
                const networkData = await this.dataProvider.loadNetworkTopology();
                await this.networkSystem.loadData(this.currentCategory, this.currentTimeRange, networkData);
                break;
        }
        
        this.updateVisualizationStats();
    }
    
    async changeCategory(category) {
        this.currentCategory = category;
        
        // Update with REAL data for new category
        switch (this.currentMode) {
            case 'particles':
                const data = await this.dataProvider.loadCategoryData(category);
                await this.particleSystem.loadData(category, this.currentTimeRange, data);
                break;
            case 'network':
                const networkData = await this.dataProvider.loadNetworkTopology();
                await this.networkSystem.loadData(category, this.currentTimeRange, networkData);
                break;
        }
        
        this.updateVisualizationStats();
    }
    
    update(currentTime) {
        this.particleSystem.update(currentTime);
        this.networkSystem.update(currentTime);
    }
    
    updateVisualizationStats() {
        // Update with REAL statistics
        const dataPointsElement = document.getElementById('data-points-count');
        if (dataPointsElement) {
            const count = this.getCurrentDataPointCount();
            dataPointsElement.textContent = count.toLocaleString();
        }
        
        const densityElement = document.getElementById('network-density');
        if (densityElement) {
            const density = this.getCurrentNetworkDensity();
            densityElement.textContent = `${(density * 100).toFixed(1)}%`;
        }
    }
    
    getCurrentDataPointCount() {
        switch (this.currentMode) {
            case 'particles':
                return this.particleSystem.getPointCount();
            case 'network':
                return this.networkSystem.getNodeCount();
            default:
                return 0;
        }
    }
    
    getCurrentNetworkDensity() {
        if (this.currentMode === 'network') {
            return this.networkSystem.getNetworkDensity();
        }
        return 0;
    }
    
    async exportData() {
        return {
            mode: this.currentMode,
            category: this.currentCategory,
            timeRange: this.currentTimeRange,
            timestamp: Date.now(),
            data: await this.getCurrentSystemData(),
            data_source: 'real_sensors_and_blockchain'
        };
    }
    
    async getCurrentSystemData() {
        switch (this.currentMode) {
            case 'particles':
                return this.particleSystem.exportData();
            case 'network':
                return this.networkSystem.exportData();
            default:
                return null;
        }
    }
    
    destroy() {
        this.particleSystem?.destroy();
        this.networkSystem?.destroy();
        
        if (this.realTimeSocket) {
            this.realTimeSocket.disconnect();
        }
    }
}

export default RealVisualizationEngine;