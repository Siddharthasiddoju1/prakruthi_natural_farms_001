# Production environment values
aws_region             = "ap-south-1"
environment            = "production"
project_name           = "prakruthi"
vpc_cidr               = "10.0.0.0/16"
db_instance_class      = "db.t3.micro"
eks_node_instance_type = "t3.medium"
eks_desired_capacity   = 2
eks_min_size           = 1
eks_max_size           = 4
domain_name            = "prakruthi.com"
