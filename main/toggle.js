function colorModeToggle() {
  function attr(defaultVal, attrVal) {
    const defaultValType = typeof defaultVal;
    if (typeof attrVal !== "string" || attrVal.trim() === "") return defaultVal;
    if (attrVal === "true" && defaultValType === "boolean") return true;
    if (attrVal === "false" && defaultValType === "boolean") return false;
    if (isNaN(attrVal) && defaultValType === "string") return attrVal;
    if (!isNaN(attrVal) && defaultValType === "number") return +attrVal;
    return defaultVal;
  }

  const htmlElement = document.documentElement;
  let toggleEl;
  let togglePressed = "false";

  // Get script tag or use defaults
  const scriptTag = document.querySelector("[data-theme-toggle-script]");
  let colorModeDuration = scriptTag ? attr(0.5, scriptTag.getAttribute("duration")) : 0.5;
  let colorModeEase = scriptTag ? attr("power1.out", scriptTag.getAttribute("ease")) : "power1.out";

  function updateButtonText(isDark) {
    const buttonTexts = document.querySelectorAll('[data-theme-toggle-button] .lights-on');
    buttonTexts.forEach(function(textEl) {
      textEl.textContent = isDark ? 'lights on' : 'lights off';
    });
  }

  function setColors(themeString, animate) {
    if (typeof gsap !== "undefined" && animate && window.colorThemes) {
      const themeColors = window.colorThemes.getTheme(themeString);
      
      // Animate body background and text colors
      gsap.to(document.body, {
        backgroundColor: themeColors['--_theme---bg-color'],
        color: themeColors['--_theme---txt-color'],
        duration: colorModeDuration,
        ease: colorModeEase
      });
      
      // Animate CSS variables
      gsap.to(htmlElement, {
        '--_theme---bg-color': themeColors['--_theme---bg-color'],
        '--_theme---txt-color': themeColors['--_theme---txt-color'],
        duration: colorModeDuration,
        ease: colorModeEase
      });
    } else {
      // Fallback to class switching
      htmlElement.classList.remove("theme-dark", "theme-light");
      htmlElement.classList.add("theme-" + themeString);
      
      if (window.colorThemes) {
        const themeColors = window.colorThemes.getTheme(themeString);
        document.body.style.backgroundColor = themeColors['--_theme---bg-color'];
        document.body.style.color = themeColors['--_theme---txt-color'];
        htmlElement.style.setProperty('--_theme---bg-color', themeColors['--_theme---bg-color']);
        htmlElement.style.setProperty('--_theme---txt-color', themeColors['--_theme---txt-color']);
      }
    }
  }

  function goDark(dark, animate) {
    if (dark) {
      localStorage.setItem("dark-mode", "true");
      htmlElement.classList.add("dark-mode");
      setColors("dark", animate);
      togglePressed = "true";
      updateButtonText(true);
    } else {
      localStorage.setItem("dark-mode", "false");
      htmlElement.classList.remove("dark-mode");
      setColors("light", animate);
      togglePressed = "false";
      updateButtonText(false);
    }
    
    if (typeof toggleEl !== "undefined") {
      toggleEl.forEach(function (element) {
        element.setAttribute("aria-pressed", togglePressed);
      });
    }
  }

  function checkPreference(e) {
    goDark(!e.matches, false); // Inverted because we're checking for light mode
  }
  
  const colorPreference = window.matchMedia("(prefers-color-scheme: dark)");
  colorPreference.addEventListener("change", (e) => {
    checkPreference(e);
  });

  // Check stored preference
  let storagePreference = localStorage.getItem("dark-mode");
  if (storagePreference !== null) {
    goDark(storagePreference === "true", false);
  } else {
    checkPreference(colorPreference);
  }

  // Initialize on DOM ready
  window.addEventListener("DOMContentLoaded", (event) => {
    toggleEl = document.querySelectorAll("[data-theme-toggle-button]");
    toggleEl.forEach(function (element) {
      element.setAttribute("aria-label", "Toggle Dark/Light Mode");
      element.setAttribute("role", "button");
      element.setAttribute("aria-pressed", togglePressed);
    });
    
    // Set initial button text
    const isDarkMode = htmlElement.classList.contains("dark-mode");
    updateButtonText(isDarkMode);
    
    // Handle clicks
    document.addEventListener("click", function (e) {
      const targetElement = e.target.closest("[data-theme-toggle-button]");
      if (targetElement) {
        let darkClass = htmlElement.classList.contains("dark-mode");
        goDark(!darkClass, true);
      }
    });
  });
}

document.addEventListener("colorThemesReady", colorModeToggle);