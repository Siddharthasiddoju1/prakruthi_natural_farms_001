# ╔══════════════════════════════════════════════════════════════════════════════════╗
# ║     PRAKRUTHI NATURAL FARMS - COMPLETE AWS FREE TIER DEPLOYMENT GUIDE          ║
# ║     Docker + Terraform + Kubernetes + CI/CD + SonarQube                        ║
# ║     Step-by-Step from Zero to Production                                        ║
# ╚══════════════════════════════════════════════════════════════════════════════════╝

# ==================================================================================
# TABLE OF CONTENTS
# ==================================================================================
# PART 1  : AWS Free Tier - What You Get Free
# PART 2  : Prerequisites - Tools to Install on Your Machine
# PART 3  : AWS Account Setup (Free)
# PART 4  : GitHub Repository Setup (Free)
# PART 5  : SonarCloud Setup (Free)
# PART 6  : Switch Database to PostgreSQL
# PART 7  : Docker - Build & Test Locally
# PART 8  : Terraform - Provision AWS Infrastructure
# PART 9  : Push Docker Images to AWS ECR
# PART 10 : Kubernetes - Deploy to AWS EKS
# PART 11 : CI/CD - GitHub Actions Automated Pipeline
# PART 12 : Domain & SSL Setup
# PART 13 : Monitoring & Logging
# PART 14 : Complete Commands Reference
# PART 15 : Troubleshooting Guide
# PART 16 : Cost Breakdown & Optimization
# ==================================================================================


# ██████████████████████████████████████████████████████████████████████████████████
# PART 1: AWS FREE TIER - WHAT YOU GET FREE (12 MONTHS)
# ██████████████████████████████████████████████████████████████████████████████████

# AWS offers 12 months free tier for new accounts:
#
# ┌─────────────────────────┬───────────────────────────────────────────────┐
# │ Service                 │ Free Allowance                                │
# ├─────────────────────────┼───────────────────────────────────────────────┤
# │ EC2                     │ 750 hrs/month t2.micro (1 vCPU, 1GB RAM)     │
# │ RDS PostgreSQL          │ 750 hrs/month db.t3.micro, 20GB storage      │
# │ S3                      │ 5GB storage, 20K GET, 2K PUT                 │
# │ ECR                     │ 500MB storage/month                          │
# │ CloudWatch              │ 10 custom metrics, 5GB log data              │
# │ Lambda                  │ 1M requests/month, 400K GB-seconds           │
# │ DynamoDB                │ 25GB, 25 read/write capacity units           │
# │ Data Transfer           │ 100GB out to internet/month                  │
# │ EKS                     │ NOT FREE ($0.10/hr = $73/month)              │
# └─────────────────────────┴───────────────────────────────────────────────┘
#
# ⚠️ IMPORTANT: EKS is NOT free. For truly free deployment, we provide
#    OPTION A: EC2 Free Tier (fully free, single server)
#    OPTION B: EKS + Kubernetes (enterprise-grade, ~$120-200/month)
#
# This guide covers BOTH options. Choose based on your budget.


# ██████████████████████████████████████████████████████████████████████████████████
# PART 2: PREREQUISITES - INSTALL THESE TOOLS ON YOUR WINDOWS MACHINE
# ██████████████████████████████████████████████████████████████████████████████████

# ┌─────────────────────────────────────────────────────────────────────────────────┐
# │ TOOL              │ PURPOSE              │ DOWNLOAD URL                         │
# ├───────────────────┼──────────────────────┼──────────────────────────────────────┤
# │ Git               │ Version control      │ https://git-scm.com/download/win     │
# │ Docker Desktop    │ Containerization     │ https://docker.com/products/docker-  │
# │                   │                      │  desktop                             │
# │ AWS CLI v2        │ AWS management       │ https://awscli.amazonaws.com/        │
# │                   │                      │  AWSCLIV2.msi                        │
# │ Terraform         │ Infrastructure code  │ https://developer.hashicorp.com/     │
# │                   │                      │  terraform/install                   │
# │ kubectl           │ Kubernetes CLI       │ https://kubernetes.io/docs/tasks/    │
# │                   │                      │  tools/install-kubectl-windows/      │
# │ Helm              │ K8s package manager  │ https://helm.sh/docs/intro/install/  │
# │ Node.js 18        │ Already in project   │ Already available                    │
# │ VS Code           │ Code editor          │ Already using                        │
# └───────────────────┴──────────────────────┴──────────────────────────────────────┘

# --- Step 2.1: Install Git ---
# Download from: https://git-scm.com/download/win
# Run installer → select defaults → Finish
# Verify:
git --version
# Expected: git version 2.x.x

# --- Step 2.2: Install Docker Desktop ---
# Download from: https://www.docker.com/products/docker-desktop/
# Run installer → Enable WSL 2 backend → Restart PC
# Open Docker Desktop → Wait for it to start
# Verify:
docker --version
docker-compose --version
# Expected: Docker version 24.x.x

# --- Step 2.3: Install AWS CLI ---
# Download and run: https://awscli.amazonaws.com/AWSCLIV2.msi
# Verify:
aws --version
# Expected: aws-cli/2.x.x

# --- Step 2.4: Install Terraform ---
# Download from: https://developer.hashicorp.com/terraform/install
# Extract terraform.exe to C:\terraform\
# Add C:\terraform\ to PATH environment variable:
#   1. Search "Environment Variables" in Windows
#   2. Edit "Path" under System variables
#   3. Add: C:\terraform
# Verify:
terraform --version
# Expected: Terraform v1.x.x

# --- Step 2.5: Install kubectl ---
# Run in PowerShell:
curl.exe -LO "https://dl.k8s.io/release/v1.28.0/bin/windows/amd64/kubectl.exe"
# Move kubectl.exe to C:\kubectl\ and add to PATH
# Verify:
kubectl version --client
# Expected: Client Version: v1.28.x

# --- Step 2.6: Install Helm ---
# Download from: https://get.helm.sh/helm-v3.13.0-windows-amd64.zip
# Extract helm.exe to C:\helm\ and add to PATH
# Verify:
helm version
# Expected: version.BuildInfo{Version:"v3.13.x"}


# ██████████████████████████████████████████████████████████████████████████████████
# PART 3: AWS ACCOUNT SETUP (FREE)
# ██████████████████████████████████████████████████████████████████████████████████

