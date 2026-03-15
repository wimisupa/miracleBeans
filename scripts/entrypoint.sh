#!/bin/sh
set -e

# Run Prisma migrations
echo "Running Prisma migrations..."
npx --yes prisma@5.22.0 migrate deploy

# Start the application
echo "Starting the application..."
exec node server.js
