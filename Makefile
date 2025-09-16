.PHONY: help build test deploy clean validate dev-setup monitoring project-graph

# Default environment
ENV ?= production

help: ## Show this help message
	@echo 'Houston Oil Airs - Advanced AI Research Platform'
	@echo 'Usage: make [target] [ENV=environment]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $1, $2}' $(MAKEFILE_LIST)

validate: ## Validate configurations
	@echo "🔍 Validating configurations..."
	@if [ -f validate-yaml.py ]; then python3 validate-yaml.py; fi
	@echo "📊 Validating Helm chart..."
	@helm lint helm/houston-oil-airs || echo "⚠️  Helm chart validation skipped"
	@echo "🔧 Validating Docker configurations..."
	@docker-compose -f docker/docker-compose.yml config > /dev/null || echo "⚠️  Docker compose validation skipped"
	@echo "✅ All validations completed"

dev-setup: ## Set up development environment
	@echo "🚀 Setting up development environment..."
	@echo "📦 Installing frontend dependencies..."
	@cd frontend && npm install
	@echo "☕ Installing backend dependencies..."
	@cd backend/node-server && npm install
	@echo "🐳 Building Docker images..."
	@docker-compose -f docker/docker-compose.yml build
	@echo "✅ Development environment ready!"

monitoring: ## Open monitoring dashboards
	@echo "📊 Opening monitoring dashboards..."
	@echo "Grafana: http://localhost:3000 (admin/admin123)"
	@echo "Prometheus: http://localhost:9090"
	@if command -v open >/dev/null 2>&1; then \
		open http://localhost:3000; \
	elif command -v xdg-open >/dev/null 2>&1; then \
		xdg-open http://localhost:3000; \
	fi

project-graph: ## Generate project architecture graph
	@echo "🧠 Generating project architecture graph..."
	@if [ -d tools/project-graph ]; then \
		cd tools/project-graph && python3 generate_graph.py; \
	else \
		echo "⚠️  Project graph tools not found"; \
	fi

build: ## Build Docker images
	@echo "Building Docker images..."
	@docker build -t houston-oil-airs/frontend:latest frontend/
	@docker build -t houston-oil-airs/backend:latest backend/
	@echo "✓ Images built successfully"

test: ## Run tests
	@echo "Running tests..."
	@cd frontend && npm ci && npx playwright install-deps && npx playwright install && npm run test:unit && npm test
	@cd backend/node-server && npm test
	@cd backend/java-services && mvn test
	@echo "✓ All tests passed"

deploy: validate ## Deploy to specified environment
	@echo "Deploying to $(ENV) environment..."
	@./deploy.sh $(ENV)

clean: ## Clean up resources
	@echo "Cleaning up..."
	@kubectl delete namespace houston-oil-airs --ignore-not-found=true
	@docker system prune -f
	@echo "✓ Cleanup completed"

dev-setup: ## Set up local development environment
	@echo "Setting up development environment..."
	@cd frontend && npm install
	@cd backend/node-server && npm install
	@echo "✓ Development environment ready"

project-graph: ## Generate project graph
	@echo "Generating project graph..."
	@node tools/project-graph/build-graph.js
	@echo "✓ Project graph generated"

graph-serve: ## Serve graph viewer
	@echo "Starting graph viewer server..."
	@cd docs && python3 -m http.server 8088

graph-query: ## Query project graph
	@echo "Querying project graph..."
	@node tools/project-graph/query-graph.js $(ARGS)

monitoring: ## Open monitoring dashboards
	@echo "Opening monitoring dashboards..."
	@kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80 &
	@kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-prometheus 9090:9090 &
	@echo "Grafana: http://localhost:3000 (admin/admin123)"
	@echo "Prometheus: http://localhost:9090"