# --- Step 3.1: Create AWS Account ---
# 1. Go to https://aws.amazon.com/free/
# 2. Click "Create a Free Account"
# 3. Enter email, password, account name
# 4. Choose "Personal" account type
# 5. Enter payment info (credit/debit card) - WON'T be charged for free tier
# 6. Verify phone number
# 7. Choose "Basic Support (Free)" plan
# 8. Sign in to AWS Console: https://console.aws.amazon.com

# --- Step 3.2: Create IAM User (NEVER use root account for daily work) ---
# 1. Go to AWS Console → IAM → Users → Create user
# 2. Username: "prakruthi-deployer"
# 3. Check "Provide user access to the AWS Management Console"
# 4. Select "Attach policies directly"
# 5. Attach these policies:
#    ✅ AmazonEKSClusterPolicy
#    ✅ AmazonEKSWorkerNodePolicy
#    ✅ AmazonEC2ContainerRegistryFullAccess
#    ✅ AmazonRDSFullAccess
#    ✅ AmazonVPCFullAccess
#    ✅ AmazonEC2FullAccess
#    ✅ AmazonS3FullAccess
#    ✅ IAMFullAccess
#    ✅ AmazonDynamoDBFullAccess
#    (Or use "AdministratorAccess" for simplicity - less secure)
# 6. Click "Create user"
# 7. Go to user → Security credentials → Create access key
# 8. Choose "Command Line Interface (CLI)"
# 9. ⚠️ SAVE the Access Key ID and Secret Access Key (shown only once!)

# --- Step 3.3: Configure AWS CLI on your machine ---
aws configure
# When prompted:
#   AWS Access Key ID:      paste-your-access-key-here
#   AWS Secret Access Key:  paste-your-secret-key-here
#   Default region name:    ap-south-1
#   Default output format:  json

# Verify AWS CLI is working:
aws sts get-caller-identity
# Expected: Shows your account ID, user ARN


# ██████████████████████████████████████████████████████████████████████████████████
# PART 4: GITHUB REPOSITORY SETUP (FREE)
# ██████████████████████████████████████████████████████████████████████████████████

# --- Step 4.1: Create GitHub Account ---
# 1. Go to https://github.com
# 2. Sign up (free account - unlimited private repos)
# 3. Verify email

# --- Step 4.2: Install GitHub CLI (optional but helpful) ---
# Download: https://cli.github.com/
# Or use: winget install --id GitHub.cli

# --- Step 4.3: Initialize Git Repository ---
cd C:\Stellantis_Folder\1.Myself\Natural

# Initialize git
git init

# Configure git user
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Prakruthi Natural Farms - Full Stack Application"

# --- Step 4.4: Create GitHub Repository ---
# OPTION A - Using GitHub CLI:
gh auth login
gh repo create prakruthi-natural-farms --private --source=. --push

# OPTION B - Using GitHub Website:
# 1. Go to https://github.com/new
# 2. Repository name: prakruthi-natural-farms
# 3. Select: Private
# 4. DON'T initialize with README (we already have code)
# 5. Click "Create repository"
# 6. Then push your code:
git remote add origin https://github.com/YOUR_USERNAME/prakruthi-natural-farms.git
git branch -M main
git push -u origin main

# --- Step 4.5: Create Branch Protection Rules ---
# 1. GitHub → Repository → Settings → Branches → Add rule
# 2. Branch name pattern: "main"
# 3. Enable:
#    ✅ Require pull request reviews before merging
#    ✅ Require status checks to pass before merging
#    ✅ Require branches to be up to date before merging
# 4. Save changes

# --- Step 4.6: Add GitHub Secrets ---
# GitHub → Repository → Settings → Secrets and variables → Actions → New repository secret
#
# Add these secrets one by one:
#
# ┌──────────────────────────────┬──────────────────────────────────────────────┐
# │ Secret Name                  │ What to Put                                  │
# ├──────────────────────────────┼──────────────────────────────────────────────┤
# │ AWS_ACCESS_KEY_ID            │ IAM user access key from Step 3.2            │
# │ AWS_SECRET_ACCESS_KEY        │ IAM user secret key from Step 3.2            │
# │ AWS_ACCOUNT_ID               │ Your 12-digit AWS account ID                 │
# │ DB_PASSWORD                  │ Strong password for RDS database             │
# │ SONAR_TOKEN                  │ SonarCloud token (from Part 5)               │
# │ SONAR_HOST_URL               │ https://sonarcloud.io                        │
# └──────────────────────────────┴──────────────────────────────────────────────┘
#
# To find your AWS Account ID:
aws sts get-caller-identity --query Account --output text


# ██████████████████████████████████████████████████████████████████████████████████
# PART 5: SONARCLOUD SETUP (FREE FOR PUBLIC REPOS / FREE TRIAL FOR PRIVATE)
# ██████████████████████████████████████████████████████████████████████████████████

# --- Step 5.1: Create SonarCloud Account ---
# 1. Go to https://sonarcloud.io
# 2. Click "Log in" → "Login with GitHub"
# 3. Authorize SonarCloud to access your GitHub
# 4. Free for public repositories; free 14-day trial for private repos

# --- Step 5.2: Create SonarCloud Project ---
# 1. Click "+" → "Analyze new project"
# 2. Select your GitHub repository: prakruthi-natural-farms
# 3. Click "Set Up"
# 4. Choose "With GitHub Actions"
# 5. Copy the SONAR_TOKEN → add to GitHub secrets (Step 4.6)
# 6. Note your Organization key (usually your GitHub username)

# --- Step 5.3: Verify sonar-project.properties ---
# The file is already created at the project root with this config:
#
#   sonar.projectKey=prakruthi-natural-farms
#   sonar.projectName=Prakruthi Natural Farms
#   sonar.sources=apps/web/src,apps/admin/src,services/api/src,packages/shared/src
#   sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**
#
# Update sonar.organization in sonar-project.properties:
#   sonar.organization=your-github-username

# --- Step 5.4: Self-Hosted SonarQube (Alternative - Free) ---
# If you want to run SonarQube yourself (completely free):
docker-compose up sonarqube -d
# Access: http://localhost:9000
# Default login: admin / admin
# Change password on first login
# Create project → Generate token → Use in CI/CD


# ██████████████████████████████████████████████████████████████████████████████████
# PART 6: SWITCH DATABASE FROM SQLITE TO POSTGRESQL
# ██████████████████████████████████████████████████████████████████████████████████

# Your current app uses SQLite (file:./dev.db). For production, we switch to PostgreSQL.

