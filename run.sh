#!/bin/bash

echo "Starting Jenkins..."
docker start jenkins

echo ""
echo "Jenkins: http://localhost:8080"
echo "Go to Jenkins and click Build Now to start the app"
echo "App will be available at http://localhost:5173 after build"