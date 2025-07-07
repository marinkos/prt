function getColorThemes() {
  window.colorThemes = {
    themes: {},
    getTheme(themeName = "") {
      if (!themeName)
        return this.getTheme(Object.keys(this.themes)[0]);
      const theme = this.themes[themeName];
      if (!theme) return {};
      return theme;
    },
  };

  const firstLink = document.querySelector('link[rel="stylesheet"]');
  if (!firstLink?.href) return null;

  const themeVariables = new Set(),
    themeClasses = new Set();

  fetch(firstLink.href)
    .then((response) => {
      if (!response.ok)
        throw new Error(`Failed to fetch stylesheet: ${response.statusText}`);
      return response.text();
    })
    .then((cssText) => {
      (cssText.match(/--_theme[\w-]+:\s*[^;]+/g) || []).forEach((variable) =>
        themeVariables.add(variable.split(":")[0].trim())
      );
      (cssText.match(/\.theme-[\w-]+/g) || []).forEach(
        (className) => {
          themeClasses.add(className);
        }
      );

      const themeVariablesArray = Array.from(themeVariables);
      
      console.log("Theme Variables found:", themeVariablesArray);
      console.log("Theme Classes found:", Array.from(themeClasses));
      
      function checkClass(themeClass) {
        let documentClasses = document.documentElement.getAttribute("class");
        document.documentElement.setAttribute("class", "");
        document.documentElement.classList.add(themeClass);
        const styleObject = {};
        themeVariablesArray.forEach(
          (variable) =>
            (styleObject[variable] = getComputedStyle(
              document.documentElement
            ).getPropertyValue(variable))
        );
        document.documentElement.setAttribute("class", documentClasses);
        return styleObject;
      }

      themeClasses.forEach((themeClassWithDot) => {
        const themeName = themeClassWithDot
          .replace(".", "")
          .replace("theme-", "");
        window.colorThemes.themes[themeName] = checkClass(
          themeClassWithDot.replace(".", "")
        );
      });

      console.log("Collected Color Themes:", window.colorThemes.themes);
      console.log("Full Theme Object:", window.colorThemes);
      
      document.dispatchEvent(new CustomEvent("colorThemesReady"));
    })
    .catch((error) => console.error("Error:", error.message));
}

window.addEventListener("DOMContentLoaded", (event) => {
  getColorThemes();
});