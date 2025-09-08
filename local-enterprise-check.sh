#!/bin/bash

# Houston Oil Airs - Local Enterprise Hardening Check
# Tests configurations without requiring a live Kubernetes cluster

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check 1: Kubernetes Configuration Validation
check_k8s_config() {
    log_info "Checking Kubernetes configuration..."
    
    if [ -f "deployment/kubernetes.yml" ]; then
        # Check for resource limits
        if grep -q "resources:" deployment/kubernetes.yml && grep -q "limits:" deployment/kubernetes.yml; then
            log_info "✓ Resource limits defined"
        else
            log_error "✗ Missing resource limits"
        fi
        
        # Check for health checks
        if grep -q "livenessProbe:" deployment/kubernetes.yml && grep -q "readinessProbe:" deployment/kubernetes.yml; then
            log_info "✓ Health checks configured"
        else
            log_error "✗ Missing health checks"
        fi
        
        # Check for StatefulSet usage
        if grep -q "kind: StatefulSet" deployment/kubernetes.yml; then
            log_info "✓ StatefulSet used for stateful services"
        else
            log_warn "! Consider using StatefulSet for databases"
        fi
    else
        log_error "✗ kubernetes.yml not found"
    fi
}

# Check 2: Security Configuration
check_security_config() {
    log_info "Checking security configurations..."
    
    if [ -f "deployment/security-policies.yml" ]; then
        log_info "✓ Security policies file exists"
        
        if grep -q "NetworkPolicy" deployment/security-policies.yml; then
            log_info "✓ Network policies defined"
        fi
        
        if grep -q "ServiceAccount" deployment/security-policies.yml; then
            log_info "✓ Service accounts configured"
        fi
    else
        log_warn "! Security policies file missing"
    fi
}

# Check 3: Monitoring Setup
check_monitoring_config() {
    log_info "Checking monitoring configuration..."
    
    if [ -f "deployment/monitoring.yml" ]; then
        log_info "✓ Monitoring configuration exists"
        
        if grep -q "ServiceMonitor" deployment/monitoring.yml; then
            log_info "✓ Prometheus ServiceMonitor configured"
        fi
        
        if grep -q "PrometheusRule" deployment/monitoring.yml; then
            log_info "✓ Alerting rules defined"
        fi
    else
        log_warn "! Monitoring configuration missing"
    fi
}

# Check 4: Infrastructure as Code
check_iac_setup() {
    log_info "Checking Infrastructure as Code setup..."
    
    if [ -d "terraform" ]; then
        log_info "✓ Terraform directory exists"
        
        if [ -f "terraform/main.tf" ]; then
            log_info "✓ Main Terraform configuration found"
        fi
        
        if [ -f "terraform/variables.tf" ]; then
            log_info "✓ Variables configuration found"
        fi
    else
        log_warn "! Terraform setup missing"
    fi
}

# Check 5: CI/CD Pipeline
check_cicd_pipeline() {
    log_info "Checking CI/CD pipeline..."
    
    if [ -f ".github/workflows/enterprise-ci-cd.yml" ]; then
        log_info "✓ Enterprise CI/CD pipeline exists"
        
        if grep -q "security-scan" .github/workflows/enterprise-ci-cd.yml; then
            log_info "✓ Security scanning configured"
        fi
        
        if grep -q "deploy-staging" .github/workflows/enterprise-ci-cd.yml; then
            log_info "✓ Staging deployment configured"
        fi
        
        if grep -q "deploy-production" .github/workflows/enterprise-ci-cd.yml; then
            log_info "✓ Production deployment configured"
        fi
    else
        log_warn "! Enterprise CI/CD pipeline missing"
    fi
}

# Check 6: API Gateway Configuration
check_api_gateway() {
    log_info "Checking API Gateway configuration..."
    
    if [ -f "deployment/api-gateway.yml" ]; then
        log_info "✓ API Gateway configuration exists"
        
        if grep -q "rate-limiting" deployment/api-gateway.yml; then
            log_info "✓ Rate limiting configured"
        fi
        
        if grep -q "cors" deployment/api-gateway.yml; then
            log_info "✓ CORS policies configured"
        fi
    else
        log_warn "! API Gateway configuration missing"
    fi
}

# Check 7: Database Configuration
check_database_config() {
    log_info "Checking database configuration..."
    
    if [ -f "deployment/postgres.yml" ]; then
        log_info "✓ PostgreSQL configuration exists"
        
        if grep -q "StatefulSet" deployment/postgres.yml; then
            log_info "✓ Database uses StatefulSet"
        fi
        
        if grep -q "volumeClaimTemplates" deployment/postgres.yml; then
            log_info "✓ Persistent storage configured"
        fi
    else
        log_warn "! Database configuration missing"
    fi
}

# Test Docker builds
test_docker_builds() {
    log_info "Testing Docker builds..."
    
    if [ -f "frontend/Dockerfile" ]; then
        log_info "✓ Frontend Dockerfile exists"
    else
        log_warn "! Frontend Dockerfile missing"
    fi
    
    if [ -f "backend/Dockerfile" ]; then
        log_info "✓ Backend Dockerfile exists"
    else
        log_warn "! Backend Dockerfile missing"
    fi
}

# Validate YAML syntax
validate_yaml_syntax() {
    log_info "Validating YAML syntax..."
    
    if [ -f "validate-yaml.py" ]; then
        python3 validate-yaml.py | while read line; do
            if [[ $line == ✓* ]]; then
                log_info "$line"
            else
                log_error "$line"
            fi
        done
    else
        log_warn "YAML validator not found, skipping syntax check"
    fi
}

# Main execution
main() {
    log_info "Starting Houston Oil Airs Enterprise Configuration Check"
    echo "============================================================"
    
    check_k8s_config
    echo
    
    check_security_config
    echo
    
    check_monitoring_config
    echo
    
    check_iac_setup
    echo
    
    check_cicd_pipeline
    echo
    
    check_api_gateway
    echo
    
    check_database_config
    echo
    
    test_docker_builds
    echo
    
    validate_yaml_syntax
    echo
    
    log_info "Enterprise configuration check completed!"
    echo
    log_info "Summary of created enterprise configurations:"
    echo "- deployment/security-policies.yml - Network policies and RBAC"
    echo "- deployment/monitoring.yml - Prometheus metrics and alerts"
    echo "- deployment/api-gateway.yml - Kong API Gateway setup"
    echo "- terraform/ - Infrastructure as Code setup"
    echo "- .github/workflows/enterprise-ci-cd.yml - Enhanced CI/CD pipeline"
    echo
    log_info "Next steps:"
    echo "1. Install kubectl and connect to your Kubernetes cluster"
    echo "2. Update secrets in terraform/variables.tf with real values"
    echo "3. Run: terraform init && terraform plan && terraform apply"
    echo "4. Apply configurations: kubectl apply -f deployment/"
    echo "5. Set up monitoring dashboards and alerts"
}

main "$@"