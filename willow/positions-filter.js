(() => {
  const FILTER_DROPDOWN_SELECTOR = "#positionsFilter";
  const FILTER_INPUT_SELECTOR = 'input[type="checkbox"][data-value]';
  const BLOCK_SELECTOR = ".positions_block[data-value]";
  const COUNT_SELECTOR = ".positions_count";
  const RESET_VALUE = "reset";

  const normalizeValue = (value) => (value || "").trim().toLowerCase();

  const updateCountLabel = (block) => {
    const countEl = block.querySelector(COUNT_SELECTOR);
    if (!countEl) return;

    let count = 0;
    const dynamicItems = block.querySelectorAll(".w-dyn-item");
    if (dynamicItems.length > 0) {
      count = dynamicItems.length;
    } else {
      const roleItems = block.querySelectorAll('[role="listitem"]');
      if (roleItems.length > 0) {
        count = roleItems.length;
      }
    }

    const suffix = count === 1 ? "Open Role" : "Open Roles";
    countEl.textContent = `${count} ${suffix}`;
  };

  const init = () => {
    const dropdown = document.querySelector(FILTER_DROPDOWN_SELECTOR);
    if (!dropdown) return;

    const checkboxes = Array.from(dropdown.querySelectorAll(FILTER_INPUT_SELECTOR));
    const blocks = Array.from(document.querySelectorAll(BLOCK_SELECTOR));
    if (checkboxes.length === 0 || blocks.length === 0) return;

    blocks.forEach(updateCountLabel);

    const getResetCheckbox = () =>
      checkboxes.find(
        (checkbox) => normalizeValue(checkbox.dataset.value) === RESET_VALUE
      );

    const enforceResetState = () => {
      const resetCheckbox = getResetCheckbox();
      if (!resetCheckbox || !resetCheckbox.checked) return;

      checkboxes.forEach((checkbox) => {
        if (checkbox !== resetCheckbox) checkbox.checked = false;
      });
    };

    const applyFilters = () => {
      enforceResetState();
      const resetCheckbox = getResetCheckbox();

      const selectedValues = new Set(
        checkboxes
          .filter((checkbox) => checkbox.checked)
          .map((checkbox) => normalizeValue(checkbox.dataset.value))
          .filter((value) => value && value !== RESET_VALUE)
      );

      const showAll =
        selectedValues.size === 0 || (resetCheckbox && resetCheckbox.checked);

      blocks.forEach((block) => {
        const blockValue = normalizeValue(block.dataset.value);
        const shouldShow = showAll || selectedValues.has(blockValue);
        block.hidden = !shouldShow;
      });
    };

    dropdown.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (!target.matches(FILTER_INPUT_SELECTOR)) return;

      const changedValue = normalizeValue(target.dataset.value);
      const resetCheckbox = getResetCheckbox();

      if (changedValue === RESET_VALUE && target.checked) {
        checkboxes.forEach((checkbox) => {
          if (checkbox !== target) checkbox.checked = false;
        });
      } else if (changedValue !== RESET_VALUE && target.checked && resetCheckbox) {
        resetCheckbox.checked = false;
      }

      applyFilters();
    });

    applyFilters();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