# --- Step 6.1: Update schema.prisma ---
# The production schema is at: services/api/prisma/schema.production.prisma
# To switch, update services/api/prisma/schema.prisma:
#
# CHANGE this:
#   datasource db {
#     provider = "sqlite"
#     url      = "file:./dev.db"
#   }
#
# TO this:
#   datasource db {
#     provider = "postgresql"
#     url      = env("DATABASE_URL")
#   }

# --- Step 6.2: Set DATABASE_URL for local development ---
# Create file: services/api/.env
# Add this line:
#   DATABASE_URL=postgresql://prakruthi:prakruthi_dev_pass@localhost:5432/prakruthi_db

# --- Step 6.3: Start local PostgreSQL with Docker ---
docker-compose up db -d

# --- Step 6.4: Run migration ---
cd services/api
npx prisma migrate dev --name init-postgres
npx prisma generate

# --- Step 6.5: Seed the database ---
npm run seed

# --- Step 6.6: Test locally ---
npm run dev
# API should now work with PostgreSQL at http://localhost:4000/health


# ██████████████████████████████████████████████████████████████████████████████████
# PART 7: DOCKER - BUILD & TEST LOCALLY
# ██████████████████████████████████████████████████████████████████████████████████

# --- Step 7.1: Understand Docker Architecture ---
#
# ┌──────────────────────────────────────────────────────────────┐
# │                    Docker Containers                          │
# │                                                                │
# │  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
# │  │ API        │  │ Web        │  │ Admin      │              │
# │  │ (Node.js)  │  │ (Nginx)    │  │ (Nginx)    │              │
# │  │ Port: 4000 │  │ Port: 3000 │  │ Port: 3001 │              │
# │  └─────┬──────┘  └────────────┘  └────────────┘              │
# │        │                                                       │
# │  ┌─────▼──────┐  ┌────────────┐                               │
# │  │ PostgreSQL │  │ SonarQube  │                               │
# │  │ Port: 5432 │  │ Port: 9000 │                               │
# │  └────────────┘  └────────────┘                               │
# └──────────────────────────────────────────────────────────────┘

# --- Step 7.2: Build all Docker images ---
cd C:\Stellantis_Folder\1.Myself\Natural

# Build API image
docker build -t prakruthi/api:latest -f services/api/Dockerfile .

# Build Web image
docker build -t prakruthi/web:latest -f apps/web/Dockerfile .

# Build Admin image
docker build -t prakruthi/admin:latest -f apps/admin/Dockerfile .

# --- Step 7.3: Verify images ---
docker images | findstr prakruthi
# Expected:
#   prakruthi/api     latest    ...    ~200MB
#   prakruthi/web     latest    ...    ~30MB
#   prakruthi/admin   latest    ...    ~30MB

# --- Step 7.4: Run everything with Docker Compose ---
docker-compose up -d

# --- Step 7.5: Verify all services are running ---
docker-compose ps
# Expected: All services show "Up" status

# Test endpoints:
curl http://localhost:4000/health        # API health check
curl http://localhost:3000               # Web frontend
curl http://localhost:3001               # Admin panel
# SonarQube: http://localhost:9000

# --- Step 7.6: View logs ---
docker-compose logs -f api              # API logs
docker-compose logs -f web              # Web logs

# --- Step 7.7: Stop all services ---
docker-compose down

# --- Step 7.8: Clean up ---
docker-compose down -v                  # Remove volumes too (deletes DB data)


# ██████████████████████████████████████████████████████████████████████████████████
# PART 8: TERRAFORM - PROVISION AWS INFRASTRUCTURE
# ██████████████████████████████████████████████████████████████████████████████████

# Terraform creates all AWS resources automatically from code.
# What it creates:
#   ✅ VPC (Virtual Private Cloud) with public/private subnets
#   ✅ EKS (Kubernetes) cluster with worker nodes
#   ✅ ECR (Container Registry) - 3 repos for API, Web, Admin
#   ✅ RDS (PostgreSQL) database with encryption & backups
#   ✅ Security Groups, IAM Roles, NAT Gateway

# --- Step 8.1: Create Terraform State Backend (S3 + DynamoDB) ---
# This stores Terraform state remotely so team can collaborate.
# Run these AWS CLI commands:

# Create S3 bucket for state storage
aws s3api create-bucket ^
  --bucket prakruthi-terraform-state ^
  --region ap-south-1 ^
  --create-bucket-configuration LocationConstraint=ap-south-1

# Enable versioning on state bucket
aws s3api put-bucket-versioning ^
  --bucket prakruthi-terraform-state ^
  --versioning-configuration Status=Enabled

# Enable encryption on state bucket
aws s3api put-bucket-encryption ^
  --bucket prakruthi-terraform-state ^
  --server-side-encryption-configuration "{\"Rules\":[{\"ApplyServerSideEncryptionByDefault\":{\"SSEAlgorithm\":\"AES256\"}}]}"

# Block public access on state bucket
aws s3api put-public-access-block ^
  --bucket prakruthi-terraform-state ^
  --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Create DynamoDB table for state locking (prevents concurrent changes)
aws dynamodb create-table ^
  --table-name prakruthi-terraform-locks ^
  --attribute-definitions AttributeName=LockID,AttributeType=S ^
  --key-schema AttributeName=LockID,KeyType=HASH ^
  --billing-mode PAY_PER_REQUEST ^
  --region ap-south-1

# --- Step 8.2: Initialize Terraform ---
cd C:\Stellantis_Folder\1.Myself\Natural\terraform

terraform init
# Expected: "Terraform has been successfully initialized!"

# --- Step 8.3: Validate Configuration ---
terraform validate
# Expected: "Success! The configuration is valid."

# --- Step 8.4: Preview Infrastructure Changes (Plan) ---
terraform plan -var="db_password=YourStrongP@ssw0rd123!"
# This shows what will be created WITHOUT actually creating anything.
# Review the plan carefully.
# Expected: "Plan: XX to add, 0 to change, 0 to destroy."

# --- Step 8.5: Create Infrastructure (Apply) ---
terraform apply -var="db_password=YourStrongP@ssw0rd123!"
# Type "yes" when prompted
# ⚠️ This takes 15-25 minutes (EKS cluster creation is slow)
# 
# Wait for output like:
#   Apply complete! Resources: XX added.
#   
#   Outputs:
#   eks_cluster_name = "prakruthi-eks"
#   eks_cluster_endpoint = "https://xxxxx.gr7.ap-south-1.eks.amazonaws.com"
#   ecr_api_repository_url = "123456789012.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/api"
#   rds_endpoint = "prakruthi-production-db.xxxxx.ap-south-1.rds.amazonaws.com:5432"

