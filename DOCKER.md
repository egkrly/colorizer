# Docker Setup Guide

This guide explains how to run the Image Colorizer server using Docker, eliminating the need for platform-specific installations.

## Quick Start

1. **Install Docker**: 
   - [Docker Desktop for Windows/Mac](https://www.docker.com/products/docker-desktop)
   - [Docker Engine for Linux](https://docs.docker.com/engine/install/)

2. **Build and run**:
   ```bash
   docker-compose up --build
   ```

3. **Access the server**: `http://localhost:3000`

That's it! The server will automatically:
- Install all Python dependencies
- Clone the DeOldify repository
- Download the model on first use (~1.4GB)

## Commands

### Start the server
```bash
docker-compose up
```

### Start in background (detached mode)
```bash
docker-compose up -d
```

### Stop the server
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Rebuild after code changes
```bash
docker-compose up --build
```

### Remove everything (including volumes)
```bash
docker-compose down -v
```

## Model Persistence

The model file (`ColorizeArtistic_gen.pth`) is stored in `server/DeOldify/models/` and is persisted via Docker volumes. This means:
- The model won't be re-downloaded on container restarts
- The model persists even if you remove the container
- To force re-download, delete `server/DeOldify/models/ColorizeArtistic_gen.pth`

## GPU Support (Optional)

For faster processing with NVIDIA GPUs:

1. **Install NVIDIA Container Toolkit**:
   - Follow the [official guide](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)

2. **Enable GPU in docker-compose.yml**:
   Uncomment the GPU section:
   ```yaml
   deploy:
     resources:
       reservations:
         devices:
           - driver: nvidia
             count: 1
             capabilities: [gpu]
   ```

3. **Rebuild and run**:
   ```bash
   docker-compose up --build
   ```

## Troubleshooting

### Port already in use
If port 3000 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Use 3001 on host, 3000 in container
```

### Out of disk space during build
The Docker image and model require ~5-6GB of space. If you get "You don't have enough free space" errors during build:

1. **Clean up unused Docker resources**:
   ```bash
   docker system prune -a --volumes -f
   ```

2. **Check Docker disk usage**:
   ```bash
   docker system df
   ```

3. **If still having issues**, you can use the cleanup script:
   ```bash
   ./docker-clean.sh
   ```

The Dockerfile uses `--no-install-recommends` to minimize package size, but ffmpeg (required by DeOldify) still pulls in many dependencies.

### Model download fails
If automatic model download fails, you can manually download it:
```bash
# Download the model
curl -L https://data.deepai.org/deoldify/ColorizeArtistic_gen.pth -o server/DeOldify/models/ColorizeArtistic_gen.pth
```

### Container won't start
Check logs for errors:
```bash
docker-compose logs
```

## Development

To modify the server code:

1. Edit files in `server/` directory
2. Rebuild the container:
   ```bash
   docker-compose up --build
   ```

Or use volume mounting for live code updates (add to docker-compose.yml):
```yaml
volumes:
  - ./server:/app/server
  - ./server/DeOldify/models:/app/server/DeOldify/models
```

Note: Volume mounting may cause issues with DeOldify imports. Rebuilding is recommended for production.
