# ✅ Production Deployment Guide - AWS Free Tier

## 🎯 Quick Start (30 Minutes)

This guide will help you deploy Prakruthi Natural Farms to AWS Free Tier at $0 cost for 12 months.

## 📋 Prerequisites
- AWS Account (free tier eligible)
- Docker Desktop installed
- AWS CLI installed (`aws configure` set up)
- Git repository pushed to GitHub

## 🚀 Step-by-Step Deployment

### STEP 1: Test Production Setup Locally (5 min)

```bash
# Create PostgreSQL database locally using Docker
docker-compose -f docker-compose.prod.yml up -d

# Wait for database to be ready
docker-compose -f docker-compose.prod.yml logs db

# Verify API health check
curl http://localhost:4000/health

# Open in browser
# Web: http://localhost:3000
# Admin: http://localhost:3001
```

If everything works locally, proceed to AWS.

### STEP 2: Create RDS Database (10 min)

```bash
# Create security group for RDS
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
  --group-name prakruthi-rds-sg \
  --description "Security group for Prakruthi RDS" \
  --query 'GroupId' --output text)

# Allow PostgreSQL access
aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 5432 \
  --cidr 0.0.0.0/0

# Create RDS instance (FREE TIER: t2.micro, 20GB storage)
aws rds create-db-instance \
  --db-instance-identifier prakruthi-db \
  --db-instance-class db.t2.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username prakruthi \
  --master-user-password YourStrongPassword123! \
  --allocated-storage 20 \
  --vpc-security-group-ids $SECURITY_GROUP_ID \
  --publicly-accessible \
  --no-multi-az \
  --backup-retention-period 7 \
  --region ap-south-1

# Wait 5-10 minutes for RDS to be available
# Check status:
aws rds describe-db-instances \
  --db-instance-identifier prakruthi-db \
  --query 'DBInstances[0].DBInstanceStatus' \
  --region ap-south-1
```

### STEP 3: Get RDS Endpoint

```bash
# Get the endpoint URL
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier prakruthi-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text \
  --region ap-south-1)

echo "RDS Endpoint: $RDS_ENDPOINT"

# Create database
psql -h $RDS_ENDPOINT -U prakruthi -d postgres -c "CREATE DATABASE prakruthi_db;"

# Verify
psql -h $RDS_ENDPOINT -U prakruthi -d prakruthi_db -c "\\dt"
```

### STEP 4: Setup ECR (5 min)

```bash
# Create ECR repositories
aws ecr create-repository --repository-name prakruthi/api --region ap-south-1
aws ecr create-repository --repository-name prakruthi/web --region ap-south-1
aws ecr create-repository --repository-name prakruthi/admin --region ap-south-1

# Get ECR login token
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin 266579819838.dkr.ecr.ap-south-1.amazonaws.com

# Build and push API image
docker build -t prakruthi/api -f services/api/Dockerfile .
docker tag prakruthi/api:latest 266579819838.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/api:latest
docker push 266579819838.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/api:latest

# Build and push Web image
docker build -t prakruthi/web -f apps/web/Dockerfile .
docker tag prakruthi/web:latest 266579819838.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/web:latest
docker push 266579819838.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/web:latest

# Build and push Admin image
docker build -t prakruthi/admin -f apps/admin/Dockerfile .
docker tag prakruthi/admin:latest 266579819838.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/admin:latest
docker push 266579819838.dkr.ecr.ap-south-1.amazonaws.com/prakruthi/admin:latest
```

### STEP 5: Launch EC2 Instance (5 min)

```bash
# Create security group for EC2
EC2_SG=$(aws ec2 create-security-group \
  --group-name prakruthi-ec2-sg \
  --description "Security group for Prakruthi EC2" \
  --query 'GroupId' --output text)

# Allow SSH, HTTP, HTTPS
aws ec2 authorize-security-group-ingress --group-id $EC2_SG --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $EC2_SG --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $EC2_SG --protocol tcp --port 443 --cidr 0.0.0.0/0

# Get latest Amazon Linux 2 AMI
AMI_ID="ami-0c55b159cbfafe1f0"  # Amazon Linux 2

# Launch t2.micro instance (FREE!)
aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type t2.micro \
  --security-group-ids $EC2_SG \
  --key-name my-key-pair \
  --region ap-south-1 \
  --monitoring Enabled=false

# Get instance ID and public IP
INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text)

PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
```

