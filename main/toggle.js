document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.querySelector('[data-theme-toggle-button]');
  const buttonText = toggleButton.querySelector('.lights-on');
  const body = document.body;
  const bottomGradient = document.querySelector('.bottom-gradient');
  
  let isDarkMode = false;
  
  body.classList.add('theme-light');
  buttonText.textContent = 'lights off';
  
  function toggleTheme() {
      const currentBg = getComputedStyle(body).backgroundColor;
      const currentColor = getComputedStyle(body).color;
      
      const wasInDarkMode = body.classList.contains('theme-dark');
      const newBgColor = wasInDarkMode ? '#f4f4f4' : '#14161a';
      
      body.classList.remove('theme-light', 'theme-dark');
      body.style.backgroundColor = currentBg;
      body.style.color = currentColor;
      
      const tl = gsap.timeline({
          ease: "power1.out",
          onComplete: function() {
              body.style.backgroundColor = '';
              body.style.color = '';
              bottomGradient.style.backgroundImage = '';
              body.classList.add(wasInDarkMode ? 'theme-light' : 'theme-dark');
          }
      });
      
      tl.to(body, {
          backgroundColor: newBgColor,
          color: wasInDarkMode ? '#14161a' : '#f4f4f4',
          duration: 0.3
      }, 0)
      .to(bottomGradient, {
          backgroundImage: `linear-gradient(0deg, ${newBgColor}, transparent)`,
          duration: 0.3
      }, 0);
      
      isDarkMode = !wasInDarkMode;
      buttonText.textContent = isDarkMode ? 'lights on' : 'lights off';
  }
  
  toggleButton.addEventListener('click', toggleTheme);
});