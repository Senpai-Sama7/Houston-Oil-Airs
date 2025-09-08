# Houston Oil Airs Deployment Guide

This guide covers deployment options for Houston Oil Airs across different environments.

## 🚀 Quick Deployment

### One-Command Deployment
```bash
# Production deployment
./deploy.sh production

# Staging deployment  
./deploy.sh staging

# Development deployment
./deploy.sh dev
```

### Using Make
```bash
# Deploy to production (default)
make deploy

# Deploy to specific environment
make deploy ENV=staging
```

## 📋 Prerequisites

### Required Tools
- **kubectl** - Kubernetes command-line tool
- **Helm 3+** - Kubernetes package manager
- **Docker** - Container runtime
- **Kustomize** - Kubernetes configuration management

### Optional Tools
- **Terraform** - Infrastructure as Code (for cloud deployments)
- **Node.js 18+** - For local development
- **Java 11+** - For backend services

### Installation
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Kustomize
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
sudo mv kustomize /usr/local/bin/
```

## 🏗️ Infrastructure Setup

### Option 1: Using Terraform (Recommended)
```bash
cd terraform

# Initialize Terraform
terraform init

# Create environment-specific variables
cp terraform.tfvars.example environments/production.tfvars
# Edit environments/production.tfvars with your values

# Plan and apply
terraform plan -var-file="environments/production.tfvars"
terraform apply -var-file="environments/production.tfvars"
```

### Option 2: Manual Kubernetes Setup
```bash
# Create namespace
kubectl create namespace houston-oil-airs

# Apply security policies
kubectl apply -f deployment/security-policies.yml

# Create secrets
kubectl create secret generic houston-secrets \
  --from-literal=redis-password=your-redis-password \
  --from-literal=postgres-password=your-postgres-password \
  --from-literal=jwt-secret=your-jwt-secret \
  --namespace=houston-oil-airs
```

## 🎯 Environment-Specific Deployments

### Development Environment
```bash
# Quick setup for development
make dev-setup

# Deploy to development
./deploy.sh dev

# Or using Helm directly
helm install houston-oil-airs helm/houston-oil-airs \
  --namespace houston-oil-airs \
  --values helm/houston-oil-airs/values-dev.yaml
```

**Development Features**:
- Reduced resource requirements
- Debug logging enabled
- Hot reloading for frontend
- Local database setup

### Staging Environment
```bash
# Deploy to staging
./deploy.sh staging

# Verify deployment
kubectl get pods -n houston-oil-airs-staging
```

**Staging Features**:
- Production-like configuration
- Reduced replica counts
- Staging-specific domains
- Integration testing setup

### Production Environment
```bash
# Deploy to production
./deploy.sh production

# Monitor deployment
kubectl rollout status deployment/houston-oil-airs-backend -n houston-oil-airs
kubectl rollout status deployment/houston-oil-airs-frontend -n houston-oil-airs
```

**Production Features**:
- High availability (multiple replicas)
- Resource limits and requests
- SSL/TLS termination
- Monitoring and alerting
- Backup and disaster recovery

## 🔧 Configuration Management

### Helm Values
Edit `helm/houston-oil-airs/values.yaml` for base configuration:

```yaml
# Replica counts
frontend:
  replicaCount: 2
backend:
  replicaCount: 3

# Resource limits
backend:
  resources:
    requests:
      memory: "1Gi"
      cpu: "500m"
    limits:
      memory: "2Gi"
      cpu: "1000m"

# Database configuration
postgres:
  persistence:
    size: 20Gi
```

### Environment Overlays
Use Kustomize for environment-specific changes:

```yaml
# kustomize/overlays/production/replica-patch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: houston-oil-airs-backend
spec:
  replicas: 5
```

### Secrets Management
```bash
# Update secrets
kubectl create secret generic houston-secrets \
  --from-literal=redis-password=new-password \
  --namespace=houston-oil-airs \
  --dry-run=client -o yaml | kubectl apply -f -

# Or using Terraform
terraform apply -var="redis_password=new-password"
```

## 🔍 Verification and Testing

### Deployment Verification
```bash
# Check pod status
kubectl get pods -n houston-oil-airs

# Check services
kubectl get services -n houston-oil-airs

# Check ingress
kubectl get ingress -n houston-oil-airs

# Check logs
kubectl logs -f deployment/houston-oil-airs-backend -n houston-oil-airs
```

### Health Checks
```bash
# Port forward for local testing
kubectl port-forward svc/houston-oil-airs-backend 3001:3001 -n houston-oil-airs

