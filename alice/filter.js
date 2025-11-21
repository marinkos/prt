document.addEventListener("DOMContentLoaded", () => {
  // Get dropdowns
  const locationDropdown = document.getElementById("positionsLocation");
  const teamDropdown = document.getElementById("positionsTeam");
  
  // Get all collection items (including hidden ones from Load More)
  const getAllCollectionItems = () => {
    return document.querySelectorAll(".positions_collection-item");
  };
  
  let collectionItems = getAllCollectionItems();
  
  if (!locationDropdown || !teamDropdown || collectionItems.length === 0) {
    console.warn("Filter elements not found");
    return;
  }

  // Find Webflow pagination button (Load More)
  const getPaginationButton = () => {
    return document.querySelector('.w-pagination-next') || 
           document.querySelector('.pagination .w-pagination-next');
  };
  
  const getPaginationWrapper = () => {
    return document.querySelector('.w-pagination-wrapper') || 
           document.querySelector('.pagination');
  };

  // Extract unique locations and teams from collection
  const locationsSet = new Set();
  const teamsSet = new Set();

  collectionItems.forEach((item) => {
    const locationEl = item.querySelector('[data-filter="location"]');
    const teamEl = item.querySelector('[data-filter="team"]');
    
    if (locationEl) {
      const location = locationEl.textContent.trim();
      if (location) locationsSet.add(location);
    }
    
    if (teamEl) {
      const team = teamEl.textContent.trim();
      if (team) teamsSet.add(team);
    }
  });

  // Populate location dropdown
  const sortedLocations = Array.from(locationsSet).sort();
  sortedLocations.forEach((location) => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    locationDropdown.appendChild(option);
  });

  // Populate team dropdown
  const sortedTeams = Array.from(teamsSet).sort();
  sortedTeams.forEach((team) => {
    const option = document.createElement("option");
    option.value = team;
    option.textContent = team;
    teamDropdown.appendChild(option);
  });

  // Function to check if any filter is active
  function isFilterActive() {
    return locationDropdown.value !== "All Locations" || teamDropdown.value !== "All Teams";
  }

  // Filter function
  function filterPositions() {
    // Refresh collection items to get all items (including newly loaded ones)
    collectionItems = getAllCollectionItems();
    
    const selectedLocation = locationDropdown.value;
    const selectedTeam = teamDropdown.value;
    const filterActive = isFilterActive();

    // Hide/show pagination (Load More button) based on filter state
    const paginationButton = getPaginationButton();
    const paginationWrapper = getPaginationWrapper();
    
    if (filterActive) {
      // Hide pagination when filtering
      if (paginationButton) {
        paginationButton.style.display = "none";
      }
      if (paginationWrapper) {
        paginationWrapper.style.display = "none";
      }
    } else {
      // Show pagination when no filters are active
      if (paginationButton) {
        paginationButton.style.display = "";
      }
      if (paginationWrapper) {
        paginationWrapper.style.display = "";
      }
    }

    // Show all items when filtering (bypass Load More visibility)
    collectionItems.forEach((item) => {
      const locationEl = item.querySelector('[data-filter="location"]');
      const teamEl = item.querySelector('[data-filter="team"]');
      
      const itemLocation = locationEl ? locationEl.textContent.trim() : "";
      const itemTeam = teamEl ? teamEl.textContent.trim() : "";

      // Check if item matches filters
      const locationMatch = selectedLocation === "All Locations" || selectedLocation === itemLocation;
      const teamMatch = selectedTeam === "All Teams" || selectedTeam === itemTeam;

      // Show or hide item based on both filters
      if (locationMatch && teamMatch) {
        item.style.display = "";
        // Remove any Load More visibility classes/attributes that might hide it
        item.classList.remove("w-dyn-item--hidden");
        item.removeAttribute("fs-loadmore-element");
      } else {
        item.style.display = "none";
      }
    });
  }

  // Add event listeners
  locationDropdown.addEventListener("change", filterPositions);
  teamDropdown.addEventListener("change", filterPositions);

  // Also listen for Load More events to refresh items when new ones are loaded
  // This ensures we can filter newly loaded items
  const observer = new MutationObserver(() => {
    const newItems = getAllCollectionItems();
    if (newItems.length > collectionItems.length) {
      collectionItems = newItems;
      // Re-extract unique values if new items were loaded
      newItems.forEach((item) => {
        const locationEl = item.querySelector('[data-filter="location"]');
        const teamEl = item.querySelector('[data-filter="team"]');
        
        if (locationEl) {
          const location = locationEl.textContent.trim();
          if (location && !locationsSet.has(location)) {
            locationsSet.add(location);
            const option = document.createElement("option");
            option.value = location;
            option.textContent = location;
            locationDropdown.appendChild(option);
            // Sort options
            const options = Array.from(locationDropdown.options);
            options.sort((a, b) => {
              if (a.value === "All Locations") return -1;
              if (b.value === "All Locations") return 1;
              return a.textContent.localeCompare(b.textContent);
            });
            locationDropdown.innerHTML = "";
            options.forEach(opt => locationDropdown.appendChild(opt));
          }
        }
        
        if (teamEl) {
          const team = teamEl.textContent.trim();
          if (team && !teamsSet.has(team)) {
            teamsSet.add(team);
            const option = document.createElement("option");
            option.value = team;
            option.textContent = team;
            teamDropdown.appendChild(option);
            // Sort options
            const options = Array.from(teamDropdown.options);
            options.sort((a, b) => {
              if (a.value === "All Teams") return -1;
              if (b.value === "All Teams") return 1;
              return a.textContent.localeCompare(b.textContent);
            });
            teamDropdown.innerHTML = "";
            options.forEach(opt => teamDropdown.appendChild(opt));
          }
        }
      });
      
      // Re-apply filter if active
      if (isFilterActive()) {
        filterPositions();
      }
    }
  });

  // Observe the collection list for changes (when pagination loads new items)
  const collectionList = document.querySelector(".positions_collection-list");
  if (collectionList) {
    observer.observe(collectionList, {
      childList: true,
      subtree: true
    });
  }
  
  // Also observe pagination wrapper to detect when new items are loaded
  const paginationWrapper = getPaginationWrapper();
  if (paginationWrapper) {
    observer.observe(paginationWrapper, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'aria-hidden']
    });
  }
});
