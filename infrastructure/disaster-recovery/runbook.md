# MediGuide Disaster Recovery Runbook

This document details critical disaster recovery procedures for the MediGuide system deployed on AWS EKS and RDS.

---

## 1. Database Restoration (RDS MySQL)

In the event of database corruption or accidental deletion, follow these steps to restore the database from a point-in-time snapshot.

### Step 1: Identify the Target Snapshot
List available snapshots for the database:
```bash
aws rds describe-db-snapshots \
    --db-instance-identifier mediguide-prod-db \
    --query "DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime,Status]" \
    --output table
```

### Step 2: Restore DB Instance from Snapshot
Restore the database to a new instance identifier (RDS does not allow restoring directly onto an active identifier):
```bash
aws rds restore-db-instance-from-db-snapshot \
    --db-instance-identifier mediguide-prod-db-restored \
    --db-snapshot-identifier mediguide-prod-db-snapshot-name \
    --db-subnet-group-name mediguide-prod-db-subnet-group \
    --vpc-security-group-ids sg-xxxxxxxxxxxxxxxxx \
    --availability-zone us-east-1a
```

### Step 3: Verify and Swap Endpoints
1. Wait for the restored instance to reach `available` status:
   ```bash
   aws rds wait db-instance-available --db-instance-identifier mediguide-prod-db-restored
   ```
2. Update the hostname key `DB_HOST` in **AWS Secrets Manager**:
   ```bash
   NEW_HOST=$(aws rds describe-db-instances \
       --db-instance-identifier mediguide-prod-db-restored \
       --query "DBInstances[0].Endpoint.Address" --output text)

   # Fetch current JSON, update DB_HOST, write back
   SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id mediguide-secrets --query SecretString --output text)
   UPDATED_JSON=$(echo $SECRET_JSON | jq --arg host "$NEW_HOST" '.DB_HOST = $host')

   aws secretsmanager put-secret-value --secret-id mediguide-secrets --secret-string "$UPDATED_JSON"
   ```
3. Trigger a rollout restart of the pods to fetch the updated configuration:
   ```bash
   kubectl rollout restart deployment/mediguide -n mediguide
   ```

---

## 2. Multi-Region Failover Strategy (Active-Passive)

If the primary AWS region (`us-east-1`) experiences a complete outage, follow this checklist to failover to the secondary region (`us-west-2`).

### Phase 1: Pre-requisites (Continuous Sync)
- **RDS**: Multi-region read replica configured in `us-west-2` with active replication.
- **S3 (TF State & Backup)**: Cross-region replication enabled between primary and backup buckets.
- **ECR**: Cross-region registry replication enabled for ECR images.

### Phase 2: Promotion & DNS Routing Switch
1. **Promote the Read Replica** in `us-west-2` to a standalone primary database:
   ```bash
   aws rds promote-read-replica \
       --db-instance-identifier mediguide-prod-db-replica \
       --region us-west-2
   ```
2. **Apply Terraform Infrastructure** to the secondary region:
   ```bash
   cd terraform/envs/prod
   terraform init -backend-config="region=us-west-2"
   terraform apply -var="aws_region=us-west-2" -auto-approve
   ```
3. **ArgoCD Sync**: Direct the secondary ArgoCD instance to apply manifests to the new cluster.
4. **DNS Switch**: Update the Route 53 latency routing or failover records to route 100% of traffic to the `us-west-2` ALB endpoint.

---

## 3. Database Credentials Rotation

Run the automated script `disaster-recovery/rotate-db-secrets.sh` to update database passwords and safely rolling-restart all app nodes.
