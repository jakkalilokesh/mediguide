# 🏥 MediGuide — Minikube Deployment Guide

This guide walks you through deploying the **MediGuide** full-stack application into a local **Minikube** Kubernetes cluster.

---

## 📋 Prerequisites

| Tool | Purpose | Install Link |
|------|---------|--------------|
| **Docker** | Build container images | https://docs.docker.com/get-docker/ |
| **Minikube** | Local Kubernetes cluster | https://minikube.sigs.k8s.io/docs/start/ |
| **kubectl** | Kubernetes CLI | https://kubernetes.io/docs/tasks/tools/ |

> **Windows users:** Make sure Docker Desktop is running and its Kubernetes integration is enabled (optional — Minikube can use its own Docker daemon).

---

## 🔧 Step 1: Start Minikube

Open a terminal and start Minikube with sufficient resources:

```bash
minikube start --driver=docker --memory=4096 --cpus=2
```

> **Why 4GB RAM?** The Node.js backend + React frontend build inside the container need adequate memory.

Verify the cluster is ready:

```bash
kubectl cluster-info
kubectl get nodes
```

---

## 🐳 Step 2: Build the Docker Image

You have **two options**. Pick the one that fits your workflow.

### Option A: Build inside Minikube's Docker daemon (recommended for local testing)

This avoids needing a Docker registry because the image is built directly into Minikube's internal Docker.

```bash
# Point your shell to Minikube's Docker daemon
eval $(minikube docker-env)

# Build the image (run from the project root)
docker build -t mediguide:latest .

# Verify the image was built
docker images | grep mediguide

# IMPORTANT: Return your shell to normal Docker context when done
eval $(minikube docker-env -u)
```

> **Windows PowerShell users:** Use `minikube docker-env | Invoke-Expression` instead of `eval`.

### Option B: Build locally and push to a registry

If you want to use a registry (Docker Hub, GitHub Container Registry, etc.):

```bash
# Build with your registry prefix
docker build -t YOUR_USERNAME/mediguide:latest .

# Push to registry
docker push YOUR_USERNAME/mediguide:latest
```

Then edit `k8s/deployment.yaml` and change:

```yaml
image: YOUR_USERNAME/mediguide:latest
imagePullPolicy: Always   # <— change from IfNotPresent
```

---

## 🔐 Step 3: Configure Secrets

The app requires API keys for the LLM provider and a JWT signing secret.

### Option 1: Edit the YAML directly (quick, but secret is in plain text in the file)

Open `k8s/secret.yaml` and replace the placeholder values:

```yaml
stringData:
  GROQ_API_KEY: "gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  JWT_SECRET:   "a-very-strong-random-secret-string-min-32-chars"
```

### Option 2: Create the secret imperatively (recommended, leaves no secrets in files)

```bash
kubectl create secret generic mediguide-secrets \
  --from-literal=GROQ_API_KEY='gsk_your_groq_api_key_here' \
  --from-literal=JWT_SECRET='a-very-strong-random-secret-string-min-32-chars' \
  --namespace mediguide
```

If you use Option 2, **delete or skip applying** `k8s/secret.yaml` to avoid overwriting your imperative secret.

---

## 🚀 Step 4: Deploy to Kubernetes

### Method A: One-command deploy with Kustomize (recommended)

```bash
kubectl apply -k k8s/
```

### Method B: Apply files individually

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml      # skip if you created the secret imperatively
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### Optional: Enable Ingress

If you want a custom domain (`mediguide.local`) instead of using NodePort:

```bash
minikube addons enable ingress
kubectl apply -f k8s/ingress.yaml
```

Add to your system's hosts file:

```
# On Linux/macOS: /etc/hosts
# On Windows:     C:\Windows\System32\drivers\etc\hosts
$(minikube ip)  mediguide.local
```

---

## ✅ Step 5: Verify the Deployment

### Check all resources

```bash
kubectl get all -n mediguide
```

Expected output:

```
NAME                            READY   STATUS    RESTARTS   AGE
pod/mediguide-xxxxxxxxx-xxxxx   1/1     Running   0          2m

NAME                TYPE       CLUSTER-IP     EXTERNAL-IP   PORT(S)          AGE
service/mediguide   NodePort   10.x.x.x       <none>        5000:30080/TCP   2m

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/mediguide  1/1     1            1           2m
```

### Check logs (if something is wrong)

```bash
kubectl logs -n mediguide -l app=mediguide --tail=50 -f
```

