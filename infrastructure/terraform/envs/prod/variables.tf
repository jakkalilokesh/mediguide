variable "aws_region" {
  type        = string
  default     = "ap-southeast-1"
  description = "The target AWS deployment region"
}

variable "project_name" {
  type        = string
  default     = "mediguide"
  description = "Project name tag and naming prefix"
}

variable "environment" {
  type        = string
  default     = "prod"
  description = "Deployment stage name"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "The CIDR block for the production VPC"
}

variable "db_instance_class" {
  type        = string
  default     = "db.t3.micro"
  description = "RDS DB instance class"
}

variable "db_allocated_storage" {
  type        = number
  default     = 20
  description = "RDS DB allocated storage in GB"
}

variable "k8s_version" {
  type        = string
  default     = "1.31"
  description = "Target Kubernetes version for EKS"
}

variable "node_instance_type" {
  type        = string
  default     = "t3.medium"
  description = "Instance type for EKS worker nodes"
}

variable "single_nat_gateway" {
  type        = bool
  default     = true
  description = "Set to true to minimize NAT gateway resources cost"
}

variable "db_multi_az" {
  type        = bool
  default     = false
  description = "Set to true to deploy database across multiple AZs for high availability. Note: Doubles RDS instance costs."
}

variable "git_repo_url" {
  type        = string
  default     = "https://github.com/mediguide/mediguide.git"
  description = "The repository URL for ArgoCD to pull K8s manifests from"
}
