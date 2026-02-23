#!/bin/bash
# ============================================================
# apply-all.sh
# Full deployment of MovieDB to Docker Desktop Kubernetes.
# Run from the project root or the k8s/ directory.
#
# Usage:
#   bash k8s/apply-all.sh          # deploy everything
#   bash k8s/apply-all.sh --delete # tear everything down
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Teardown mode ──────────────────────────────────────────
if [[ "$1" == "--delete" ]]; then
  echo "🗑️  Tearing down MovieDB from Kubernetes..."
  kubectl delete namespace moviedb --ignore-not-found
  echo "✅ All MovieDB resources deleted."
  exit 0
fi

# ── Pre-flight checks ──────────────────────────────────────
echo "🔍 Checking prerequisites..."

if ! kubectl cluster-info &>/dev/null; then
  echo "❌ Cannot reach Kubernetes cluster."
  echo "   Make sure Docker Desktop is running and Kubernetes is enabled."
  echo "   Docker Desktop → Settings → Kubernetes → Enable Kubernetes"
  exit 1
fi

CONTEXT=$(kubectl config current-context)
echo "   ✅ Cluster context: $CONTEXT"

# Warn if not using docker-desktop context
if [[ "$CONTEXT" != "docker-desktop" ]]; then
  echo ""
  echo "   ⚠️  WARNING: Current context is '$CONTEXT', not 'docker-desktop'."
  echo "   To switch: kubectl config use-context docker-desktop"
  read -rp "   Continue anyway? [y/N] " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || exit 1
fi

# ── Build Docker images ────────────────────────────────────
echo ""
echo "🐳 Building Docker images..."

echo "   Building moviedb-backend:latest..."
docker build -t moviedb-backend:latest "$PROJECT_ROOT/backend" --quiet
echo "   ✅ moviedb-backend:latest built"

echo "   Building moviedb-frontend:latest..."
docker build -t moviedb-frontend:latest "$PROJECT_ROOT/frontend" --quiet
echo "   ✅ moviedb-frontend:latest built"

# ── Deploy ─────────────────────────────────────────────────
echo ""
echo "🚀 Deploying to Kubernetes..."

# 1. Namespace
echo "   [1/6] Creating namespace..."
kubectl apply -f "$SCRIPT_DIR/namespace.yaml"

# 2. Secrets (must exist before backend deployment)
echo "   [2/6] Creating secrets..."
bash "$SCRIPT_DIR/create-secrets.sh"

# 3. Backend
  echo "   [3/4] Deploying Backend..."  # MongoDB runs locally on the host
kubectl apply -f "$SCRIPT_DIR/backend/"

# 4. Wait for Backend
echo "   ⏳ Waiting for Backend to become ready..."
kubectl rollout status deployment/backend -n moviedb --timeout=120s

# 5. Frontend
echo "   [4/4] Deploying Frontend..."
kubectl apply -f "$SCRIPT_DIR/frontend/"

# 6. Wait for Frontend
echo "   ⏳ Waiting for Frontend to become ready..."
kubectl rollout status deployment/frontend -n moviedb --timeout=120s

# ── Summary ────────────────────────────────────────────────
echo ""
echo "✅ MovieDB deployed successfully on Docker Desktop Kubernetes!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🌐  Frontend : http://localhost:5173"
echo "  ⚙️   Backend  : http://localhost:5001"
echo "  🗄️   MongoDB  : localhost:27017 (host machine — not a pod)"
echo "  🩺  Health   : http://localhost:5001/api/health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Useful commands:"
echo "  kubectl get all -n moviedb              # view all resources"
echo "  kubectl logs -f deployment/backend -n moviedb"
echo "  kubectl logs -f deployment/frontend -n moviedb"
echo "  mongosh mongodb://localhost:27017/movie-browser  # connect to local MongoDB"
echo ""
echo "  To teardown: bash k8s/apply-all.sh --delete"
