# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


## Never Lie or Over-exaggerate
    - I give you permission to admit uncertainty. This simple technique can drastically reduce false information.
    - I also give you permission to say you can't do something or don't know something.
    

## Coding Standards
- always batch:
    - Vision
    - Tool use
    - System messages
    - Multi-turn conversations
    - Any beta features
    - results
    - Monitor batch processing status regularly and implement       appropriate retry logic for failed requests.
    - Use meaningful custom_id values to easily match results with requests, since order is not guaranteed.
    - Consider breaking very large datasets into multiple batches for better manageability.
    - Dry run a single request shape with the Messages API to avoid validation errors.
- Batch storage and privacy
    - Workspace isolation: Batches are isolated within the Workspace they are created in. They can only be accessed by API keys associated with that Workspace, or users with permission to view Workspace batches in the Console.
    - Result availability: Batch results are available for 29 days after the batch is created, allowing ample time for retrieval and processing.
    -  prompt caching 
    
## Efficient Token Use
    - ALWAYS engage in the most efficient use of token for everything as long as it doesn't sacrifice accurate coding and end-to-end development
    - Proactively manage rate limits and costs
    - Make smart model routing decisions
    - Optimize prompts to be a specific length
​    - Always Break down complex tasks into smaller, consistent subtasks. Each subtask gets assigned to an appropriate agent that work in parellel to reduce token usage and work efficiently and effectively. each task gets the agents full attention, reducing inconsistency errors across scaled workflows.
 
## Development Commands

### Frontend Development
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server (Vite)
npm run build        # Build for production with optimization
npm run test         # Run Playwright E2E tests
npm run test:unit    # Run Jest unit tests
npm run lint         # ESLint code checking
npm run format       # Prettier code formatting
```

### Backend Development
```bash
# Node.js API Server
cd backend/node-server
npm install          # Install dependencies
npm start           # Start Node.js server
npm test            # Run Jest tests
npm run lint        # ESLint checking

# Java Analytics Services
cd backend/java-services
mvn test            # Run Java tests
mvn spring-boot:run # Start Spring Boot service

# C++ Engine
cd backend/cpp-engine
cmake .             # Configure build
make               # Build C++ components
```

### Full Stack Development
```bash
make dev-setup      # Install all dependencies and build images
make validate       # Validate all configurations (Helm, Docker, YAML)
make test          # Run all test suites (frontend, Node.js, Java)
make build         # Build all Docker images
```

## Development Workflow
1. **Planning Phase**: Use `/agents planner` for complex features
2. **Implementation**: Use `/agents executor` for safe execution  
3. **Review Phase**: Use `/agents reviewer` for quality assurance
4. **Testing**: Use `/agents test-runner` for comprehensive testing
5. **Benchmarking**: Use `/agents swe-bench-evaluator` for performance evaluation

```bash
make deploy ENV=dev        # Deploy to development
make deploy ENV=staging    # Deploy to staging
make deploy ENV=production # Deploy to production (default)
./deploy.sh production     # Alternative deployment script
```

### Monitoring & Analysis
```bash
make monitoring     # Open Grafana (localhost:3000) and Prometheus (localhost:9090)
make project-graph  # Generate project architecture graph
make graph-serve    # Serve graph viewer on port 8088
```

## Architecture Overview

### Multi-Service Backend Architecture
- **Node.js API Server** (`backend/node-server/`): Main API with Express, Socket.IO, Redis caching, PostgreSQL
- **Java Analytics Service** (`backend/java-services/`): Spring Boot microservice for AI research analytics
- **C++ Processing Engine** (`backend/cpp-engine/`): High-performance data processing with FFI integration
- **Frontend** (`frontend/`): Vite.js with Three.js WebGL visualizations, modern glassmorphism UI

### Key Components
- **VisualizationEngine**: Core 3D visualization system using Three.js and WebGL
- **AIResearchAnalyzer**: Java service for research trend analysis and network analytics
- **DataProcessor**: C++ engine for high-performance research data filtering and generation
- **Community Portal**: Next.js application for environmental justice community engagement (`platform/community/portal/`)
- **ESP32 Edge Devices**: IoT sensors with MQTT-Kafka data pipeline (`platform/edge/esp32/`)

### Technology Stack
- **Frontend**: Vite, Three.js, WebGL, GSAP animations, Chart.js, D3.js
- **Backend**: Node.js/Express, Java/Spring Boot, C++/CMake, Socket.IO, Redis, PostgreSQL
- **Infrastructure**: Kubernetes, Helm charts, Kustomize overlays, Docker, Terraform
- **Monitoring**: Prometheus metrics, Grafana dashboards
- **IoT**: ESP32 firmware, MQTT protocols, environmental sensors

## Development Guidelines

### Testing Strategy
- **Frontend**: Playwright for E2E testing, Jest for unit tests
- **Backend**: Jest for Node.js services, Maven/JUnit for Java services
- **Integration**: Full stack testing with Docker Compose
- **Performance**: Lighthouse audits, bundle analysis with webpack-bundle-analyzer

### Code Organization
- **Frontend**: Component-based architecture with modern ES modules
- **Backend**: Microservices pattern with clear service boundaries
- **Database**: PostgreSQL with Redis caching layer
- **Configuration**: Environment-specific overlays with Kustomize

### Build and Deployment
- **Environment Management**: Development, staging, production environments
- **Infrastructure**: Kubernetes-native with Helm charts and Terraform IaC
- **CI/CD**: GitHub Actions with security scanning and automated deployments
- **Monitoring**: Health endpoints at `/live`, `/ready`, `/health`, `/metrics`

### Project Graph System
- **Generation**: `make project-graph` creates `docs/project-graph.json`
- **Visualization**: Interactive graph viewer at `localhost:8088/graph-viewer.html`
- **Querying**: `node tools/project-graph/query-graph.js --type=endpoint`
- **Export**: Neo4j Cypher export for advanced graph analysis

## Special Features

### Environmental Justice Platform (EJ-AI)
- **Community Portal**: Next.js application for community engagement and data sovereignty
- **IoT Sensor Network**: ESP32 devices with environmental monitoring capabilities
- **Data Pipeline**: MQTT-Kafka ingestion with real-time processing
- **Encryption**: Dual-key community-controlled data encryption

### Houston Urban Intelligence
- **Network Analysis**: 15.4M nodes, 71.8M edges mapping Houston's social/physical infrastructure
- **AI-Powered Advocacy**: Environmental justice playbook with policy intervention strategies
- **Real-time Monitoring**: 487 air quality monitors with live PM₂.₅ and ozone data
- **Graph Analytics**: Community resilience measurement through network modularity analysis

### Performance Optimizations
- **WebGL Rendering**: Hardware-accelerated 3D visualizations
- **Edge Computing**: ESP32 firmware for distributed sensor processing
- **Caching Strategy**: Redis for API responses, browser caching for static assets
- **Bundle Optimization**: Terser compression, image optimization, tree shaking

## Important Notes

- **Node.js Version**: Requires Node.js ≥18.0.0, npm ≥9.0.0
- **Java Version**: Java 11 required for Spring Boot services
- **C++ Dependencies**: CMake required for building native engine
- **Docker Requirements**: Multi-stage builds for production optimization
- **Kubernetes**: Helm 3.x required for deployments
- **Security**: Network policies, RBAC, pod security standards enforced
- Maintain minimum 80% test coverage
- All code must pass linting and formatting checks
- Use semantic commit messages
- Document all public APIs

