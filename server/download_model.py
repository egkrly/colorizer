"""
Download DeOldify pre-trained model weights.
"""

import os
import urllib.request
from pathlib import Path

def download_model():
    """Download the ColorizeArtistic_gen.pth model file."""
    # Model URL
    model_url = "https://data.deepai.org/deoldify/ColorizeArtistic_gen.pth"
    
    # Determine the models directory
    current_dir = Path(__file__).parent
    deoldify_dir = current_dir / "DeOldify"
    models_dir = deoldify_dir / "models"
    model_path = models_dir / "ColorizeArtistic_gen.pth"
    
    # Create models directory if it doesn't exist
    models_dir.mkdir(parents=True, exist_ok=True)
    
    # Check if model already exists
    if model_path.exists():
        print(f"Model already exists at: {model_path}")
        print("Skipping download.")
        return str(model_path)
    
    print(f"Downloading DeOldify model from: {model_url}")
    print(f"Destination: {model_path}")
    print("This may take several minutes (file is ~1.4GB)...")
    
    try:
        # Download with progress
        def show_progress(block_num, block_size, total_size):
            downloaded = block_num * block_size
            percent = min(downloaded * 100 / total_size, 100)
            print(f"\rProgress: {percent:.1f}% ({downloaded / (1024*1024):.1f} MB / {total_size / (1024*1024):.1f} MB)", end='', flush=True)
        
        urllib.request.urlretrieve(model_url, model_path, show_progress)
        print(f"\n\nModel downloaded successfully to: {model_path}")
        return str(model_path)
        
    except Exception as e:
        print(f"\nError downloading model: {str(e)}")
        print("\nYou can manually download the model from:")
        print(f"  {model_url}")
        print(f"\nAnd place it in: {models_dir}")
        raise

if __name__ == "__main__":
    download_model()

