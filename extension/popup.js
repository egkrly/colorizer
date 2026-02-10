// Check server connection status
async function checkServerStatus() {
  const statusDiv = document.getElementById('status');
  const checkButton = document.getElementById('checkServer');
  
  statusDiv.textContent = 'Server: Checking...';
  statusDiv.className = 'status';
  checkButton.disabled = true;
  
  try {
    // Create timeout manually for better browser compatibility
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('http://localhost:3000/health', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      statusDiv.textContent = 'Server: Connected ✓';
      statusDiv.className = 'status connected';
    } else {
      throw new Error(`Server returned error: ${response.status}`);
    }
  } catch (error) {
    let errorMessage = 'Server: Disconnected';
    
    if (error.name === 'AbortError') {
      errorMessage += ' (Connection timeout)';
    } else if (error.message && error.message.includes('fetch')) {
      errorMessage += ' (Cannot connect)';
    } else if (error.message) {
      errorMessage += ` (${error.message})`;
    } else {
      errorMessage += ' (Make sure server is running on localhost:3000)';
    }
    
    statusDiv.textContent = errorMessage;
    statusDiv.className = 'status disconnected';
  } finally {
    checkButton.disabled = false;
  }
}

// Check status on load
document.addEventListener('DOMContentLoaded', () => {
  checkServerStatus();
  document.getElementById('checkServer').addEventListener('click', checkServerStatus);
});

