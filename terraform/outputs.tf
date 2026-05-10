# ============================================
# Outputs
# ============================================

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "ecr_api_repository_url" {
  description = "ECR repository URL for API"
  value       = module.ecr.api_repository_url
}

output "ecr_web_repository_url" {
  description = "ECR repository URL for Web"
  value       = module.ecr.web_repository_url
}

output "ecr_admin_repository_url" {
  description = "ECR repository URL for Admin"
  value       = module.ecr.admin_repository_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = module.rds.endpoint
}

output "rds_database_name" {
  description = "RDS database name"
  value       = module.rds.database_name
}
