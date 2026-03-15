#!/bin/bash
set -e

echo "==============================================="
echo " Prisma DB Migration (Intel iMac)"
echo "==============================================="
echo ""

echo "Running migrate deploy inside the container..."
docker exec miracle-point-prod npx prisma migrate deploy

echo ""
echo "==============================================="
echo "✅ DB Migration Applied Successfully!"
echo "==============================================="
echo ""
