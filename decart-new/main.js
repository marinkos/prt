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

/* Cursor coordinates — real on page; fake drift when pointer is over an iframe */
(function () {
  var el = document.getElementById('cursor-coords');
  if (!el) return;

  var lastX = 0;
  var lastY = 0;
  var fakeX = 0;
  var fakeY = 0;
  var fakeRaf = null;

  function updateCoords(x, y) {
    el.textContent = '(X ' + x.toFixed(1) + ', Y ' + y.toFixed(1) + ')';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.display = 'block';
  }

  function stopFake() {
    if (fakeRaf != null) {
      cancelAnimationFrame(fakeRaf);
      fakeRaf = null;
    }
  }

  function runFake() {
    fakeX += (Math.random() - 0.5) * 2;
    fakeY += (Math.random() - 0.5) * 2;
    updateCoords(fakeX, fakeY);
    fakeRaf = requestAnimationFrame(runFake);
  }

  function startFake() {
    stopFake();
    fakeX = lastX;
    fakeY = lastY;
    runFake();
  }

  document.addEventListener('mousemove', function (e) {
    stopFake();
    lastX = e.clientX;
    lastY = e.clientY;
    updateCoords(lastX, lastY);
  });

  /* When cursor leaves and goes to an iframe: relatedTarget can be iframe, or null (cross-origin). */
  document.addEventListener('mouseout', function (e) {
    var target = e.relatedTarget;
    if (target && target.nodeType && (target.tagName === 'IFRAME' || (target.closest && target.closest('iframe')))) {
      startFake();
      return;
    }
    /* Cross-origin iframe often gives relatedTarget null; check if pointer is now over an iframe */
    if (!target && (lastX || lastY)) {
      requestAnimationFrame(function () {
        var el = document.elementFromPoint(lastX, lastY);
        if (el && el.tagName === 'IFRAME') startFake();
      });
    }
  });

  document.querySelectorAll('iframe').forEach(function (frame) {
    frame.addEventListener('mouseenter', startFake);
    /* When cursor moves from wrapper (or sibling) into iframe, parent gets mouseout with relatedTarget = iframe */
    if (frame.parentNode) {
      frame.parentNode.addEventListener('mouseout', function (e) {
        if (e.relatedTarget === frame) startFake();
      });
    }
  });
})();