
<p align="center">
  <img src="frontend/IMAGE.jpeg" alt="Houston Oil Airs" width="300"/>
</p>

# 🌟 Houston Oil Airs - Advanced AI Research Platform

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](docker/)

> **Created by**: Senpai-Sama7
> **Date**: 2025-05-28 21:39:15 UTC
> **Vision**: Advancing responsible AI through cutting-edge research visualization

---

## 🚀 **Live Demo**

- **Production**: [https://houstonoilairs.org](https://houstonoilairs.org)
- **Staging**: [https://staging.houstonoilairs.org](https://staging.houstonoilairs.org)

---

## ✨ **Features**

- 🎨 **Immersive 3D Visualizations** - WebGL-powered research data exploration
- 🔄 **Real-time Analytics** - Live AI research metrics and collaboration networks
- 🌐 **Interactive Network Analysis** - Dynamic research collaboration mapping
- ⚡ **High Performance** - Native C++, Java, and Node.js backend architecture
- 🔒 **Enterprise Security** - Advanced authentication and data protection
- 📱 **Responsive Design** - Optimized for all devices and screen sizes
 - 📈 **Observability** - Liveness/Readiness + Prometheus metrics out of the box
 - 🧠 **Architecture Graph** - Auto-generated, queryable project graph (JSON/DOT/GraphML/Mermaid) + HTML viewer

---

## 🔧 **Updated Features**

### Research Trends Endpoint

- Returns a JSON array of research metrics for a given category and timeframe.
- If no metrics are found, an empty JSON array is returned.

### Network Analysis Endpoint

- Performs network analysis for specified research categories.
- Returns a JSON object with nodes, edges, and network metrics.
- If no data is generated, an empty JSON object is returned.

### Health Endpoint

- Provides the service status, timestamp, and service name.
- Always returns a JSON response indicating the health of the service.

---

## 🏗️ **Architecture**

- **Frontend**: Built with Vite.js for blazing-fast development and optimized production builds.
- **Backend**: Multi-language architecture using C++, Java, and Node.js for high performance and scalability.
- **Deployment**: Dockerized containers with Kubernetes orchestration for seamless scaling.
- **Database**: Optimized relational and NoSQL databases for efficient data storage and retrieval.
 - **Observability**: `/live`, `/ready` (readiness), `/metrics` (Prometheus), `/metrics.json` (JSON)
 - **Knowledge Graph**: Repo-indexed project graph with classes, methods, endpoints, imports, and calls

---

## 📜 **Documentation**

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [License](LICENSE)
- [FAQs](FAQ.md)

---

## 🛠️ **Setup Instructions**

### Prerequisites

- **Node.js**: v18.20.8 or higher
- **Java**: JDK 11 or higher
- **Docker**: Installed and running

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/Senpai-Sama7/Houston-Oil-Airs.git
   ```

2. Navigate to the project directory:

   ```bash
   cd Houston-Oil-Airs
   ```

3. Install dependencies for the frontend:

   ```bash
   cd frontend
   npm install
   ```

4. Build and run the backend services:

   ```bash
   cd ../backend/java-services
   mvn clean install
   mvn spring-boot:run
   ```

5. Start the frontend:

   ```bash
   cd ../../frontend
   npm run dev
   ```

6. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8080/api](http://localhost:8080/api)

Optional: disable native C++ FFI processing and use JS fallback

```
export CPP_ENGINE_ENABLED=0
cd backend/node-server && node src/server.js
```

---

## 🧪 **Testing**

### Backend Tests

Run the following command to execute backend tests:

```bash
cd backend/java-services
mvn test
```

### Frontend Tests

Run the following command to execute frontend tests:

```bash
cd frontend
npm test
```

### E2E (Playwright)

```
cd frontend
npx playwright install --with-deps
npm run test:e2e
```

Press `n` in the running app (network mode) to open a node’s details panel (useful in demos/tests).

---

## 🌍 **Contributing**

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

---

## 📧 **Contact**

For inquiries, please contact us at [support@houstonoilairs.org](mailto:support@houstonoilairs.org).

---

## 📜 **License**

This project is licensed under the [MIT License](LICENSE).

---

## 🔎 Architectural Graph & Queries

We ship a detailed, queryable project knowledge graph capturing services, files, classes, methods, endpoints, imports/includes, and call symbols.

- Builder: `tools/project-graph/build-graph.js`
- Query: `tools/project-graph/query-graph.js`
- Outputs (in `docs/`): JSON, Graphviz DOT, GraphML, Mermaid
- Viewer: `docs/graph-viewer.html`

Build full graph (all formats):

```
make project-graph
```

Build a subset graph (e.g., frontend scope up to 6 hops) and view it:

```
make graph-subset ARGS="--root=app:frontend --depth=6 --outfile=project-graph.frontend"
make graph-serve
# open http://localhost:8088/graph-viewer.html?src=project-graph.frontend.json
```

Query examples:

```
make graph-query ARGS="--type=endpoint"
make graph-query ARGS="--edge=imports --from=file:frontend/src/js/main.js"
make graph-query ARGS="--name=VisualizationEngine"
```

Export to Neo4j (Cypher):

```
make graph-cypher
# Then: cat docs/project-graph.cypher | cypher-shell -u neo4j -p password
```

---

## 📊 Health, Readiness, and Metrics

- Liveness: `GET /live` → `{ status: "alive" }`
- Readiness: `GET /ready` → includes Redis and native mode status (HTTP 200/503)
- Health (alias): `GET /health` → redirects to `/ready`
- Metrics (Prometheus): `GET /metrics` → counters, errors, duration histograms per route
- Metrics (JSON): `GET /metrics.json`

Prometheus keys include:

- `app_requests_total`, `app_uptime_seconds`, `app_memory_rss_megabytes`, `app_native_mode`
- `app_route_requests_total{route=...}`, `app_route_errors_total{route=...}`
- `app_route_duration_seconds_bucket{route=...,le="..."}`
