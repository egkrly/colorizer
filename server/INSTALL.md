# Installation Instructions for DeOldify

DeOldify cannot be installed directly from PyPI. Follow these steps:

## Step 1: Install Base Dependencies

First, install the basic requirements (excluding DeOldify):

```bash
pip install Flask>=3.0.0 flask-cors>=4.0.0 Pillow>=10.2.0 numpy>=1.26.0
```

**Important for Python 3.13+:** Install an older version of setuptools that includes `pkg_resources`:

```bash
pip install "setuptools<70"
```

This is required because DeOldify's bundled fastai uses `pkg_resources`, which was removed in newer setuptools versions.

## Step 2: Install PyTorch

Install PyTorch (required for DeOldify). Choose the appropriate version:

**For CPU only:**
```bash
pip install torch torchvision
```

**For GPU (CUDA) support:**
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

## Step 3: Install FastAI

```bash
pip install fastai>=2.7.0
```

## Step 4: Install DeOldify from GitHub

DeOldify must be installed directly from GitHub:

```bash
pip install git+https://github.com/jantic/DeOldify.git
```

**Note:** This requires Git to be installed on your system. If you don't have Git:

1. Install Git from https://git-scm.com/download/win
2. Restart your terminal/PowerShell
3. Run the command above

## Alternative: Manual Installation

If the GitHub installation fails, you can clone and install manually:

```bash
git clone https://github.com/jantic/DeOldify.git
cd DeOldify
pip install -e .
cd ..
```

## Verify Installation

Check if DeOldify is installed:

```bash
python -c "import deoldify; print('DeOldify installed successfully')"
```

If you see an error, DeOldify is not properly installed.

## Troubleshooting

### "git is not recognized"
- Install Git from https://git-scm.com/download/win
- Restart your terminal after installation

### "Could not find a version that satisfies the requirement"
- Make sure you have the latest pip: `python -m pip install --upgrade pip`
- Try installing dependencies in order: PyTorch → FastAI → DeOldify

### Import errors after installation
- Make sure you're using the same Python environment
- Try: `python -m pip install git+https://github.com/jantic/DeOldify.git`

### "No module named 'pkg_resources'" (Python 3.13+)
- Install older setuptools: `pip install "setuptools<70"`
- This is required because `pkg_resources` was removed in newer setuptools versions

