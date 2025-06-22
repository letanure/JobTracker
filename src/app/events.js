// ============================================================================
// EVENT HANDLERS AND UTILITY FUNCTIONS
// ============================================================================

// Setup event listeners
function setupEventListeners() {
	// ESC key to close modals
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			closeModal();
			closeAllDropdowns();
		}
	});
	
	// Close dropdowns when clicking outside
	document.addEventListener("click", (e) => {
		const isDropdownIcon = e.target.closest('.filter-dropdown-icon');
		const isDropdownContent = e.target.closest('.filter-dropdown');
		
		if (!isDropdownIcon && !isDropdownContent) {
			closeAllDropdowns();
		}
	});
}

// Close all dropdowns
function closeAllDropdowns() {
	document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
		dropdown.style.display = 'none';
	});
}

// Toggle dropdown function
function toggleDropdown(dropdownId) {
	const dropdown = document.getElementById(dropdownId);
	if (!dropdown) return;
	
	// Close all other dropdowns
	document.querySelectorAll('.filter-dropdown').forEach(d => {
		if (d.id !== dropdownId) {
			d.style.display = 'none';
		}
	});
	
	// Toggle this dropdown
	dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Tab switching function (legacy support)
function switchTab(tabName) {
	document.querySelectorAll('.tab-button').forEach(btn => {
		btn.classList.remove('active');
	});
	document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
	
	document.querySelectorAll('.tab-content').forEach(content => {
		content.classList.remove('active');
	});
	document.getElementById(`${tabName}Tab`).classList.add('active');
	
	if (tabName === 'kanban') {
		populateKanbanBoard();
	}
}

// Kanban board population (placeholder)
function populateKanbanBoard() {
	// This would populate the kanban board
	console.log("Populating kanban board");
}