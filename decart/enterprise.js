// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener("DOMContentLoaded", () => {
  /** Text reveal animation **/
  const splitTypes = document.querySelectorAll(".reveal-type");

  splitTypes.forEach((char) => {
    const text = new SplitText(char, { type: "chars, words, lines" });

    // Create timeline for better control
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: char,
        start: "top 80%",
        end: "top 20%",
        scrub: true,
        markers: false,
        onRefresh: (self) => {
          // Check if element is already in view when ScrollTrigger refreshes
          if (self.progress === 1) {
            gsap.set(text.chars, { color: "white" });
          } else if (self.progress === 0) {
            gsap.set(text.chars, { color: "#475462" });
          }
        },
      },
    });

    // Set initial color
    gsap.set(text.chars, {
      color: "#475462",
    });

    // Animate to white
    tl.to(text.chars, {
      color: "white",
      stagger: 0.2,
    });
  });

  /** Fade-in text reveal (alternative animation) **/
  const fadeRevealElements = document.querySelectorAll(".fade-reveal");

  fadeRevealElements.forEach((element) => {
    const text = new SplitText(element, { type: "lines" });

    // Set initial state
    gsap.set(text.lines, {
      opacity: 0,
      y: 50,
    });

    // Create scroll-triggered animation
    gsap.to(text.lines, {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        end: "top 50%",
        toggleActions: "play none none reverse",
      },
    });
  });

  /** Word-by-word reveal **/
  const wordRevealElements = document.querySelectorAll(".word-reveal");

  wordRevealElements.forEach((element) => {
    const text = new SplitText(element, { type: "words" });

    // Set initial state
    gsap.set(text.words, {
      opacity: 0,
      y: 30,
    });

    // Create scroll-triggered animation
    gsap.to(text.words, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  });

  /** Enterprise Form - Enable/Disable Submit Button **/
  const enterpriseForm = document.getElementById("wf-form-Enterprise-Form");
  
  if (enterpriseForm) {
    const submitButton = enterpriseForm.querySelector('input[type="submit"]');
    const requiredFields = enterpriseForm.querySelectorAll('[required]');
    
    // Function to check if all required fields are filled
    const checkRequiredFields = () => {
      let allFilled = true;
      
      requiredFields.forEach((field) => {
        const value = field.value.trim();
        
        // Check if field is empty or if it's a select with empty value
        if (!value || value === '') {
          allFilled = false;
        }
      });
      
      // Toggle the is-disabled class based on whether all fields are filled
      if (allFilled) {
        submitButton.classList.remove('is-disabled');
        submitButton.disabled = false;
      } else {
        submitButton.classList.add('is-disabled');
        submitButton.disabled = true;
      }
    };
    
    // Add event listeners to all required fields
    requiredFields.forEach((field) => {
      // Use 'input' for text inputs and textareas, 'change' for selects
      const eventType = field.tagName === 'SELECT' ? 'change' : 'input';
      field.addEventListener(eventType, checkRequiredFields);
    });
    
    // Initial check on page load
    checkRequiredFields();
  }
});

