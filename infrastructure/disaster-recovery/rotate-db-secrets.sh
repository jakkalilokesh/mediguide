#!/usr/bin/env bash
# ==============================================================================
# MediGuide RDS MySQL & Secrets Manager Password Rotation Script
# ==============================================================================
set -euo pipefail

DB_INSTANCE_ID="mediguide-prod-db"
SECRET_ID="mediguide-secrets"
AWS_REGION="us-east-1"
NAMESPACE="mediguide"

echo "🏥 Generating new secure database password..."
NEW_PASSWORD=$(openssl rand -base64 18 | tr -dc 'a-zA-Z0-9' | head -c 16)

echo "🏥 Updating master password on RDS instance: ${DB_INSTANCE_ID}..."
aws rds modify-db-instance \
    --db-instance-identifier "${DB_INSTANCE_ID}" \
    --master-user-password "${NEW_PASSWORD}" \
    --apply-immediately \
    --region "${AWS_REGION}"

echo "🏥 Waiting for RDS instance modifications to apply (this can take a moment)..."
aws rds wait db-instance-available \
    --db-instance-identifier "${DB_INSTANCE_ID}" \
    --region "${AWS_REGION}"

echo "🏥 Fetching current configuration from Secrets Manager..."
CURRENT_SECRET_JSON=$(aws secretsmanager get-secret-value \
    --secret-id "${SECRET_ID}" \
    --region "${AWS_REGION}" \
    --query SecretString --output text)

echo "🏥 Injecting new DB_PASSWORD into secret JSON structure..."
UPDATED_SECRET_JSON=$(echo "${CURRENT_SECRET_JSON}" | jq --arg pw "${NEW_PASSWORD}" '.DB_PASSWORD = $pw')

echo "🏥 Pushing updated configuration to Secrets Manager..."
aws secretsmanager put-secret-value \
    --secret-id "${SECRET_ID}" \
    --secret-string "${UPDATED_SECRET_JSON}" \
    --region "${AWS_REGION}"

echo "🏥 Forcing rolling-restart of MediGuide pods to fetch new credentials..."
kubectl rollout restart deployment/mediguide -n "${NAMESPACE}"
kubectl rollout status deployment/mediguide -n "${NAMESPACE}" --timeout=5m

echo "✅ Database secrets rotation completed successfully!"
