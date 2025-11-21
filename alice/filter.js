document.addEventListener("DOMContentLoaded", () => {
  function hideDuplicates(collectionId) {
    const collection = document.getElementById(collectionId);
    if (!collection) return;

    // Get all dropdown links in this collection
    const links = collection.querySelectorAll('.template-item.w-dropdown-link');
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
