# Frequently Asked Questions (FAQ)

## 🚀 Getting Started

### Q: How do I deploy Houston Oil Airs?
**A:** Use the unified deployment script:
```bash
# Production deployment
./deploy.sh production

# Or using Make
make deploy ENV=production
```

### Q: What are the system requirements?
**A:** 
- **Development**: Node.js 18+, Docker, 8GB RAM
- **Production**: Kubernetes cluster, 16GB+ RAM, 4+ CPU cores
- **Tools**: kubectl, Helm 3+, Terraform (optional)

### Q: How do I set up local development?
**A:**
```bash
make dev-setup
cd frontend && npm run dev
cd backend && ./start.sh
```

## 🏗️ Architecture

### Q: What technologies does Houston Oil Airs use?
**A:**
- **Frontend**: React, Vite.js, WebGL
- **Backend**: Node.js, Java, C++
- **Database**: PostgreSQL, Redis
- **Infrastructure**: Kubernetes, Helm, Terraform
- **Monitoring**: Prometheus, Grafana

### Q: How is the project structured?
**A:**
```
Houston-Oil-Airs/
├── helm/houston-oil-airs/    # Kubernetes deployment
├── kustomize/               # Environment configs
├── terraform/               # Infrastructure as Code
├── frontend/                # React application
├── backend/                 # Multi-service backend
└── deployment/              # Legacy configurations
```

### Q: What's the difference between Helm and Kustomize?
**A:**
- **Helm**: Package manager for Kubernetes, handles templating
- **Kustomize**: Manages environment-specific configurations
- **Together**: Helm provides base templates, Kustomize handles environment differences

## 🔧 Configuration

### Q: How do I configure different environments?
**A:** Use Kustomize overlays:
```bash
./deploy.sh dev        # Development
./deploy.sh staging    # Staging  
./deploy.sh production # Production
```

### Q: Where do I put secrets?
**A:** 
- **Development**: `helm/houston-oil-airs/values.yaml`
- **Production**: `terraform/variables.tf` or Kubernetes secrets
- **Never commit secrets to Git**

### Q: How do I customize resource limits?
**A:** Edit `helm/houston-oil-airs/values.yaml`:
```yaml
backend:
  resources:
    requests:
      memory: "1Gi"
      cpu: "500m"
    limits:
      memory: "2Gi" 
      cpu: "1000m"
```

## 🚢 Deployment

### Q: How do I deploy to a specific environment?
**A:**
```bash
# Using deployment script
./deploy.sh staging

# Using Make with environment variable
make deploy ENV=staging
```

### Q: What if deployment fails?
**A:**
1. Check prerequisites: `kubectl`, `helm`, `kustomize`
2. Validate configurations: `make validate`
3. Check cluster connectivity: `kubectl cluster-info`
4. Review logs: `kubectl logs -n houston-oil-airs`

### Q: How do I rollback a deployment?
**A:**
```bash
# Helm rollback
helm rollback houston-oil-airs -n houston-oil-airs

# Or redeploy previous version
./deploy.sh production
```

## 📊 Monitoring

### Q: How do I access monitoring dashboards?
**A:**
```bash
make monitoring
# Grafana: http://localhost:3000 (admin/admin123)
# Prometheus: http://localhost:9090
```

### Q: What metrics are available?
**A:**
- Request rates and response times
- Error rates and success rates
- Resource utilization (CPU, memory)
- Database performance
- Custom application metrics

### Q: How do I set up alerts?
**A:** Alerts are configured in `deployment/monitoring.yml`:
```yaml
- alert: HighErrorRate
  expr: rate(app_route_errors_total[5m]) > 0.1
  for: 5m
```

## 🔒 Security

### Q: What security features are included?
**A:**
- Network policies for pod isolation
- RBAC for access control
- Pod security standards
- Container vulnerability scanning
- SSL/TLS termination

