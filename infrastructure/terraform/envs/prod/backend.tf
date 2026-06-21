terraform {
  backend "s3" {
    # Replace these placeholders with the actual names output by the bootstrap step:
    bucket         = "mediguide-tf-state-tarui0jx"
    key            = "prod/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "mediguide-tf-locks"
    encrypt        = true
  }
}
