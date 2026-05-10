# ============================================
# Deployment Guide - Prakruthi Natural Farms
# Complete DevOps Setup with AWS + Kubernetes
# ============================================

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud                                    │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        VPC (10.0.0.0/16)                          │   │
│  │                                                                    │   │
│  │  ┌─────────────────────┐    ┌─────────────────────────────────┐  │   │
│  │  │   Public Subnets     │    │      Private Subnets             │  │   │
│  │  │                      │    │                                   │  │   │
│  │  │  ┌────────────────┐ │    │  ┌─────────────────────────┐    │  │   │
│  │  │  │  ALB (Ingress) │ │    │  │    EKS Cluster           │    │  │   │
│  │  │  └───────┬────────┘ │    │  │                           │    │  │   │
│  │  │          │           │    │  │  ┌─────┐ ┌─────┐ ┌────┐ │    │  │   │
│  │  └──────────┼───────────┘    │  │  │ API │ │ Web │ │Admn│ │    │  │   │
│  │             │                 │  │  └──┬──┘ └─────┘ └────┘ │    │  │   │
│  │             │                 │  │     │                     │    │  │   │
│  │             └─────────────────│──│─────┘                     │    │  │   │
│  │                               │  └─────────────────────────┘    │  │   │
│  │                               │                                   │  │   │
│  │                               │  ┌─────────────────────────┐    │  │   │
│  │                               │  │  RDS PostgreSQL (Multi-AZ)│    │  │   │
│  │                               │  └─────────────────────────┘    │  │   │
│  │                               └─────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                     │
│  │   ECR        │  │   S3        │  │ CloudWatch  │                     │
│  │ (Images)     │  │ (Assets)    │  │ (Logs)      │                     │
│  └─────────────┘  └─────────────┘  └─────────────┘                     │
└─────────────────────────────────────────────────────────────────────────┘
```

## CI/CD Pipeline Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  GitHub  │───▶│   CI     │───▶│ SonarQube│───▶│   CD     │───▶│  AWS EKS │
│  Push    │    │  Build   │    │  Scan    │    │  Deploy  │    │  Cluster │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │                                │
                     ▼                                ▼
               ┌──────────┐                    ┌──────────┐
               │  Docker  │                    │   ECR    │
               │  Build   │                    │  Push    │
               └──────────┘                    └──────────┘
```

---

## Prerequisites (Install on your machine)

| Tool | Purpose | Install Command |
|------|---------|-----------------|
| **Git** | Version control | https://git-scm.com/download |
| **Docker Desktop** | Container runtime | https://docker.com/products/docker-desktop |
| **AWS CLI v2** | AWS management | `msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi` |
| **Terraform** | Infrastructure as Code | https://developer.hashicorp.com/terraform/install |
| **kubectl** | Kubernetes CLI | `choco install kubernetes-cli` |
| **Helm** | K8s package manager | `choco install kubernetes-helm` |
| **Node.js 18** | Build toolchain | Already in project |

---

## Step-by-Step Deployment Guide

### STEP 1: GitHub Repository Setup

```bash
# Initialize git repository
cd c:\Stellantis_Folder\1.Myself\Natural
git init
git add .
git commit -m "Initial commit: Prakruthi Natural Farms"

# Create GitHub repo (via GitHub CLI or website)
gh repo create prakruthi-natural-farms --private
git remote add origin https://github.com/YOUR_USERNAME/prakruthi-natural-farms.git
git push -u origin main
```

### STEP 2: AWS Account Setup

1. **Create AWS Account**: https://aws.amazon.com/
2. **Create IAM User** with programmatic access:
   - Attach policies: `AdministratorAccess` (or fine-grained EKS/ECR/RDS/VPC policies)
3. **Configure AWS CLI**:
```bash
aws configure
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: ap-south-1
# Output format: json
```

### STEP 3: Create Terraform State Backend

```bash
# Create S3 bucket for Terraform state
aws s3api create-bucket \
  --bucket prakruthi-terraform-state \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket prakruthi-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name prakruthi-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

### STEP 4: Deploy Infrastructure with Terraform

```bash
cd terraform

# Initialize Terraform
terraform init

# Preview changes
terraform plan -var="db_password=YourStrongPassword123!"

# Apply infrastructure (creates VPC, EKS, RDS, ECR)
terraform apply -var="db_password=YourStrongPassword123!"

# This takes ~15-20 minutes to create EKS cluster
```

### STEP 5: Configure kubectl for EKS

```bash
# Update kubeconfig
aws eks update-kubeconfig --name prakruthi-eks --region ap-south-1

# Verify connection
kubectl get nodes
```

### STEP 6: Install AWS Load Balancer Controller

```bash
# Add Helm repo
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install ALB Ingress Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=prakruthi-eks \
  --set serviceAccount.create=true
```

### STEP 7: Build & Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com

# Build and push API
docker build -t prakruthi/api -f services/api/Dockerfile .
docker tag prakruthi/api:latest YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/api:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/api:latest

# Build and push Web
docker build -t prakruthi/web -f apps/web/Dockerfile .
docker tag prakruthi/web:latest YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/web:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/web:latest

# Build and push Admin
docker build -t prakruthi/admin -f apps/admin/Dockerfile .
docker tag prakruthi/admin:latest YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/admin:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/admin:latest
```

### STEP 8: Deploy to Kubernetes

```bash
# Update secrets with real values first!
# Edit k8s/secrets-configmap.yaml with your RDS endpoint and credentials

# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets-configmap.yaml
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml
kubectl apply -f k8s/admin-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Run database migrations
kubectl apply -f k8s/jobs.yaml

# Check deployment status
kubectl get pods -n prakruthi
kubectl get services -n prakruthi
kubectl get ingress -n prakruthi
```

