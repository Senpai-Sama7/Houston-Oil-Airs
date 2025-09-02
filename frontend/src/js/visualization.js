/**
 * Advanced Visualization Engine for Houston Oil Airs
 * Handles 3D data visualization with high-performance rendering
 */
import * as THREE from 'three';

// Lightweight no-op stubs to allow progressive enhancement without runtime errors
class BaseSystem {
    constructor(scene, performanceConfig) {
        this.scene = scene;
        this.performanceConfig = performanceConfig;
        this.visible = false;
    }
    async initialize() {}
    setVisible(v) { this.visible = v; }
    async loadData() {}
    highlightCategory() {}
    clearHighlight() {}
    addRealTimePoint() {}
    updateRealTimeMetrics() {}
    addDataFlow() {}
    update() {}
    handleResize() {}
    setLOD() {}
    reset() {}
    optimizeMemory() {}
    destroy() {}
    exportData() { return {}; }
}

class AdvancedParticleSystem extends BaseSystem {
    constructor(scene, performanceConfig) {
        super(scene, performanceConfig);
        this.object3D = null;
        this.geometry = null;
        this.material = null;
        this.pointCount = Math.min(performanceConfig?.maxParticles || 5000, 5000);
        this._time = 0;
    }

    async initialize() {
        // Create a simple particle cloud for an immediate visual
        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.pointCount * 3);
        const colors = new Float32Array(this.pointCount * 3);

        for (let i = 0; i < this.pointCount; i++) {
            const i3 = i * 3;
            positions[i3 + 0] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 20;

            colors[i3 + 0] = 0.1 + Math.random() * 0.9;
            colors[i3 + 1] = 0.5 + Math.random() * 0.5;
            colors[i3 + 2] = 1.0;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        this.material = new THREE.PointsMaterial({ size: 0.06, vertexColors: true, opacity: 0.9, transparent: true });
        this.object3D = new THREE.Points(this.geometry, this.material);
        this.object3D.visible = this.visible;
        this.scene.add(this.object3D);
    }

    setVisible(v) {
        super.setVisible(v);
        if (this.object3D) this.object3D.visible = v;
    }

    async loadData(category, timeRange, data) {
        // Populate geometry from API data if available; otherwise retain existing/random
        if (!data || !Array.isArray(data.research_points) || data.research_points.length === 0) {
            return true;
        }

        const pts = data.research_points;
        const count = Math.min(pts.length, this.pointCount);
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const p = pts[i];
            const i3 = i * 3;
            positions[i3 + 0] = (p.pos?.[0] ?? 0);
            positions[i3 + 1] = (p.pos?.[1] ?? 0);
            positions[i3 + 2] = (p.pos?.[2] ?? 0);

            const conf = Math.max(0, Math.min(1, p.confidence ?? 0.5));
            // Map confidence to blue-ish color ramp
            colors[i3 + 0] = 0.1 + 0.3 * conf;
            colors[i3 + 1] = 0.4 + 0.4 * conf;
            colors[i3 + 2] = 0.8 + 0.2 * conf;
        }

        // Rebuild geometry to match new dataset size
        this.geometry?.dispose?.();
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        if (this.object3D) {
            this.object3D.geometry = this.geometry;
        } else {
            this.material = new THREE.PointsMaterial({ size: 0.06, vertexColors: true, opacity: 0.9, transparent: true });
            this.object3D = new THREE.Points(this.geometry, this.material);
            this.object3D.visible = this.visible;
            this.scene.add(this.object3D);
        }
        return true;
    }

    update(t) {
        this._time = t * 0.001;
        if (!this.object3D) return;
        // Subtle idle animation
        this.object3D.rotation.y = this._time * 0.1;
    }

    getPointCount() { return this.pointCount; }

    setLOD(level) {
        if (!this.material) return;
        this.material.size = level === 'low' ? 0.04 : 0.06;
    }

    exportData() {
        return { points: this.pointCount };
    }

    destroy() {
        if (this.object3D) this.scene.remove(this.object3D);
        this.material?.dispose?.();
        this.geometry?.dispose?.();
        this.object3D = null;
        this.material = null;
        this.geometry = null;
    }
}

class NetworkVisualizationSystem extends BaseSystem {
    constructor(scene, performanceConfig) {
        super(scene, performanceConfig);
        this.group = new THREE.Group();
        this.nodes = [];
        this.edges = [];
        this.nodeMeshes = new Map();
        this.edgeLines = null;
        this._colorByCategory = new Map([
            ['alignment', new THREE.Color(0x7aa7ff)],
            ['fairness', new THREE.Color(0x66ffd2)],
            ['interpretability', new THREE.Color(0xffa3a3)],
            ['robustness', new THREE.Color(0xffd166)],
            ['safety', new THREE.Color(0x1df2ff)],
            ['ethics', new THREE.Color(0xb28dff)]
        ]);
    }

    async initialize() {
        this.group.visible = this.visible;
        this.scene.add(this.group);
    }

