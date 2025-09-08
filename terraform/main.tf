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

module "kubernetes_cluster" {
  source = "./modules/kubernetes-cluster"
  
  namespace         = var.namespace
  app_name         = var.app_name
  redis_password   = var.redis_password
  postgres_password = var.postgres_password
  jwt_secret       = var.jwt_secret
}

module "monitoring" {
  source = "./modules/monitoring"
  
  namespace = var.namespace
  grafana_admin_password = var.grafana_admin_password
}

module "ingress" {
  source = "./modules/ingress"
  
  namespace = var.namespace
}