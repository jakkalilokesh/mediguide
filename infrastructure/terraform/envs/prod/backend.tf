terraform {
  backend "s3" {
    # Replace these placeholders with the actual names output by the bootstrap step:
    bucket         = "mediguide-tf-state-mediguide"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "mediguide-tf-locks"
    encrypt        = true
  }
}
