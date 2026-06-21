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

variable "private_subnet_ids" {
  type        = list(string)
  description = "List of private subnet IDs for DB Subnet Group"
}

variable "app_security_group_id" {
  type        = string
  description = "Security group of the app/EKS nodes allowed to connect to MySQL"
}

variable "db_instance_class" {
  type        = string
  default     = "db.t3.micro"
  description = "RDS instance class"
}

variable "db_allocated_storage" {
  type        = number
  default     = 20
  description = "Allocated storage in GB"
}

variable "db_name" {
  type        = string
  default     = "mediguidedb"
  description = "Name of the default database"
}

variable "db_user" {
  type        = string
  default     = "mediguide"
  description = "Master username"
}

variable "multi_az" {
  type        = bool
  default     = false
  description = "Set to true to enable Multi-AZ deployment for HA. Note: This doubles the RDS cost."
}
