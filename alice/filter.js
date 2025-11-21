document.addEventListener("DOMContentLoaded", () => {
  // Function to remove duplicates from Finsweet dropdown
  function removeDuplicatesFromDropdown(dropdownElement) {
    // Find the dropdown nav that contains the links
    const dropdownNav = dropdownElement.querySelector('.w-dropdown-list');
    if (!dropdownNav) return;

    // Get all dropdown links (excluding the reset button)
    const dropdownLinks = dropdownNav.querySelectorAll('.template-item.w-dropdown-link');
    
    if (dropdownLinks.length === 0) return;

    // Collect unique values
    const uniqueValues = new Set();
    const valueToElement = new Map();

    dropdownLinks.forEach((link) => {
      const text = link.textContent.trim();
      if (text && !uniqueValues.has(text)) {
        uniqueValues.add(text);
        valueToElement.set(text, link);
      }
    });

    // Get the list container where links are stored
    const listContainer = dropdownNav.querySelector('.list-container');
    if (!listContainer) return;

    // Remove all existing dropdown links
    dropdownLinks.forEach((link) => {
      link.remove();
    });

    // Sort unique values
    const sortedValues = Array.from(uniqueValues).sort();

    // Re-add only unique links in sorted order
    sortedValues.forEach((value) => {
      const originalLink = valueToElement.get(value);
      if (originalLink) {
        // Clone the original link to preserve attributes
        const newLink = originalLink.cloneNode(true);
        // Insert before the reset button (if it exists) or at the end
        const resetButton = dropdownNav.querySelector('.template-item.is-reset');
        if (resetButton && resetButton.parentNode) {
          resetButton.parentNode.insertBefore(newLink, resetButton);
        } else {
          listContainer.appendChild(newLink);
        }
      }
    });
  }

  // Find location dropdown using ID
  const locationCollection = document.getElementById('locationCollection');
  const locationDropdownWrapper = locationCollection?.closest('.w-dropdown[fs-selectcustom-element="dropdown"]');
  const locationDropdown = locationCollection?.querySelector('select[name="location"]');

  // Find team dropdown using ID
  const teamCollection = document.getElementById('teamCollection');
  const teamDropdownWrapper = teamCollection?.closest('.w-dropdown[fs-selectcustom-element="dropdown"]');
  const teamDropdown = teamCollection?.querySelector('select[name="team"]');

  // Remove duplicates from both dropdowns
  if (!locationCollection || !teamCollection) {
    console.warn('Location or Team collection not found. Make sure IDs are set: locationCollection and teamCollection');
    return;
  }

  if (locationDropdownWrapper) {
    removeDuplicatesFromDropdown(locationDropdownWrapper);
  }

  if (teamDropdownWrapper) {
    removeDuplicatesFromDropdown(teamDropdownWrapper);
  }

  // Also handle the hidden select options (remove duplicates there too)
  function removeDuplicatesFromSelect(selectElement) {
    if (!selectElement) return;

    const options = Array.from(selectElement.options);
    const uniqueValues = new Set();
    const valueToOption = new Map();

    // Skip the first option (usually "All Locations" or "All Teams")
    const firstOption = options[0];
    const firstValue = firstOption ? firstOption.value || firstOption.textContent.trim() : '';

    options.forEach((option) => {
      const value = option.value || option.textContent.trim();
      if (value && value !== firstValue && !uniqueValues.has(value)) {
        uniqueValues.add(value);
        valueToOption.set(value, option);
      }
    });

    // Clear all options except the first one
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }

    // Re-add unique options in sorted order
    const sortedValues = Array.from(uniqueValues).sort();
    sortedValues.forEach((value) => {
      const originalOption = valueToOption.get(value);
      if (originalOption) {
        const newOption = originalOption.cloneNode(true);
        selectElement.appendChild(newOption);
      }
    });
  }

  // Remove duplicates from hidden select elements
  if (locationDropdown) {
    removeDuplicatesFromSelect(locationDropdown);
  }

  if (teamDropdown) {
    removeDuplicatesFromSelect(teamDropdown);
  }

  // Watch for new items being loaded (in case pagination adds more)
  const observer = new MutationObserver(() => {
    // Re-run duplicate removal when new items are added
    // Re-find elements in case DOM changed
    const locCollection = document.getElementById('locationCollection');
    const locWrapper = locCollection?.closest('.w-dropdown[fs-selectcustom-element="dropdown"]');
    const locSelect = locCollection?.querySelector('select[name="location"]');
    
    const teamColl = document.getElementById('teamCollection');
    const teamWrapper = teamColl?.closest('.w-dropdown[fs-selectcustom-element="dropdown"]');
    const teamSelect = teamColl?.querySelector('select[name="team"]');
    
    if (locWrapper) {
      removeDuplicatesFromDropdown(locWrapper);
    }
    if (teamWrapper) {
      removeDuplicatesFromDropdown(teamWrapper);
    }
    if (locSelect) {
      removeDuplicatesFromSelect(locSelect);
    }
    if (teamSelect) {
      removeDuplicatesFromSelect(teamSelect);
    }
  });

  // Observe the dropdown containers for changes
  const filterWrapper = document.querySelector('.positions_filter-wrapper');
  if (filterWrapper) {
    observer.observe(filterWrapper, {
      childList: true,
      subtree: true
    });
  }
});
