resource "aws_ecr_repository" "app" {
  name                 = var.project_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
  }

  tags = {
    Name        = "${var.project_name}-ecr"
    Environment = var.environment
  }
}

resource "aws_ecr_lifecycle_policy" "policy" {
  repository = aws_ecr_repository.app.name

  policy = <<EOF
{
    "rules": [
        {
            "rulePriority": 1,
            "description": "Expire untagged images after 7 days",
            "selection": {
                "tagStatus": "untagged",
                "countType": "sinceImagePushed",
                "countUnit": "days",
                "countNumber": 7
            },
            "action": {
                "type": "expire"
            }
        },
        {
            "rulePriority": 2,
            "description": "Keep last 10 tagged images",
            "selection": {
                "tagStatus": "any",
                "countType": "imageCountMoreThan",
                "countNumber": 10
            },
            "action": {
                "type": "expire"
            }
        }
    ]
}
EOF
}
