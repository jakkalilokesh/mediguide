output "db_instance_endpoint" {
  value       = aws_db_instance.mysql.endpoint
  description = "The connection endpoint"
}

output "db_instance_address" {
  value       = aws_db_instance.mysql.address
  description = "The database host address"
}

output "db_instance_port" {
  value       = aws_db_instance.mysql.port
  description = "The database port"
}

output "db_name" {
  value       = aws_db_instance.mysql.db_name
  description = "The database name"
}

output "db_username" {
  value       = aws_db_instance.mysql.username
  description = "The database username"
}

output "db_password" {
  value       = random_password.db_password.result
  sensitive   = true
  description = "The generated database password"
}
