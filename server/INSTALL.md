# Installation Instructions for DeOldify

> **Note:** For easiest setup, consider using Docker instead. See the main [README.md](../../README.md) for Docker instructions.

DeOldify cannot be installed directly from PyPI. Follow these steps:

## Step 1: Install All Dependencies

Install all Python dependencies from requirements.txt:

```bash
cd server
pip install -r requirements.txt
```

This will install:
- Flask and flask-cors (web server)
- Pillow and numpy (image processing)
- PyTorch and torchvision (deep learning)
- FastAI (DeOldify dependency)
- IPython, opencv-python, ffmpeg-python, yt-dlp (DeOldify dependencies)
- setuptools<70 (required for Python 3.13+)

**For GPU (CUDA) support**, you may want to install PyTorch separately first:
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
pip install -r requirements.txt
```

## Step 4: Clone DeOldify

DeOldify must be cloned from GitHub (no pip installation needed):

```bash
cd server
git clone https://github.com/jantic/DeOldify.git
```

**Note:** This requires Git to be installed on your system. If you don't have Git:

1. Install Git from https://git-scm.com/download/win (Windows) or your system's package manager
2. Restart your terminal/PowerShell
3. Run the clone command above

The server will automatically detect and use DeOldify from the cloned folder - no pip installation needed!

## Verify Installation

Check if DeOldify can be imported:

```bash
cd server
python -c "import sys; sys.path.insert(0, 'DeOldify'); import deoldify; print('DeOldify ready!')"
```

If you see an error, make sure:
- DeOldify is cloned to `server/DeOldify`
- All dependencies are installed (torch, fastai, etc.)

## Troubleshooting

### "git is not recognized"
- Install Git from https://git-scm.com/download/win
- Restart your terminal after installation

### "Could not find a version that satisfies the requirement"
- Make sure you have the latest pip: `python -m pip install --upgrade pip`
- Try installing dependencies in order: PyTorch → FastAI → DeOldify

### Import errors after installation
- Make sure DeOldify is cloned to `server/DeOldify` directory
- Verify the path: `ls server/DeOldify/deoldify/` should show Python files
- Make sure you're running from the `server` directory or adjust the path

### "No module named 'pkg_resources'" (Python 3.13+)
- Install older setuptools: `pip install "setuptools<70"`
- This is required because `pkg_resources` was removed in newer setuptools versions

