"""
Image colorization module using DeOldify.
DeOldify is a deep learning model for colorizing and restoring old images.
"""

import os
import sys
import tempfile
from PIL import Image
import numpy as np

# Patch torch.load for PyTorch 2.6+ compatibility BEFORE any torch imports
# PyTorch 2.6+ changed default weights_only=True, but DeOldify checkpoints need weights_only=False
# This must be done before importing torch or any modules that import torch
def _patch_torch_load():
    try:
        import torch
        if hasattr(torch, 'load'):
            _original_torch_load = torch.load
            
            def _patched_torch_load(*args, **kwargs):
                # If weights_only is not explicitly set, default to False for DeOldify compatibility
                if 'weights_only' not in kwargs:
                    kwargs['weights_only'] = False
                return _original_torch_load(*args, **kwargs)
            
            torch.load = _patched_torch_load
            return True
    except ImportError:
        pass  # torch not installed yet
    return False

# Apply patch immediately
_patch_torch_load()

# Try to add DeOldify to path if it's cloned locally
_current_dir = os.path.dirname(os.path.abspath(__file__))
_deoldify_path = os.path.join(_current_dir, 'DeOldify')
if os.path.exists(_deoldify_path) and _deoldify_path not in sys.path:
    sys.path.insert(0, _deoldify_path)

# DeOldify imports
try:
    from deoldify import device
    from deoldify.device_id import DeviceId
    from deoldify.visualize import get_image_colorizer
    DEOLDIFY_AVAILABLE = True
except ImportError as e:
    DEOLDIFY_AVAILABLE = False
    print(f"Warning: DeOldify not available. Error: {str(e)}")
    print("Install DeOldify by running: install_deoldify.bat or install_deoldify.ps1")

# Global colorizer model (initialized once)
colorizer_model = None
device_set = False

def init_deoldify():
    """Initialize DeOldify model. Should be called once at startup."""
    global colorizer_model, device_set
    
    if not DEOLDIFY_AVAILABLE:
        raise ImportError("DeOldify is not installed. Install with: pip install deoldify")
    
    if colorizer_model is not None:
        return  # Already initialized
    
    try:
        # Try to use GPU if available, otherwise fall back to CPU
        try:
            device.set(device=DeviceId.GPU0)
            print("DeOldify: Using GPU")
        except:
            device.set(device=DeviceId.CPU)
            print("DeOldify: Using CPU (GPU not available)")
        
        device_set = True
        
        # Set the root folder to DeOldify directory so it can find the models folder
        from pathlib import Path
        root_folder = Path(_deoldify_path) if os.path.exists(_deoldify_path) else Path('./')
        
        # Check if model exists, if not, try to download it
        models_dir = root_folder / 'models'
        model_path = models_dir / 'ColorizeArtistic_gen.pth'
        
        if not model_path.exists():
            print(f"Model file not found at: {model_path}")
            print("Attempting to download model...")
            try:
                from download_model import download_model
                download_model()
            except Exception as download_error:
                print(f"Automatic download failed: {str(download_error)}")
                print("\nPlease download the model manually:")
                print("  1. Run: python download_model.py")
                print("  2. Or download from: https://data.deepai.org/deoldify/ColorizeArtistic_gen.pth")
                print(f"  3. Place it in: {models_dir}")
                raise FileNotFoundError(f"Model file not found at {model_path}. Please download it first.")
        
        # Get the artistic colorizer (better quality)
        # Pass root_folder so DeOldify knows where to find the models
        colorizer_model = get_image_colorizer(artistic=True, root_folder=root_folder)
        print("DeOldify model initialized successfully")
        
    except Exception as e:
        print(f"Error initializing DeOldify: {str(e)}")
        raise

def colorize_image(image, render_factor=35):
    """
    Colorize a grayscale/black and white image using DeOldify.
    
    Args:
        image: PIL Image object (RGB mode)
        render_factor: DeOldify render factor (higher = more detail, slower)
                      Typical values: 35-45 for good balance
    
    Returns:
        PIL Image object with colorized version
    """
    global colorizer_model
    
    if not DEOLDIFY_AVAILABLE:
        raise ImportError("DeOldify is not installed. Install with: pip install deoldify")
    
    # Initialize model if not already done
    if colorizer_model is None:
        init_deoldify()
    
    try:
        # Create temporary file for input image
        # DeOldify works with file paths, not PIL Images directly
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_input:
            temp_input_path = temp_input.name
            # Save image as JPEG
            image.save(temp_input_path, 'JPEG', quality=95)
        
        try:
            # Colorize using DeOldify
            result = colorizer_model.get_transformed_image(
                temp_input_path,
                render_factor=render_factor,
                post_process=True
            )
            
            # Convert result to PIL Image if it's not already
            if not isinstance(result, Image.Image):
                result = Image.fromarray(np.array(result))
            
            return result
            
        finally:
            # Clean up temporary input file
            try:
                if os.path.exists(temp_input_path):
                    os.unlink(temp_input_path)
            except:
                pass
            
            # Clean up temporary output file if DeOldify created one
            # DeOldify might create output files, but we're getting the image directly
            # so we don't need to clean up output files
            
    except Exception as e:
        print(f"Error in colorize_image with DeOldify: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

