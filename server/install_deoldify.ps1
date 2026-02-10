Write-Host "Installing DeOldify and dependencies..." -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Installing base dependencies..." -ForegroundColor Yellow
pip install Flask>=3.0.0 flask-cors>=4.0.0 Pillow>=10.2.0 numpy>=1.26.0

Write-Host ""
Write-Host "Step 2: Installing PyTorch..." -ForegroundColor Yellow
pip install torch torchvision

Write-Host ""
Write-Host "Step 3: Installing FastAI..." -ForegroundColor Yellow
pip install fastai>=2.7.0

Write-Host ""
Write-Host "Step 4: Installing DeOldify..." -ForegroundColor Yellow
Write-Host "Cloning DeOldify repository (no pip installation needed)..." -ForegroundColor Cyan

if (Test-Path "DeOldify") {
    Write-Host "DeOldify directory already exists, removing it..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "DeOldify"
}

git clone https://github.com/jantic/DeOldify.git
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Git clone failed. Make sure Git is installed." -ForegroundColor Red
    Write-Host "Download Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "DeOldify cloned successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "NOTE: DeOldify will be used directly from the cloned folder." -ForegroundColor Yellow
Write-Host "No pip installation needed - the server will automatically find it." -ForegroundColor Yellow
$deoldifyPath = (Resolve-Path ".").Path + "\DeOldify"
Write-Host "The DeOldify folder is located at: $deoldifyPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Verify installation by running:" -ForegroundColor Cyan
Write-Host "python -c `"import sys; sys.path.insert(0, r'$deoldifyPath'); import deoldify; print('DeOldify ready!')`"" -ForegroundColor Cyan