### Check persistent volumes

```bash
kubectl get pvc -n mediguide
```

Both `db-data` and `session-data` should show `Bound`.

---

## 🌐 Step 6: Access the Application

### Method A: NodePort (simplest, no Ingress required)

```bash
minikube service mediguide -n mediguide --url
```

Or manually:

```bash
echo http://$(minikube ip):30080
```

Open the URL in your browser.

### Method B: Ingress (if you enabled it)

Simply navigate to:

```
http://mediguide.local
```

### Method C: Port-forward (for quick debugging)

```bash
kubectl port-forward -n mediguide svc/mediguide 8080:5000
```

Then open http://localhost:8080

---

## 🧪 Step 7: Test the API & Health Check

```bash
# Health check
curl http://$(minikube ip):30080/api/health

# Start a session
curl -X POST http://$(minikube ip):30080/api/start
```

---

## 🔄 Updating the App

After making code changes:

```bash
# 1. Rebuild the image inside Minikube's Docker
eval $(minikube docker-env)
docker build -t mediguide:latest .
eval $(minikube docker-env -u)

# 2. Restart the deployment to pull the new image
kubectl rollout restart deployment/mediguide -n mediguide

# 3. Watch the rollout
kubectl rollout status deployment/mediguide -n mediguide
```

> **Note:** `imagePullPolicy: IfNotPresent` allows the already-built local image to be used. If you push to a remote registry, change the policy to `Always`.

---

## 🧹 Cleanup / Teardown

To remove everything:

```bash
# Delete all MediGuide resources
kubectl delete -k k8s/

# Or delete the entire namespace
kubectl delete namespace mediguide

# Stop Minikube
minikube stop

# Delete Minikube cluster entirely
minikube delete
```

---

## 🛠 Troubleshooting

### Pod stuck in `Pending`

```bash
kubectl describe pod -n mediguide -l app=mediguide
```

- Check if PVCs are bound: `kubectl get pvc -n mediguide`
- If using Docker Desktop on Windows, ensure WSL2 backend has enough disk space.

### Pod stuck in `CrashLoopBackOff`

```bash
kubectl logs -n mediguide -l app=mediguide --previous
```

Common causes:
- Missing `GROQ_API_KEY` or `JWT_SECRET` → check `kubectl get secret -n mediguide`
- SQLite permission denied → `fsGroup: 1000` in deployment should handle this
- Port conflict → Ensure no other service uses NodePort `30080`

### `ImagePullBackOff` error

- If using `mediguide:latest` built inside Minikube: make sure `imagePullPolicy: IfNotPresent`
- If using a remote registry: make sure you pushed the image and set `imagePullPolicy: Always`

### Cannot access `$(minikube ip):30080` from browser

```bash
# Test from inside Minikube
minikube ssh -- curl -s http://localhost:30080/api/health

# If that works but host doesn't, check your firewall / Docker Desktop network settings
```


  ```bash
  kubectl delete deployment mediguide -n mediguide
  kubectl apply -f k8s/deployment.yaml
  ```

---

## 📁 Manifest Summary

| File | What it does |
|------|--------------|
| `k8s/namespace.yaml` | Creates the `mediguide` namespace |
| `k8s/secret.yaml` | Holds `GROQ_API_KEY` and `JWT_SECRET` |
| `k8s/configmap.yaml` | Holds non-sensitive environment variables |
| `k8s/pvc.yaml` | Two PersistentVolumeClaims for SQLite DB & session data |
| `k8s/deployment.yaml` | Runs the app container (1 replica, probes, volumes) |
| `k8s/service.yaml` | Exposes the app via NodePort `30080` |
| `k8s/ingress.yaml` | Optional Ingress rule for `mediguide.local` |
| `k8s/kustomization.yaml` | Kustomize file for one-command deployment |

---

## 🚀 Next Steps (Production Hardening)

1. **External Database**: Replace SQLite with PostgreSQL or MySQL and use a `StatefulSet` or managed DB.
2. **Multiple Replicas**: Once you have an external DB, you can safely scale `replicas` > 1.
3. **HTTPS / TLS**: Use `cert-manager` with Let's Encrypt for automatic TLS certificates on Ingress.
4. **Horizontal Pod Autoscaler (HPA)**: Auto-scale based on CPU/memory usage.
5. **Monitoring**: Deploy Prometheus + Grafana to track pod health and API metrics.

---

<div align="center">

**Built with 💚 for better health**

</div>

