variable "vpc_cidr" {
  type        = string
  description = "The CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "prod"
}

variable "aws_region" {
  type        = string
  description = "AWS deployment region"
}

variable "single_nat_gateway" {
  type        = bool
  description = "Set to true to use a single NAT gateway to minimize cost"
  default     = true
}
