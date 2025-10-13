// ===================================
// INTAKE FORM - STEP FUNCTIONALITY
// ===================================

document.addEventListener("DOMContentLoaded", function () {
    // Constants
    const TOTAL_STEPS = 4;
  
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
    const validation3 = document.getElementById("validationStep3");
  
    // Make progress elements globally accessible for upload script
    window.progressBar = progressBar;
    window.progressText = progressText;
  
    // Current step tracker
    let currentStep = 1;
  
    // Track which child we're working on
    let currentChildIndex = 0;
  
    // Store all children data
    const childrenData = [];
  
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
      validation3.style.display = "none";
  
      // Update child heading if on child 2+
      if (currentChildIndex > 0 && (stepNumber === 2 || stepNumber === 3)) {
        const step2Heading = step2.querySelector(".intake_heading");
        const step3Heading = step3.querySelector(".intake_heading");
  
        if (step2Heading) {
          step2Heading.textContent = `Child #${
            currentChildIndex + 1
          } Information`;
        }
        if (step3Heading) {
          step3Heading.textContent = `Child #${
            currentChildIndex + 1
          } - Upload Your Documentation`;
        }
      }
  
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
          prevBtn.style.display = currentChildIndex > 0 ? "flex" : "flex";
          nextBtn.style.display = "block";
          skipBtn.style.display = "none";
          submitBtn.style.display = "none";
          break;
  case 3:
    step3.style.display = "block";
    prevBtn.style.display = "flex";
    nextBtn.style.display = "block";
    skipBtn.style.display = "block";
    submitBtn.style.display = "none";
    
    // Restore files for current child if editing
    if (childrenData[currentChildIndex]) {
      restoreChildFiles(currentChildIndex);
    }
    break;
        case 4:
          step4Summary.style.display = "block";
          prevBtn.style.display = "flex";
          nextBtn.style.display = "none";
          skipBtn.style.display = "none";
          submitBtn.style.display = "block";
          submitBtn.value = "Submit";
          updateSummaryDisplay();
          break;
      }
  
      currentStep = stepNumber;
      updateProgressBar();
    }
  
    // ===================================
    // CHILD DATA MANAGEMENT
    // ===================================
  
  function saveCurrentChildData(skipFiles = false) {
    console.log(`Saving child ${currentChildIndex}, skipFiles: ${skipFiles}`);
    
    // Create a deep copy of the pending files
    let childFiles = null;
    let filesSkipped = skipFiles;
  
    if (!skipFiles && window.pendingFiles) {
      // Count files to determine if any were actually added
      const fileCount =
        (window.pendingFiles.primaryInsuranceFront ? 1 : 0) +
        (window.pendingFiles.primaryInsuranceBack ? 1 : 0) +
        (window.pendingFiles.diagnosisReport ? 1 : 0) +
        (window.pendingFiles.additionalFiles
          ? window.pendingFiles.additionalFiles.length
          : 0);
  
      console.log(`File count for child ${currentChildIndex}: ${fileCount}`);
  
      if (fileCount > 0) {
        filesSkipped = false;
        childFiles = {
          primaryInsuranceFront: window.pendingFiles.primaryInsuranceFront
            ? { ...window.pendingFiles.primaryInsuranceFront }
            : null,
          primaryInsuranceBack: window.pendingFiles.primaryInsuranceBack
            ? { ...window.pendingFiles.primaryInsuranceBack }
            : null,
          diagnosisReport: window.pendingFiles.diagnosisReport
            ? { ...window.pendingFiles.diagnosisReport }
            : null,
          additionalFiles: window.pendingFiles.additionalFiles
            ? [...window.pendingFiles.additionalFiles]
            : [],
        };
      } else {
        filesSkipped = true;
      }
    }
  
    const childData = {
      firstName: document.getElementById("First-Name").value,
      lastName: document.getElementById("Last-Name").value,
      birthDate: document.getElementById("birthDate").value,
      gender: document.getElementById("Gender").value,
      level: document.getElementById("Level").value,
      availability: document.getElementById("Availability").value,
      files: childFiles || {
        primaryInsuranceFront: null,
        primaryInsuranceBack: null,
        diagnosisReport: null,
        additionalFiles: [],
      },
      filesSkipped: filesSkipped,
    };
  
    console.log(`Saving child ${currentChildIndex} with filesSkipped: ${filesSkipped}`);
    childrenData[currentChildIndex] = childData;
  }
    function clearChildForm() {
      // Clear step 2 fields
      document.getElementById("First-Name").value = "";
      document.getElementById("Last-Name").value = "";
      document.getElementById("birthDate").value = "";
      document.getElementById("Gender").value = "";
      document.getElementById("Level").value = "";
      document.getElementById("Availability").value = "";
  
      // Clear file uploads
      if (window.clearFileUploads) {
        window.clearFileUploads();
      }
  
      // Clear the upload list UI
      const uploadList = document.getElementById("uploadList");
      if (uploadList) {
        const fileItems = uploadList.querySelectorAll(
          ".file-item-template:not(.success-template):not(.error-template)"
        );
        fileItems.forEach((item) => item.remove());
        uploadList.style.display = "none";
      }
  
      // Reset pending files
      if (window.pendingFiles) {
        window.pendingFiles.primaryInsuranceFront = null;
        window.pendingFiles.primaryInsuranceBack = null;
        window.pendingFiles.diagnosisReport = null;
        window.pendingFiles.additionalFiles = [];
      }
    }
  
  function restoreChildFiles(childIndex) {
    const child = childrenData[childIndex];
    if (!child) return;
  
    // Clear current files first
    if (window.clearFileUploads) {
      window.clearFileUploads();
    }
  
    // Clear the upload list UI
    const uploadList = document.getElementById("uploadList");
    if (uploadList) {
      const fileItems = uploadList.querySelectorAll(
        ".file-item-template:not(.success-template):not(.error-template)"
      );
      fileItems.forEach((item) => item.remove());
      uploadList.style.display = "none";
    }
  
    // Restore files for this specific child
    if (window.pendingFiles && child.files) {
      window.pendingFiles.primaryInsuranceFront =
        child.files.primaryInsuranceFront;
      window.pendingFiles.primaryInsuranceBack =
        child.files.primaryInsuranceBack;
      window.pendingFiles.diagnosisReport = child.files.diagnosisReport;
      window.pendingFiles.additionalFiles = child.files.additionalFiles || [];
  
      // Recreate UI for existing files
      const filesToRestore = [];
      if (child.files.primaryInsuranceFront)
        filesToRestore.push(child.files.primaryInsuranceFront);
      if (child.files.primaryInsuranceBack)
        filesToRestore.push(child.files.primaryInsuranceBack);
      if (child.files.diagnosisReport)
        filesToRestore.push(child.files.diagnosisReport);
      if (child.files.additionalFiles)
        filesToRestore.push(...child.files.additionalFiles);
  
      filesToRestore.forEach((fileData) => {
        if (fileData && fileData.element) {
          uploadList.appendChild(fileData.element);
          uploadList.style.display = "block";
        }
      });
    }
    
    // Update buttons after restoring files with a delay
    setTimeout(() => {
    }, 100);
  }
  
  /*function updateFileUploadButtons() {
    // Check if any files are present in pendingFiles
    let hasFiles = window.pendingFiles && (
      window.pendingFiles.primaryInsuranceFront ||
      window.pendingFiles.primaryInsuranceBack ||
      window.pendingFiles.diagnosisReport ||
      (window.pendingFiles.additionalFiles && window.pendingFiles.additionalFiles.length > 0)
    );
  
    // Also check if we're editing and the child has existing files
    if (!hasFiles && childrenData[currentChildIndex] && childrenData[currentChildIndex].files) {
      const childFiles = childrenData[currentChildIndex].files;
      hasFiles = (
        childFiles.primaryInsuranceFront ||
        childFiles.primaryInsuranceBack ||
        childFiles.diagnosisReport ||
        (childFiles.additionalFiles && childFiles.additionalFiles.length > 0)
      );
    }
  
    if (currentStep === 3) {
      if (hasFiles) {
        // Show Next button, hide Skip button
        nextBtn.style.display = "block";
        skipBtn.style.display = "none";
      } else {
        // Show Skip button, hide Next button
        nextBtn.style.display = "none";
        skipBtn.style.display = "block";
      }
    }
  }*/
  
    function updateSummaryDisplay() {
      const summaryContainer = document.getElementById("childrenSummaryCards");
      let summaryHTML = "";
  
      childrenData.forEach((child, index) => {
        if (child) {
          const age = child.birthDate ? calculateAge(child.birthDate) : "Unknown";
          const fileCount = countChildFiles(child);
          const fileText = child.filesSkipped
            ? "Files skipped"
            : `${fileCount} files uploaded`;
  
          summaryHTML += `
              <div class="child-summary-card" data-child-index="${index}">
                <div class="child-card-header">
                  <div>Child #${index + 1}</div>
                  <a href="#" class="button is-secondary w-button edit-child-btn" data-child-index="${index}">Edit</a>
                </div>
                <div class="child-card-content">
                  <div class="summary-row">
                    <span class="summary-label">Name:</span>
                    <span class="summary-value">${child.firstName} ${
            child.lastName
          }</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">Age:</span>
                    <span class="summary-value">${age}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">Gender:</span>
                    <span class="summary-value">${child.gender}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">Level:</span>
                    <span class="summary-value">${child.level}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">Available Hours:</span>
                    <span class="summary-value">${child.availability}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">Documents:</span>
                    <span class="summary-value">${fileText}</span>
                  </div>
                </div>
              </div>
            `;
        }
      });
  
      summaryContainer.innerHTML = summaryHTML;
  
      // Add edit button listeners
      document.querySelectorAll(".edit-child-btn").forEach((btn) => {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          const childIndex = parseInt(this.dataset.childIndex);
          editChild(childIndex);
        });
      });
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
  
    function countChildFiles(child) {
      if (!child.files) return 0;
  
      let count = 0;
      if (child.files.primaryInsuranceFront) count++;
      if (child.files.primaryInsuranceBack) count++;
      if (child.files.diagnosisReport) count++;
      if (child.files.additionalFiles)
        count += child.files.additionalFiles.length;
      return count;
    }
  
    function editChild(childIndex) {
      const child = childrenData[childIndex];
      if (!child) return;
  
      currentChildIndex = childIndex;
  
      // Populate form with child data
      document.getElementById("First-Name").value = child.firstName;
      document.getElementById("Last-Name").value = child.lastName;
      document.getElementById("birthDate").value = child.birthDate;
      document.getElementById("Gender").value = child.gender;
      document.getElementById("Level").value = child.level;
      document.getElementById("Availability").value = child.availability;
  
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
          if (!document.getElementById("Language").value) {
            document.getElementById("Language").classList.add("error");
            isValid = false;
          }
          if (!document.getElementById("Expirience").value) {
            document.getElementById("Expirience").classList.add("error");
            isValid = false;
          }
          break;
  
        case 2:
          validationElement = validation2;
          if (!document.getElementById("First-Name").value) {
            document.getElementById("First-Name").classList.add("error");
            isValid = false;
          }
          if (!document.getElementById("Last-Name").value) {
            document.getElementById("Last-Name").classList.add("error");
            isValid = false;
          }
          if (!document.getElementById("birthDate").value) {
            document.getElementById("birthDate").classList.add("error");
            isValid = false;
          }
          if (!document.getElementById("Gender").value) {
            document.getElementById("Gender").classList.add("error");
            isValid = false;
          }
          if (!document.getElementById("Level").value) {
            document.getElementById("Level").classList.add("error");
            isValid = false;
          }
          if (!document.getElementById("Availability").value) {
            document.getElementById("Availability").classList.add("error");
            isValid = false;
          }
          break;
  
        case 3:
          // File upload is now optional, so always return true
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
  
    if (currentStep === 3) {
      // On file upload step with files, proceed to summary
      saveCurrentChildData(false);
      showStep(4);
    } else if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        showStep(currentStep + 1);
      }
    }
  });
  
    // Skip button click (for file upload step)
    if (skipBtn) {
      skipBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
  
        if (currentStep === 3) {
          // Save current child data and mark files as skipped
          saveCurrentChildData(true);
          showStep(4);
        }
      });
    }
  
    // Previous button click
    prevBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
  
      if (currentStep === 2 && currentChildIndex > 0) {
        // First save current data before going back
        const tempData = {
          firstName: document.getElementById("First-Name").value,
          lastName: document.getElementById("Last-Name").value,
          birthDate: document.getElementById("birthDate").value,
          gender: document.getElementById("Gender").value,
          level: document.getElementById("Level").value,
          availability: document.getElementById("Availability").value,
        };
  
        // Only save if there's actual data
        if (tempData.firstName || tempData.lastName) {
          if (!childrenData[currentChildIndex]) {
            childrenData[currentChildIndex] = {
              ...tempData,
              files: null,
              filesSkipped: true,
            };
          }
        }
  
        // When on step 2 for additional children, go back to summary
        showStep(4);
      } else if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    });
  
    // Submit button click - different behavior based on current step
    submitBtn.addEventListener("click", async function (e) {
      e.preventDefault();
      e.stopPropagation();
  
      if (currentStep === 4) {
        submitBtn.disabled = true;
        submitBtn.value = "Uploading files...";
  
        try {
          for (let i = 0; i < childrenData.length; i++) {
            if (
              childrenData[i] &&
              childrenData[i].files &&
              !childrenData[i].filesSkipped
            ) {
              // Store current child index for file naming
              window.currentChildIndex = i;
              window.pendingFiles = childrenData[i].files;
  
              if (window.uploadAllFiles) {
                await window.uploadAllFiles();
              }
            }
          }
  
          submitBtn.value = "Success!";

          console.log("All children data:", childrenData);
          // Redirect to thank-you page after successful submission (defer to avoid Webflow handlers)
          setTimeout(function () {
            window.location.replace("/thank-you-schedule");
          }, 0);
        } catch (error) {
          console.error("Upload failed:", error);
          submitBtn.disabled = false;
          submitBtn.value = "Submit";
          alert("Failed to upload files. Please try again.");
        }
      }
    });
  
    // Add another child button
    const addAnotherBtn = document.getElementById("addAnotherChildBtn");
    console.log("Add Another Child button found?", addAnotherBtn);
  
    if (addAnotherBtn) {
    addAnotherBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Add another child clicked!");
  
      // Save current child data with files before adding another
      saveCurrentChildData(false); // Don't skip files
      
      currentChildIndex++;
      clearChildForm();
      showStep(2);
    });
  }
  
    // Prevent default form submission
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  
    // Make clearFileUploads function available globally
    window.clearFileUploads = function () {
      if (window.pendingFiles) {
        window.pendingFiles = {
          primaryInsuranceFront: null,
          primaryInsuranceBack: null,
          diagnosisReport: null,
          additionalFiles: [],
        };
      }
    };
  
  window.childrenData = childrenData;
  // Update currentChildIndex to be a getter/setter that references the local variable
  Object.defineProperty(window, 'currentChildIndex', {
    get: function() { return currentChildIndex; },
    set: function(value) { currentChildIndex = value; },
    configurable: true
  });
    window.currentChildIndex = currentChildIndex;
  
    // ===================================
    // FILE UPLOAD FUNCTIONALITY
    // ===================================
  
    (function () {
      // Your Vercel API endpoint
      const API_ENDPOINT =
        "https://s3-upload-g3h67hcwn-marinas-projects-8b38807b.vercel.app/api/get-upload-url";
  
      // Get upload elements
      const fileInput = document.getElementById("fileInput");
      const browseButton = document.getElementById("browseButton");
      const dropzone = document.getElementById("imageDropzone");
      const uploadList = document.getElementById("uploadList");
  
      // Files waiting to be uploaded - this will be specific to each child
      const pendingFiles = {
        primaryInsuranceFront: null,
        primaryInsuranceBack: null,
        diagnosisReport: null,
        additionalFiles: [],
      };

      // Clear all pending files and hide UI for the current child
      function clearFileUploads() {
        pendingFiles.primaryInsuranceFront = null;
        pendingFiles.primaryInsuranceBack = null;
        pendingFiles.diagnosisReport = null;
        pendingFiles.additionalFiles = [];

        const uploadListEl = document.getElementById("uploadList");
        if (uploadListEl) {
          const visibleItems = uploadListEl.querySelectorAll(
            ".file-item-template:not(.success-template):not(.error-template)"
          );
          visibleItems.forEach((item) => item.remove());
          uploadListEl.style.display = "none";
        }
      }
  
      // Initialize upload handlers
      function initializeUploads() {
        // Hide template items
        const templates = document.querySelectorAll(
          ".upload-list .file-item-template"
        );
        if (templates.length >= 2) {
          templates[0].style.display = "none";
          templates[0].classList.add("success-template");
          templates[1].style.display = "none";
          templates[1].classList.add("error-template");
        }
  
        // Browse button click
        browseButton.addEventListener("click", function (e) {
          e.preventDefault();
          fileInput.click();
        });
  
        // File input change
        fileInput.addEventListener("change", function (e) {
          handleFiles(e.target.files);
          e.target.value = "";
        });
  
        // Drag and drop
        dropzone.addEventListener("dragover", function (e) {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add("drag-over");
        });
  
        dropzone.addEventListener("dragleave", function (e) {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove("drag-over");
        });
  
        dropzone.addEventListener("drop", function (e) {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove("drag-over");
          handleFiles(e.dataTransfer.files);
        });
  
        // Allow multiple file types
        fileInput.setAttribute("accept", "image/*,.pdf");
        fileInput.setAttribute("multiple", "true");
      }
  
      // Handle file selection
      function handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
          addFileToQueue(files[i]);
        }
      }
  
      // Add file to queue
      function addFileToQueue(file) {
        if (!validateFile(file)) {
          return;
        }
  
        const fileItem = createFileItem(file);
        uploadList.appendChild(fileItem);
        uploadList.style.display = "block";
  
        // Show "Ready to upload" instead of fake progress
        const progressBar = fileItem.querySelector(".file-progress-bar");
        const progressPercent = fileItem.querySelector(".file-progress-percent");
  
        progressBar.style.width = "100%";
        progressBar.style.backgroundColor = "#4CAF50";
        progressPercent.textContent = "Ready";
  
        // Categorize and store file
        categorizeFile(file, fileItem);
      }
  
      // Categorize file based on name
      function categorizeFile(file, fileItem) {
        const fileName = file.name.toLowerCase();
        let category = null;
  
        if (fileName.includes("insurance") || fileName.includes("card")) {
          if (fileName.includes("front")) {
            pendingFiles.primaryInsuranceFront = { file, element: fileItem };
            category = "primaryInsuranceFront";
          } else if (fileName.includes("back")) {
            pendingFiles.primaryInsuranceBack = { file, element: fileItem };
            category = "primaryInsuranceBack";
          } else {
            if (!pendingFiles.primaryInsuranceFront) {
              pendingFiles.primaryInsuranceFront = { file, element: fileItem };
              category = "primaryInsuranceFront";
            } else if (!pendingFiles.primaryInsuranceBack) {
              pendingFiles.primaryInsuranceBack = { file, element: fileItem };
              category = "primaryInsuranceBack";
            } else {
              pendingFiles.additionalFiles.push({ file, element: fileItem });
              category = "additional";
            }
          }
        } else if (
          fileName.includes("diagnosis") ||
          fileName.includes("report") ||
          file.type === "application/pdf"
        ) {
          pendingFiles.diagnosisReport = { file, element: fileItem };
          category = "diagnosisReport";
        } else {
          pendingFiles.additionalFiles.push({ file, element: fileItem });
          category = "additional";
        }
  
        fileItem.dataset.category = category;
      }
  
      // Create file item UI element
      function createFileItem(file) {
        const template = document
          .querySelector(".file-item-template.success-template")
          .cloneNode(true);
        template.classList.remove("success-template");
        template.style.display = "flex";
  
        template.querySelector(".file-name").textContent = file.name;
        template.querySelector(".file-size").textContent = formatFileSize(
          file.size
        );
  
        template.fileReference = file;
  
  // Add delete functionality
  const deleteBtn = template.querySelector(".file-delete");
  deleteBtn.addEventListener("click", function () {
    // Remove from pending files
    const category = template.dataset.category;
    if (category === "additional") {
      pendingFiles.additionalFiles = pendingFiles.additionalFiles.filter(
        (item) => item.element !== template
      );
    } else if (category && pendingFiles[category]) {
      pendingFiles[category] = null;
    }
  
    template.remove();
  
    // Hide list if empty
    const visibleItems = uploadList.querySelectorAll(
      ".file-item-template:not(.success-template):not(.error-template)"
    );
    if (visibleItems.length === 0) {
      uploadList.style.display = "none";
    }
    
  });
  
        return template;
      }
  
      // Upload all pending files
      async function uploadAllFiles() {
        const filesToUpload = [];
        const userEmail =
          document.getElementById("hidden-email").value || "unknown";
        const childIndex = window.currentChildIndex || 0;
        const childData = window.childrenData[childIndex];
        const userName = childData
          ? `${childData.firstName}_${childData.lastName}`
          : "unknown";
  
        // Collect all files to upload
        if (pendingFiles.primaryInsuranceFront) {
          filesToUpload.push({
            ...pendingFiles.primaryInsuranceFront,
            prefix: `child_${childIndex + 1}_${userName}_insurance_front`,
          });
        }
        if (pendingFiles.primaryInsuranceBack) {
          filesToUpload.push({
            ...pendingFiles.primaryInsuranceBack,
            prefix: `child_${childIndex + 1}_${userName}_insurance_back`,
          });
        }
        if (pendingFiles.diagnosisReport) {
          filesToUpload.push({
            ...pendingFiles.diagnosisReport,
            prefix: `child_${childIndex + 1}_${userName}_diagnosis`,
          });
        }
        pendingFiles.additionalFiles.forEach((item, index) => {
          filesToUpload.push({
            ...item,
            prefix: `child_${childIndex + 1}_${userName}_additional_${index + 1}`,
          });
        });
  
        // Upload all files
        const uploadPromises = filesToUpload.map((item) => uploadFile(item));
  
        try {
          const results = await Promise.all(uploadPromises);
          return results;
        } catch (error) {
          console.error("Some files failed to upload:", error);
          throw error;
        }
      }
  
      // Upload single file
      async function uploadFile(item) {
        const { file, element, prefix } = item;
        const progressBar = element.querySelector(".file-progress-bar");
        const progressPercent = element.querySelector(".file-progress-percent");
  
        try {
          // Reset progress
          progressBar.style.width = "0%";
          progressBar.style.backgroundColor = "#2196F3";
          progressPercent.textContent = "0%";
  
          // Generate unique filename
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(7);
          const fileExtension = file.name.split(".").pop();
          const fileName = `${prefix}_${timestamp}_${randomId}.${fileExtension}`;
  
          // Get presigned URL
          const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileName: fileName,
              fileType: file.type,
            }),
          });
  
          if (!response.ok) {
            throw new Error("Failed to get upload URL");
          }
  
          const { uploadUrl, fileUrl } = await response.json();
  
          // Upload file with progress
          await uploadFileWithProgress(
            file,
            uploadUrl,
            progressBar,
            progressPercent
          );
  
          // Success
          element.classList.add("completed");
          element.dataset.fileUrl = fileUrl;
  
          // Hide delete button, show checkmark
          const deleteIcon = element.querySelector(".icon-delete");
          const checkIcon = element.querySelector(".icon-completed");
          if (deleteIcon) deleteIcon.style.display = "none";
          if (checkIcon) checkIcon.style.display = "block";
  
          return { success: true, fileUrl, fileName };
        } catch (error) {
          console.error("Upload failed:", error);
          element.classList.add("failed");
          progressBar.style.width = "100%";
          progressBar.style.backgroundColor = "#dc3545";
          progressPercent.textContent = "Failed";
  
          throw error;
        }
      }
  
      // Upload file with XMLHttpRequest for progress tracking
      function uploadFileWithProgress(
        file,
        uploadUrl,
        progressBar,
        progressPercent
      ) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
  
          xhr.upload.addEventListener("progress", function (e) {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 100);
              progressBar.style.width = percentComplete + "%";
              progressPercent.textContent = percentComplete + "%";
            }
          });
  
          xhr.addEventListener("load", function () {
            if (xhr.status === 200) {
              progressBar.style.width = "100%";
              progressPercent.textContent = "100%";
              progressBar.style.backgroundColor = "#4CAF50";
              resolve();
            } else {
              reject(new Error("Upload failed"));
            }
          });
  
          xhr.addEventListener("error", reject);
  
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
      }
  
      // Validate file
      function validateFile(file) {
        const maxSize = file.type.includes("pdf")
          ? 25 * 1024 * 1024
          : 10 * 1024 * 1024;
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "application/pdf",
        ];
  
        if (!allowedTypes.includes(file.type)) {
          alert("Please upload only images (JPEG, PNG, GIF) or PDF files");
          return false;
        }
  
        if (file.size > maxSize) {
          alert(
            `File size exceeds limit. Maximum size: ${
              file.type.includes("pdf") ? "25MB" : "10MB"
            }`
          );
          return false;
        }
  
        return true;
      }
  
      // Format file size
      function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + " bytes";
        else if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
        else return Math.round((bytes / 1048576) * 10) / 10 + " MB";
      }
  
      // Make pendingFiles accessible globally
      window.pendingFiles = pendingFiles;
  
      // Initialize
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeUploads);
      } else {
        initializeUploads();
      }
  
      // Expose functions for form integration
      window.uploadAllFiles = uploadAllFiles;
      window.clearFileUploads = clearFileUploads;
    })();
  });
  