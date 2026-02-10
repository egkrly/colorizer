from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image

# Import colorizer (which patches torch.load for PyTorch 2.6+ compatibility)
from colorizer import colorize_image

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Server is running"}), 200

@app.route('/colorize', methods=['POST'])
def colorize():
    """Colorize an image endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        if 'image' not in data:
            return jsonify({"error": "No image data provided. Expected 'image' field with base64 data."}), 400
        
        # Decode base64 image
        image_base64 = data['image']
        
        if not image_base64 or not isinstance(image_base64, str):
            return jsonify({"error": "Invalid image data format. Expected base64 string."}), 400
        
        try:
            image_data = base64.b64decode(image_base64)
        except Exception as e:
            return jsonify({"error": f"Invalid base64 encoding: {str(e)}"}), 400
        
        # Check image size (limit to 20MB decoded)
        if len(image_data) > 20 * 1024 * 1024:
            return jsonify({"error": "Image is too large (max 20MB)"}), 400
        
        try:
            image = Image.open(io.BytesIO(image_data))
        except Exception as e:
            return jsonify({"error": f"Invalid image format: {str(e)}"}), 400
        
        # Check image dimensions (limit to prevent memory issues)
        max_dimension = 4096
        if image.width > max_dimension or image.height > max_dimension:
            # Resize if too large
            image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Colorize the image
        try:
            colorized_image = colorize_image(image)
        except Exception as e:
            print(f"Error in colorize_image function: {str(e)}")
            return jsonify({"error": f"Colorization failed: {str(e)}"}), 500
        
        if colorized_image is None:
            return jsonify({"error": "Failed to colorize image. Colorization function returned None."}), 500
        
        # Convert colorized image to base64
        try:
            buffer = io.BytesIO()
            colorized_image.save(buffer, format='PNG')
            colorized_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        except Exception as e:
            return jsonify({"error": f"Failed to encode colorized image: {str(e)}"}), 500
        
        return jsonify({
            "success": True,
            "colorized_image": colorized_base64
        }), 200
        
    except Exception as e:
        print(f"Unexpected error in colorize endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

# Initialize DeOldify model on startup
def init_colorizer():
    """Initialize the colorization model on server startup"""
    try:
        from colorizer import init_deoldify
        print("Initializing DeOldify model...")
        init_deoldify()
        print("DeOldify model ready!")
    except ImportError as e:
        print(f"Warning: {str(e)}")
        print("Server will start but colorization may not work properly.")
    except Exception as e:
        print(f"Error initializing colorizer: {str(e)}")
        print("Server will start but colorization may not work properly.")

if __name__ == '__main__':
    print("Starting Image Colorizer Server...")
    print("Server will be available at http://localhost:3000")
    
    # Initialize colorizer before starting server
    init_colorizer()
    
    app.run(host='0.0.0.0', port=3000, debug=True)