### STEP 9: Setup SonarQube

Option A: **SonarCloud (Recommended - Free for open source)**
1. Go to https://sonarcloud.io
2. Connect your GitHub account
3. Import your repository
4. Get the `SONAR_TOKEN`

Option B: **Self-hosted SonarQube**
```bash
# Run locally with docker-compose for testing
docker-compose up sonarqube
# Access at http://localhost:9000 (admin/admin)
```

### STEP 10: Configure GitHub Secrets

Go to GitHub → Repository → Settings → Secrets and variables → Actions

Add these secrets:
| Secret Name | Value |
|-------------|-------|
| `AWS_ACCESS_KEY_ID` | Your IAM access key |
| `AWS_SECRET_ACCESS_KEY` | Your IAM secret key |
| `AWS_ACCOUNT_ID` | Your 12-digit AWS account ID |
| `DB_PASSWORD` | Your RDS database password |
| `SONAR_TOKEN` | SonarQube/SonarCloud token |
| `SONAR_HOST_URL` | SonarQube server URL |

### STEP 11: DNS Configuration

1. Buy a domain (GoDaddy, Namecheap, Route 53)
2. Get ALB DNS name: `kubectl get ingress -n prakruthi`
3. Create DNS records:

| Type | Name | Value |
|------|------|-------|
| CNAME | @ | ALB-DNS-name.elb.amazonaws.com |
| CNAME | api | ALB-DNS-name.elb.amazonaws.com |
| CNAME | admin | ALB-DNS-name.elb.amazonaws.com |
| CNAME | www | ALB-DNS-name.elb.amazonaws.com |

### STEP 12: SSL Certificate (ACM)

```bash
# Request certificate in AWS Certificate Manager
aws acm request-certificate \
  --domain-name prakruthi.com \
  --subject-alternative-names "*.prakruthi.com" \
  --validation-method DNS \
  --region ap-south-1
```

---

## Project Structure After Setup

```
prakruthi-natural-farms/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI: Build, Test, SonarQube
│       ├── cd.yml              # CD: Deploy to EKS
│       └── infrastructure.yml  # Terraform apply
├── terraform/
│   ├── main.tf                 # Provider configuration
│   ├── variables.tf            # Input variables
│   ├── outputs.tf              # Output values
│   ├── infrastructure.tf       # Module orchestration
│   ├── terraform.tfvars        # Variable values
│   └── modules/
│       ├── vpc/main.tf         # VPC, Subnets, NAT
│       ├── eks/main.tf         # EKS Cluster, Node Groups
│       ├── ecr/main.tf         # Container Registries
│       └── rds/main.tf         # PostgreSQL Database
├── k8s/
│   ├── namespace.yaml          # Kubernetes namespace
│   ├── secrets-configmap.yaml  # Secrets & config
│   ├── api-deployment.yaml     # API pods + HPA
│   ├── web-deployment.yaml     # Web frontend pods
│   ├── admin-deployment.yaml   # Admin frontend pods
│   ├── ingress.yaml            # ALB Ingress rules
│   └── jobs.yaml               # DB migration jobs
├── services/api/
│   ├── Dockerfile              # Multi-stage API build
│   └── ...
├── apps/web/
│   ├── Dockerfile              # Multi-stage Web build
│   ├── nginx.conf              # Nginx config for SPA
│   └── ...
├── apps/admin/
│   ├── Dockerfile              # Multi-stage Admin build
│   ├── nginx.conf              # Nginx config for SPA
│   └── ...
├── docker-compose.yml          # Local development
├── sonar-project.properties    # SonarQube config
├── .dockerignore               # Docker build exclusions
└── .gitignore                  # Git exclusions
```

---

## Monitoring & Observability

### CloudWatch (Built-in with EKS)
```bash
# View pod logs
kubectl logs -f deployment/prakruthi-api -n prakruthi

# View cluster events
kubectl get events -n prakruthi --sort-by='.lastTimestamp'
```

### Optional: Prometheus + Grafana
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

---

## Cost Estimation (Monthly)

| Service | Configuration | Estimated Cost |
|---------|--------------|----------------|
| EKS Cluster | Control plane | $73 |
| EC2 (2x t3.medium) | Worker nodes | $60 |
| RDS PostgreSQL (t3.micro) | Single-AZ | $15 |
| NAT Gateway | Data transfer | $32 |
| ALB | Application LB | $22 |
| ECR | Image storage | $1 |
| S3 | Terraform state | $1 |
| **Total** | | **~$204/month** |

### Cost Optimization Tips:
- Use **Spot Instances** for non-prod: saves 60-70%
- Start with **Single-AZ RDS** (saves $15/month)
- Use **t3.small** nodes if traffic is low (saves $30/month)
- **Minimum viable**: ~$120/month with optimizations

---

## Useful Commands

```bash
# === Docker ===
docker-compose up -d                    # Start all services locally
docker-compose logs -f api              # View API logs
docker-compose down                     # Stop all services

# === Kubernetes ===
kubectl get pods -n prakruthi           # List pods
kubectl describe pod <pod-name> -n prakruthi  # Pod details
kubectl logs <pod-name> -n prakruthi    # Pod logs
kubectl exec -it <pod-name> -n prakruthi -- sh  # Shell into pod
kubectl scale deployment prakruthi-api --replicas=3 -n prakruthi  # Scale

# === Terraform ===
terraform plan                          # Preview changes
terraform apply                         # Apply changes
terraform destroy                       # Tear down everything

# === AWS ===
aws eks list-clusters                   # List EKS clusters
aws ecr list-images --repository-name prakruthi/api  # List images
aws rds describe-db-instances           # Database info
```
