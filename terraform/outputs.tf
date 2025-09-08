output "namespace" {
  description = "Kubernetes namespace"
  value       = kubernetes_namespace.houston.metadata[0].name
}

output "ingress_controller_status" {
  description = "Nginx Ingress Controller status"
  value       = helm_release.nginx_ingress.status
}

output "monitoring_stack_status" {
  description = "Monitoring stack status"
  value       = helm_release.monitoring.status
}

output "cert_manager_status" {
  description = "Cert Manager status"
  value       = helm_release.cert_manager.status
}