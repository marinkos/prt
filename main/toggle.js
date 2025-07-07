document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.querySelector('[data-theme-toggle-button]');
  const buttonText = toggleButton.querySelector('.lights-on');
  const body = document.body;
  
  let isDarkMode = false;
  
  body.classList.add('theme-light');
  buttonText.textContent = 'lights off';
  
  function toggleTheme() {
      const currentBg = getComputedStyle(body).backgroundColor;
      const currentColor = getComputedStyle(body).color;
      
      const wasInDarkMode = body.classList.contains('theme-dark');
      
      body.classList.remove('theme-light', 'theme-dark');
      body.classList.add(wasInDarkMode ? 'theme-light' : 'theme-dark');
      
      const newBg = getComputedStyle(body).backgroundColor;
      const newColor = getComputedStyle(body).color;
      
      body.classList.remove('theme-light', 'theme-dark');
      body.style.backgroundColor = currentBg;
      body.style.color = currentColor;
      
      gsap.to(body, {
          backgroundColor: newBg,
          color: newColor,
          duration: 0.3,
          ease: "power1.out",
          onComplete: function() {
              body.style.backgroundColor = '';
              body.style.color = '';
              body.classList.add(wasInDarkMode ? 'theme-light' : 'theme-dark');
          }
      });
      
      isDarkMode = !wasInDarkMode;
      buttonText.textContent = isDarkMode ? 'lights on' : 'lights off';
  }
  
  toggleButton.addEventListener('click', toggleTheme);
});