### Q: How do I update secrets?
**A:**
```bash
# Update Kubernetes secret
kubectl create secret generic houston-secrets \
  --from-literal=redis-password=newpassword \
  --namespace=houston-oil-airs \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Q: Are there any security best practices?
**A:**
- Use strong passwords and rotate regularly
- Keep dependencies updated
- Scan images for vulnerabilities
- Follow principle of least privilege
- Enable audit logging

## 🧪 Testing

### Q: How do I run tests?
**A:**
```bash
make test           # All tests
cd frontend && npm test    # Frontend only
cd backend && mvn test     # Backend only
```

### Q: What types of tests are included?
**A:**
- Unit tests (Jest, JUnit)
- Integration tests
- E2E tests (Playwright)
- Configuration validation
- Security scanning

### Q: How do I add new tests?
**A:**
- **Frontend**: Add `.test.js` files in `frontend/src/`
- **Backend**: Add test files following existing patterns
- **E2E**: Add tests in `frontend/e2e/`

## 🛠️ Development

### Q: How do I contribute to the project?
**A:** See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines:
1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

### Q: What's the development workflow?
**A:**
```bash
make dev-setup      # Set up environment
make validate       # Validate changes
make test          # Run tests
make build         # Build images
```

### Q: How do I debug issues?
**A:**
- Check application logs: `kubectl logs -f deployment/houston-backend`
- Use port forwarding: `kubectl port-forward svc/houston-backend 3001:3001`
- Access monitoring dashboards: `make monitoring`
- Check resource usage: `kubectl top pods`

## 🔄 Updates and Maintenance

### Q: How do I update dependencies?
**A:**
```bash
# Frontend dependencies
cd frontend && npm update

# Backend dependencies  
cd backend/node-server && npm update
cd backend/java-services && mvn versions:use-latest-versions

# Infrastructure
helm repo update
terraform init -upgrade
```

### Q: How do I backup data?
**A:**
- Database backups are handled by PostgreSQL StatefulSet
- Use `kubectl` to backup configurations
- Store Terraform state in remote backend
- Regular Git commits for code

### Q: What's the upgrade process?
**A:**
1. Test in development environment
2. Deploy to staging
3. Validate functionality
4. Deploy to production
5. Monitor for issues

## 🌐 Networking

### Q: How do I configure custom domains?
**A:** Update `helm/houston-oil-airs/values.yaml`:
```yaml
ingress:
  hosts:
    - host: your-domain.com
      paths:
        - path: /
          service: frontend
```

### Q: How do I enable HTTPS?
**A:** HTTPS is enabled by default with cert-manager:
```yaml
ingress:
  tls:
    - secretName: houston-tls
      hosts:
        - your-domain.com
```

## 📈 Performance

### Q: How do I optimize performance?
**A:**
- Scale replicas: Edit `values.yaml` replica counts
- Adjust resource limits based on usage
- Use Redis caching effectively
- Optimize database queries
- Enable CDN for static assets

### Q: How do I scale the application?
**A:**
```bash
# Scale using kubectl
kubectl scale deployment houston-backend --replicas=5

# Or update Helm values and redeploy
helm upgrade houston-oil-airs helm/houston-oil-airs
```

## 🆘 Troubleshooting

### Q: Common deployment issues?
**A:**
- **ImagePullBackOff**: Check image names and registry access
- **CrashLoopBackOff**: Check application logs and health checks
- **Pending Pods**: Check resource availability and node capacity
- **Service Unavailable**: Verify service and ingress configuration

### Q: Where can I get help?
**A:**
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community help
- **Documentation**: Check existing docs and guides
- **Email**: support@houstonoilairs.org

### Q: How do I report bugs?
**A:**
1. Check existing issues first
2. Use the bug report template
3. Include steps to reproduce
4. Provide environment details
5. Include relevant logs and screenshots

---

## 📞 Still Need Help?

If you can't find the answer to your question:

1. **Search** existing GitHub issues and discussions
2. **Check** the documentation in the `docs/` directory
3. **Ask** in GitHub Discussions for community help
4. **Report** bugs or request features via GitHub Issues
5. **Contact** us at support@houstonoilairs.org

We're here to help! 🚀