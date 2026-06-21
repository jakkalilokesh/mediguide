# MediGuide Terraform Infrastructure

This directory contains the IaC (Infrastructure as Code) configuration for provisioning the AWS foundation for MediGuide.

## Structure

*   `bootstrap/`: One-time setup to create the S3 bucket and DynamoDB table for remote state storage.
*   `modules/`: Reusable components for `vpc`, `rds-mysql`, `ecr`, `eks`, `secrets`, and `irsa`.
*   `envs/prod/`: Production environment orchestration.

## How to Deploy

### 1. Initialize Remote State Bootstrap
Run the bootstrap setup to create the S3 state bucket and DynamoDB lock table:

```bash
cd terraform/bootstrap
terraform init
terraform apply
```

Note down the bucket name and table name from the outputs, and configure them in `terraform/envs/prod/backend.tf`.

### 2. Deploy Production Environment
Configure your secrets and local tfvars:

```bash
cd ../envs/prod
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your configuration

terraform init
terraform plan
terraform apply
```

### 3. Populating Secrets Manager
After deploying, the Secrets Manager entries are created as empty placeholders. Run the following to update them:

```bash
aws secretsmanager put-secret-value --secret-id mediguide-secrets --secret-string '{"GROQ_API_KEY":"gsk_xyz","JWT_SECRET":"securesecret","DB_PASSWORD":"securepassword123"}'
```
