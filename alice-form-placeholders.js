// ===================================
// CONVERT LABELS TO PLACEHOLDERS
// ===================================
// This script converts form labels to placeholders
// Add this to the Comeet form iframe or include it in the CSS URL as a script

(function() {
  // Wait for DOM to be ready
  function init() {
    // Find all form groups with labels
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach(function(group) {
      const label = group.querySelector('label.control-label');
      const input = group.querySelector('input, textarea, select');
      
      if (label && input) {
        // Get label text
        const labelText = label.textContent.trim();
        
        // Set placeholder attribute
        if (input.tagName === 'SELECT') {
          // For select elements, set the first option as placeholder
          const firstOption = input.querySelector('option:first-child');
          if (firstOption && !firstOption.value) {
            firstOption.textContent = labelText;
          }
        } else {
          // For input and textarea, set placeholder
          input.setAttribute('placeholder', labelText);
        }
        
        // Hide the label (already done in CSS, but ensure it's hidden)
        label.style.display = 'none';
      }
    });
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Also run after a delay to catch dynamically loaded content
  setTimeout(init, 1000);
  setTimeout(init, 3000);
})();

