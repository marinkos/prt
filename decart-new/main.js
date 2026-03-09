/* Buttons */
(function () {
  if (typeof gsap === 'undefined' || typeof SplitText === 'undefined') {
    console.warn('GSAP or SplitText not found. Button animations require these libraries.');
    return;
  }

  function animateChars(chars, yPosition) {
    gsap.to(chars, {
      y: yPosition,
      duration: 0.35,
      ease: "power1.inOut",
      stagger: 0.02,
    });
  }

  function initButtonAnimations() {
    const buttons = document.querySelectorAll('[data-rotate]');

    if (buttons.length === 0) return;

    buttons.forEach((button, index) => {
      const originalText = button.querySelector(".btn-text");

      if (!originalText) {
        console.warn(`Element with class "btn-text" not found inside button ${index + 1}`);
        return;
      }

      const originalSplit = new SplitText(originalText, { type: "chars" });

      const clonedText = originalText.cloneNode(true);
      button.appendChild(clonedText);

      const clonedSplit = new SplitText(clonedText, { type: "chars" });

      const originalChars = originalSplit.chars;
      const clonedChars = clonedSplit.chars;

      gsap.set(clonedText, { position: "absolute" });
      gsap.set(clonedChars, { y: "100%" });

      button.addEventListener("mouseenter", () => {
        animateChars(originalChars, "-100%");
        animateChars(clonedChars, "0%");
      });

      button.addEventListener("mouseleave", () => {
        animateChars(originalChars, "0%");
        animateChars(clonedChars, "100%");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initButtonAnimations);
  } else {
    initButtonAnimations();
  }
})();

/* Cursor coordinates */
(function () {
  var el = document.getElementById('cursor-coords');
  if (!el) return;

  function updateCoords(x, y) {
    el.textContent = '(X ' + x.toFixed(1) + ', Y ' + y.toFixed(1) + ')';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.display = 'block';
  }

  document.addEventListener('mousemove', function (e) {
    updateCoords(e.clientX, e.clientY);
  });

  /* When pointer is over an iframe, parent gets no mousemove. If the iframe sends
     postMessage({ type: 'cursor', x, y }) on mousemove, we can show coords. */
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'cursor' && typeof e.data.x === 'number' && typeof e.data.y === 'number') {
      var frame = Array.prototype.find.call(document.querySelectorAll('iframe'), function (f) {
        return f.contentWindow === e.source;
      });
      if (frame) {
        var rect = frame.getBoundingClientRect();
        updateCoords(rect.left + e.data.x, rect.top + e.data.y);
      } else {
        updateCoords(e.data.x, e.data.y);
      }
    }
  });
})();