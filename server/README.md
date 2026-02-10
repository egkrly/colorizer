# Image Colorizer Server

Python Flask server for colorizing grayscale and black & white images using DeOldify.

## Setup

1. Install Python dependencies:

**Option A: Use the installation script (Recommended for Windows)**
```bash
# PowerShell
.\install_deoldify.ps1

# Or Command Prompt
install_deoldify.bat
```

**Option B: Manual installation**
```bash
# Install base dependencies
pip install -r requirements.txt

# Install DeOldify from GitHub (requires Git to be installed)
pip install git+https://github.com/jantic/DeOldify.git
```

**Important:** DeOldify cannot be installed from PyPI. It must be installed from GitHub using the command above. If you don't have Git installed, download it from https://git-scm.com/download/win

**Note:** Installing DeOldify and its dependencies (PyTorch, FastAI) may take several minutes and requires significant disk space (~2-3GB). The first run will also download pre-trained models automatically.

See `INSTALL.md` for detailed troubleshooting instructions.

2. Download the pre-trained model:
```bash
python download_model.py
```

This will download the `ColorizeArtistic_gen.pth` model file (~1.4GB) to `DeOldify/models/`. This only needs to be done once.

**Alternative:** You can manually download from:
- https://data.deepai.org/deoldify/ColorizeArtistic_gen.pth
- Place it in `server/DeOldify/models/` directory

3. Run the server:
```bash
python app.py
```

The server will start on `http://localhost:3000`. On first startup, DeOldify will load the pre-trained model.

**System Requirements:**
- Python 3.8+
- At least 4GB RAM (8GB+ recommended)
- GPU optional but recommended for faster processing (CUDA-compatible)
- ~3GB disk space for models and dependencies

## Endpoints

### GET /health
Health check endpoint to verify server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### POST /colorize
Colorize an image.

**Request:**
```json
{
  "image": "base64_encoded_image_string"
}
```

**Response:**
```json
{
  "success": true,
  "colorized_image": "base64_encoded_colorized_image_string"
}
```

## Colorization Model

This server uses **DeOldify** for high-quality image colorization. DeOldify is a state-of-the-art deep learning model specifically designed for colorizing and restoring old photographs.

### Model Details
- **Model Type**: Artistic colorizer (best quality)
- **Render Factor**: 35 (configurable in `colorizer.py`)
- **Device**: Automatically uses GPU if available, falls back to CPU

### Performance Tips
- **GPU**: Significantly faster processing (10-50x speedup)
- **CPU**: Works but slower, suitable for occasional use
- **Image Size**: Larger images take longer to process
- **First Run**: Model download happens automatically on first startup

## Notes

- The server accepts images in various formats (JPEG, PNG, etc.)
- Images are automatically converted to RGB mode
- Large images may take longer to process
- Consider adding image resizing for performance optimization

