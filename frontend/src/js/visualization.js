/**
 * Advanced Visualization Engine for Houston Oil Airs
 * Handles 3D data visualization with high-performance rendering
 */

class VisualizationEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        this.currentMode = 'particles';
        this.currentCategory = 'all';
        this.currentTimeRange = 24;
        
        this.visualizationObjects = new Map();
        this.animationMixers = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.particleSystem = null;
        this.networkSystem = null;
        this.heatmapSystem = null;
        this.flowSystem = null;
        
        this.interactionMode = 'explore';
        this.selectedObjects = new Set();
        
        this.performanceConfig = {
            maxParticles: 25000,
            lodDistance: 50,
            cullingEnabled: true,
            instancedRendering: true
        };
    }
    
    async initialize(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        await this.setupVisualizationSystems();
        this.setupInteractionHandlers();
        
        console.log('🎨 Visualization engine initialized');
    }
    
    async setupVisualizationSystems() {
        // Initialize particle system
        this.particleSystem = new AdvancedParticleSystem(this.scene, this.performanceConfig);
        await this.particleSystem.initialize();
        
        // Initialize network visualization system
        this.networkSystem = new NetworkVisualizationSystem(this.scene, this.performanceConfig);
        await this.networkSystem.initialize();
        
        // Initialize heatmap system
        this.heatmapSystem = new HeatmapSystem(this.scene, this.performanceConfig);
        await this.heatmapSystem.initialize();
        
        // Initialize flow system
        this.flowSystem = new DataFlowSystem(this.scene, this.performanceConfig);
        await this.flowSystem.initialize();
        
        // Set default mode
        await this.changeMode(this.currentMode);
    }
    
    setupInteractionHandlers() {
        // Setup raycaster for object picking
        this.raycaster.params.Points.threshold = 0.1;
        this.raycaster.params.Line.threshold = 0.05;
    }
    
    async changeMode(mode) {
        this.currentMode = mode;
        
        // Hide all systems
        this.particleSystem.setVisible(false);
        this.networkSystem.setVisible(false);
        this.heatmapSystem.setVisible(false);
        this.flowSystem.setVisible(false);
        
        // Show selected system
        switch (mode) {
            case 'particles':
                this.particleSystem.setVisible(true);
                await this.particleSystem.loadData(this.currentCategory, this.currentTimeRange);
                break;
                
            case 'network':
                this.networkSystem.setVisible(true);
                await this.networkSystem.loadData(this.currentCategory, this.currentTimeRange);
                break;
                
            case 'heatmap':
                this.heatmapSystem.setVisible(true);
                await this.heatmapSystem.loadData(this.currentCategory, this.currentTimeRange);
                break;
                
            case 'flow':
                this.flowSystem.setVisible(true);
                await this.flowSystem.loadData(this.currentCategory, this.currentTimeRange);
                break;
        }
        
        // Update UI
        this.updateVisualizationStats();
    }
    
    async changeCategory(category) {
        this.currentCategory = category;
        
        // Update current visualization system
        switch (this.currentMode) {
            case 'particles':
                await this.particleSystem.loadData(category, this.currentTimeRange);
                break;
            case 'network':
                await this.networkSystem.loadData(category, this.currentTimeRange);
                break;
            case 'heatmap':
                await this.heatmapSystem.loadData(category, this.currentTimeRange);
                break;
            case 'flow':
                await this.flowSystem.loadData(category, this.currentTimeRange);
                break;
        }
        
        this.updateVisualizationStats();
    }
    
    async changeTimeRange(timeRange) {
        this.currentTimeRange = timeRange;
        await this.changeCategory(this.currentCategory);
    }
    
    async focusOnCategory(category, data) {
        await this.changeCategory(category);
        
        // Animate camera to focus on category data
        const bounds = this.calculateDataBounds(data);
        this.animateCameraToFit(bounds);
    }
    
    previewCategory(category) {
        // Create subtle preview effect
        switch (this.currentMode) {
            case 'particles':
                this.particleSystem.highlightCategory(category);
                break;
            case 'network':
                this.networkSystem.highlightCategory(category);
                break;
        }
    }
    
    clearPreview() {
        this.particleSystem.clearHighlight();
        this.networkSystem.clearHighlight();
        this.heatmapSystem.clearHighlight();
        this.flowSystem.clearHighlight();
    }
    
    updateMouse(mouse) {
        this.mouse.copy(mouse);
        
        // Update raycaster
        this.raycaster.setFromCamera(mouse, this.camera);
        
        // Check for intersections
        this.updateHover();
    }
    
    updateHover() {
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            this.handleObjectHover(intersectedObject, intersects[0]);
        } else {
            this.clearHover();
        }
    }
    
    handleObjectHover(object, intersection) {
        // Reset previous hover state
        this.clearHover();
        
        // Apply hover effect based on object type
        if (object.userData.type === 'research-point') {
            this.showDataPointTooltip(object, intersection);
        } else if (object.userData.type === 'network-node') {
            this.highlightNetworkNode(object);
        }
        
        // Change cursor
        document.body.style.cursor = 'pointer';
    }
    
    clearHover() {
        this.hideTooltip();
        this.clearNetworkHighlight();
        document.body.style.cursor = 'default';
    }
    
    handleClick(mouse) {
        this.raycaster.setFromCamera(mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.selectObject(object);
        } else {
            this.clearSelection();
        }
    }
    
    selectObject(object) {
        // Add to selection
        this.selectedObjects.add(object);
        
        // Visual feedback
        this.highlightSelectedObject(object);
        
        // Show detailed information
        this.showObjectDetails(object);
    }
    
    clearSelection() {
        this.selectedObjects.forEach(object => {
            this.removeHighlight(object);
        });
        this.selectedObjects.clear();
        this.hideObjectDetails();
    }
    
    addRealTimeData(category, metrics, timestamp) {
        switch (this.currentMode) {
            case 'particles':
                this.particleSystem.addRealTimePoint(category, metrics, timestamp);
                break;
            case 'network':
                this.networkSystem.updateRealTimeMetrics(metrics, timestamp);
                break;
            case 'flow':
                this.flowSystem.addDataFlow(category, metrics, timestamp);
                break;
        }
    }
    
    update(currentTime) {
        // Update all animation mixers
        this.animationMixers.forEach(mixer => {
            mixer.update(0.016); // Assume 60fps
        });
        
        // Update visualization systems
        this.particleSystem.update(currentTime);
        this.networkSystem.update(currentTime);
        this.heatmapSystem.update(currentTime);
        this.flowSystem.update(currentTime);
        
        // Update performance-based LOD
        this.updateLevelOfDetail();
    }
    
    updateLevelOfDetail() {
        const distance = this.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        
        if (distance > this.performanceConfig.lodDistance) {
            // Reduce quality for distant viewing
            this.particleSystem.setLOD('low');
            this.networkSystem.setLOD('low');
        } else {
            // High quality for close viewing
            this.particleSystem.setLOD('high');
            this.networkSystem.setLOD('high');
        }
    }
    
    handleResize(width, height) {
        // Update visualization systems for new viewport
        this.particleSystem.handleResize(width, height);
        this.networkSystem.handleResize(width, height);
        this.heatmapSystem.handleResize(width, height);
        this.flowSystem.handleResize(width, height);
    }
    
    calculateDataBounds(data) {
        if (!data || !data.research_points) return null;
        
        const bounds = {
            min: new THREE.Vector3(Infinity, Infinity, Infinity),
            max: new THREE.Vector3(-Infinity, -Infinity, -Infinity)
        };
        
        data.research_points.forEach(point => {
            bounds.min.x = Math.min(bounds.min.x, point.pos[0]);
            bounds.min.y = Math.min(bounds.min.y, point.pos[1]);
            bounds.min.z = Math.min(bounds.min.z, point.pos[2]);
            
            bounds.max.x = Math.max(bounds.max.x, point.pos[0]);
            bounds.max.y = Math.max(bounds.max.y, point.pos[1]);
            bounds.max.z = Math.max(bounds.max.z, point.pos[2]);
        });
        
        return bounds;
    }
    
    animateCameraToFit(bounds) {
        if (!bounds) return;
        
        const center = new THREE.Vector3()
            .addVectors(bounds.min, bounds.max)
            .multiplyScalar(0.5);
        
        const size = new THREE.Vector3()
            .subVectors(bounds.max, bounds.min);
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        const distance = maxDim / (2 * Math.tan(fov / 2)) * 1.5;
        
        const targetPosition = center.clone().add(new THREE.Vector3(0, 0, distance));
        
        // Animate camera position
        const startPosition = this.camera.position.clone();
        const startTime = performance.now();
        const duration = 2000; // 2 seconds
        
        const animateCamera = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing function
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, eased);
            this.camera.lookAt(center);
            
            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        
        requestAnimationFrame(animateCamera);
    }
    
    showDataPointTooltip(object, intersection) {
        const tooltip = this.getOrCreateTooltip();
        const data = object.userData;
        
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <h4>${data.category.toUpperCase()}</h4>
                <span class="confidence">Confidence: ${(data.confidence * 100).toFixed(1)}%</span>
            </div>
            <div class="tooltip-body">
                <p><strong>Position:</strong> (${data.pos[0].toFixed(2)}, ${data.pos[1].toFixed(2)}, ${data.pos[2].toFixed(2)})</p>
                <p><strong>Timestamp:</strong> ${new Date(data.timestamp * 1000).toLocaleString()}</p>
                ${data.meta ? `<p><strong>Impact Score:</strong> ${(data.meta[0] * 100).toFixed(1)}%</p>` : ''}
            </div>
        `;
        
        // Position tooltip near cursor
        const rect = this.renderer.domElement.getBoundingClientRect();
        tooltip.style.left = `${intersection.point.x + rect.left + 10}px`;
        tooltip.style.top = `${intersection.point.y + rect.top - 10}px`;
        tooltip.style.display = 'block';
    }
    
    getOrCreateTooltip() {
        let tooltip = document.getElementById('viz-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'viz-tooltip';
            tooltip.className = 'visualization-tooltip';
            document.body.appendChild(tooltip);
        }
        return tooltip;
    }
    
    hideTooltip() {
        const tooltip = document.getElementById('viz-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
    
    updateVisualizationStats() {
        // Update data points count
        const dataPointsElement = document.getElementById('data-points-count');
        if (dataPointsElement) {
            const count = this.getCurrentDataPointCount();
            dataPointsElement.textContent = count.toLocaleString();
        }
        
        // Update network density
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
        const exportData = {
            mode: this.currentMode,
            category: this.currentCategory,
            timeRange: this.currentTimeRange,
            timestamp: Date.now(),
            data: await this.getCurrentSystemData()
        };
        
        return exportData;
    }
    
    async getCurrentSystemData() {
        switch (this.currentMode) {
            case 'particles':
                return this.particleSystem.exportData();
            case 'network':
                return this.networkSystem.exportData();
            case 'heatmap':
                return this.heatmapSystem.exportData();
            case 'flow':
                return this.flowSystem.exportData();
            default:
                return null;
        }
    }
    
    reset() {
        this.clearSelection();
        this.clearPreview();
        
        // Reset all systems
        this.particleSystem.reset();
        this.networkSystem.reset();
        this.heatmapSystem.reset();
        this.flowSystem.reset();
        
        // Reset camera
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(0, 0, 0);
    }
    
    optimizeMemory() {
        // Implement memory optimization for each system
        this.particleSystem.optimizeMemory();
        this.networkSystem.optimizeMemory();
        this.heatmapSystem.optimizeMemory();
        this.flowSystem.optimizeMemory();
        
        // Clear unused textures and geometries
        this.renderer.info.memory = {
            geometries: 0,
            textures: 0
        };
    }
    
    destroy() {
        // Cleanup all visualization systems
        this.particleSystem.destroy();
        this.networkSystem.destroy();
        this.heatmapSystem.destroy();
        this.flowSystem.destroy();
        
        // Clear animation mixers
        this.animationMixers.forEach(mixer => mixer.stopAllAction());
        this.animationMixers = [];
        
        // Remove tooltip
        const tooltip = document.getElementById('viz-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
}