### STEP 6: Setup EC2 Instance

```bash
# SSH into EC2
ssh -i my-key-pair.pem ec2-user@$PUBLIC_IP

# On EC2 instance, run these commands:
sudo yum update -y
sudo yum install git -y

# Install Docker
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Exit SSH and reconnect to apply group changes
exit
ssh -i my-key-pair.pem ec2-user@$PUBLIC_IP

# Clone repository
git clone https://github.com/YOUR_USERNAME/prakruthi-natural-farms.git
cd prakruthi-natural-farms

# Create .env.production with RDS details
cat > .env.production << EOF
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://prakruthi:YourStrongPassword123@$RDS_ENDPOINT:5432/prakruthi_db"
NODE_ENV=production
PORT=4000
JWT_SECRET=$(openssl rand -base64 32)
CORS_ORIGIN="https://yourdomain.com,https://admin.yourdomain.com"
OTP_PROVIDER=mock
VITE_API_BASE_URL="https://api.yourdomain.com/api"
EOF

# Login to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin 266579819838.dkr.ecr.ap-south-1.amazonaws.com

# Create docker-compose override for production
cat > docker-compose.override.yml << EOF
version: '3.8'
services:
  api:
    environment:
      DATABASE_PROVIDER: \${DATABASE_PROVIDER}
      DATABASE_URL: \${DATABASE_URL}
      NODE_ENV: \${NODE_ENV}
      JWT_SECRET: \${JWT_SECRET}
      CORS_ORIGIN: \${CORS_ORIGIN}
  web:
    environment:
      VITE_API_BASE_URL: \${VITE_API_BASE_URL}
  admin:
    environment:
      VITE_API_BASE_URL: \${VITE_API_BASE_URL}
EOF

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check if everything started
docker-compose logs

# Test API health
curl http://localhost:4000/health
```

### STEP 7: Setup Domain & SSL

```bash
# If using Route53:
HOSTED_ZONE_ID="Z123456789ABC"  # Your hosted zone ID

# Create A record for API
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.yourdomain.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "'$PUBLIC_IP'"}]
      }
    }]
  }'

# Setup HTTPS with Let's Encrypt on EC2
# SSH back into EC2:
ssh -i my-key-pair.pem ec2-user@$PUBLIC_IP

# Install Certbot
sudo yum install certbot -y

# Get certificate
sudo certbot certonly --standalone -d api.yourdomain.com

# Update nginx configuration to use SSL certificate
```

## ✅ Verification Checklist

```bash
# Test API
curl https://api.yourdomain.com/health

# Test Web App
curl https://yourdomain.com

# Check container logs
docker-compose logs -f

# Monitor database
aws rds describe-db-instances --db-instance-identifier prakruthi-db
```

## 💰 Free Tier Cost Breakdown

| Service | Free Tier | Usage | Cost |
|---------|-----------|-------|------|
| EC2 t2.micro | 750 hrs/month | ~730 hrs | $0 |
| RDS db.t2.micro | 750 hrs/month | ~730 hrs | $0 |
| ECR | 500MB storage | ~200MB | $0 |
| Data Transfer | 100GB/month out | ~10GB | $0 |
| **Total** | | | **$0/month** |

**After 12 months**: ~$15-25/month

## 🚨 Troubleshooting

### Database Connection Failed
```bash
# Check if RDS is accessible
psql -h $RDS_ENDPOINT -U prakruthi -d prakruthi_db -c "SELECT 1"

# Make RDS publicly accessible if needed
aws rds modify-db-instance \
  --db-instance-identifier prakruthi-db \
  --publicly-accessible \
  --apply-immediately
```

### Container Failing to Start
```bash
# Check logs
docker-compose logs api

# Verify environment variables
docker-compose exec api env | grep DATABASE

# Check if migrations ran
docker-compose exec api npx prisma migrate status
```

### Domain Not Resolving
```bash
# Verify DNS record
nslookup api.yourdomain.com

# Check Route53 record
aws route53 list-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID
```

## 📞 Support

- AWS Free Tier: https://aws.amazon.com/free/
- Docker Docs: https://docs.docker.com/
- Prisma Migration: https://www.prisma.io/docs/concepts/components/prisma-migrate

**Ready to deploy? Start with STEP 1 above! 🚀**
