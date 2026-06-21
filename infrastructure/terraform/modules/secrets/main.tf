resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "${var.project_name}-secrets"
  description             = "Application secrets and credentials for MediGuide"
  recovery_window_in_days = 0 # Forces immediate deletion upon destroy for development convenience

  tags = {
    Name        = "${var.project_name}-secrets"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "app_secrets_val" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    GROQ_API_KEY      = "placeholder_change_me"
    OPENAI_API_KEY    = "placeholder_change_me"
    GOOGLE_API_KEY    = "placeholder_change_me"
    DEEPSEEK_API_KEY  = "placeholder_change_me"
    JWT_SECRET        = "placeholder_change_me"
    DB_HOST           = var.db_host
    DB_NAME           = var.db_name
    DB_USER           = var.db_username
    DB_PASSWORD       = var.db_password
  })

  # Ignore changes to the secret string so manual updates out-of-band aren't reverted by Terraform
  lifecycle {
    ignore_changes = [
      secret_string
    ]
  }
}
