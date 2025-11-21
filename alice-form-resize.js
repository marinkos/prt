// ===================================
// COMEET FORM IFRAME AUTO-RESIZE
// ===================================
// This script automatically adjusts the iframe height based on its content
// Add this to your Webflow page where the form is embedded

document.addEventListener("DOMContentLoaded", function() {
  const iframe = document.querySelector('.form-container iframe');
  
  if (!iframe) return;
  
  // Function to resize iframe
  function resizeIframe() {
    try {
      // Try to access iframe content (may fail due to CORS)
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const iframeBody = iframeDoc.body;
      
      // Get the scroll height of the iframe content
      const height = Math.max(
        iframeBody.scrollHeight,
        iframeBody.offsetHeight,
        iframeDoc.documentElement.clientHeight,
        iframeDoc.documentElement.scrollHeight,
        iframeDoc.documentElement.offsetHeight
      );
      
      // Set iframe height with some padding
      iframe.style.height = (height + 20) + 'px';
      iframe.style.minHeight = 'auto';
    } catch (e) {
      // CORS error - use postMessage approach if iframe supports it
      console.log('Direct iframe access blocked, using fallback heights');
      
      // Fallback: responsive heights based on viewport
      const viewportWidth = window.innerWidth;
      let minHeight;
      
      if (viewportWidth <= 768) {
        // Mobile
        minHeight = '80rem';
      } else if (viewportWidth <= 1024) {
        // Tablet
        minHeight = '70rem';
      } else {
        // Desktop
        minHeight = '56rem';
      }
      
      iframe.style.minHeight = minHeight;
    }
  }
  
  // Initial resize
  resizeIframe();
  
  // Listen for messages from iframe (if Comeet supports postMessage)
  window.addEventListener('message', function(event) {
    // Verify origin for security
    if (event.origin !== 'https://www.comeet.co') return;
    
    // Check if message contains height data
    if (event.data && typeof event.data === 'object' && event.data.type === 'resize') {
      iframe.style.height = event.data.height + 'px';
      iframe.style.minHeight = 'auto';
    }
  });
  
  // Resize on window resize
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeIframe, 250);
  });
  
  // Try to resize after iframe loads
  iframe.addEventListener('load', function() {
    setTimeout(resizeIframe, 500);
  });
  
  // Periodic check (fallback for dynamic content)
  setInterval(resizeIframe, 2000);
});

