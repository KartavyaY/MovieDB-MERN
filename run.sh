#!/bin/bash

# Load credentials from .env (not committed to git)
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

JENKINS_URL="http://localhost:8080"
JENKINS_JOB="Movie-DB"

echo "Starting Jenkins..."
docker start jenkins

echo "Fixing Docker socket permissions..."
docker exec -u root jenkins chmod 666 /var/run/docker.sock

echo "Waiting for Jenkins to be ready..."
until curl -s -o /dev/null -w "%{http_code}" "$JENKINS_URL/login" | grep -q "200"; do
  sleep 3
done

echo "Triggering build..."
CRUMB=$(curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" \
  "$JENKINS_URL/crumbIssuer/api/json" | grep -o '"crumb":"[^"]*"' | cut -d'"' -f4)

curl -s -X POST -u "$JENKINS_USER:$JENKINS_TOKEN" \
  -H "Jenkins-Crumb: $CRUMB" \
  "$JENKINS_URL/job/$JENKINS_JOB/build"

echo ""
echo "Jenkins: $JENKINS_URL"
echo "Build triggered for job: $JENKINS_JOB"
echo "App will be available at http://localhost:5173 after build"