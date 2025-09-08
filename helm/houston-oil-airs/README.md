# Houston Oil Airs Helm Chart

This Helm chart deploys Houston Oil Airs on a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- PV provisioner support in the underlying infrastructure

## Installing the Chart

```bash
# Add the repository (if using a Helm repository)
helm repo add houston-oil-airs https://charts.houstonoilairs.org
helm repo update

# Install the chart
helm install houston-oil-airs houston-oil-airs/houston-oil-airs

# Or install from local directory
helm install houston-oil-airs ./helm/houston-oil-airs
```

## Uninstalling the Chart

```bash
helm uninstall houston-oil-airs
```

## Configuration

The following table lists the configurable parameters and their default values.

### Global Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.namespace` | Kubernetes namespace | `houston-oil-airs` |
| `global.imageRegistry` | Global Docker image registry | `ghcr.io` |
| `global.imageRepository` | Global Docker image repository | `senpai-sama7/houston-oil-airs` |

### Application Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `app.name` | Application name | `houston-oil-airs` |
| `app.version` | Application version | `1.0.0` |

### Frontend Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `frontend.enabled` | Enable frontend deployment | `true` |
| `frontend.replicaCount` | Number of frontend replicas | `2` |
| `frontend.image.repository` | Frontend image repository | `frontend` |
| `frontend.image.tag` | Frontend image tag | `latest` |
| `frontend.resources.requests.memory` | Frontend memory request | `256Mi` |
| `frontend.resources.requests.cpu` | Frontend CPU request | `100m` |
| `frontend.resources.limits.memory` | Frontend memory limit | `512Mi` |
| `frontend.resources.limits.cpu` | Frontend CPU limit | `200m` |

### Backend Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `backend.enabled` | Enable backend deployment | `true` |
| `backend.replicaCount` | Number of backend replicas | `3` |
| `backend.image.repository` | Backend image repository | `backend` |
| `backend.image.tag` | Backend image tag | `latest` |
| `backend.resources.requests.memory` | Backend memory request | `1Gi` |
| `backend.resources.requests.cpu` | Backend CPU request | `500m` |
| `backend.resources.limits.memory` | Backend memory limit | `2Gi` |
| `backend.resources.limits.cpu` | Backend CPU limit | `1000m` |

### Database Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `postgres.enabled` | Enable PostgreSQL | `true` |
| `postgres.persistence.enabled` | Enable persistent storage | `true` |
| `postgres.persistence.size` | Storage size | `20Gi` |
| `redis.enabled` | Enable Redis | `true` |
| `redis.persistence.enabled` | Enable Redis persistence | `true` |
| `redis.persistence.size` | Redis storage size | `10Gi` |

### Ingress Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ingress.enabled` | Enable ingress | `true` |
| `ingress.className` | Ingress class name | `nginx` |
| `ingress.hosts[0].host` | Hostname | `houstonoilairs.org` |

### Security Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `security.networkPolicies.enabled` | Enable network policies | `true` |
| `security.podSecurityStandards.enabled` | Enable pod security standards | `true` |
| `security.serviceAccount.create` | Create service account | `true` |

## Examples

### Basic Installation

```bash
helm install houston-oil-airs ./helm/houston-oil-airs
```

### Custom Values

```bash
helm install houston-oil-airs ./helm/houston-oil-airs \
  --set frontend.replicaCount=3 \
  --set backend.replicaCount=5 \
  --set ingress.hosts[0].host=my-domain.com
```

### Using Values File

Create a `my-values.yaml` file:

```yaml
frontend:
  replicaCount: 3
  resources:
    requests:
      memory: "512Mi"
      cpu: "200m"

backend:
  replicaCount: 5
  resources:
    requests:
      memory: "2Gi"
      cpu: "1000m"

ingress:
  hosts:
    - host: my-domain.com
      paths:
        - path: /
          service: frontend
          port: 80
```

Install with custom values:

```bash
helm install houston-oil-airs ./helm/houston-oil-airs -f my-values.yaml
```

## Upgrading

```bash
helm upgrade houston-oil-airs ./helm/houston-oil-airs
```

## Monitoring

The chart includes ServiceMonitor resources for Prometheus integration:

```bash
# Check if monitoring is enabled
helm get values houston-oil-airs | grep monitoring

# Access Grafana dashboard
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
```

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -n houston-oil-airs
kubectl describe pod <pod-name> -n houston-oil-airs
```

### Check Logs

```bash
kubectl logs -f deployment/houston-oil-airs-backend -n houston-oil-airs
kubectl logs -f deployment/houston-oil-airs-frontend -n houston-oil-airs
```

### Check Services

```bash
kubectl get services -n houston-oil-airs
kubectl describe service houston-oil-airs-backend -n houston-oil-airs
```

### Check Ingress

```bash
kubectl get ingress -n houston-oil-airs
kubectl describe ingress houston-oil-airs-ingress -n houston-oil-airs
```

## Development

### Linting

```bash
helm lint ./helm/houston-oil-airs
```

### Template Rendering

```bash
helm template houston-oil-airs ./helm/houston-oil-airs
```

### Dry Run

```bash
helm install houston-oil-airs ./helm/houston-oil-airs --dry-run --debug
```