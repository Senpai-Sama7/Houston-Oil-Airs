# Project: Houston Oil Airs

## 1. Project Overview

**Houston Oil Airs** is an advanced AI research platform focused on urban intelligence and environmental justice in Houston. It combines a multi-service backend, a sophisticated frontend with 3D visualizations, and a suite of tools for data analysis, deployment, and monitoring. The project aims to provide data-driven solutions for urban planning and environmental advocacy.

**Key Goals:**
-   Advance responsible AI through research visualization.
-   Provide community-centered urban intelligence.
-   Offer a production-grade platform for real-world impact.

**Core Technologies:**
-   **Frontend:** Vite.js, WebGL
-   **Backend:** Node.js, Java, C++
-   **Database:** PostgreSQL, Redis
-   **API Gateway:** Kong
-   **Deployment:** Docker, Kubernetes, Helm, Kustomize, Terraform
-   **Monitoring:** Prometheus, Grafana
-   **CI/CD:** GitHub Actions

## 2. Project Structure

The project is organized into several key directories:

-   `.github/workflows/`: Contains CI/CD pipelines using GitHub Actions.
-   `agents/`: Holds AI agents for auditing and validation.
-   `backend/`: The multi-service backend, with components in Node.js, Java, and C++.
-   `data/`: Contains sample data, including `air_quality_data.csv`.
-   `database/`: Includes database schemas and migration scripts.
-   `docker/`: Docker configurations for building and running services.
-   `docs/`: Extensive documentation on the project's vision, architecture, and research.
-   `firmware/`: Firmware for IoT sensors.
-   `frontend/`: The Vite.js frontend application with WebGL visualizations.
-   `helm/`: Helm charts for Kubernetes deployment.
-   `kustomize/`: Kustomize overlays for environment-specific configurations.
-   `platform/`: Components of the EJ-AI platform, including a community portal and data ingestion services.
-   `terraform/`: Infrastructure as Code for provisioning resources.
-   `tools/`: Development and analysis tools, including a project graph generator.

## 3. Key Documents

-   [AI-Powered Environmental Justice Playbook](docs/AI-Powered-Environmental-Justice-Playbook.md)
-   [Houston Urban Intelligence Analysis](docs/Houston-Urban-Intelligence-Analysis.md)
-   [Architecture Graph](docs/ARCHITECTURE_GRAPH.md)
-   [Strategic Plan](docs/STRATEGIC_PLAN.md)
-   [Contributing Guidelines](CONTRIBUTING.md)

## 4. Development Workflow

### Local Development

1.  **Setup:** Run `make dev-setup` to install dependencies and configure the local environment.
2.  **Frontend:** Navigate to `frontend/` and use `npm run dev` to start the development server.
3.  **Backend:** Navigate to `backend/` and run `./start.sh` to start the backend services.

### Testing

-   Run all tests with `make test`.
-   Backend tests: `cd backend/java-services && mvn test` and `cd backend/node-server && npm test`.
-   Frontend tests: `cd frontend && npm test`.
-   E2E tests: `cd frontend && npm run test:e2e`.

### Deployment

-   The project uses a unified deployment script: `./deploy.sh <env>`.
-   Environments (`dev`, `staging`, `production`) are managed with Kustomize overlays.
-   Infrastructure is provisioned with Terraform.

## 5. Monitoring

-   The project includes a Prometheus and Grafana stack for monitoring.
-   Access dashboards via `make monitoring`.
-   Health endpoints are available at `/live`, `/ready`, and `/metrics`.

## 6. AI Agents

The `agents/` directory contains AI agents for various tasks. These agents appear to be configured with `.toml` files and implemented in Python. They likely play a role in data analysis, auditing, and validation.
