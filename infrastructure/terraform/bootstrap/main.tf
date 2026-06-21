provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "ap-southeast-1"
}

variable "project_name" {
  type    = string
  default = "mediguide"
}

resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket" "state" {
  bucket        = "${var.project_name}-tf-state-${random_string.suffix.result}"
  force_destroy = false

  tags = {
    Name        = "Terraform State Bucket"
    Project     = var.project_name
    Environment = "bootstrap"
  }
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket = aws_s3_bucket.state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "locks" {
  name         = "${var.project_name}-tf-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name        = "Terraform Lock Table"
    Project     = var.project_name
    Environment = "bootstrap"
  }
}

output "state_bucket_name" {
  value       = aws_s3_bucket.state.id
  description = "Use this for bucket in backend configuration"
}

output "lock_table_name" {
  value       = aws_dynamodb_table.locks.name
  description = "Use this for dynamodb_table in backend configuration"
}