# --- Step 8.6: Save Important Output Values ---
# Note down these values from terraform output:
terraform output
# Save:
#   eks_cluster_name
#   ecr_api_repository_url
#   ecr_web_repository_url
#   ecr_admin_repository_url
#   rds_endpoint

# --- Step 8.7: Configure kubectl to connect to EKS ---
aws eks update-kubeconfig --name prakruthi-eks --region ap-south-1

# Verify connection:
kubectl get nodes
# Expected: Shows 2 worker nodes in "Ready" state
kubectl cluster-info
# Expected: Shows Kubernetes control plane URL

# ⚠️ IF YOU WANT TO DESTROY EVERYTHING LATER (to stop charges):
# terraform destroy -var="db_password=YourStrongP@ssw0rd123!"


# ██████████████████████████████████████████████████████████████████████████████████
# PART 9: PUSH DOCKER IMAGES TO AWS ECR (Elastic Container Registry)
# ██████████████████████████████████████████████████████████████████████████████████

# ECR is AWS's Docker Hub - stores your container images privately.

# --- Step 9.1: Get your AWS Account ID ---
# Set your AWS Account ID as a variable (replace with your actual ID):
$AWS_ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
$ECR_URL = "${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com"

# --- Step 9.2: Login to ECR ---
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin $ECR_URL
# Expected: "Login Succeeded"

# --- Step 9.3: Build images (from project root) ---
cd C:\Stellantis_Folder\1.Myself\Natural

# Build API
docker build -t prakruthi/api:latest -f services/api/Dockerfile .

# Build Web (with production API URL)
docker build -t prakruthi/web:latest -f apps/web/Dockerfile --build-arg VITE_API_URL=https://api.prakruthi.com .

# Build Admin (with production API URL)
docker build -t prakruthi/admin:latest -f apps/admin/Dockerfile --build-arg VITE_API_URL=https://api.prakruthi.com .

# --- Step 9.4: Tag images for ECR ---
docker tag prakruthi/api:latest "${ECR_URL}/prakruthi/api:latest"
docker tag prakruthi/api:latest "${ECR_URL}/prakruthi/api:v1.0.0"

docker tag prakruthi/web:latest "${ECR_URL}/prakruthi/web:latest"
docker tag prakruthi/web:latest "${ECR_URL}/prakruthi/web:v1.0.0"

docker tag prakruthi/admin:latest "${ECR_URL}/prakruthi/admin:latest"
docker tag prakruthi/admin:latest "${ECR_URL}/prakruthi/admin:v1.0.0"

# --- Step 9.5: Push images to ECR ---
docker push "${ECR_URL}/prakruthi/api:latest"
docker push "${ECR_URL}/prakruthi/api:v1.0.0"

docker push "${ECR_URL}/prakruthi/web:latest"
docker push "${ECR_URL}/prakruthi/web:v1.0.0"

docker push "${ECR_URL}/prakruthi/admin:latest"
docker push "${ECR_URL}/prakruthi/admin:v1.0.0"
# Each push may take 2-5 minutes depending on internet speed

# --- Step 9.6: Verify images in ECR ---
aws ecr list-images --repository-name prakruthi/api --region ap-south-1
aws ecr list-images --repository-name prakruthi/web --region ap-south-1
aws ecr list-images --repository-name prakruthi/admin --region ap-south-1


# ██████████████████████████████████████████████████████████████████████████████████
# PART 10: KUBERNETES - DEPLOY TO AWS EKS
# ██████████████████████████████████████████████████████████████████████████████████

# --- Step 10.1: Install AWS Load Balancer Controller ---
# This creates an ALB (Application Load Balancer) for your Ingress.

# Create IAM OIDC provider for EKS
$CLUSTER_NAME = "prakruthi-eks"
$REGION = "ap-south-1"

eksctl utils associate-iam-oidc-provider --cluster $CLUSTER_NAME --region $REGION --approve

# Install AWS Load Balancer Controller using Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller ^
  -n kube-system ^
  --set clusterName=$CLUSTER_NAME ^
  --set serviceAccount.create=true ^
  --set serviceAccount.name=aws-load-balancer-controller

# Verify it's running:
kubectl get deployment -n kube-system aws-load-balancer-controller
# Expected: READY 1/1

# --- Step 10.2: Update Kubernetes Secrets with REAL values ---
# ⚠️ BEFORE deploying, update k8s/secrets-configmap.yaml with real values:
#
# Replace in k8s/secrets-configmap.yaml:
#   DATABASE_URL → use the rds_endpoint from terraform output:
#     postgresql://prakruthi_admin:YourStrongP@ssw0rd123!@TERRAFORM_RDS_ENDPOINT/prakruthi_db
#   JWT_SECRET → generate a strong random string:
#     Run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
#   OTP_API_KEY → your Twilio/MSG91 API key (or keep mock for testing)

# --- Step 10.3: Update K8s manifests with your AWS Account ID ---
# Replace <AWS_ACCOUNT_ID> in all k8s/*.yaml files with your actual account ID:
cd C:\Stellantis_Folder\1.Myself\Natural

# On Windows PowerShell:
$files = Get-ChildItem -Path "k8s" -Filter "*.yaml"
foreach ($file in $files) {
    (Get-Content $file.FullName) -replace '<AWS_ACCOUNT_ID>', $AWS_ACCOUNT_ID | Set-Content $file.FullName
}

# --- Step 10.4: Deploy to Kubernetes (in order) ---

# 1. Create namespace
kubectl apply -f k8s/namespace.yaml
# Expected: namespace/prakruthi created

# 2. Create secrets and config
kubectl apply -f k8s/secrets-configmap.yaml
# Expected: secret/prakruthi-secrets created, configmap/prakruthi-config created

# 3. Deploy API
kubectl apply -f k8s/api-deployment.yaml
# Expected: deployment.apps/prakruthi-api created, service/prakruthi-api-service created

# 4. Deploy Web frontend
kubectl apply -f k8s/web-deployment.yaml
# Expected: deployment.apps/prakruthi-web created

# 5. Deploy Admin panel
kubectl apply -f k8s/admin-deployment.yaml
# Expected: deployment.apps/prakruthi-admin created

# 6. Create Ingress (Load Balancer)
kubectl apply -f k8s/ingress.yaml
# Expected: ingress.networking.k8s.io/prakruthi-ingress created

# --- Step 10.5: Run Database Migrations ---
kubectl apply -f k8s/jobs.yaml

# Wait for migration to complete:
kubectl wait --for=condition=complete --timeout=120s job/prakruthi-db-migrate -n prakruthi

