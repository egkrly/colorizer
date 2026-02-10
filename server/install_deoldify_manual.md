# Manual DeOldify Installation (Alternative Method)

If the automated installation scripts fail, follow these manual steps:

## Step 1: Install Dependencies

```bash
pip install Flask>=3.0.0 flask-cors>=4.0.0 Pillow>=10.2.0 numpy>=1.26.0
pip install torch torchvision
pip install fastai>=2.7.0
```

## Step 2: Clone DeOldify

```bash
cd server
git clone https://github.com/jantic/DeOldify.git
```

## Step 3: Install DeOldify (Workaround for setup.py bug)

The DeOldify setup.py has a bug. Install it without dependencies:

```bash
cd DeOldify
pip install -e . --no-deps
cd ..
```

## Step 4: Verify Installation

```bash
python -c "import sys; sys.path.insert(0, 'DeOldify'); import deoldify; print('Success!')"
```

## Alternative: Use DeOldify Without Installation

If installation still fails, the `colorizer.py` will automatically detect DeOldify if it's in the `server/DeOldify` folder. Just make sure:

1. DeOldify is cloned to `server/DeOldify`
2. Dependencies (torch, fastai) are installed
3. The server will automatically add DeOldify to the Python path

## Troubleshooting

### "No module named 'deoldify'"
- Make sure DeOldify folder exists in `server/DeOldify`
- Check that dependencies are installed: `pip list | findstr torch`
- Try: `python -c "import sys; print(sys.path)"` to see Python paths

### "Git is not recognized"
- Install Git from https://git-scm.com/download/win
- Restart terminal after installation

### Setup.py errors
- Use the `--no-deps` flag: `pip install -e . --no-deps`
- Dependencies should already be installed from Step 1

