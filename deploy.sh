#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting MediGuide Minikube Deployment Process..."

# 1. Check if Minikube is running
if ! minikube status | grep -q "Running"; then
    echo "📦 Minikube is not running. Starting Minikube..."
    minikube start
else
    echo "✅ Minikube is already running."
fi

# 2. Build the Docker image inside Minikube's Docker daemon
echo "🔨 Building Docker image (this may take a few minutes if dependencies changed)..."
minikube image build -t jakkalilokesh/mediguide:latest .

# 3. Apply the Kubernetes manifests
echo "📝 Applying Kubernetes manifests..."
kubectl apply -k infrastructure/k8s

# 4. Rollout restart to ensure the new image is picked up
echo "🔄 Restarting the deployment to apply the new image..."
kubectl rollout restart deployment mediguide -n mediguide

# 5. Wait for the rollout to complete
echo "⏳ Waiting for pods to be ready..."
kubectl rollout status deployment mediguide -n mediguide

# 6. Verify the ReplicaSet is active
echo "📊 Checking ReplicaSet status (managed automatically by the Deployment):"
kubectl get replicaset -n mediguide

# 7. Expose the service
echo "🌐 Deployment successful! Exposing the service..."
echo "⚠️ Note: Since you are on Windows using the Docker driver, this command will block the terminal."
echo "Press Ctrl+C to stop the tunnel when you are done."
minikube service mediguide -n mediguide --url
