# Quick DeOldify Installation (No Pip Install Needed)

Since DeOldify's setup.py has a bug, we'll just clone it and use it directly.

## Simple 3-Step Installation

### Step 1: Install Dependencies Only
```bash
pip install Flask>=3.0.0 flask-cors>=4.0.0 Pillow>=10.2.0 numpy>=1.26.0 torch torchvision fastai>=2.7.0
```

### Step 2: Clone DeOldify (No Installation!)
```bash
cd server
git clone https://github.com/jantic/DeOldify.git
```

That's it! The server will automatically find and use DeOldify from the cloned folder.

### Step 3: Verify
```bash
python -c "import sys; sys.path.insert(0, 'DeOldify'); import deoldify; print('Success!')"
```

## Why This Works

The `colorizer.py` file automatically adds the `DeOldify` folder to Python's path if it exists in the `server` directory. No pip installation needed!

## If Git Clone Fails

If you don't have Git installed:
1. Download Git: https://git-scm.com/download/win
2. Install it
3. Restart your terminal
4. Run the clone command again

Or download DeOldify as a ZIP:
1. Go to: https://github.com/jantic/DeOldify
2. Click "Code" → "Download ZIP"
3. Extract it to `server/DeOldify`

