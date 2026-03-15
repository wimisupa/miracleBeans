#!/bin/sh
set -ex

echo "--- Debug Info ---"
echo "Current User: $(id)"
echo "DATABASE_URL: $DATABASE_URL"
echo "Working Directory: $(pwd)"
ls -la prisma

# Check if the database directory is writable
DB_DIR=$(dirname "${DATABASE_URL#file:}")
echo "Checking writability of $DB_DIR"
if [ -w "$DB_DIR" ]; then
  echo "Directory $DB_DIR is writable."
else
  echo "ERROR: Directory $DB_DIR is NOT writable by $(id)"
fi

# Run Prisma migrations
echo "Running Prisma migrations..."
npx --yes prisma@5.22.0 migrate deploy

# Start the application
echo "Starting the application..."
exec node server.js
