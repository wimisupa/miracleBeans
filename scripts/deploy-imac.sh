#!/bin/bash
set -e

echo "==============================================="
echo " Deploying Miracle Point on Intel iMac (Direct Build)"
echo "==============================================="
echo ""

echo "Pulling latest changes from git..."
git pull origin main

echo ""
echo "Building and starting containers using docker-compose..."
docker-compose up -d --build

echo ""
echo "==============================================="
echo "✅ Deployment Successful!"
echo "==============================================="
echo "Miracle Point is now running on this iMac."
echo "Check the logs with: docker-compose logs -f miracle-point"
echo ""
