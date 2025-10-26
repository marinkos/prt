// ===================================
// INTAKE FORM - STEP FUNCTIONALITY
// ===================================

document.addEventListener("DOMContentLoaded", function () {
    // Constants
    const TOTAL_STEPS = 3;
  
    // Get form elements
    const form = document.getElementById("email-form");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const skipBtn = document.getElementById("skipBtn");
    const submitBtn = document.querySelector(".button.is-form-submit");
    const progressBar = document.querySelector(".intake_progress");
    const progressText = document.getElementById("intakeProgress");
  
    // Get step elements
    const step1 = document.getElementById("intakeStepOne");
    const step2 = document.getElementById("intakeStepTwo");
    const step3 = document.getElementById("intakeStepThree");
    const step4Summary = document.getElementById("intakeStepSummary");
  
    // Get validation message elements
    const validation1 = document.getElementById("validationStep1");
    const validation2 = document.getElementById("validationStep2");
  
    // Make progress elements globally accessible
    window.progressBar = progressBar;
    window.progressText = progressText;
  
    // Current step tracker
    let currentStep = 1;
  
    // Store child data
    let childData = null;
  
    // Get URL parameters and populate hidden fields
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");
    const leadId = urlParams.get("leadId");
  
    if (email) {
      document.getElementById("hidden-email").value = email;
    }
    if (leadId) {
      document.getElementById("hidden-leadId").value = leadId;
    }
  
    // Prevent Webflow form submission
    form.setAttribute("data-wf-page-id", "");
    form.setAttribute("data-wf-element-id", "");
  
    // Initialize form
    showStep(1);
  
    // ===================================
    // PROGRESS TRACKING
    // ===================================
  
    function updateProgressBar() {
      let progress = 0;
  
      if (currentStep >= 1) progress = 33;
      if (currentStep >= 2) progress = 66;
      if (currentStep >= 3) progress = 100;
  
      progressText.textContent = progress;
      progressBar.style.width = progress + "%";
    }
  
    // ===================================
    // STEP NAVIGATION FUNCTIONS
    // ===================================
  
    function showStep(stepNumber) {
      // Hide all steps
      step1.style.display = "none";
      step2.style.display = "none";
      step3.style.display = "none";
      step4Summary.style.display = "none";
  
      // Hide all validation messages
      validation1.style.display = "none";
      validation2.style.display = "none";
  
  
      // Show current step
      switch (stepNumber) {
        case 1:
          step1.style.display = "block";
          prevBtn.style.display = "none";
          nextBtn.style.display = "block";
          skipBtn.style.display = "none";
          submitBtn.style.display = "none";
          break;
        case 2:
          step2.style.display = "block";
          prevBtn.style.display = "flex";
          nextBtn.style.display = "block";
          skipBtn.style.display = "none";
          submitBtn.style.display = "none";
          break;
  case 3:
    step3.style.display = "block";
          prevBtn.style.display = "flex";
          nextBtn.style.display = "none";
          skipBtn.style.display = "none";
          submitBtn.style.display = "block";
          submitBtn.value = "Submit";
          // Update summary display if child data exists
          if (childData) {
          updateSummaryDisplay();
          }
          break;
      }
  
      currentStep = stepNumber;
      updateProgressBar();
    }
  
    // ===================================
    // CHILD DATA MANAGEMENT
    // ===================================
  
  function saveChildData() {
    console.log("Saving child data");
  
    childData = {
      firstName: document.getElementById("00N8b00000Bz3KG").value,
      lastName: document.getElementById("00N8b00000Bz3KL").value,
      birthDate: document.getElementById("00N8b00000GjjfI").value,
      gender: document.getElementById("00NRc00000kLAzZ").value,
      level: document.getElementById("00NRc00000kLBFh").value,
    };
  
    console.log("Child data saved:", childData);
  }
    function clearChildForm() {
      // Clear step 2 fields
      document.getElementById("00N8b00000Bz3KG").value = "";
      document.getElementById("00N8b00000Bz3KL").value = "";
      document.getElementById("00N8b00000GjjfI").value = "";
      document.getElementById("00NRc00000kLAzZ").value = "";
      document.getElementById("00NRc00000kLBFh").value = "";
    }
  
  
  
    function updateSummaryDisplay() {
      const summaryContainer = document.getElementById("childrenSummaryCards");
      let summaryHTML = "";
  
      if (childData) {
        const age = childData.birthDate ? calculateAge(childData.birthDate) : "Unknown";
  
          summaryHTML += `
            <div class="child-summary-card">
                <div class="child-card-header">
                <div>Child Information</div>
                <a href="#" class="button is-secondary w-button edit-child-btn">Edit</a>
                </div>
                <div class="child-card-content">
                  <div class="summary-row">
                    <span class="summary-label">Name:</span>
                  <span class="summary-value">${childData.firstName} ${childData.lastName}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">Age:</span>
                    <span class="summary-value">${age}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">Gender:</span>
                  <span class="summary-value">${childData.gender}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">Level:</span>
                  <span class="summary-value">${childData.level}</span>
                  </div>
                </div>
              </div>
            `;
        }
  
      summaryContainer.innerHTML = summaryHTML;
  
      // Add edit button listener
      const editBtn = document.querySelector(".edit-child-btn");
      if (editBtn) {
        editBtn.addEventListener("click", function (e) {
          e.preventDefault();
          editChild();
        });
      }
    }
  
    function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
  
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
  
    // Handle negative ages
    if (age < 0) {
      return "Invalid date";
    }
  
    return age + " years old";
  }
  
  
    function editChild() {
      if (!childData) return;
  
      // Populate form with child data
      document.getElementById("00N8b00000Bz3KG").value = childData.firstName;
      document.getElementById("00N8b00000Bz3KL").value = childData.lastName;
      document.getElementById("00N8b00000GjjfI").value = childData.birthDate;
      document.getElementById("00NRc00000kLAzZ").value = childData.gender;
      document.getElementById("00NRc00000kLBFh").value = childData.level;
  
      // Go back to step 2
      showStep(2);
    }
  
    // ===================================
    // VALIDATION FUNCTIONS
    // ===================================
  
    function validateStep(stepNumber) {
      let isValid = true;
      let validationElement;
  
      switch (stepNumber) {
        case 1:
          validationElement = validation1;
          if (!document.getElementById("00NRc00000kKz0K").value) {
            document.getElementById("00NRc00000kKz0K").classList.add("error");
            isValid = false;
          }
          if (!document.getElementById("00NRc00000kL8Eb").value) {
            document.getElementById("00NRc00000kL8Eb").classList.add("error");
            isValid = false;
          }
          if (!document.getElementById("Availability").value) {
            document.getElementById("Availability").classList.add("error");
            isValid = false;
          }
          if (!document.getElementById("00NRc00000kLALF").value) {
            document.getElementById("00NRc00000kLALF").classList.add("error");
            isValid = false;
          }
          break;
  
        case 2:
          validationElement = validation2;
          if (!document.getElementById("00N8b00000Bz3KG").value) {
            document.getElementById("00N8b00000Bz3KG").classList.add("error");
            isValid = false;
          }
          if (!document.getElementById("00N8b00000Bz3KL").value) {
            document.getElementById("00N8b00000Bz3KL").classList.add("error");
            isValid = false;
          }
          if (!document.getElementById("00N8b00000GjjfI").value) {
            document.getElementById("00N8b00000GjjfI").classList.add("error");
            isValid = false;
          }
          if (!document.getElementById("00NRc00000kLAzZ").value) {
            document.getElementById("00NRc00000kLAzZ").classList.add("error");
            isValid = false;
          }
          if (!document.getElementById("00NRc00000kLBFh").value) {
            document.getElementById("00NRc00000kLBFh").classList.add("error");
            isValid = false;
          }
          break;
  
        case 3:
          // Step 3 is now a textarea, no validation needed
          return true;
      }
  
      if (!isValid && validationElement) {
        validationElement.textContent = "Please fill in all the required fields";
        validationElement.style.display = "block";
      } else if (validationElement && isValid) {
        validationElement.style.display = "none";
      }
  
      return isValid;
    }
  
    // ===================================
    // EVENT LISTENERS
    // ===================================
  
    // Track input changes to remove error styling
    form.addEventListener("input", function (e) {
      if (e.target.classList.contains("error") && e.target.value.trim() !== "") {
        e.target.classList.remove("error");
      }
    });
  
    // Track select changes to remove error styling
    form.addEventListener("change", function (e) {
      if (
        e.target.tagName === "SELECT" &&
        e.target.classList.contains("error") &&
        e.target.value !== ""
      ) {
        e.target.classList.remove("error");
      }
    });
  
  // Next button click
  nextBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
  
    if (currentStep === 2) {
      // Save child data and proceed to step 3
      saveChildData();
      showStep(3);
    } else if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        showStep(currentStep + 1);
      }
    }
  });
  
  
    // Previous button click
    prevBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
  
      if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    });
  
    // Submit button click
    submitBtn.addEventListener("click", async function (e) {
      e.preventDefault();
      e.stopPropagation();
  
      if (currentStep === 3) {
        submitBtn.disabled = true;
        submitBtn.value = "Submitting...";
  
        try {
          // Save any final data
          saveChildData();
  
          submitBtn.value = "Success!";

          console.log("Child data:", childData);
          // Redirect to thank-you page after successful submission (defer to avoid Webflow handlers)
          setTimeout(function () {
            window.location.replace("/thank-you-schedule");
          }, 0);
        } catch (error) {
          console.error("Submission failed:", error);
          submitBtn.disabled = false;
          submitBtn.value = "Submit";
        }
      }
    });
  
  
    // Prevent default form submission
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  
  
  // Make childData globally accessible
  window.childData = childData;
  
  });
  