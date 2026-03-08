#!/bin/bash
# ============================================================
# create-secrets.sh
# Reads Firebase credentials from backend/.env and creates
# the 'backend-secrets' Kubernetes Secret in the moviedb namespace.
#
# Run this ONCE before deploying, or re-run to update secrets.
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../backend/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ ERROR: backend/.env not found at: $ENV_FILE"
  echo "   Make sure the file exists before running this script."
  exit 1
fi

echo "📖 Reading credentials from backend/.env..."

# Extract values from .env without 'source' to avoid side effects
get_env_val() {
  grep -E "^$1=" "$ENV_FILE" | head -1 | sed "s/^$1=//" | sed 's/^"//' | sed 's/"$//'
}

FIREBASE_PROJECT_ID=$(get_env_val "FIREBASE_PROJECT_ID")
FIREBASE_CLIENT_EMAIL=$(get_env_val "FIREBASE_CLIENT_EMAIL")
# Private key spans multiple lines; extract with a broader approach
FIREBASE_PRIVATE_KEY=$(python3 -c "
import re, sys
content = open('$ENV_FILE').read()
m = re.search(r'FIREBASE_PRIVATE_KEY=\"(.+?)\"', content, re.DOTALL)
if m:
    print(m.group(1))
else:
    sys.exit(1)
" 2>/dev/null) || {
  echo "❌ ERROR: Could not extract FIREBASE_PRIVATE_KEY from .env"
  exit 1
}

if [ -z "$FIREBASE_PROJECT_ID" ] || [ -z "$FIREBASE_CLIENT_EMAIL" ] || [ -z "$FIREBASE_PRIVATE_KEY" ]; then
  echo "❌ ERROR: One or more required Firebase values are empty in backend/.env"
  echo "   Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
  exit 1
fi

echo "🔐 Creating/updating 'backend-secrets' in namespace 'moviedb'..."

kubectl create secret generic backend-secrets \
  --namespace=moviedb \
  --from-literal=FIREBASE_PROJECT_ID="$FIREBASE_PROJECT_ID" \
  --from-literal=FIREBASE_CLIENT_EMAIL="$FIREBASE_CLIENT_EMAIL" \
  --from-literal=FIREBASE_PRIVATE_KEY="$FIREBASE_PRIVATE_KEY" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "✅ backend-secrets created/updated successfully."

# ── Frontend ConfigMap (Firebase client config) ────────────
FRONTEND_ENV_FILE="$SCRIPT_DIR/../frontend/.env"

if [ ! -f "$FRONTEND_ENV_FILE" ]; then
  echo "❌ ERROR: frontend/.env not found at: $FRONTEND_ENV_FILE"
  exit 1
fi

echo "📖 Reading Firebase client config from frontend/.env..."

# Export vars so envsubst can see them
set -a
# shellcheck source=/dev/null
source "$FRONTEND_ENV_FILE"
set +a

echo "🔧 Applying frontend ConfigMap with substituted values..."
envsubst < "$SCRIPT_DIR/frontend/configmap.yaml" | kubectl apply -f -

echo "✅ frontend-config ConfigMap created/updated successfully."