# Check migration logs:
kubectl logs job/prakruthi-db-migrate -n prakruthi

# --- Step 10.6: Verify Everything is Running ---

# Check all pods:
kubectl get pods -n prakruthi
# Expected:
#   NAME                              READY   STATUS    RESTARTS   AGE
#   prakruthi-api-xxxxx-yyyyy         1/1     Running   0          2m
#   prakruthi-api-xxxxx-zzzzz         1/1     Running   0          2m
#   prakruthi-web-xxxxx-yyyyy         1/1     Running   0          1m
#   prakruthi-web-xxxxx-zzzzz         1/1     Running   0          1m
#   prakruthi-admin-xxxxx-yyyyy       1/1     Running   0          1m

# Check services:
kubectl get services -n prakruthi
# Expected: Shows ClusterIP services for api, web, admin

# Check ingress (get ALB URL):
kubectl get ingress -n prakruthi
# Expected:
#   NAME                CLASS   HOSTS              ADDRESS                                    PORTS
#   prakruthi-ingress   alb     prakruthi.com,...   k8s-prakruth-xxxxx.ap-south-1.elb.amazonaws.com   80

# ⚠️ The ALB ADDRESS is your application's public URL!
# Save this URL - you'll need it for DNS setup.

# --- Step 10.7: Test the deployment ---
$ALB_URL = kubectl get ingress prakruthi-ingress -n prakruthi -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
curl "http://${ALB_URL}/health"
# Expected: {"ok":true,"service":"prakruthi-api"}

# --- Step 10.8: Useful Kubernetes Debug Commands ---
# If pods are not running:
kubectl describe pod <pod-name> -n prakruthi          # Check events/errors
kubectl logs <pod-name> -n prakruthi                   # Check logs
kubectl logs <pod-name> -n prakruthi --previous        # Check previous crash logs
kubectl get events -n prakruthi --sort-by='.lastTimestamp'  # All events


# ██████████████████████████████████████████████████████████████████████████████████
# PART 11: CI/CD - GITHUB ACTIONS AUTOMATED PIPELINE
# ██████████████████████████████████████████████████████████████████████████████████

# The CI/CD pipeline is already configured in .github/workflows/
# Here's what happens automatically:

# ┌──────────────────────────────────────────────────────────────────────────────┐
# │                        CI/CD PIPELINE FLOW                                   │
# │                                                                              │
# │  Developer pushes code                                                       │
# │       │                                                                      │
# │       ▼                                                                      │
# │  ┌─────────────────────┐                                                    │
# │  │  PULL REQUEST (PR)  │ → Triggers CI Pipeline (.github/workflows/ci.yml)  │
# │  └─────────┬───────────┘                                                    │
# │            │                                                                 │
# │            ▼                                                                 │
# │  ┌─────────────────────┐   ┌──────────────────┐   ┌───────────────────┐    │
# │  │ 1. Code Quality     │   │ 2. Security Scan │   │ 3. SonarQube     │    │
# │  │   - TypeScript       │   │   - npm audit    │   │   - Code quality │    │
# │  │   - Type checking    │   │   - Trivy scan   │   │   - Bug detection│    │
# │  └─────────┬───────────┘   └────────┬─────────┘   └───────┬───────────┘    │
# │            │                         │                      │                │
# │            ▼                         ▼                      ▼                │
# │  ┌─────────────────────────────────────────────────────────────────────┐    │
# │  │ 4. Build Docker Images (validate they build successfully)           │    │
# │  └─────────────────────────────────────────┬───────────────────────────┘    │
# │                                             │                                │
# │  ──────────────── PR Merged to main ────────┼───────────────────────         │
# │                                             │                                │
# │                                             ▼                                │
# │  ┌─────────────────────┐  Triggers CD Pipeline (.github/workflows/cd.yml)   │
# │  │ 5. Build & Push to  │                                                    │
# │  │    AWS ECR           │                                                    │
# │  └─────────┬───────────┘                                                    │
# │            │                                                                 │
# │            ▼                                                                 │
# │  ┌─────────────────────┐                                                    │
# │  │ 6. Deploy to EKS   │ → kubectl apply → rolling update                   │
# │  └─────────┬───────────┘                                                    │
# │            │                                                                 │
# │            ▼                                                                 │
# │  ┌─────────────────────┐                                                    │
# │  │ 7. Run DB Migration │                                                    │
# │  └─────────┬───────────┘                                                    │
# │            │                                                                 │
# │            ▼                                                                 │
# │  ┌─────────────────────┐                                                    │
# │  │ 8. Health Check     │ → Verify deployment is healthy                     │
# │  └─────────────────────┘                                                    │
# └──────────────────────────────────────────────────────────────────────────────┘

# --- Step 11.1: How to use the CI/CD pipeline ---

# DAILY WORKFLOW:
# 1. Create feature branch
git checkout -b feature/add-payment-page

# 2. Make your changes
# ... edit code ...

# 3. Commit and push
git add .
git commit -m "feat: add payment page"
git push origin feature/add-payment-page

# 4. Create Pull Request on GitHub
#    → CI pipeline runs automatically (build, test, scan, sonarqube)
#    → Wait for all checks to pass ✅

# 5. Merge PR to main
#    → CD pipeline runs automatically
#    → Builds Docker images → pushes to ECR → deploys to EKS
#    → Your changes are live! 🚀

# --- Step 11.2: Manual Deployment (if needed) ---
# Go to GitHub → Actions → CD Pipeline → "Run workflow" → "Run workflow"

# --- Step 11.3: Terraform Infrastructure Changes ---
# When you modify terraform/ files:
# 1. Create PR → terraform plan runs automatically (shows preview)
# 2. Merge to main → terraform apply runs automatically (creates resources)

# --- Step 11.4: Monitor Pipeline ---
# Go to GitHub → Actions tab
# Click on any workflow run to see:
#   - Step-by-step progress
#   - Build logs
#   - SonarQube results
#   - Deployment status


# ██████████████████████████████████████████████████████████████████████████████████
# PART 12: DOMAIN & SSL SETUP
# ██████████████████████████████████████████████████████████████████████████████████

# --- Step 12.1: Buy a Domain Name ---
# Options:
#   - GoDaddy:    https://godaddy.com        (~₹800/year for .com)
#   - Namecheap:  https://namecheap.com      (~₹700/year for .com)
#   - Route 53:   AWS Console → Route 53     (~$12/year for .com)
#   - Hostinger:  https://hostinger.in       (~₹500/year for .com)

