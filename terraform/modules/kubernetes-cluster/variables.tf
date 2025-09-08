variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
  default     = "houston-oil-airs"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "houston-oil-airs"
}

variable "redis_password" {
  description = "Redis password"
  type        = string
  sensitive   = true
}

variable "postgres_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret"
  type        = string
  sensitive   = true
}