# Test health endpoints
curl http://localhost:3001/health
curl http://localhost:3001/ready
curl http://localhost:3001/metrics
```

### Load Testing
```bash
# Install k6 for load testing
sudo apt install k6

# Run load tests
k6 run scripts/load-test.js
```

## 📊 Monitoring Setup

### Access Monitoring Dashboards
```bash
# Open monitoring dashboards
make monitoring

# Or manually port forward
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-prometheus 9090:9090
```

### Dashboard URLs
- **Grafana**: http://localhost:3000 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **AlertManager**: http://localhost:9093

### Custom Metrics
The application exposes metrics at `/metrics` endpoint:
- Request rates and response times
- Error rates and success rates
- Database connection pools
- Custom business metrics

## 🔄 Updates and Rollbacks

### Rolling Updates
```bash
# Update image tags
helm upgrade houston-oil-airs helm/houston-oil-airs \
  --set backend.image.tag=v1.1.0 \
  --set frontend.image.tag=v1.1.0

# Or using deployment script
./deploy.sh production
```

### Rollbacks
```bash
# Helm rollback
helm rollback houston-oil-airs -n houston-oil-airs

# Kubernetes rollback
kubectl rollout undo deployment/houston-oil-airs-backend -n houston-oil-airs
```

### Blue-Green Deployment
```bash
# Deploy to blue environment
./deploy.sh production-blue

# Test blue environment
# Switch traffic to blue
# Cleanup green environment
```

## 🔒 Security Considerations

### Network Security
- Network policies restrict pod-to-pod communication
- Ingress controller handles SSL termination
- Service mesh for advanced traffic management

### Container Security
- Images scanned for vulnerabilities
- Non-root containers
- Read-only root filesystems
- Security contexts applied

### Secrets Management
- Kubernetes secrets for sensitive data
- External secret management integration
- Regular secret rotation

## 🚨 Troubleshooting

### Common Issues

1. **ImagePullBackOff**
   ```bash
   kubectl describe pod <pod-name> -n houston-oil-airs
   # Check image names and registry access
   ```

2. **CrashLoopBackOff**
   ```bash
   kubectl logs <pod-name> -n houston-oil-airs
   # Check application logs and health checks
   ```

3. **Service Unavailable**
   ```bash
   kubectl get endpoints -n houston-oil-airs
   # Verify service selectors and pod labels
   ```

4. **Ingress Issues**
   ```bash
   kubectl describe ingress houston-oil-airs-ingress -n houston-oil-airs
   # Check ingress controller and DNS configuration
   ```

### Debug Commands
```bash
# Get detailed pod information
kubectl describe pod <pod-name> -n houston-oil-airs

# Execute commands in pod
kubectl exec -it <pod-name> -n houston-oil-airs -- /bin/sh

# Check resource usage
kubectl top pods -n houston-oil-airs
kubectl top nodes

# View events
kubectl get events -n houston-oil-airs --sort-by='.lastTimestamp'
```

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale deployments
kubectl scale deployment houston-oil-airs-backend --replicas=5 -n houston-oil-airs

# Or update Helm values
helm upgrade houston-oil-airs helm/houston-oil-airs \
  --set backend.replicaCount=5
```

### Vertical Scaling
```bash
# Update resource limits
helm upgrade houston-oil-airs helm/houston-oil-airs \
  --set backend.resources.limits.memory=4Gi \
  --set backend.resources.limits.cpu=2000m
```

### Auto Scaling
```yaml
# HorizontalPodAutoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: houston-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: houston-oil-airs-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 🔄 CI/CD Integration

### GitHub Actions
The project includes automated CI/CD pipeline:
- Security scanning with Trivy
- Multi-environment testing
- Automated deployments
- Container registry integration

### Manual Deployment
```bash
# Build and push images
make build
docker tag houston-oil-airs/frontend:latest ghcr.io/senpai-sama7/houston-oil-airs/frontend:v1.0.0
docker push ghcr.io/senpai-sama7/houston-oil-airs/frontend:v1.0.0

# Deploy with new images
./deploy.sh production
```

## 📞 Support

For deployment issues:
1. Check this deployment guide
2. Review troubleshooting section
3. Check application logs
4. Open GitHub issue
5. Contact support@houstonoilairs.org

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Terraform Documentation](https://terraform.io/docs/)
- [Project FAQ](FAQ.md)
- [Contributing Guide](CONTRIBUTING.md)