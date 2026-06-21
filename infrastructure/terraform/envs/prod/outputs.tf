output "vpc_id" {
  value       = module.vpc.vpc_id
  description = "The ID of the VPC"
}

output "ecr_repository_url" {
  value       = module.ecr.repository_url
  description = "The URL of the ECR repository"
}

output "eks_cluster_name" {
  value       = module.eks.cluster_name
  description = "The name of the EKS cluster"
}

output "eks_cluster_endpoint" {
  value       = module.eks.cluster_endpoint
  description = "The endpoint of the EKS cluster"
}

output "rds_endpoint" {
  value       = module.rds.db_instance_endpoint
  description = "The RDS MySQL connection endpoint"
}

output "secrets_manager_arn" {
  value       = module.secrets.secret_arn
  description = "The ARN of the app secrets in Secrets Manager"
}

output "irsa_alb_role_arn" {
  value       = module.irsa_alb.role_arn
  description = "IAM Role ARN for AWS Load Balancer Controller"
}

output "irsa_eso_role_arn" {
  value       = module.irsa_eso.role_arn
  description = "IAM Role ARN for External Secrets Operator"
}

output "irsa_fluentbit_role_arn" {
  value       = module.irsa_fluentbit.role_arn
  description = "IAM Role ARN for Fluent Bit"
}
