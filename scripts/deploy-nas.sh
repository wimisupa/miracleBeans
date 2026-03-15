#!/bin/bash
set -e

# Configuration
IMAGE_NAME="ghcr.io/myshpapa/ohmycong:latest"

echo "==============================================="
echo " Deploying Miracle Point to GitHub Container Registry"
echo " Image: $IMAGE_NAME"
echo "==============================================="
echo ""

# Note: Assuming you are logged into ghcr.io
echo "Make sure you are logged into ghcr.io."
echo "If this fails with an authentication error, run: docker login ghcr.io -u <your_username>"

echo ""
echo "Building and pushing cross-platform image for NAS (linux/amd64)..."
echo "This might take a while depending on your Mac's performance and network connection."
echo "Command running: docker buildx build --platform linux/amd64 -t $IMAGE_NAME --push ."
echo ""

# Build and push the image using buildx for amd64 architecture
docker buildx build --platform linux/amd64 -t $IMAGE_NAME --push .

echo ""
echo "==============================================="
echo "✅ Deployment Successful!"
echo "==============================================="
echo "The image has been pushed to $IMAGE_NAME"
echo ""
echo "Next steps on your Synology NAS:"
echo "1. Ensure 'docker-compose.nas.yml' and '.env.production' are uploaded to your NAS folder."
echo "2. Run 'docker login ghcr.io' on the NAS if you haven't already."
echo "3. Run 'docker-compose -f docker-compose.nas.yml pull' to download the latest image."
echo "4. Run 'docker-compose -f docker-compose.nas.yml up -d' to start the services."
