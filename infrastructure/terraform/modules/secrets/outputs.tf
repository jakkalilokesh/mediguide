output "secret_arn" {
  value       = aws_secretsmanager_secret.app_secrets.arn
  description = "The ARN of the secret"
}

output "secret_name" {
  value       = aws_secretsmanager_secret.app_secrets.name
  description = "The name of the secret"
}
