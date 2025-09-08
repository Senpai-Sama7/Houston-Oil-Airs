# Houston Oil Airs Terraform Infrastructure

This directory contains Terraform configurations for deploying Houston Oil Airs infrastructure.

## Overview

The infrastructure is organized into reusable modules:

```
terraform/
├── main.tf                    # Main configuration
├── variables.tf               # Input variables
├── outputs.tf                 # Output values
├── terraform.tfvars.example   # Example variables
└── modules/
    ├── kubernetes-cluster/    # Kubernetes resources
    ├── monitoring/           # Monitoring stack
    └── ingress/             # Ingress controller
```

## Prerequisites

- Terraform >= 1.0
- kubectl configured with cluster access
- Helm 3.0+

## Quick Start

1. **Initialize Terraform**:
   ```bash
   terraform init
   ```

2. **Create variables file**:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Plan deployment**:
   ```bash
   terraform plan
   ```

4. **Apply configuration**:
   ```bash
   terraform apply
   ```

## Configuration

### Required Variables

| Variable | Description | Type | Required |
|----------|-------------|------|----------|
| `namespace` | Kubernetes namespace | `string` | No |
| `app_name` | Application name | `string` | No |
| `redis_password` | Redis password | `string` | Yes |
| `postgres_password` | PostgreSQL password | `string` | Yes |
| `jwt_secret` | JWT secret key | `string` | Yes |
| `grafana_admin_password` | Grafana admin password | `string` | Yes |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `environment` | Environment name | `production` |
| `replicas.frontend` | Frontend replicas | `2` |
| `replicas.backend` | Backend replicas | `3` |

## Environment-Specific Configurations

### Development
```bash
terraform apply -var-file="environments/dev.tfvars"
```

### Staging
```bash
terraform apply -var-file="environments/staging.tfvars"
```

### Production
```bash
terraform apply -var-file="environments/production.tfvars"
```

## Modules

### kubernetes-cluster

Manages core Kubernetes resources:
- Namespace creation
- Secrets management
- Service accounts
- RBAC configuration

**Usage**:
```hcl
module "kubernetes_cluster" {
  source = "./modules/kubernetes-cluster"
  
  namespace         = var.namespace
  app_name         = var.app_name
  redis_password   = var.redis_password
  postgres_password = var.postgres_password
  jwt_secret       = var.jwt_secret
}
```

### monitoring

Deploys monitoring stack:
- Prometheus
- Grafana
- AlertManager
- ServiceMonitors

**Usage**:
```hcl
module "monitoring" {
  source = "./modules/monitoring"
  
  namespace = var.namespace
  grafana_admin_password = var.grafana_admin_password
}
```

### ingress

Manages ingress controller:
- Nginx Ingress Controller
- Cert Manager
- SSL certificates

**Usage**:
```hcl
module "ingress" {
  source = "./modules/ingress"
  
  namespace = var.namespace
}
```

## State Management

### Local State (Development)
For development, Terraform state is stored locally.

### Remote State (Production)
For production, configure remote state backend:

```hcl
terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "houston-oil-airs/terraform.tfstate"
    region = "us-west-2"
  }
}
```

## Security

### Secrets Management
- Never commit secrets to version control
- Use environment variables or secure vaults
- Rotate secrets regularly

### Example secrets setup:
```bash
export TF_VAR_redis_password="secure-redis-password"
export TF_VAR_postgres_password="secure-postgres-password"
export TF_VAR_jwt_secret="secure-jwt-secret"
export TF_VAR_grafana_admin_password="secure-grafana-password"
```

## Outputs

After successful deployment, Terraform provides:

| Output | Description |
|--------|-------------|
| `namespace` | Kubernetes namespace |
| `ingress_controller_status` | Ingress controller status |
| `monitoring_stack_status` | Monitoring stack status |
| `cert_manager_status` | Cert Manager status |

## Troubleshooting

### Common Issues

1. **Provider authentication**:
   ```bash
   kubectl config current-context
   ```

2. **Helm repository issues**:
   ```bash
   helm repo update
   ```

3. **Resource conflicts**:
   ```bash
   terraform refresh
   terraform plan
   ```

### Debugging

Enable debug logging:
```bash
export TF_LOG=DEBUG
terraform apply
```

### State Issues

If state becomes corrupted:
```bash
terraform refresh
terraform import <resource> <id>
```

## Maintenance

### Updates

1. **Update providers**:
   ```bash
   terraform init -upgrade
   ```

2. **Update modules**:
   ```bash
   terraform get -update
   ```

3. **Plan and apply updates**:
   ```bash
   terraform plan
   terraform apply
   ```

### Cleanup

To destroy infrastructure:
```bash
terraform destroy
```

**Warning**: This will delete all resources. Use with caution in production.

## Best Practices

1. **Version Control**: Always version control your Terraform code
2. **State Backup**: Backup Terraform state regularly
3. **Environment Separation**: Use separate state files for different environments
4. **Resource Tagging**: Tag all resources for better management
5. **Security**: Use secure methods for secret management
6. **Testing**: Test infrastructure changes in development first

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Terraform

on:
  push:
    branches: [ main ]
    paths: [ 'terraform/**' ]

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v2
      with:
        terraform_version: 1.5.0
    
    - name: Terraform Init
      run: terraform init
      working-directory: terraform
    
    - name: Terraform Plan
      run: terraform plan
      working-directory: terraform
      env:
        TF_VAR_redis_password: ${{ secrets.REDIS_PASSWORD }}
        TF_VAR_postgres_password: ${{ secrets.POSTGRES_PASSWORD }}
        TF_VAR_jwt_secret: ${{ secrets.JWT_SECRET }}
        TF_VAR_grafana_admin_password: ${{ secrets.GRAFANA_PASSWORD }}
    
    - name: Terraform Apply
      if: github.ref == 'refs/heads/main'
      run: terraform apply -auto-approve
      working-directory: terraform
```

## Support

For issues with Terraform configuration:
1. Check the [Terraform documentation](https://terraform.io/docs)
2. Review provider documentation
3. Open an issue in the project repository
4. Contact support@houstonoilairs.org