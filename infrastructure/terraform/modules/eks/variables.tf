variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "vpc_id" {
  type        = string
  description = "The ID of the VPC"
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "List of public subnet IDs"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "List of private subnet IDs for node placement"
}

variable "k8s_version" {
  type        = string
  default     = "1.28"
  description = "Kubernetes control plane version"
}

variable "node_instance_type" {
  type        = string
  default     = "t3.medium"
  description = "Instance type for EKS managed node group"
}

variable "node_min_size" {
  type        = number
  default     = 2
  description = "Minimum size of EKS node group"
}

variable "node_max_size" {
  type        = number
  default     = 5
  description = "Maximum size of EKS node group"
}

variable "node_desired_size" {
  type        = number
  default     = 2
  description = "Desired size of EKS node group"
}