    setVisible(v) {
        super.setVisible(v);
        this.group.visible = v;
    }

    async loadData(category, timeRange, data) {
        if (!data || !Array.isArray(data.nodes)) return true;
        this.clear();

        this.nodes = data.nodes;
        this.edges = Array.isArray(data.edges) ? data.edges : [];

        // Compute degrees for nodes
        const degree = new Map();
        for (const e of this.edges) {
            degree.set(e.source, (degree.get(e.source) || 0) + 1);
            degree.set(e.target, (degree.get(e.target) || 0) + 1);
        }

        // Create node spheres
        const sphereGeo = new THREE.SphereGeometry(0.08, 12, 12);
        for (const n of this.nodes) {
            const color = this._colorByCategory.get(n.category) || new THREE.Color(0x9bb4ff);
            const mat = new THREE.MeshStandardMaterial({ color, emissive: color.clone().multiplyScalar(0.2) });
            const m = new THREE.Mesh(sphereGeo, mat);
            m.position.set(n.x || 0, n.y || 0, n.z || 0);
            m.userData = { type: 'network-node', id: n.id, category: n.category, influence: n.influence, degree: degree.get(n.id) || 0 };
            this.group.add(m);
            this.nodeMeshes.set(n.id, m);
        }

        // Create edge lines
        if (this.edges.length > 0) {
            const positions = new Float32Array(this.edges.length * 2 * 3);
            let i = 0;
            for (const e of this.edges) {
                const a = this.nodeMeshes.get(e.source)?.position;
                const b = this.nodeMeshes.get(e.target)?.position;
                if (!a || !b) continue;
                positions[i++] = a.x; positions[i++] = a.y; positions[i++] = a.z;
                positions[i++] = b.x; positions[i++] = b.y; positions[i++] = b.z;
            }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const mat = new THREE.LineBasicMaterial({ color: 0x5fa0ff, transparent: true, opacity: 0.6 });
            this.edgeLines = new THREE.LineSegments(geo, mat);
            this.group.add(this.edgeLines);
        }
        return true;
    }

    highlightCategory(category) {
        for (const [id, mesh] of this.nodeMeshes) {
            const isCat = mesh.userData.category === category;
            mesh.scale.setScalar(isCat ? 1.6 : 1.0);
            mesh.material?.emissive?.setScalar(isCat ? 0.5 : 0.2);
        }
    }

    clearHighlight() {
        for (const [, mesh] of this.nodeMeshes) {
            mesh.scale.setScalar(1.0);
            mesh.material?.emissive?.setScalar(0.2);
        }
    }

    getNodeCount() { return this.nodes.length || 0; }

    getNetworkDensity() {
        const n = this.nodes.length || 0;
        const m = this.edges.length || 0;
        if (n <= 1) return 0;
        return (2 * m) / (n * (n - 1));
    }

    update(t) {
        // subtle pulsing
        const s = 1 + Math.sin(t * 0.001) * 0.02;
        this.group.scale.set(s, s, s);
    }

    handleResize() {}

    exportData() { return { nodes: this.getNodeCount(), edges: this.edges.length || 0 }; }

    centerView(camera) {
        if (!this.nodes.length) return;
        const bbox = new THREE.Box3();
        this.nodeMeshes.forEach(mesh => bbox.expandByPoint(mesh.position));
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const distance = maxDim / (2 * Math.tan(fov / 2)) * 1.5;
        const targetPos = center.clone().add(new THREE.Vector3(0, 0, distance));
        camera.position.copy(targetPos);
        camera.lookAt(center);
    }

    filterByInfluence(min = 0.5) {
        for (const n of this.nodes) {
            const mesh = this.nodeMeshes.get(n.id);
            if (mesh) mesh.visible = (n.influence || 0) >= min;
        }
    }

    clear() {
        // dispose previous
        for (const [, m] of this.nodeMeshes) {
            this.group.remove(m);
            m.geometry?.dispose?.();
            m.material?.dispose?.();
        }
        this.nodeMeshes.clear();
        if (this.edgeLines) {
            this.group.remove(this.edgeLines);
            this.edgeLines.geometry?.dispose?.();
            this.edgeLines.material?.dispose?.();
            this.edgeLines = null;
        }
    }

    destroy() { this.clear(); this.scene.remove(this.group); }
}

class HeatmapSystem extends BaseSystem {}
class DataFlowSystem extends BaseSystem {}

class VisualizationEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        this.currentMode = 'particles';
        this.currentCategory = 'alignment';
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

        this.dataProvider = null; // Expected to implement loadCategoryData(category)
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

    setDataProvider(provider) {
        this.dataProvider = provider;
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
                {
                    const data = this.dataProvider ? await this.dataProvider.loadCategoryData(this.currentCategory) : null;
                    await this.particleSystem.loadData(this.currentCategory, this.currentTimeRange, data);
                }
                break;
                
            case 'network':
                this.networkSystem.setVisible(true);
                {
                    const data = this.dataProvider?.loadNetworkTopology ? await this.dataProvider.loadNetworkTopology() : null;
                    await this.networkSystem.loadData(this.currentCategory, this.currentTimeRange, data);
                }
                break;
                
            case 'heatmap':
                this.heatmapSystem.setVisible(true);
                {
                    const data = this.dataProvider ? await this.dataProvider.loadCategoryData(this.currentCategory) : null;
                    await this.heatmapSystem.loadData(this.currentCategory, this.currentTimeRange, data);
                }
                break;
                
            case 'flow':
                this.flowSystem.setVisible(true);
                {
                    const data = this.dataProvider ? await this.dataProvider.loadCategoryData(this.currentCategory) : null;
                    await this.flowSystem.loadData(this.currentCategory, this.currentTimeRange, data);
                }
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
                {
                    const data = this.dataProvider ? await this.dataProvider.loadCategoryData(category) : null;
                    await this.particleSystem.loadData(category, this.currentTimeRange, data);
                }
                break;
            case 'network':
                {
                    const data = this.dataProvider?.loadNetworkTopology ? await this.dataProvider.loadNetworkTopology() : null;
                    await this.networkSystem.loadData(category, this.currentTimeRange, data);
                }
                break;
            case 'heatmap':
                {
                    const data = this.dataProvider ? await this.dataProvider.loadCategoryData(category) : null;
                    await this.heatmapSystem.loadData(category, this.currentTimeRange, data);
                }
                break;
            case 'flow':
                {
                    const data = this.dataProvider ? await this.dataProvider.loadCategoryData(category) : null;
                    await this.flowSystem.loadData(category, this.currentTimeRange, data);
                }
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
            this.showNetworkNodeTooltip(object);
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
            const intersection = intersects[0];
            this.selectObject(object, intersection);
        } else {
            this.clearSelection();
        }
    }
    
    selectObject(object, intersection) {
        // Add to selection
        this.selectedObjects.add(object);
        
        // Visual feedback
        this.highlightSelectedObject(object);
        
        // Show detailed information
        this.showObjectDetails(object, intersection);
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
        
        // Position tooltip near the projected screen position
        const world = intersection.point.clone();
        const vector = world.project(this.camera);
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = (vector.x * 0.5 + 0.5) * rect.width + rect.left;
        const y = (-vector.y * 0.5 + 0.5) * rect.height + rect.top;
        tooltip.style.left = `${x + 10}px`;
        tooltip.style.top = `${y - 10}px`;
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

    highlightNetworkNode(object) {
        if (!this.networkSystem) return;
        this.networkSystem.highlightCategory(object.userData.category);
    }

    clearNetworkHighlight() {
        if (!this.networkSystem) return;
        this.networkSystem.clearHighlight();
    }

    showNetworkNodeTooltip(object) {
        const tooltip = this.getOrCreateTooltip();
        const data = object.userData || {};

        tooltip.innerHTML = `
            <div class="tooltip-header">
                <h4>${(data.category || 'node').toUpperCase()}</h4>
                <span class="confidence">Node ID: ${data.id || 'N/A'}</span>
            </div>
            <div class="tooltip-body">
                <p><strong>Type:</strong> Network Node</p>
                <p><strong>Category:</strong> ${data.category || 'unknown'}</p>
            </div>
        `;

        // Project object position to screen space
        const vector = object.position.clone().project(this.camera);
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = (vector.x * 0.5 + 0.5) * rect.width + rect.left;
        const y = (-vector.y * 0.5 + 0.5) * rect.height + rect.top;
        tooltip.style.left = `${x + 10}px`;
        tooltip.style.top = `${y - 10}px`;
        tooltip.style.display = 'block';

        // Update details panel
        const panel = document.getElementById('details-panel');
        if (panel) {
            panel.style.display = 'block';
            const idEl = document.getElementById('detail-id');
            const catEl = document.getElementById('detail-category');
            const infEl = document.getElementById('detail-influence');
            if (idEl) idEl.textContent = data.id || '—';
            if (catEl) catEl.textContent = data.category || '—';
            if (infEl) infEl.textContent = (data.influence != null ? Number(data.influence).toFixed(2) : '—') + ` (deg ${data.degree ?? 0})`;
        }
    }

    highlightSelectedObject(object) {
        if (object.material && object.material.emissive) {
            object.material.emissiveIntensity = 0.8;
        }
        object.scale.setScalar(1.8);
    }

    removeHighlight(object) {
        if (object.material && object.material.emissive) {
            object.material.emissiveIntensity = 0.2;
        }
        object.scale.setScalar(1.0);
    }

    showObjectDetails(object) {
        if (object.userData?.type === 'network-node') {
            this.showNetworkNodeTooltip(object);
        }
    }

    hideObjectDetails() {
        this.hideTooltip();
        const panel = document.getElementById('details-panel');
        if (panel) panel.style.display = 'none';
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

export default VisualizationEngine;
