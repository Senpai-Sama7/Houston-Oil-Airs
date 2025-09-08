variable "redis_password" {
  description = "Password for Redis"
  type        = string
  sensitive   = true
  default     = "changeme123"
}

variable "postgres_password" {
  description = "Password for PostgreSQL"
  type        = string
  sensitive   = true
  default     = "changeme456"
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
  default     = "your-jwt-secret-here"
}

variable "grafana_admin_password" {
  description = "Grafana admin password"
  type        = string
  sensitive   = true
  default     = "admin123"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "replicas" {
  description = "Number of replicas for services"
  type = object({
    frontend = number
    backend  = number
  })
  default = {
    frontend = 2
    backend  = 3
  }
}