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
      
      // Store current state
      const wasInDarkMode = body.classList.contains('theme-dark');
      
      // Apply new state to get target colors
      body.classList.remove('theme-light', 'theme-dark');
      body.classList.add(wasInDarkMode ? 'theme-light' : 'theme-dark');
      
      // Get new computed colors  
      const newBg = getComputedStyle(body).backgroundColor;
      const newColor = getComputedStyle(body).color;
      
      // Remove classes temporarily to animate from current colors
      body.classList.remove('theme-light', 'theme-dark');
      body.style.backgroundColor = currentBg;
      body.style.color = currentColor;
      
      // Animate to new colors
      gsap.to(body, {
          backgroundColor: newBg,
          color: newColor,
          duration: 0.5,
          ease: "power1.out",
          onComplete: function() {
              // Remove inline styles and apply the final class
              body.style.backgroundColor = '';
              body.style.color = '';
              body.classList.add(wasInDarkMode ? 'theme-light' : 'theme-dark');
          }
      });
      
      // Update state, text and save preference
      isDarkMode = !wasInDarkMode;
      buttonText.textContent = isDarkMode ? 'lights on' : 'lights off';
      localStorage.setItem('dark-mode', isDarkMode);
  }
  
  toggleButton.addEventListener('click', toggleTheme);
});