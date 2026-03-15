#!/bin/sh
set -e

# Sync the database schema
echo "Syncing database schema (db push)..."
npx --yes prisma@5.22.0 db push --skip-generate

# Start the application
echo "Starting the application..."
exec node server.js