# --- Step 12.2: Request SSL Certificate (FREE via AWS ACM) ---
aws acm request-certificate ^
  --domain-name prakruthi.com ^
  --subject-alternative-names "*.prakruthi.com" ^
  --validation-method DNS ^
  --region ap-south-1

# Save the Certificate ARN from the output:
#   "CertificateArn": "arn:aws:acm:ap-south-1:123456789012:certificate/abc-def-123"

# --- Step 12.3: Validate SSL Certificate ---
# 1. Go to AWS Console → Certificate Manager
# 2. Click on your certificate
# 3. Click "Create records in Route 53" (if using Route 53)
#    OR add the CNAME record shown to your domain registrar's DNS
# 4. Wait for status to change to "Issued" (takes 5-30 minutes)

# --- Step 12.4: Update Ingress with Certificate ARN ---
# Edit k8s/ingress.yaml:
#   Change the annotation:
#   alb.ingress.kubernetes.io/certificate-arn: "YOUR_CERTIFICATE_ARN"
#
# Apply updated ingress:
kubectl apply -f k8s/ingress.yaml

# --- Step 12.5: Configure DNS Records ---
# Get your ALB DNS name:
kubectl get ingress prakruthi-ingress -n prakruthi -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Add these DNS records at your domain registrar:
#
# ┌───────┬──────────┬──────────────────────────────────────────────────┐
# │ Type  │ Name     │ Value                                            │
# ├───────┼──────────┼──────────────────────────────────────────────────┤
# │ CNAME │ @        │ k8s-prakruth-xxxxx.ap-south-1.elb.amazonaws.com │
# │ CNAME │ www      │ k8s-prakruth-xxxxx.ap-south-1.elb.amazonaws.com │
# │ CNAME │ api      │ k8s-prakruth-xxxxx.ap-south-1.elb.amazonaws.com │
# │ CNAME │ admin    │ k8s-prakruth-xxxxx.ap-south-1.elb.amazonaws.com │
# └───────┴──────────┴──────────────────────────────────────────────────┘
#
# DNS propagation takes 5 minutes to 48 hours.

# --- Step 12.6: Verify SSL is working ---
curl https://prakruthi.com
curl https://api.prakruthi.com/health
curl https://admin.prakruthi.com


# ██████████████████████████████████████████████████████████████████████████████████
# PART 13: MONITORING & LOGGING
# ██████████████████████████████████████████████████████████████████████████████████

# --- Step 13.1: CloudWatch Logs (Built-in with EKS) ---
# EKS automatically sends cluster logs to CloudWatch.
# View in: AWS Console → CloudWatch → Log groups → /aws/eks/prakruthi-eks

# --- Step 13.2: kubectl logs (Direct pod logs) ---
# Real-time API logs:
kubectl logs -f deployment/prakruthi-api -n prakruthi

# All pods in namespace:
kubectl logs -l app=prakruthi-api -n prakruthi --tail=100

# --- Step 13.3: Install Prometheus + Grafana (Optional - Free, Self-hosted) ---
# Prometheus = metrics collection
# Grafana = beautiful dashboards

# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install monitoring stack
helm install monitoring prometheus-community/kube-prometheus-stack ^
  --namespace monitoring ^
  --create-namespace ^
  --set grafana.service.type=LoadBalancer

# Access Grafana:
kubectl get svc -n monitoring | findstr grafana
# Default login: admin / prom-operator
# Open: http://GRAFANA_EXTERNAL_IP:80

# Pre-built dashboards for:
#   - Kubernetes cluster overview
#   - Node resource usage (CPU, Memory)
#   - Pod health & restarts
#   - API response times

# --- Step 13.4: Application-Level Monitoring ---
# Add to your API for error tracking:
# 1. Sign up at https://sentry.io (free tier: 5K errors/month)
# 2. Install: npm install @sentry/node
# 3. Add to server.ts:
#    import * as Sentry from '@sentry/node';
#    Sentry.init({ dsn: process.env.SENTRY_DSN });

# --- Step 13.5: Uptime Monitoring (Free) ---
# Use https://uptimerobot.com (free: 50 monitors)
# Add monitors for:
#   - https://api.prakruthi.com/health (every 5 min)
#   - https://prakruthi.com (every 5 min)
#   - https://admin.prakruthi.com (every 5 min)
# Get email/SMS alerts when site goes down.


# ██████████████████████████████████████████████████████████████████████████████████
# PART 14: COMPLETE COMMANDS REFERENCE
# ██████████████████████████████████████████████████████████████████████████████████

# ═══════════════════════════════════
# DOCKER COMMANDS
# ═══════════════════════════════════
docker-compose up -d                          # Start all services
docker-compose down                           # Stop all services
docker-compose logs -f api                    # View API logs live
docker-compose ps                             # List running containers
docker-compose restart api                    # Restart API service
docker build -t name:tag -f Dockerfile .      # Build image
docker images                                 # List images
docker system prune -a                        # Clean unused images/containers

# ═══════════════════════════════════
# KUBERNETES (kubectl) COMMANDS
# ═══════════════════════════════════
kubectl get pods -n prakruthi                 # List all pods
kubectl get services -n prakruthi             # List services
kubectl get ingress -n prakruthi              # List ingress (load balancer)
kubectl get deployments -n prakruthi          # List deployments
kubectl get hpa -n prakruthi                  # List auto-scalers
kubectl get events -n prakruthi               # List events (errors)

kubectl describe pod <name> -n prakruthi      # Detailed pod info
kubectl logs <pod-name> -n prakruthi          # Pod logs
kubectl logs -f <pod-name> -n prakruthi       # Live pod logs
kubectl exec -it <pod-name> -n prakruthi -- sh  # Shell into pod

kubectl scale deployment prakruthi-api --replicas=3 -n prakruthi  # Scale up
kubectl rollout restart deployment/prakruthi-api -n prakruthi      # Restart
kubectl rollout status deployment/prakruthi-api -n prakruthi       # Deploy status
kubectl rollout undo deployment/prakruthi-api -n prakruthi         # Rollback

kubectl apply -f k8s/                         # Apply all manifests
kubectl delete -f k8s/                        # Delete all resources

kubectl top nodes                             # Node CPU/Memory usage
kubectl top pods -n prakruthi                 # Pod CPU/Memory usage

