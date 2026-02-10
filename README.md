# Image Colorizer Browser Extension

A browser extension that colorizes grayscale and black & white images using AI. The extension communicates with a local Python server that processes images using machine learning models.

## Features

- Right-click on any image to colorize it
- In-place image replacement with colorized version
- Toggle button to switch between original and colorized images
- Works on any website
- Local processing via Python server

## Architecture

The solution consists of two components:

1. **Browser Extension** (Manifest V3) - Detects images, sends them to server, displays results
2. **Python Server** (Flask) - Receives images, colorizes using ML model, returns results

## Setup

### Option 1: Docker Setup (Recommended - Works on Windows, macOS, and Linux)

This is the easiest way to get started and avoids platform-specific dependency issues.

1. **Prerequisites**: Install [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)

2. **Build and run the container**:
```bash
docker-compose up --build
```

The server will start on `http://localhost:3000`. The first run will:
- Download all dependencies
- Clone the DeOldify repository
- Download the pre-trained model (~1.4GB) on first colorization request

3. **Stop the server**:
```bash
docker-compose down
```

**Note**: The model file will be persisted in `server/DeOldify/models/` so you don't need to re-download it on subsequent runs.

**GPU Support** (Optional): If you have an NVIDIA GPU and want to use it for faster processing:
1. Install [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)
2. Uncomment the GPU section in `docker-compose.yml`
3. Rebuild: `docker-compose up --build`

### Option 2: Manual Python Server Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Install DeOldify (choose one method):
   - **Windows**: Run `install_deoldify.bat` or `install_deoldify.ps1`
   - **macOS/Linux**: Run `./install_deoldify.sh`
   - **Manual**: `git clone https://github.com/jantic/DeOldify.git server/DeOldify`

4. Download the model (optional - will auto-download on first run):
```bash
python download_model.py
```

5. Start the server:
```bash
python app.py
```

The server will start on `http://localhost:3000`

### 2. Browser Extension Setup

1. Open your browser's extension management page:
   - **Chrome/Edge**: `chrome://extensions/` or `edge://extensions/`
   - **Firefox**: `about:addons` (Note: Firefox uses Manifest V2, may need adjustments)

2. Enable "Developer mode"

3. Click "Load unpacked" and select the `extension` folder

4. **Important**: Create icon files in `extension/icons/`:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

   You can use any PNG images with these dimensions as placeholders.

## Usage

1. Make sure the Python server is running:
   - **Docker**: `docker-compose up` (or already running in background)
   - **Manual**: `python server/app.py`

2. Navigate to any webpage with images

3. Right-click on a grayscale or black & white image

4. Select "Colorize Image" from the context menu

5. Wait for the image to be processed (a loading indicator will appear)

6. The image will be replaced with the colorized version

7. Click the "Show Original" button to toggle between original and colorized versions

## Advanced Colorization Models

This project uses **DeOldify** for high-quality image colorization. DeOldify is already integrated and configured:

- **Docker setup**: DeOldify is automatically installed and configured
- **Manual setup**: Follow the installation instructions in `server/README.md`

The DeOldify model provides state-of-the-art colorization results for grayscale and black & white images.


## File Structure

```
image-colorizer/
├── extension/
│   ├── manifest.json          # Extension configuration
│   ├── background.js          # Service worker for context menu
│   ├── content.js             # Image processing and UI injection
│   ├── popup.html             # Extension popup UI
│   ├── popup.js               # Popup functionality
│   ├── styles.css             # Styling for toggle controls
│   └── icons/                 # Extension icons (create these)
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── server/
│   ├── app.py                 # Flask server application
│   ├── colorizer.py           # Image colorization logic
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # Server-specific documentation
├── Dockerfile                  # Docker configuration
├── docker-compose.yml         # Docker Compose configuration
└── README.md                   # This file
```

## Troubleshooting

### Server Connection Issues

- Make sure the Python server is running on `localhost:3000`
- Check the extension popup for server connection status
- Verify firewall settings allow localhost connections

### Image Not Colorizing

- Check browser console for errors (F12)
- Verify the image is accessible (not blocked by CORS)
- Check server logs for processing errors
- Ensure image size is under 10MB (client limit) and 20MB (server limit)

### Extension Not Working

- Reload the extension in browser extension management
- Check that you're using a Manifest V3 compatible browser (Chrome 88+, Edge 88+)
- Verify all permissions are granted

## Limitations

- Images are limited to 10MB on client side, 20MB on server side
- Large images may take time to process (especially on CPU)
- Server must be running locally
- First model download is ~1.4GB
- GPU recommended for faster processing

## Development

### Testing the Extension

1. Start the server:
   - **Docker**: `docker-compose up`
   - **Manual**: `python server/app.py`
2. Load the extension in your browser
3. Test on various websites with grayscale images
4. Check browser console (F12) for any errors

### Modifying the Server

1. Edit files in `server/` directory
2. **Docker**: Rebuild with `docker-compose up --build`
3. **Manual**: Restart the server

## License

This project is open source. Feel free to modify and use as needed.

