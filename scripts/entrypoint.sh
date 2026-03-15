#!/bin/sh
set -e

# Run Prisma migrations
echo "Running Prisma migrations..."
npx --yes prisma migrate deploy

# Start the application
echo "Starting the application..."
exec node server.js
