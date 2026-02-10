// Store original and colorized images for each processed image
const imageDataMap = new Map();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "colorizeImage") {
    handleColorizeImage(request.imageUrl);
    sendResponse({ success: true });
  }
  return true; // Keep message channel open for async response
});

// Handle image colorization
async function handleColorizeImage(imageUrl) {
  try {
    // Find the image element on the page
    const images = Array.from(document.querySelectorAll('img'));
    let targetImage = images.find(img => img.src === imageUrl || img.currentSrc === imageUrl);
    
    if (!targetImage) {
      // Try to find by data attribute or other means
      targetImage = images.find(img => {
        return img.src.includes(imageUrl.split('/').pop()) || 
               imageUrl.includes(img.src.split('/').pop());
      });
    }

    if (!targetImage) {
      showNotification("Image not found on page", "error");
      return;
    }

    // Check if already processed
    const imageId = getImageId(targetImage);
    const existingData = imageDataMap.get(imageId);
    if (existingData && typeof existingData === 'object' && existingData.element) {
      // Toggle if already processed
      const wasColorized = existingData.isColorized;
      toggleImage(imageId);
      const newState = wasColorized ? "original" : "colorized";
      showNotification(`Showing ${newState} image`, "success");
      return;
    }

    // Show loading indicator
    showLoadingIndicator(targetImage);

    // Fetch image and convert to base64
    let imageData;
    try {
      imageData = await fetchImageAsBase64(imageUrl);
    } catch (error) {
      hideLoadingIndicator(targetImage);
      showNotification(error.message || "Failed to load image", "error");
      return;
    }

    // Send to server for colorization
    let colorizedData;
    try {
      colorizedData = await sendToServer(imageData);
    } catch (error) {
      hideLoadingIndicator(targetImage);
      const errorMsg = error.message || "Failed to colorize image. Is the server running?";
      showNotification(errorMsg, "error");
      return;
    }
    
    if (!colorizedData) {
      hideLoadingIndicator(targetImage);
      showNotification("Failed to colorize image. Server returned no data.", "error");
      return;
    }

    // Store original and colorized data
    const originalSrc = targetImage.src;
    const colorizedSrc = `data:image/png;base64,${colorizedData}`;
    
    imageDataMap.set(imageId, {
      original: originalSrc,
      originalUrl: imageUrl, // Store original URL for context menu lookup
      colorized: colorizedSrc,
      element: targetImage,
      isColorized: true
    });
    
    // Also store mapping from URL to imageId for easy lookup from context menu
    imageDataMap.set(`url:${imageUrl}`, imageId);

    // Replace image with colorized version
    targetImage.src = colorizedSrc;
    hideLoadingIndicator(targetImage);

    showNotification("Image colorized successfully! Right-click to toggle.", "success");
  } catch (error) {
    console.error("Error colorizing image:", error);
    showNotification("Error: " + error.message, "error");
  }
}

// Fetch image and convert to base64 using background script (bypasses CORS)
async function fetchImageAsBase64(imageUrl) {
  try {
    // Request background script to fetch the image (background scripts can bypass CORS)
    const response = await chrome.runtime.sendMessage({
      action: "fetchImageAsBase64",
      imageUrl: imageUrl
    });
    
    if (!response || !response.success) {
      const errorMsg = response?.error || "Failed to fetch image";
      throw new Error(errorMsg);
    }
    
    return response.base64;
  } catch (error) {
    console.error("Error fetching image:", error);
    if (error.message) {
      throw error;
    }
    throw new Error("Failed to load image. Check if image is accessible.");
  }
}

// Send image to server for colorization with retry logic
async function sendToServer(imageBase64, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for processing
      
      const response = await fetch('http://localhost:3000/colorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Server error (${response.status})`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Use default error message
        }
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(errorMessage);
        }
        
        // Retry on server errors (5xx)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
          continue;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.colorized_image) {
        throw new Error("Server returned invalid response");
      }
      
      return data.colorized_image;
    } catch (error) {
      console.error(`Error sending to server (attempt ${attempt + 1}/${retries + 1}):`, error);
      
      if (error.name === 'AbortError') {
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        throw new Error("Request timed out. The server may be processing a large image.");
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        throw new Error("Cannot connect to server. Make sure the server is running on localhost:3000");
      }
      
      // If it's the last attempt or a non-retryable error, throw it
      if (attempt === retries || (error.message && !error.message.includes('Server error'))) {
        throw error;
      }
    }
  }
  
  return null;
}

// Get unique ID for image element
function getImageId(img) {
  if (!img.dataset.colorizerId) {
    img.dataset.colorizerId = `colorizer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  return img.dataset.colorizerId;
}

// Toggle between original and colorized (internal function)
function toggleImage(imageId) {
  const data = imageDataMap.get(imageId);
  if (!data) return;

  if (data.isColorized) {
    data.element.src = data.original;
    data.isColorized = false;
  } else {
    data.element.src = data.colorized;
    data.isColorized = true;
  }
}

// Show loading indicator
function showLoadingIndicator(img) {
  const loader = document.createElement('div');
  loader.className = 'colorizer-loader';
  loader.textContent = 'Colorizing...';
  img.parentElement.insertBefore(loader, img);
  img.dataset.loadingId = loader.className;
}

// Hide loading indicator
function hideLoadingIndicator(img) {
  const loader = img.parentElement.querySelector('.colorizer-loader');
  if (loader) {
    loader.remove();
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `colorizer-notification colorizer-notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('colorizer-notification-show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('colorizer-notification-show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

