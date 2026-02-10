# Use Python 3.10 as base image (compatible with DeOldify and dependencies)
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
# Note: ffmpeg is large but required by DeOldify's visualize.py import
# Using --no-install-recommends to minimize size
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    wget \
    curl \
    ffmpeg \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy requirements first for better caching
COPY server/requirements.txt /app/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy server files first
COPY server/ /app/server/

# Clone DeOldify repository if it doesn't exist (in case user has it locally)
RUN if [ ! -d "/app/server/DeOldify" ]; then \
        git clone https://github.com/jantic/DeOldify.git /app/server/DeOldify; \
    fi

# Set working directory to server
WORKDIR /app/server

# Download model if it doesn't exist (will be done on first run if not pre-downloaded)
# The model download is handled automatically by colorizer.py if missing

# Expose port
EXPOSE 3000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py

# Run the server
CMD ["python", "app.py"]
