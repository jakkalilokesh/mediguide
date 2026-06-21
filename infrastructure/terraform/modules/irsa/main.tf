data "aws_caller_identity" "current" {}

resource "aws_iam_role" "role" {
  name = "${var.project_name}-${var.role_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = var.oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${var.oidc_provider_url}:sub" : "system:serviceaccount:${var.namespace}:${var.service_account_name}",
            "${var.oidc_provider_url}:aud" : "sts.amazonaws.com"
          }
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.role_name}"
    Role        = var.role_name
    Project     = var.project_name
  }
}

resource "aws_iam_policy" "custom" {
  count       = var.policy_json != "" ? 1 : 0
  name        = "${var.project_name}-${var.role_name}-policy"
  description = "Custom policy for IRSA role ${var.role_name}"
  policy      = var.policy_json
}

resource "aws_iam_role_policy_attachment" "custom" {
  count      = var.policy_json != "" ? 1 : 0
  role       = aws_iam_role.role.name
  policy_arn = aws_iam_policy.custom[0].arn
}

resource "aws_iam_role_policy_attachment" "arn" {
  count      = var.policy_arn != "" ? 1 : 0
  role       = aws_iam_role.role.name
  policy_arn = var.policy_arn
}
