# Houston Oil Airs - Development and Deployment Makefile
# Author: Senpai-Sama7
# Date: 2025-05-28

.PHONY: help build dev test deploy clean install lint format docker k8s

# Default target
help:
	@echo "Houston Oil Airs - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  install     - Install all dependencies"
	@echo "  dev         - Start development servers"
	@echo "  build       - Build all components"
	@echo "  test        - Run all tests"
	@echo "  lint        - Run linting"
	@echo "  format      - Format code"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build    - Build Docker images"
	@echo "  docker-run      - Run with Docker Compose"
	@echo "  docker-clean    - Clean Docker resources"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy-dev      - Deploy to development"
	@echo "  deploy-prod     - Deploy to production"
	@echo "  k8s-deploy      - Deploy to Kubernetes"
	@echo ""
	@echo "Utilities:"
	@echo "  clean       - Clean build artifacts"
	@echo "  logs        - View application logs"
	@echo "  monitor     - Open monitoring dashboard"

# Installation
install:
	@echo "🔄 Installing dependencies..."
	cd backend/node-server && npm install
	cd frontend && npm install
	cd backend/java-services && ./gradlew build -x test
	@echo "✅ Dependencies installed"

# Development
dev:
	@echo "🚀 Starting development servers..."
	docker-compose -f docker/docker-compose.yml up -d redis
	cd backend/node-server && npm run dev &
	cd frontend && npm run dev &
	cd backend/java-services && ./gradlew bootRun &
	@echo "✅ Development servers started"

# Build
build: build-cpp build-java build-frontend build-node
	@echo "✅ All components built successfully"

build-cpp:
	@echo "🔧 Building C++ components..."
	cd backend/cpp-engine && mkdir -p build && cd build && \
	cmake .. -DCMAKE_BUILD_TYPE=Release && make -j$(nproc)

build-java:
	@echo "☕ Building Java services..."
	cd backend/java-services && ./gradlew build

build-node:
	@echo "📦 Building Node.js server..."
	cd backend/node-server && npm run build

build-frontend:
	@echo "🎨 Building frontend..."
	cd frontend && npm run build

# Testing
test: test-backend test-frontend
	@echo "✅ All tests passed"

test-backend:
	@echo "🧪 Running backend tests..."
	cd backend/node-server && npm test
	cd backend/java-services && ./gradlew test

test-frontend:
	@echo "🧪 Running frontend tests..."
	cd frontend && npm test

test-e2e:
	@echo "🧪 Running end-to-end tests..."
	cd frontend && npm run test:e2e

# Linting and Formatting
lint:
	@echo "🔍 Running linters..."
	cd backend/node-server && npm run lint
	cd frontend && npm run lint

format:
	@echo "💄 Formatting code..."
	cd backend/node-server && npm run format
	cd frontend && npm run format

# Docker
docker-build:
	@echo "🐳 Building Docker images..."
	docker build -f docker/Dockerfile.backend -t houston-oil-airs/backend:latest .
	docker build -f docker/Dockerfile.frontend -t houston-oil-airs/frontend:latest .
	@echo "✅ Docker images built"

docker-run:
	@echo "🐳 Starting Docker containers..."
	docker-compose -f docker/docker-compose.yml up -d
	@echo "✅ Containers started"
	@echo "📱 Frontend: http://localhost"
	@echo "🔧 Backend: http://localhost:3001"
	@echo "📊 Grafana: http://localhost:3000"
	@echo "🔍 Kibana: http://localhost:5601"

docker-stop:
	@echo "🛑 Stopping Docker containers..."
	docker-compose -f docker/docker-compose.yml down

docker-clean:
	@echo "🧹 Cleaning Docker resources..."
	docker-compose -f docker/docker-compose.yml down -v
	docker system prune -f
	docker volume prune -f

# Deployment
deploy-dev:
	@echo "🚀 Deploying to development environment..."
	$(MAKE) docker-build
	docker tag houston-oil-airs/backend:latest houston-oil-airs/backend:dev
	docker tag houston-oil-airs/frontend:latest houston-oil-airs/frontend:dev
	# Add deployment commands for dev environment

deploy-prod:
	@echo "🌟 Deploying to production environment..."
	$(MAKE) test
	$(MAKE) docker-build
	docker tag houston-oil-airs/backend:latest houston-oil-airs/backend:prod
	docker tag houston-oil-airs/frontend:latest houston-oil-airs/frontend:prod
	# Add deployment commands for production environment

k8s-deploy:
	@echo "☸️ Deploying to Kubernetes..."
	kubectl apply -f deployment/kubernetes.yml
	kubectl rollout status deployment/houston-backend -n houston-oil-airs
	kubectl rollout status deployment/houston-frontend -n houston-oil-airs
	@echo "✅ Kubernetes deployment complete"

k8s-status:
	@echo "📊 Kubernetes cluster status:"
	kubectl get pods -n houston-oil-airs
	kubectl get services -n houston-oil-airs
	kubectl get ingress -n houston-oil-airs

# Utilities
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf backend/cpp-engine/build
	rm -rf backend/java-services/build
	rm -rf backend/node-server/dist
	rm -rf frontend/dist
	@echo "✅ Clean complete"

logs:
	@echo "📋 Viewing application logs..."
	docker-compose -f docker/docker-compose.yml logs -f

monitor:
	@echo "📊 Opening monitoring dashboard..."
	@echo "Grafana: http://localhost:3000 (admin/admin)"
	@echo "Prometheus: http://localhost:9090"
	@echo "Kibana: http://localhost:5601"

# Performance testing
perf-test:
	@echo "⚡ Running performance tests..."
	cd frontend && npm run lighthouse
	# Add additional performance testing commands

# Security scanning
security-scan:
	@echo "🔒 Running security scans..."
	cd backend/node-server && npm audit
	cd frontend && npm audit
	# Add Docker image security scanning

# Backup
backup:
	@echo "💾 Creating backup..."
	docker exec houston-redis redis-cli BGSAVE
	# Add additional backup commands

# Database operations
db-migrate:
	@echo "🗃️ Running database migrations..."
	# Add migration commands

db-seed:
	@echo "🌱 Seeding database..."
	# Add seed commands

# Certificate management
cert-renew:
	@echo "🔐 Renewing SSL certificates..."
	# Add certificate renewal commands

# Environment setup
setup-dev:
	@echo "🛠️ Setting up development environment..."
	$(MAKE) install
	cp .env.example .env
	@echo "✅ Development environment ready"

setup-prod:
	@echo "🌟 Setting up production environment..."
	# Add production setup commands

# CI/CD helpers
ci-install:
	$(MAKE) install

ci-test:
	$(MAKE) test
	$(MAKE) lint

ci-build:
	$(MAKE) build
	$(MAKE) docker-build

ci-deploy:
	$(MAKE) deploy-prod

# Version management
version-patch:
	cd frontend && npm version patch
	cd backend/node-server && npm version patch

version-minor:
	cd frontend && npm version minor
	cd backend/node-server && npm version minor

version-major:
	cd frontend && npm version major
	cd backup/node-server && npm version major

# Documentation
docs-build:
	@echo "📚 Building documentation..."
	# Add documentation build commands

docs-serve:
	@echo "📖 Serving documentation..."
	# Add documentation serve commands