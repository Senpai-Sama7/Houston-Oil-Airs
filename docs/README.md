# Houston Oil Airs Documentation

Welcome to the Houston Oil Airs documentation hub. This directory contains comprehensive guides and references for deploying, developing, and maintaining the AI research platform and Houston urban intelligence system.

## 📚 Documentation Index

### Getting Started
- [**README.md**](../README.md) - Project overview and quick start
- [**FAQ.md**](../FAQ.md) - Frequently asked questions
- [**DEPLOYMENT.md**](../DEPLOYMENT.md) - Complete deployment guide

### Houston Intelligence
- [**Re-Drawing Houston Playbook**](Re-Drawing_Houston.txt) - Environmental justice advocacy guide
- [**Houston Intelligence Analysis**](Taco-Truck_Can_Save_Houston.txt) - Full-spectrum urban systems analysis
- [**Research Ethics Framework**](RESEARCH_ETHICS_FRAMEWORK.md) - Ethical guidelines for urban intelligence
- [**Strategic Plan**](STRATEGIC_PLAN.md) - Long-term vision and roadmap

### Development
- [**CONTRIBUTING.md**](../CONTRIBUTING.md) - Contribution guidelines
- [**REFACTORING_SUMMARY.md**](../REFACTORING_SUMMARY.md) - Recent refactoring changes
- [**CHANGELOG.md**](../CHANGELOG.md) - Version history and changes

### Enterprise Implementation
- [**ENTERPRISE_IMPLEMENTATION_SUMMARY.md**](../ENTERPRISE_IMPLEMENTATION_SUMMARY.md) - Enterprise features overview

### Infrastructure
- [**Helm Chart Documentation**](../helm/houston-oil-airs/README.md) - Kubernetes deployment with Helm
- [**Terraform Documentation**](../terraform/README.md) - Infrastructure as Code

### Configuration
- [**Kustomize Overlays**](../kustomize/) - Environment-specific configurations
- [**Security Policies**](../deployment/security-policies.yml) - Network and security configurations
- [**Monitoring Setup**](../deployment/monitoring.yml) - Observability configuration

## 🚀 Quick Navigation

