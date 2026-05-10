# ============================================
# VPC - Virtual Private Cloud
# ============================================

module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  aws_region   = var.aws_region
}

# ============================================
# ECR - Elastic Container Registry
# ============================================

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

# ============================================
# RDS - PostgreSQL Database
# ============================================

module "rds" {
  source = "./modules/rds"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnet_ids
  db_username     = var.db_username
  db_password     = var.db_password
  instance_class  = var.db_instance_class

  depends_on = [module.vpc]
}

# ============================================
# EKS - Elastic Kubernetes Service
# ============================================

module "eks" {
  source = "./modules/eks"

  project_name     = var.project_name
  environment      = var.environment
  vpc_id           = module.vpc.vpc_id
  private_subnets  = module.vpc.private_subnet_ids
  instance_type    = var.eks_node_instance_type
  desired_capacity = var.eks_desired_capacity
  min_size         = var.eks_min_size
  max_size         = var.eks_max_size

  depends_on = [module.vpc]
}
