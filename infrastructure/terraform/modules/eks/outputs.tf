output "cluster_name" {
  value       = aws_eks_cluster.main.name
  description = "The name of the cluster"
}

output "cluster_endpoint" {
  value       = aws_eks_cluster.main.endpoint
  description = "The endpoint of the cluster"
}

output "cluster_ca_certificate" {
  value       = aws_eks_cluster.main.certificate_authority[0].data
  description = "The base64 encoded cluster CA certificate"
}

output "node_security_group_id" {
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
  description = "Security group ID attached to EKS nodes"
}

output "oidc_provider_arn" {
  value       = aws_iam_openid_connect_provider.eks.arn
  description = "OIDC Provider ARN for IRSA"
}

output "oidc_provider_url" {
  value       = replace(aws_eks_cluster.main.identity[0].oidc[0].issuer, "https://", "")
  description = "OIDC Provider URL for IRSA (without https://)"
}
