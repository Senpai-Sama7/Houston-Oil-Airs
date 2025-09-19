import * as THREE from 'three';
import VisualizationEngine from './visualization.js';

class VisualizationApp {
    constructor() {
        this.performance = {
            frameCount: 0,
            lastTime: 0,
            fps: 0
        };
        this.isInitialized = false;
        this.animationId = null;
        this.controls = null;
        this.backgroundParticles = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.visualizationEngine = null;
        this.analyticsManager = null;
        this.socket = null;
    }

    async initialize() {
        try {
            this.dataProcessor = new DataProcessor();
            await this.dataProcessor.initialize().catch(() => {});
        } catch (e) {
            console.warn('Data processor init failed:', e);
        }

        // Setup minimal Three.js if WebGL is available
        if (VisualizationApp.isWebGLAvailable()) {
            await this.setupThree();
        } else {
            console.warn('WebGL not available. Running in degraded mode.');
        }

        this.isInitialized = true;
        this.bindUI();
        this.hideLoadingScreen();
        return this;
    }

    static isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(
                window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
            );
        } catch (e) {
            return false;
        }
    }

    async setupThree() {
        // Create minimal renderer/scene/camera so the app can render
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        document.body.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 0, 10);

        // Basic ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);

        // Provide a minimal no-op controls object to avoid null checks everywhere
        this.controls = { update: () => {}, reset: () => {} };

        // Visual sanity check: rotating cube
        const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
        const cubeMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, roughness: 0.4, metalness: 0.2 });
        this._previewCube = new THREE.Mesh(cubeGeo, cubeMat);
        this._previewCube.position.set(-2, 0, 0);
        this.scene.add(this._previewCube);

        // Initialize visualization engine in a safe way
        this.visualizationEngine = new VisualizationEngine();
        await this.visualizationEngine.initialize(this.scene, this.camera, this.renderer);
        this.visualizationEngine.setDataProvider(this.dataProcessor);
        // Initialize with a sensible default category to fetch real data
        await this.visualizationEngine.changeCategory('alignment');

        // Attach canvas interactions
        this.renderer.domElement.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.renderer.domElement.addEventListener('click', (e) => this.handleCanvasClick(e));

        this.startRenderLoop();
    }

    startHealthChecks() {
        const el = document.getElementById('health-indicator');
        const check = async () => {
            if (!el) return;
            try {
                // Try relative first (works if proxy set), then explicit dev URL
                let res = await fetch('/health').catch(() => null);
                if (!res || !res.ok) {
                    res = await fetch('http://localhost:3001/health');
                }
                const data = await res.json();
                const ok = data && data.status === 'healthy';
                el.textContent = ok ? 'Backend: healthy' : 'Backend: degraded';
                el.classList.toggle('healthy', !!ok);
                el.classList.toggle('unhealthy', !ok);
                // Update status tray with metrics
                const tray = document.getElementById('viz-stats');
                if (tray) {
                    // Fetch metrics.json for counts
                    let mres = await fetch('/metrics.json').catch(() => null);
                    if (!mres || !mres.ok) mres = await fetch('http://localhost:3001/metrics.json');
                    const m = await mres.json();
                    // update data points and density via existing engine too
                    this.visualizationEngine?.updateVisualizationStats?.();
                }
            } catch (e) {
                if (el) {
                    el.textContent = 'Backend: unreachable';
                    el.classList.remove('healthy');
                    el.classList.add('unhealthy');
                }
            }
        };
        check();
        this._healthTimer = setInterval(check, 10000);
    }

    bindUI() {
        // Safe event bindings only if elements exist
        document.querySelectorAll('[data-nav]').forEach(el => {
            el.addEventListener('click', (e) => this.handleNavigation(e));
        });

        const fab = document.getElementById('fab');
        if (fab) fab.addEventListener('click', () => this.toggleFabMenu());

        document.querySelectorAll('.research-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleResearchCardClick(e));
            card.addEventListener('mouseenter', (e) => this.handleResearchCardHover(e));
            card.addEventListener('mouseleave', (e) => this.handleResearchCardLeave(e));
        });

        const categorySelector = document.getElementById('category-selector');
        if (categorySelector) categorySelector.addEventListener('change', (e) => this.handleCategoryChange(e));

        const timeRangeSelector = document.getElementById('time-range-selector');
        if (timeRangeSelector) timeRangeSelector.addEventListener('change', (e) => this.handleTimeRangeChange(e));

        const vizModeSelector = document.getElementById('viz-mode-selector');
        if (vizModeSelector) vizModeSelector.addEventListener('change', (e) => this.handleVisualizationModeChange(e));

        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('keydown', (e) => this.handleKeyboard(e));
        this.startHealthChecks();

        // Minimal global controls
        const modeSelect = document.getElementById('mode-select');
        if (modeSelect) {
            modeSelect.addEventListener('change', async (e) => {
                const val = e.target.value;
                await this.visualizationEngine?.changeMode?.(val);
            });
        }
        const btnCenter = document.getElementById('btn-center');
        if (btnCenter) {
            btnCenter.addEventListener('click', () => {
                if (this.visualizationEngine?.currentMode === 'network') {
                    this.visualizationEngine.networkSystem?.centerView?.(this.camera);
                } else {
                    this.visualizationEngine?.reset?.();
                }
            });
        }
        const influenceRange = document.getElementById('influence-range');
        const influenceValue = document.getElementById('influence-value');
        if (influenceRange) {
            influenceRange.addEventListener('input', (e) => {
                const v = Number(e.target.value);
                if (influenceValue) influenceValue.textContent = v.toFixed(2);
                if (this.visualizationEngine?.currentMode === 'network') {
                    this.visualizationEngine.networkSystem?.filterByInfluence?.(v);
                }
            });
        }
    }

    optimizeMemoryUsage() {
        const memInfo = {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576),
            total: Math.round(performance.memory.totalJSHeapSize / 1048576),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        };

        if (memInfo.used > memInfo.limit * 0.8) {
            console.warn('⚠️ High memory usage detected:', memInfo);
            // Implement memory optimization logic here
        }
    }

    startRenderLoop() {
        const render = (currentTime) => {
            if (!this.isInitialized) return;

            performance.mark('render-start');

            this.performance.frameCount++;
            if (currentTime - this.performance.lastTime >= 1000) {
                this.performance.fps = this.performance.frameCount;
                this.performance.frameCount = 0;
                this.performance.lastTime = currentTime;
                // Update performance display logic here
            }

            this.controls?.update?.();

            if (this.backgroundParticles?.material?.uniforms) {
                this.backgroundParticles.material.uniforms.time.value = currentTime * 0.001;
            }

            // Allow the engine to tick if present
            this.visualizationEngine?.update?.(currentTime);
            if (this._previewCube) {
                this._previewCube.rotation.x += 0.01;
                this._previewCube.rotation.y += 0.015;
            }
            this.renderer?.render?.(this.scene, this.camera);

            performance.mark('render-end');
            performance.measure('render-frame', 'render-start', 'render-end');

            this.animationId = requestAnimationFrame(render);
        };

        this.animationId = requestAnimationFrame(render);
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (this.camera && this.renderer) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }

        this.visualizationEngine?.handleResize?.(width, height);
        this.analyticsManager?.handleResize?.(width, height);
    }

    handleNavigation(event) {
        event.preventDefault();
        const target = event.currentTarget.getAttribute('data-nav');
        const section = document.getElementById(target);

        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            history.pushState(null, null, `#${target}`);
        }
    }

    async handleResearchCardClick(event) {
        const card = event.currentTarget;
        const category = card.getAttribute('data-category');

        try {
            card.classList.add('loading');

            const data = await this.dataProcessor.loadCategoryData(category);

            if (this.visualizationEngine?.focusOnCategory) {
                await this.visualizationEngine.focusOnCategory(category, data);
            }

            if (this.socket) {
                this.socket.emit('subscribe_to_category', category);
            }

            document.getElementById('visualization').scrollIntoView({
                behavior: 'smooth'
            });

            card.classList.remove('loading');
        } catch (error) {
            console.error('Error loading category data:', error);
            card.classList.remove('loading');
        }
    }

    handleResearchCardHover(event) {
        const card = event.currentTarget;
        card.classList.add('hover');
    }

    handleResearchCardLeave(event) {
        const card = event.currentTarget;
        card.classList.remove('hover');
    }

    async handleCategoryChange(event) {
        const category = event.target.value;
        await this.visualizationEngine?.changeCategory?.(category);
    }

    async handleTimeRangeChange(event) {
        const timeRange = event.target.value;
        await this.visualizationEngine?.changeTimeRange?.(timeRange);
    }

    async handleVisualizationModeChange(event) {
        const mode = event.target.value;
        await this.visualizationEngine?.changeMode?.(mode);
    }

    async handleAction(event) {
        const action = event.currentTarget.getAttribute('data-action');

        switch (action) {
            case 'explore-research':
                document.getElementById('research').scrollIntoView({ behavior: 'smooth' });
                break;
            case 'view-network':
                document.getElementById('network').scrollIntoView({ behavior: 'smooth' });
                await this.networkAnalyzer?.loadNetworkData?.();
                break;
            case 'center-network':
                this.networkAnalyzer?.centerView?.();
                break;
            case 'highlight-connections':
                this.networkAnalyzer?.highlightConnections?.();
                break;
            case 'filter-influence':
                this.networkAnalyzer?.filterByInfluence?.();
                break;
            case 'animate-flow':
                this.networkAnalyzer?.animateDataFlow?.();
                break;
            case 'fullscreen':
                this.toggleFullscreen();
                break;
            case 'export-data':
                await this.exportVisualizationData();
                break;
            case 'share':
                this.shareVisualization();
                break;
        }
    }

    handleKeyboard(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'f':
                    event.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 's':
                    event.preventDefault();
                    this.exportVisualizationData();
                    break;
                case 'r':
                    event.preventDefault();
                    this.resetVisualization();
                    break;
            }
        }

        switch (event.key) {
            case '1':
                document.getElementById('research').scrollIntoView({ behavior: 'smooth' });
                break;
            case '2':
                document.getElementById('visualization').scrollIntoView({ behavior: 'smooth' });
                break;
            case '3':
                document.getElementById('network').scrollIntoView({ behavior: 'smooth' });
                break;
            case '4':
                document.getElementById('analytics').scrollIntoView({ behavior: 'smooth' });
                break;
            case 'n':
                // E2E: open details for first network node if available
                if (this.visualizationEngine?.networkSystem) {
                    const meshes = this.visualizationEngine.networkSystem.nodeMeshes;
                    for (const [, mesh] of meshes) {
                        this.visualizationEngine.showNetworkNodeTooltip(mesh);
                        break;
                    }
                }
                break;
        }
    }

    handleMouseMove(event) {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.visualizationEngine?.updateMouse?.(mouse);
    }

    handleCanvasClick(event) {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.visualizationEngine?.handleClick?.(mouse);
    }

    handleScroll() {
        const scrollY = window.pageYOffset;
        if (this.backgroundParticles) {
            this.backgroundParticles.rotation.y = scrollY * 0.0005;
            this.backgroundParticles.rotation.x = scrollY * 0.0002;
        }

        this.updateActiveSection();
    }

    handleRealTimeUpdate(data) {
        const { category, metrics, timestamp } = data;

        this.visualizationEngine?.addRealTimeData?.(category, metrics, timestamp);

        this.analyticsManager?.processRealTimeData?.(data);

        this.updateMetricsPreview(category, metrics);
    }

    updateMetricsPreview(category, metrics) {
        const previewElement = document.getElementById(`${category}-metrics`);
        if (previewElement) {
            const sparkline = this.createSparkline(metrics);
            previewElement.innerHTML = sparkline;
        }
    }

    createSparkline(data) {
        const width = 120;
        const height = 30;
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;

        const points = data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');

        return `
            <svg width="${width}" height="${height}" class="sparkline">
                <polyline fill="none" stroke="#00d4ff" stroke-width="2" points="${points}"/>
            </svg>
        `;
    }

    updateActiveSection() {
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('[data-nav]');

        let activeSection = null;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                activeSection = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-nav') === activeSection);
        });
    }

    toggleFabMenu() {
        const fabMenu = document.getElementById('fab-menu');
        const fab = document.getElementById('fab');

        fabMenu.classList.toggle('active');
        fab.classList.toggle('active');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    async exportVisualizationData() {
        try {
            const data = await this.visualizationEngine?.exportData?.();
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `houston-oil-airs-data-${Date.now()}.json`;
            a.click();

            URL.revokeObjectURL(url);
            this.showNotification('Data exported successfully', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed', 'error');
        }
    }

    shareVisualization() {
        if (navigator.share) {
            navigator.share({
                title: 'Houston Oil Airs - AI Research Visualization',
                text: 'Explore cutting-edge AI research through immersive data visualization',
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('Link copied to clipboard', 'success');
            });
        }
    }

    resetVisualization() {
        this.visualizationEngine?.reset?.();
        this.networkAnalyzer?.reset?.();
        this.controls?.reset?.();
        this.showNotification('Visualization reset', 'info');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) return;
        loadingScreen.classList.add('hidden');
        setTimeout(() => { if (loadingScreen) loadingScreen.style.display = 'none'; }, 500);
    }

    showErrorState(error) {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.innerHTML = `
            <div class="error-state">
                <h2>⚠️ Initialization Failed</h2>
                <p>Failed to load Houston Oil Airs application</p>
                <details>
                    <summary>Error Details</summary>
                    <pre>${error.message}</pre>
                </details>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }

    updateConnectionStatus(connected) {
        const indicator = document.querySelector('.connection-indicator') || this.createConnectionIndicator();
        indicator.classList.toggle('connected', connected);
        indicator.classList.toggle('disconnected', !connected);
        indicator.title = connected ? 'Connected to server' : 'Disconnected from server';
    }

    createConnectionIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'connection-indicator';
        indicator.innerHTML = '<div class="indicator-dot"></div>';
        document.body.appendChild(indicator);
        return indicator;
    }

    updatePerformanceDisplay() {
        const fpsDisplay = document.getElementById('fps-counter');
        if (fpsDisplay) {
            fpsDisplay.textContent = `${this.performance.fps} FPS`;
        }

        const processingSpeed = document.getElementById('processing-speed');
        if (processingSpeed) {
            processingSpeed.textContent = `${this.performance.frameTime.toFixed(1)}ms`;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.socket) {
            this.socket.disconnect();
        }

        this.visualizationEngine?.destroy?.();
        this.networkAnalyzer?.destroy?.();
        this.analyticsManager?.destroy?.();

        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Data Processing Class
class DataProcessor {
    constructor() {
        this.cache = new Map();
        this.apiEndpoint = '/api/research';
    }

    async initialize() {
        console.log('🔄 Initializing data processor...');
        await this.loadInitialData();
    }

    async loadInitialData() {
        try {
            const categories = ['alignment', 'fairness', 'interpretability', 'robustness', 'safety', 'ethics'];

            await Promise.all(categories.map(category =>
                this.loadCategoryData(category)
            ));

            console.log('✅ Initial data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load initial data:', error);
            throw error;
        }
    }

    async loadCategoryData(category) {
        if (this.cache.has(category)) {
            return this.cache.get(category);
        }

        try {
            const response = await fetch(`${this.apiEndpoint}/visualization-data/${category}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            this.cache.set(category, data);

            return data;
        } catch (error) {
            console.error(`Failed to load data for category ${category}:`, error);
            throw error;
        }
    }

    async loadNetworkTopology() {
        try {
            const response = await fetch(`${this.apiEndpoint}/network-topology`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            return await response.json();
        } catch (error) {
            console.error('Failed to load network topology:', error);
            throw error;
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new VisualizationApp();
    app.initialize().finally(() => {
        window.houstonOilAirsApp = app;
    });
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.houstonOilAirsApp) {
        window.houstonOilAirsApp.destroy();
    }
});
