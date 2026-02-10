#!/bin/bash
# Clean Docker to free up space
echo "Cleaning Docker build cache and unused resources..."
docker system prune -a --volumes -f
echo "Done! You can now rebuild with: docker-compose build --no-cache"
