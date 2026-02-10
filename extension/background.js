// Register context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "colorizeImage",
    title: "Colorize/Toggle Image",
    contexts: ["image"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "colorizeImage" && info.srcUrl) {
    // Send message to content script with image URL
    // Content script will check if already colorized and toggle, or colorize if not
    chrome.tabs.sendMessage(tab.id, {
      action: "colorizeImage",
      imageUrl: info.srcUrl,
      imageElement: null // Will be found by content script
    }).catch(err => {
      console.error("Error sending message to content script:", err);
    });
  }
});

// Handle image fetching requests from content script (bypasses CORS)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchImageAsBase64") {
    // Background script can fetch cross-origin images without CORS restrictions
    fetchImageAsBase64(request.imageUrl)
      .then(base64 => {
        sendResponse({ success: true, base64: base64 });
      })
      .catch(error => {
        console.error("Error fetching image in background:", error);
        const errorMessage = error.message || "Unknown error occurred";
        sendResponse({ success: false, error: errorMessage });
      });
    return true; // Keep message channel open for async response
  }
  return false; // Not handled
});

// Fetch image and convert to base64 (runs in background script, bypasses CORS)
async function fetchImageAsBase64(imageUrl) {
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(imageUrl, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    // Check image size (limit to 10MB)
    if (blob.size > 10 * 1024 * 1024) {
      throw new Error("Image is too large (max 10MB)");
    }
    
    // Check if it's actually an image
    if (!blob.type.startsWith('image/')) {
      throw new Error("File is not an image");
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
          resolve(base64);
        } catch (e) {
          reject(new Error("Failed to process image data"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. Image may be too large or server is slow.");
    }
    throw error;
  }
}

