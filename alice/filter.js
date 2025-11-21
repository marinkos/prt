document.addEventListener("DOMContentLoaded", () => {
  function hideDuplicates(collectionId) {
    console.log(`\n=== Processing ${collectionId} ===`);
    
    // Find the collection by ID
    const collection = document.getElementById(collectionId);
    console.log('Collection found:', collection);
    if (!collection) {
      console.log(`Collection ${collectionId} not found!`);
      return;
    }

    // Find the parent nav that contains the dropdown links
    const dropdownNav = collection.closest('.positions_dropdown-nav');
    console.log('Dropdown nav found:', dropdownNav);
    if (!dropdownNav) {
      console.log('Dropdown nav not found!');
      return;
    }

    // Get all visible dropdown links in this nav
    const links = dropdownNav.querySelectorAll('.template-item.w-dropdown-link');
    console.log(`Found ${links.length} dropdown links`);
    
    const seen = new Set();
    let hiddenCount = 0;
    let visibleCount = 0;

    links.forEach((link, index) => {
      const text = link.textContent.trim();
      console.log(`Link ${index}: "${text}"`);
      
      if (seen.has(text)) {
        // Hide duplicate
        link.style.display = 'none';
        hiddenCount++;
        console.log(`  -> HIDDEN (duplicate)`);
      } else {
        // Keep first occurrence visible
        seen.add(text);
        link.style.display = '';
        visibleCount++;
        console.log(`  -> VISIBLE (first occurrence)`);
      }
    });
    
    console.log(`Summary: ${visibleCount} visible, ${hiddenCount} hidden`);
    console.log(`Unique values:`, Array.from(seen));
  }

  console.log('=== Initializing duplicate removal ===');
  
  // Hide duplicates in both collections
  hideDuplicates('locationCollection');
  hideDuplicates('teamCollection');

  // Watch for new items (pagination)
  const observer = new MutationObserver((mutations) => {
    console.log('=== MutationObserver triggered ===', mutations.length, 'mutations');
    hideDuplicates('locationCollection');
    hideDuplicates('teamCollection');
  });

  const filterWrapper = document.querySelector('.positions_filter-wrapper');
  console.log('Filter wrapper found:', filterWrapper);
  if (filterWrapper) {
    observer.observe(filterWrapper, {
      childList: true,
      subtree: true
    });
    console.log('Observer started watching filterWrapper');
  } else {
    console.log('Filter wrapper not found!');
  }
});