# ═══════════════════════════════════
# TERRAFORM COMMANDS
# ═══════════════════════════════════
terraform init                                # Initialize (first time)
terraform validate                            # Validate config
terraform plan                                # Preview changes
terraform apply                               # Apply changes (create resources)
terraform destroy                             # Destroy ALL resources
terraform output                              # Show output values
terraform state list                          # List managed resources
terraform state show <resource>               # Show resource details
terraform fmt                                 # Format terraform files

# ═══════════════════════════════════
# AWS CLI COMMANDS
# ═══════════════════════════════════
aws sts get-caller-identity                   # Verify AWS credentials
aws eks list-clusters                         # List EKS clusters
aws eks update-kubeconfig --name prakruthi-eks --region ap-south-1  # Connect kubectl
aws ecr list-images --repository-name prakruthi/api  # List ECR images
aws rds describe-db-instances                 # Database info
aws ecr get-login-password --region ap-south-1 | docker login ...  # ECR login
aws s3 ls                                     # List S3 buckets
aws cloudwatch get-metric-statistics ...      # Get metrics

# ═══════════════════════════════════
# GIT COMMANDS
# ═══════════════════════════════════
git checkout -b feature/my-feature            # Create branch
git add .                                     # Stage changes
git commit -m "feat: description"             # Commit
git push origin feature/my-feature            # Push branch
git checkout main                             # Switch to main
git pull origin main                          # Pull latest
git merge feature/my-feature                  # Merge branch
git log --oneline -10                         # Last 10 commits

# ═══════════════════════════════════
# PRISMA COMMANDS
# ═══════════════════════════════════
npx prisma migrate dev --name <name>          # Create migration (dev)
npx prisma migrate deploy                     # Apply migrations (production)
npx prisma generate                           # Generate client
npx prisma studio                             # Open DB GUI
npx prisma db seed                            # Seed database


# ██████████████████████████████████████████████████████████████████████████████████
# PART 15: TROUBLESHOOTING GUIDE
# ██████████████████████████████████████████████████████████████████████████████████

# ───────────────────────────────────
# PROBLEM: Pods stuck in "Pending"
# ───────────────────────────────────
# Cause: Not enough resources on nodes
# Fix:
kubectl describe pod <pod-name> -n prakruthi  # Check "Events" section
# If "Insufficient cpu/memory":
#   - Reduce resource requests in deployment yaml
#   - OR scale up nodes: edit terraform/variables.tf → eks_desired_capacity
#   - OR use larger instance type: edit eks_node_instance_type

# ───────────────────────────────────
# PROBLEM: Pods in "CrashLoopBackOff"
# ───────────────────────────────────
# Cause: Application is crashing
# Fix:
kubectl logs <pod-name> -n prakruthi --previous  # Check crash logs
# Common causes:
#   - DATABASE_URL is wrong → check secrets-configmap.yaml
#   - Missing environment variables
#   - Database not accessible (security group issue)

# ───────────────────────────────────
# PROBLEM: Ingress shows no ADDRESS
# ───────────────────────────────────
# Cause: ALB Controller not working
# Fix:
kubectl get deployment -n kube-system aws-load-balancer-controller
kubectl logs deployment/aws-load-balancer-controller -n kube-system
# Common fix: Check IAM permissions for the load balancer controller

# ───────────────────────────────────
# PROBLEM: Cannot connect to RDS
# ───────────────────────────────────
# Cause: Security group blocking traffic
# Fix:
# 1. AWS Console → RDS → your database → Security group
# 2. Edit inbound rules → Add rule:
#    Type: PostgreSQL, Port: 5432, Source: 10.0.0.0/16 (VPC CIDR)
# 3. Verify EKS nodes and RDS are in the same VPC

# ───────────────────────────────────
# PROBLEM: Docker build fails
# ───────────────────────────────────
# Cause: Missing files or dependency issues
# Fix:
docker build --no-cache -t prakruthi/api:test -f services/api/Dockerfile .
# Check the error message carefully
# Common: package-lock.json missing → run "npm install" first

# ───────────────────────────────────
# PROBLEM: CI/CD pipeline fails
# ───────────────────────────────────
# Fix:
# 1. Go to GitHub → Actions → Click failed run → Read logs
# 2. Common causes:
#    - Missing GitHub secrets (check all secrets in Step 4.6)
#    - AWS credentials expired → regenerate in IAM
#    - Docker build error → test locally first

# ───────────────────────────────────
# PROBLEM: SonarQube quality gate fails
# ───────────────────────────────────
# Cause: Code quality issues detected
# Fix:
# 1. Check SonarCloud dashboard for details
# 2. Fix reported bugs, code smells, vulnerabilities
# 3. Push fix → pipeline re-runs


# ██████████████████████████████████████████████████████████████████████████████████
# PART 16: COST BREAKDOWN & OPTIMIZATION
# ██████████████████████████████████████████████████████████████████████████████████

# ═══════════════════════════════════════════════════════════════
# OPTION A: MINIMUM COST (Using Free Tier + Budget choices)
# ═══════════════════════════════════════════════════════════════
#
# ┌──────────────────────────┬───────────────┬───────────────┐
# │ Service                  │ Configuration │ Monthly Cost  │
# ├──────────────────────────┼───────────────┼───────────────┤
# │ EKS Control Plane        │ 1 cluster     │ $73           │
# │ EC2 (2x t3.medium nodes) │ Worker nodes  │ $60           │
# │ RDS PostgreSQL           │ db.t3.micro   │ $15 (free yr) │
# │ NAT Gateway              │ 1 AZ          │ $32           │
# │ ALB                      │ 1 load balancer│ $22          │
# │ ECR                      │ ~1GB images   │ $0.10         │
# │ S3 (Terraform state)     │ <1GB          │ $0.02         │
# │ Route 53 (optional)      │ 1 hosted zone │ $0.50         │
# │ Data Transfer             │ ~10GB/month   │ $0.90         │
# ├──────────────────────────┼───────────────┼───────────────┤
# │ TOTAL                    │               │ ~$204/month   │
# │                          │               │ ~₹17,000/month│
# └──────────────────────────┴───────────────┴───────────────┘

# ═══════════════════════════════════════════════════════════════
# OPTION B: ULTRA-LOW COST (Single EC2 - No Kubernetes)
# For startups / MVPs / testing
# ═══════════════════════════════════════════════════════════════
#
# ┌──────────────────────────┬───────────────┬───────────────┐
# │ Service                  │ Configuration │ Monthly Cost  │
# ├──────────────────────────┼───────────────┼───────────────┤
# │ EC2                      │ t2.micro      │ FREE (1 year) │
# │ RDS PostgreSQL           │ db.t3.micro   │ FREE (1 year) │
# │ S3                       │ 5GB           │ FREE (1 year) │
# │ ECR                      │ 500MB         │ FREE          │
# │ Elastic IP               │ 1             │ FREE (if used)│
# ├──────────────────────────┼───────────────┼───────────────┤
# │ TOTAL (Year 1)           │               │ $0/month      │
# │ TOTAL (After Year 1)     │               │ ~$25/month    │
# └──────────────────────────┴───────────────┴───────────────┘

