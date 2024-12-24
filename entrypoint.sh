#!/bin/sh

# Make script executable
chmod +x /usr/share/nginx/entrypoint.sh

echo "Starting nginx..."
exec "$@"