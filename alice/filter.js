document.addEventListener("DOMContentLoaded", () => {
  function hideDuplicates(collectionId) {
    // Find the collection by ID
    const collection = document.getElementById(collectionId);
    if (!collection) return;

    // Find the parent nav that contains the dropdown links
    const dropdownNav = collection.closest('.positions_dropdown-nav');
    if (!dropdownNav) return;

    // Get all visible dropdown links in this nav
    const links = dropdownNav.querySelectorAll('.template-item.w-dropdown-link');
    const seen = new Set();

    links.forEach((link) => {
      const text = link.textContent.trim();
      if (seen.has(text)) {
        // Hide duplicate
        link.style.display = 'none';
      } else {
        // Keep first occurrence visible
        seen.add(text);
        link.style.display = '';
      }
    });
  }

  // Hide duplicates in both collections
  hideDuplicates('locationCollection');
  hideDuplicates('teamCollection');

  // Watch for new items (pagination)
  const observer = new MutationObserver(() => {
    hideDuplicates('locationCollection');
    hideDuplicates('teamCollection');
  });

  const filterWrapper = document.querySelector('.positions_filter-wrapper');
  if (filterWrapper) {
    observer.observe(filterWrapper, {
      childList: true,
      subtree: true
    });
  }
});