# ═══════════════════════════════════════════════════════════════
# OPTION B: DEPLOY ON SINGLE EC2 (FREE TIER) - STEP BY STEP
# ═══════════════════════════════════════════════════════════════

# Step B.1: Launch EC2 Instance
# AWS Console → EC2 → Launch Instance
# - Name: prakruthi-server
# - AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
# - Instance type: t2.micro (Free tier eligible) OR t3.small ($15/month for better perf)
# - Key pair: Create new → "prakruthi-key" → Download .pem file
# - Security group: Allow SSH (22), HTTP (80), HTTPS (443), Custom TCP (4000)
# - Storage: 20GB gp2 (Free tier: up to 30GB)
# - Click "Launch instance"

# Step B.2: Connect to EC2
ssh -i "prakruthi-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# Step B.3: Install Docker on EC2
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
# Log out and log back in for group change to take effect
exit
ssh -i "prakruthi-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# Step B.4: Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Step B.5: Install Nginx
sudo apt install -y nginx

# Step B.6: Install PM2
sudo npm install -g pm2

# Step B.7: Clone Repository
git clone https://github.com/YOUR_USERNAME/prakruthi-natural-farms.git
cd prakruthi-natural-farms

# Step B.8: Start PostgreSQL with Docker
docker run -d \
  --name prakruthi-db \
  -e POSTGRES_USER=prakruthi \
  -e POSTGRES_PASSWORD=YourStrongP@ssw0rd \
  -e POSTGRES_DB=prakruthi_db \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:15-alpine

# Step B.9: Setup API
cd services/api
cp .env.example .env
# Edit .env with your values:
# DATABASE_URL=postgresql://prakruthi:YourStrongP@ssw0rd@localhost:5432/prakruthi_db
# JWT_SECRET=your-strong-secret
# PORT=4000
# NODE_ENV=production

npm install
npx prisma migrate deploy
npx prisma generate
npm run build
npm run seed

# Step B.10: Start API with PM2
pm2 start dist/server.js --name prakruthi-api
pm2 save
pm2 startup
# Run the command PM2 outputs to enable auto-start on boot

# Step B.11: Build Frontend
cd ../../apps/web
npm install
VITE_API_URL=https://api.yourdomain.com npm run build

cd ../admin
npm install
VITE_API_URL=https://api.yourdomain.com npm run build

# Step B.12: Configure Nginx
sudo tee /etc/nginx/sites-available/prakruthi << 'EOF'
# Web Application
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /home/ubuntu/prakruthi-natural-farms/apps/web/dist;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}

# Admin Panel
server {
    listen 80;
    server_name admin.yourdomain.com;
    root /home/ubuntu/prakruthi-natural-farms/apps/admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/prakruthi /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Step B.13: Setup SSL with Let's Encrypt (FREE)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com -d admin.yourdomain.com
# Follow prompts → Enter email → Agree to terms → Choose redirect HTTP to HTTPS
# SSL auto-renews every 90 days

# Step B.14: Setup Auto-Deploy Script
tee /home/ubuntu/deploy.sh << 'SCRIPT'
#!/bin/bash
set -e
cd /home/ubuntu/prakruthi-natural-farms
git pull origin main
npm install
cd services/api
npx prisma migrate deploy
npm run build
pm2 restart prakruthi-api
cd ../../apps/web
npm run build
cd ../admin
npm run build
sudo systemctl restart nginx
echo "Deployment complete!"
SCRIPT
chmod +x /home/ubuntu/deploy.sh

# To deploy updates manually:
./deploy.sh

# ═══════════════════════════════════════════════════════════════
# COST OPTIMIZATION TIPS
# ═══════════════════════════════════════════════════════════════
#
# 1. USE SPOT INSTANCES for EKS worker nodes (saves 60-70%)
#    Add to terraform/modules/eks/main.tf:
#      capacity_type = "SPOT"
#
# 2. USE SINGLE-AZ RDS (saves ~$15/month)
#    Set in terraform/variables.tf:
#      multi_az = false
#
# 3. USE t3.small NODES instead of t3.medium (saves $30/month)
#
# 4. REMOVE NAT GATEWAY for dev/staging (saves $32/month)
#    Use VPC endpoints instead
#
# 5. RESERVED INSTANCES: 1-year commitment saves 30-40%
#
# 6. SET BILLING ALERTS:
#    AWS Console → Billing → Budgets → Create budget
#    Set alert at $50, $100, $200 thresholds


# ██████████████████████████████████████████████████████████████████████████████████
# EXECUTION ORDER CHECKLIST
# ██████████████████████████████████████████████████████████████████████████████████
#
# Run these in exact order:
#
# □ 1.  Install Git, Docker Desktop, AWS CLI, Terraform, kubectl, Helm
# □ 2.  Create AWS account at https://aws.amazon.com/free/
# □ 3.  Create IAM user and configure AWS CLI (aws configure)
# □ 4.  Create GitHub account and push code to repository
# □ 5.  Add GitHub secrets (AWS keys, DB password, SonarQube token)
# □ 6.  Setup SonarCloud at https://sonarcloud.io
# □ 7.  Switch Prisma to PostgreSQL
# □ 8.  Test Docker build locally (docker-compose up)
# □ 9.  Create Terraform state backend (S3 + DynamoDB)
# □ 10. Run terraform init → plan → apply (creates AWS infra)
# □ 11. Configure kubectl for EKS (aws eks update-kubeconfig)
# □ 12. Install AWS Load Balancer Controller (Helm)
# □ 13. Build and push Docker images to ECR
# □ 14. Update K8s secrets with real values
# □ 15. Deploy to Kubernetes (kubectl apply -f k8s/)
# □ 16. Run database migrations
# □ 17. Buy domain and configure DNS
# □ 18. Request and validate SSL certificate
# □ 19. Setup monitoring (CloudWatch + UptimeRobot)
# □ 20. Push code → CI/CD pipeline auto-deploys! ✅
#
# ESTIMATED TIME: 3-5 hours for first deployment
#
# After setup, every git push to main auto-deploys in ~5 minutes.