### For Developers
1. [Development Setup](../CONTRIBUTING.md#development-workflow)
2. [Local Testing](../FAQ.md#development)
3. [Code Standards](../CONTRIBUTING.md#coding-standards)

### For DevOps Engineers
1. [Deployment Guide](../DEPLOYMENT.md)
2. [Infrastructure Setup](../terraform/README.md)
3. [Monitoring Configuration](../DEPLOYMENT.md#monitoring-setup)

### For System Administrators
1. [Security Configuration](../DEPLOYMENT.md#security-considerations)
2. [Troubleshooting Guide](../FAQ.md#troubleshooting)
3. [Scaling Guide](../DEPLOYMENT.md#scaling)

## 🏗️ Architecture Overview

```
Houston Oil Airs Platform
├── Frontend (React/Vite + Glassmorphism UI)
│   ├── 3D Visualization Engine (WebGL/Three.js)
│   ├── Real-time Analytics Dashboard
│   ├── Interactive Network Analysis
│   ├── Houston Urban Intelligence Interface
│   └── Parallax Scroll Effects & Animations
├── Backend Services
│   ├── Node.js API Server
│   ├── Java Microservices
│   └── C++ Processing Engine
├── Houston Intelligence Layer
│   ├── Environmental Sensor Network (487 monitors)
│   ├── Network Graph Analysis (15.4M nodes, 71.8M edges)
│   ├── Community Trust Metrics
│   └── Policy Impact Analysis
├── Data Layer
│   ├── PostgreSQL Database
│   ├── Redis Cache
│   └── Environmental Data Streams
└── Infrastructure
    ├── Kubernetes Orchestration
    ├── Helm Package Management
    ├── Terraform Infrastructure
    └── Monitoring Stack
```

## 📋 Common Tasks

### Deployment
```bash
# Quick deployment
make deploy ENV=production

# Validate configuration
make validate

# Monitor deployment
make monitoring
```

### Development
```bash
# Setup development environment
make dev-setup

# Run tests
make test

# Build containers
make build
```

### Maintenance
```bash
# Update dependencies
make update

# Clean up resources
make clean

# Generate project graph
make project-graph
```

## 🔧 Configuration Files

| File | Purpose | Documentation |
|------|---------|---------------|
| `helm/houston-oil-airs/values.yaml` | Helm chart configuration | [Helm README](../helm/houston-oil-airs/README.md) |
| `terraform/variables.tf` | Infrastructure variables | [Terraform README](../terraform/README.md) |
| `kustomize/overlays/` | Environment-specific configs | [Deployment Guide](../DEPLOYMENT.md) |
| `deployment/*.yml` | Legacy Kubernetes manifests | [Migration Guide](../CHANGELOG.md) |

## 🔍 Troubleshooting

### Common Issues
- [Deployment Problems](../FAQ.md#troubleshooting)
- [Configuration Errors](../DEPLOYMENT.md#troubleshooting)
- [Performance Issues](../FAQ.md#performance)

### Debug Commands
```bash
# Check pod status
kubectl get pods -n houston-oil-airs

# View logs
kubectl logs -f deployment/houston-backend -n houston-oil-airs

# Validate configurations
make validate

# Test connectivity
kubectl port-forward svc/houston-backend 3001:3001
```

## 📊 Monitoring and Observability

### Dashboards
- **Grafana**: Application metrics and dashboards
- **Prometheus**: Metrics collection and alerting
- **Kubernetes Dashboard**: Cluster overview

### Access
```bash
# Open monitoring dashboards
make monitoring

# Direct access
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
```

### Key Metrics
- Request rates and response times
- Error rates and success rates
- Resource utilization (CPU, memory)
- Database performance metrics

## 🔒 Security

### Security Features
- Network policies for pod isolation
- RBAC for access control
- Pod security standards
- Container vulnerability scanning
- SSL/TLS termination

### Security Configuration
- [Security Policies](../deployment/security-policies.yml)
- [Network Policies](../DEPLOYMENT.md#security-considerations)
- [Secrets Management](../terraform/README.md#security)

## 🌍 Multi-Environment Support

### Environments
- **Development**: Local development and testing
- **Staging**: Pre-production testing
- **Production**: Live production environment

### Configuration
Each environment has specific configurations in:
- `kustomize/overlays/{environment}/`
- `terraform/environments/{environment}.tfvars`
- `helm/houston-oil-airs/values-{environment}.yaml`

## 📈 Performance and Scaling

### Scaling Options
- Horizontal pod autoscaling
- Vertical resource scaling
- Database read replicas
- CDN for static assets

### Performance Monitoring
- Application performance metrics
- Database query optimization
- Resource utilization tracking
- Load testing results

## 🤝 Contributing

### How to Contribute
1. Read the [Contributing Guide](../CONTRIBUTING.md)
2. Check existing [Issues](https://github.com/Senpai-Sama7/Houston-Oil-Airs/issues)
3. Join [Discussions](https://github.com/Senpai-Sama7/Houston-Oil-Airs/discussions)

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

## 📞 Support

### Getting Help
- **Documentation**: Check this documentation first
- **FAQ**: Review [frequently asked questions](../FAQ.md)
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share ideas
- **Email**: support@houstonoilairs.org

### Community
- [GitHub Repository](https://github.com/Senpai-Sama7/Houston-Oil-Airs)
- [Project Website](https://houstonoilairs.org)
- [Documentation Site](https://docs.houstonoilairs.org)

---

## 📝 Documentation Standards

When contributing to documentation:
1. Use clear, concise language
2. Include code examples where helpful
3. Update relevant sections when making changes
4. Follow the existing structure and formatting
5. Test all commands and examples

## 🔄 Keeping Documentation Updated

This documentation is actively maintained. If you find outdated information:
1. Open an issue describing the problem
2. Submit a pull request with corrections
3. Contact the maintainers

Last updated: 2024-01-15