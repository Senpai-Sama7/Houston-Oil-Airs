resource "kubernetes_namespace" "app" {
  metadata {
    name = var.namespace
    labels = {
      "pod-security.kubernetes.io/enforce" = "restricted"
      "pod-security.kubernetes.io/audit"   = "restricted"
      "pod-security.kubernetes.io/warn"    = "restricted"
    }
  }
}

resource "kubernetes_secret" "app_secrets" {
  metadata {
    name      = "${var.app_name}-secrets"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  data = {
    redis-password    = var.redis_password
    postgres-password = var.postgres_password
    jwt-secret       = var.jwt_secret
  }

  type = "Opaque"
}