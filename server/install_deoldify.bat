@echo off
echo Installing DeOldify and dependencies...
echo.

echo Step 1: Installing base dependencies...
pip install Flask>=3.0.0 flask-cors>=4.0.0 Pillow>=10.2.0 numpy>=1.26.0

echo.
echo Step 2: Installing PyTorch...
pip install torch torchvision

echo.
echo Step 3: Installing FastAI...
pip install fastai>=2.7.0

echo.
echo Step 4: Installing DeOldify...
echo Cloning DeOldify repository (no pip installation needed)...
if exist DeOldify (
    echo DeOldify directory already exists, removing it...
    rmdir /s /q DeOldify
)
git clone https://github.com/jantic/DeOldify.git
if errorlevel 1 (
    echo ERROR: Git clone failed. Make sure Git is installed.
    echo Download Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo.
echo DeOldify cloned successfully!
echo.
echo NOTE: DeOldify will be used directly from the cloned folder.
echo No pip installation needed - the server will automatically find it.
echo The DeOldify folder is located at: %CD%\DeOldify
echo.
echo Installation complete!
echo.
echo Verify installation by running:
echo python -c "import sys; sys.path.insert(0, r'%CD%\DeOldify'); import deoldify; print('DeOldify ready!')"
pause

