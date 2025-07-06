used: Math.round(performance.memory.usedJSHeapSize / 1048576),
    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
                };

if (memInfo.used > memInfo.limit * 0.8) {
    console.warn('⚠️ High memory usage detected:', memInfo);
    this.optimizeMemoryUsage();
}
            }
        }, 5000);
    }

startRenderLoop() {
    const render = (currentTime) => {
        if (!this.isInitialized) return;

        performance.mark('render-start');

        // Calculate FPS
        this.performance.frameCount++;
        if (currentTime - this.performance.lastTime >= 1000) {
            this.performance.fps = this.performance.frameCount;
            this.performance.frameCount = 0;
            this.performance.lastTime = currentTime;
            this.updatePerformanceDisplay();
        }

        // Update controls
        this.controls.update();

        // Update background particles animation
        if (this.backgroundParticles && this.backgroundParticles.material.uniforms) {
            this.backgroundParticles.material.uniforms.time.value = currentTime * 0.001;
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);

        performance.mark('render-end');
        performance.measure('render-frame', 'render-start', 'render-end');

        this.animationId = requestAnimationFrame(render);
    };

    this.animationId = requestAnimationFrame(render);
}

handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    // Update visualization components
    this.visualizationEngine.handleResize(width, height);
    this.analyticsManager.handleResize(width, height);
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

        // Update URL without triggering page reload
        history.pushState(null, null, `#${target}`);
    }
}

    async handleResearchCardClick(event) {
    const card = event.currentTarget;
    const category = card.getAttribute('data-category');

    try {
        // Visual feedback
        card.classList.add('loading');

        // Load research data for this category
        const data = await this.dataProcessor.loadCategoryData(category);

        // Update visualization
        await this.visualizationEngine.focusOnCategory(category, data);

        // Subscribe to real-time updates for this category
        this.socket.emit('subscribe_to_category', category);

        // Navigate to visualization section
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
    await this.visualizationEngine.changeCategory(category);
}

    async handleTimeRangeChange(event) {
    const timeRange = event.target.value;
    await this.visualizationEngine.changeTimeRange(timeRange);
}

    async handleVisualizationModeChange(event) {
    const mode = event.target.value;
    await this.visualizationEngine.changeMode(mode);
}

    async handleAction(event) {
    const action = event.currentTarget.getAttribute('data-action');

    switch (action) {
        case 'explore-research':
            document.getElementById('research').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'view-network':
            document.getElementById('network').scrollIntoView({ behavior: 'smooth' });
            await this.networkAnalyzer.loadNetworkData();
            break;
        case 'center-network':
            this.networkAnalyzer.centerView();
            break;
        case 'highlight-connections':
            this.networkAnalyzer.highlightConnections();
            break;
        case 'filter-influence':
            this.networkAnalyzer.filterByInfluence();
            break;
        case 'animate-flow':
            this.networkAnalyzer.animateDataFlow();
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
    // Keyboard shortcuts for power users
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

    // Navigation shortcuts
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
    }
}

handleMouseMove(event) {
    // Convert mouse position to normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update visualization engine with mouse position for interactions
    this.visualizationEngine.updateMouse(mouse);
}

handleCanvasClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Perform raycasting to detect object intersections
    this.visualizationEngine.handleClick(mouse);
}

handleScroll() {
    // Parallax effect for background particles
    const scrollY = window.pageYOffset;
    if (this.backgroundParticles) {
        this.backgroundParticles.rotation.y = scrollY * 0.0005;
        this.backgroundParticles.rotation.x = scrollY * 0.0002;
    }

    // Update section visibility for navigation highlighting
    this.updateActiveSection();
}

handleRealTimeUpdate(data) {
    const { category, metrics, timestamp } = data;

    // Update visualization with new data
    this.visualizationEngine.addRealTimeData(category, metrics, timestamp);

    // Update analytics
    this.analyticsManager.processRealTimeData(data);

    // Update metrics preview on research cards
    this.updateMetricsPreview(category, metrics);
}

updateMetricsPreview(category, metrics) {
    const previewElement = document.getElementById(`${category}-metrics`);
    if (previewElement) {
        // Create simple sparkline visualization
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
        const data = await this.visualizationEngine.exportData();
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
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            this.showNotification('Link copied to clipboard', 'success');
        });
    }
}

resetVisualization() {
    this.visualizationEngine.reset();
    this.networkAnalyzer.reset();
    this.controls.reset();
    this.showNotification('Visualization reset', 'info');
}

hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('hidden');

    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
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
    // Update FPS counter if performance panel is visible
    const fpsDisplay = document.getElementById('fps-counter');
    if (fpsDisplay) {
        fpsDisplay.textContent = `${this.performance.fps} FPS`;
    }

    // Update processing speed stat
    const processingSpeed = document.getElementById('processing-speed');
    if (processingSpeed) {
        processingSpeed.textContent = `${this.performance.frameTime.toFixed(1)}ms`;
    }
}

optimizeMemoryUsage() {
    // Implement memory optimization strategies
    this.visualizationEngine.optimizeMemory();
    this.networkAnalyzer.optimizeMemory();

    // Force garbage collection if available
    if (window.gc) {
        window.gc();
    }
}

showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

destroy() {
    // Cleanup resources
    if (this.animationId) {
        cancelAnimationFrame(this.animationId);
    }

    if (this.socket) {
        this.socket.disconnect();
    }

    this.visualizationEngine.destroy();
    this.networkAnalyzer.destroy();
    this.analyticsManager.destroy();

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
    window.houstonOilAirsApp = new HoustonOilAirsApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.houstonOilAirsApp) {
        window.houstonOilAirsApp.destroy();
    }
});
