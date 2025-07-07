document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.querySelector('[data-theme-toggle-button]');
  const buttonText = toggleButton.querySelector('.lights-on');
  const body = document.body;
  
  // Add CSS transition to body (faster)
  body.style.transition = 'background-color 0.3s ease-out, color 0.3s ease-out';
  
  // Check saved preference
  let isDarkMode = localStorage.getItem('dark-mode') === 'true';
  
  // Apply initial state
  if (isDarkMode) {
      body.classList.add('theme-dark');
      buttonText.textContent = 'lights on';
  } else {
      body.classList.add('theme-light');
      buttonText.textContent = 'lights off';
  }
  
  function toggleTheme() {
      // Toggle dark mode
      isDarkMode = !isDarkMode;
      
      // Remove both classes and add the appropriate one
      body.classList.remove('theme-light', 'theme-dark');
      body.classList.add(isDarkMode ? 'theme-dark' : 'theme-light');
      
      // Update text and save preference
      buttonText.textContent = isDarkMode ? 'lights on' : 'lights off';
      localStorage.setItem('dark-mode', isDarkMode);
  }
  
  toggleButton.addEventListener('click', toggleTheme);
});