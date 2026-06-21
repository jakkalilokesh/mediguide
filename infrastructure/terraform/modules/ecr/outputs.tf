output "repository_url" {
  value       = aws_ecr_repository.app.repository_url
  description = "The URL of the repository"
}

output "repository_name" {
  value       = aws_ecr_repository.app.name
  description = "Name of the repository"
}

output "registry_id" {
  value       = aws_ecr_repository.app.registry_id
  description = "Registry ID of the repository"
}
