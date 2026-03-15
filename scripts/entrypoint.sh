#!/bin/sh
set -ex

echo "--- Debug Info ---"
echo "Current User: $(id)"
echo "DATABASE_URL: $DATABASE_URL"
echo "Working Directory: $(pwd)"
echo "Prisma directory:"
ls -la prisma
echo "Data directory:"
ls -la /data

# Check if the database directory is writable
DB_DIR=$(dirname "${DATABASE_URL#file:}")
DB_FILE="${DATABASE_URL#file:}"

echo "Checking writability of $DB_DIR"
if [ -w "$DB_DIR" ]; then
  echo "Directory $DB_DIR is writable."
else
  echo "ERROR: Directory $DB_DIR is NOT writable by $(id)"
fi

if [ -f "$DB_FILE" ]; then
  echo "Database file exists. Size: $(ls -lh "$DB_FILE" | awk '{print $5}')"
else
  echo "Database file does not exist yet."
fi

# Sync the database schema
echo "Syncing database schema (db push)..."
npx --yes prisma@5.22.0 db push --skip-generate

# Start the application
echo "Starting the application..."
exec node server.js
