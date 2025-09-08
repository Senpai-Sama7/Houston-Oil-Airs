#!/bin/bash

# Houston Oil Airs - Enterprise Hardening Checklist
# This script checks and implements enterprise-grade improvements

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        return 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed"
        return 1
    fi
    
    # Check if helm is installed
    if ! command -v helm &> /dev/null; then
        log_warn "helm is not installed - will install"
        curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
    fi
    
    log_info "Prerequisites check completed"
}

# 1. Kubernetes Production Hardening
check_ingress_controller() {
    log_info "Checking Ingress Controller..."
    
    if kubectl get pods -n ingress-nginx &> /dev/null; then
        log_info "✓ Nginx Ingress Controller is already installed"
        return 0
    else
        log_warn "Nginx Ingress Controller not found - will install"
        return 1
    fi
}

install_ingress_controller() {
    log_info "Installing Nginx Ingress Controller..."
    
    # Add nginx ingress helm repo
    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
    helm repo update
    
    # Install nginx ingress controller
    helm install ingress-nginx ingress-nginx/ingress-nginx \
        --namespace ingress-nginx \
        --create-namespace \
        --set controller.metrics.enabled=true \
        --set controller.podAnnotations."prometheus\.io/scrape"="true" \
        --set controller.podAnnotations."prometheus\.io/port"="10254"
    
    log_info "✓ Nginx Ingress Controller installed"
}

check_resource_limits() {
    log_info "Checking resource limits in kubernetes.yml..."
    
    if grep -q "resources:" deployment/kubernetes.yml; then
        log_info "✓ Resource limits are defined"
        return 0
    else
        log_error "Resource limits not properly defined"
        return 1
    fi
}

check_secrets_management() {
    log_info "Checking secrets management..."
    
    if kubectl get secret -n houston-oil-airs &> /dev/null; then
        log_info "✓ Secrets namespace exists"
    else
        log_warn "No secrets found - will create example"
    fi
}

create_secrets() {
    log_info "Creating example secrets..."
    
    kubectl create secret generic houston-secrets \
        --namespace=houston-oil-airs \
        --from-literal=redis-password=changeme123 \
        --from-literal=jwt-secret=your-jwt-secret-here \
        --dry-run=client -o yaml > deployment/secrets.yml
    
    log_info "✓ Secrets template created in deployment/secrets.yml"
}

# 2. Infrastructure as Code
check_terraform() {
    log_info "Checking for Terraform configuration..."
    
    if [ -d "terraform" ]; then
        log_info "✓ Terraform directory exists"
        return 0
    else
        log_warn "No Terraform configuration found - will create basic setup"
        return 1
    fi
}

create_terraform_setup() {
    log_info "Creating basic Terraform setup..."
    
    mkdir -p terraform/{modules,environments/{dev,staging,prod}}
    
    # Create main terraform configuration
    cat > terraform/main.tf << 'EOF'
terraform {
  required_version = ">= 1.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}
EOF
    
    log_info "✓ Basic Terraform setup created"
}

# 3. Database Setup
check_database() {
    log_info "Checking database configuration..."
    
    if kubectl get statefulset postgres -n houston-oil-airs &> /dev/null; then
        log_info "✓ PostgreSQL StatefulSet exists"
        return 0
    else
        log_warn "No production database found - will create PostgreSQL setup"
        return 1
    fi
}

create_database_setup() {
    log_info "Creating PostgreSQL StatefulSet..."
    
    cat > deployment/postgres.yml << 'EOF'
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: houston-oil-airs
spec:
  serviceName: postgres-service
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: houston_oil_airs
        - name: POSTGRES_USER
          value: houston_user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: houston-secrets
              key: postgres-password
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: houston-oil-airs
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  type: ClusterIP
EOF
    
    log_info "✓ PostgreSQL StatefulSet configuration created"
}

# 4. Monitoring Setup
check_monitoring() {
    log_info "Checking monitoring setup..."
    
    if kubectl get namespace monitoring &> /dev/null; then
        log_info "✓ Monitoring namespace exists"
        return 0
    else
        log_warn "No monitoring setup found - will install Prometheus/Grafana"
        return 1
    fi
}

install_monitoring() {
    log_info "Installing Prometheus and Grafana..."
    
    # Add prometheus helm repo
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    
    # Install kube-prometheus-stack
    helm install monitoring prometheus-community/kube-prometheus-stack \
        --namespace monitoring \
        --create-namespace \
        --set grafana.adminPassword=admin123 \
        --set prometheus.prometheusSpec.retention=30d
    
    log_info "✓ Monitoring stack installed"
}

# 5. Security Setup
check_security() {
    log_info "Checking security configurations..."
    
    if kubectl get networkpolicy -n houston-oil-airs &> /dev/null; then
        log_info "✓ Network policies exist"
    else
        log_warn "No network policies found - will create basic policies"
    fi
}

create_security_policies() {
    log_info "Creating network policies..."
    
    cat > deployment/network-policies.yml << 'EOF'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: houston-backend-policy
  namespace: houston-oil-airs
spec:
  podSelector:
    matchLabels:
      app: houston-backend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: houston-frontend
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3001
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: redis
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 6379
    - protocol: TCP
      port: 5432
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
EOF
    
    log_info "✓ Network policies created"
}

# Main execution function
run_check() {
    local check_name=$1
    local check_function=$2
    local install_function=$3
    
    echo "=================================================="
    log_info "Running check: $check_name"
    echo "=================================================="
    
    if $check_function; then
        log_info "✓ $check_name - PASSED"
    else
        log_warn "✗ $check_name - FAILED"
        if [ -n "$install_function" ]; then
            read -p "Do you want to install/fix this? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                $install_function
                log_info "✓ $check_name - FIXED"
            else
                log_warn "Skipping $check_name installation"
            fi
        fi
    fi
    
    echo
}

# Main execution
main() {
    log_info "Starting Houston Oil Airs Enterprise Hardening Checklist"
    echo "=========================================================="
    
    # Prerequisites
    run_check "Prerequisites" "check_prerequisites" ""
    
    # Kubernetes Production Hardening
    run_check "Ingress Controller" "check_ingress_controller" "install_ingress_controller"
    run_check "Resource Limits" "check_resource_limits" ""
    run_check "Secrets Management" "check_secrets_management" "create_secrets"
    
    # Infrastructure as Code
    run_check "Terraform Setup" "check_terraform" "create_terraform_setup"
    
    # Database
    run_check "Production Database" "check_database" "create_database_setup"
    
    # Monitoring
    run_check "Monitoring Stack" "check_monitoring" "install_monitoring"
    
    # Security
    run_check "Security Policies" "check_security" "create_security_policies"
    
    log_info "Enterprise hardening checklist completed!"
    log_info "Next steps:"
    echo "1. Review generated configurations in deployment/ directory"
    echo "2. Update secrets with actual values"
    echo "3. Apply configurations: kubectl apply -f deployment/"
    echo "4. Set up CI/CD pipeline"
    echo "5. Configure external monitoring and alerting"
}

# Run main function
main "$@"