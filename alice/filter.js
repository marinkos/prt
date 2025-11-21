document.addEventListener("DOMContentLoaded", () => {
  // Get dropdowns
  const locationDropdown = document.getElementById("positionsLocation");
  const teamDropdown = document.getElementById("positionsTeam");
  
  // Get all collection items
  const collectionItems = document.querySelectorAll(".positions_collection-item");
  
  if (!locationDropdown || !teamDropdown || collectionItems.length === 0) {
    console.warn("Filter elements not found");
    return;
  }

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

  // Filter function
  function filterPositions() {
    const selectedLocation = locationDropdown.value;
    const selectedTeam = teamDropdown.value;

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
      } else {
        item.style.display = "none";
      }
    });
  }

  // Add event listeners
  locationDropdown.addEventListener("change", filterPositions);
  teamDropdown.addEventListener("change", filterPositions);
});
