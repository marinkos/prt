document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.querySelector('[data-theme-toggle-button]');
  const buttonText = toggleButton.querySelector('.lights-on');
  const body = document.body;
  
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
      // Get current computed colors
      const currentBg = getComputedStyle(body).backgroundColor;
      const currentColor = getComputedStyle(body).color;
      
      // Toggle classes
      isDarkMode = !isDarkMode;
      body.classList.remove('theme-light', 'theme-dark');
      body.classList.add(isDarkMode ? 'theme-dark' : 'theme-light');
      
      // Get new computed colors  
      const newBg = getComputedStyle(body).backgroundColor;
      const newColor = getComputedStyle(body).color;
      
      // Reset to current state for animation
      body.classList.remove('theme-light', 'theme-dark');
      body.classList.add(isDarkMode ? 'theme-light' : 'theme-dark');
      
      // Animate to new colors
      gsap.fromTo(body, 
          {
              backgroundColor: currentBg,
              color: currentColor
          },
          {
              backgroundColor: newBg,
              color: newColor,
              duration: 0.5, // Faster animation
              ease: "power1.out",
              onComplete: function() {
                  // Apply the final class after animation
                  body.classList.remove('theme-light', 'theme-dark');
                  body.classList.add(isDarkMode ? 'theme-dark' : 'theme-light');
              }
          }
      );
      
      // Update text and save preference
      buttonText.textContent = isDarkMode ? 'lights on' : 'lights off';
      localStorage.setItem('dark-mode', isDarkMode);
  }
  
  toggleButton.addEventListener('click', toggleTheme);
});