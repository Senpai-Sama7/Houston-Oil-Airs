#!/bin/bash

set -e

ENVIRONMENT=${1:-production}
NAMESPACE="houston-oil-airs"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    command -v kubectl >/dev/null 2>&1 || { log_error "kubectl required but not installed"; exit 1; }
    command -v helm >/dev/null 2>&1 || { log_error "helm required but not installed"; exit 1; }
    command -v kustomize >/dev/null 2>&1 || { log_error "kustomize required but not installed"; exit 1; }
    
    log_info "✓ Prerequisites check passed"
}

deploy_infrastructure() {
    log_info "Deploying infrastructure with Terraform..."
    
    if [ -d "terraform" ]; then
        cd terraform
        terraform init -upgrade
        terraform plan -var-file="environments/${ENVIRONMENT}.tfvars"
        terraform apply -var-file="environments/${ENVIRONMENT}.tfvars" -auto-approve
        cd ..
        log_info "✓ Infrastructure deployed"
    else
        log_warn "Terraform directory not found, skipping infrastructure deployment"
    fi
}

deploy_application() {
    log_info "Deploying application with Helm and Kustomize..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy using Kustomize
    if [ -d "kustomize/overlays/${ENVIRONMENT}" ]; then
        kustomize build kustomize/overlays/${ENVIRONMENT} | kubectl apply -f -
        log_info "✓ Application deployed using Kustomize overlay: ${ENVIRONMENT}"
    else
        # Fallback to Helm
        helm upgrade --install houston-oil-airs helm/houston-oil-airs \
            --namespace ${NAMESPACE} \
            --values helm/houston-oil-airs/values-${ENVIRONMENT}.yaml \
            --wait
        log_info "✓ Application deployed using Helm"
    fi
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=houston-oil-airs -n ${NAMESPACE} --timeout=300s
    
    log_info "✓ Deployment verification completed"
    
    # Show status
    kubectl get pods,services,ingress -n ${NAMESPACE}
}

main() {
    log_info "Starting Houston Oil Airs deployment to ${ENVIRONMENT}"
    echo "============================================================"
    
    check_prerequisites
    deploy_infrastructure
    deploy_application
    verify_deployment
    
    log_info "Deployment completed successfully!"
    log_info "Access your application at: https://houstonoilairs.org"
}

case "${1:-}" in
    "dev"|"staging"|"production")
        main
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [environment]"
        echo "Environments: dev, staging, production (default: production)"
        ;;
    *)
        log_warn "Unknown environment: ${1:-}. Using production."
        main
        ;;
esac