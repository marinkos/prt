document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.querySelector('[data-theme-toggle-button]');
  const buttonText = toggleButton.querySelector('.lights-on');
  const body = document.body;
  
  // Check saved preference
  let isDarkMode = localStorage.getItem('dark-mode') === 'true';
  
  // Apply saved state
  if (isDarkMode) {
      body.classList.add('theme-dark');
      buttonText.textContent = 'lights on';
  }
  
  function toggleTheme() {
      // Get current computed colors
      const currentBg = getComputedStyle(body).backgroundColor;
      const currentColor = getComputedStyle(body).color;
      
      // Toggle class
      isDarkMode = !isDarkMode;
      body.classList.toggle('theme-dark');
      
      // Get new computed colors  
      const newBg = getComputedStyle(body).backgroundColor;
      const newColor = getComputedStyle(body).color;
      
      // Reset to current colors
      body.classList.toggle('theme-dark');
      
      // Animate to new colors
      gsap.fromTo(body, 
          {
              backgroundColor: currentBg,
              color: currentColor
          },
          {
              backgroundColor: newBg,
              color: newColor,
              duration: 0.5,
              ease: "power1.out",
              onComplete: function() {
                  // Apply the class after animation
                  body.classList.toggle('theme-dark');
              }
          }
      );
      
      // Update text and save preference
      buttonText.textContent = isDarkMode ? 'lights on' : 'lights off';
      localStorage.setItem('dark-mode', isDarkMode);
  }
  
  toggleButton.addEventListener('click', toggleTheme);
});