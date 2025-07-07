document.addEventListener('colorThemesReady', function() {
  // Get the toggle button
  const toggleButton = document.querySelector('[data-theme-toggle-button]');
  const buttonText = toggleButton.querySelector('.lights-on');
  
  // Get theme colors from the collected data
  const lightTheme = window.colorThemes.getTheme('light');
  const darkTheme = window.colorThemes.getTheme('dark');
  
  // Track current theme state
  let isDarkMode = false;
  
  // Check saved preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
      isDarkMode = true;
      document.documentElement.classList.add('theme-dark');
      buttonText.textContent = 'lights on';
  } else {
      document.documentElement.classList.add('theme-light');
  }
  
  function toggleTheme() {
      const currentTheme = isDarkMode ? lightTheme : darkTheme;
      const targetTheme = isDarkMode ? darkTheme : lightTheme;
      
      // Create a timeline for smooth transition
      const tl = gsap.timeline({
          ease: "power1.out",
          onComplete: function() {
              // Toggle classes after animation
              if (isDarkMode) {
                  document.documentElement.classList.remove('theme-dark');
                  document.documentElement.classList.add('theme-light');
              } else {
                  document.documentElement.classList.remove('theme-light');
                  document.documentElement.classList.add('theme-dark');
              }
              isDarkMode = !isDarkMode;
              localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
          }
      });
      
      // Animate from current colors to target colors
      tl.fromTo('body', 
          {
              backgroundColor: currentTheme['--_theme---bg-color'],
              color: currentTheme['--_theme---txt-color']
          },
          {
              backgroundColor: targetTheme['--_theme---bg-color'],
              color: targetTheme['--_theme---txt-color'],
              duration: 0.5
          }
      );
      
      // Update button text
      buttonText.textContent = !isDarkMode ? 'lights on' : 'lights off';
  }
  
  toggleButton.addEventListener('click', toggleTheme);
});