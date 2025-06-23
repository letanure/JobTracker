// ============================================================================
// TAB NAVIGATION COMPONENT
// ============================================================================

const TabNavigation = {
	// Current active tab
	activeTab: "jobs",

	// Available tabs configuration
	tabs: [
		{ id: "jobs", key: "tabs.jobs", icon: "work" },
		{ id: "applications", key: "tabs.applications", icon: "dashboard" },
		{ id: "tasks", key: "tabs.tasks", icon: "task_alt" },
		{ id: "calendar", key: "tabs.calendar", icon: "calendar_month" },
		{ id: "contacts", key: "tabs.contacts", icon: "contacts" },
	],

	// Get tab from URL parameter
	getTabFromURL: () => {
		const urlParams = new URLSearchParams(window.location.search);
		const tabParam = urlParams.get("tab");
		// Validate tab exists
		if (tabParam && TabNavigation.tabs.some((t) => t.id === tabParam)) {
			return tabParam;
		}
		return null;
	},

	// Set tab in URL parameter
	setTabInURL: (tabId) => {
		const url = new URL(window.location);
		if (tabId && tabId !== "jobs") {
			url.searchParams.set("tab", tabId);
		} else {
			url.searchParams.delete("tab");
		}

		// If switching away from calendar, clean up calendar-specific params
		if (tabId !== "calendar") {
			url.searchParams.delete("view");
			url.searchParams.delete("date");
		}

		window.history.replaceState({}, "", url);
	},

	// Create the tab navigation HTML
	create: () => {
		// Get initial tab from URL before creating buttons
		const urlTab = TabNavigation.getTabFromURL();
		if (urlTab) {
			TabNavigation.activeTab = urlTab;
		}

		// Create tab navigation container
		const tabNav = document.createElement("div");
		tabNav.className = "tab-navigation";

		// Create tab buttons
		TabNavigation.tabs.forEach((tab) => {
			const button = document.createElement("button");
			button.className = `tab-button ${tab.id === TabNavigation.activeTab ? "active" : ""}`;
			button.dataset.tab = tab.id;

			// Create icon span with Material Icon
			const icon = document.createElement("span");
			icon.className = "material-symbols-outlined tab-icon";
			icon.textContent = tab.icon;

			// Create text span
			const text = document.createElement("span");
			text.className = "tab-text";
			text.textContent = I18n.t(tab.key);

			button.appendChild(icon);
			button.appendChild(text);

			// Add click event listener
			button.addEventListener("click", () => TabNavigation.switchTo(tab.id));

			tabNav.appendChild(button);
		});

		return tabNav;
	},

	// Switch to a specific tab
	switchTo: (tabId, force = false) => {
		if (!force && TabNavigation.activeTab === tabId) return;

		// Update active tab
		TabNavigation.activeTab = tabId;

		// Update URL
		TabNavigation.setTabInURL(tabId);

		// Update button states
		document.querySelectorAll(".tab-button").forEach((btn) => {
			btn.classList.toggle("active", btn.dataset.tab === tabId);
		});

		// Update content visibility
		document.querySelectorAll(".tab-content").forEach((content) => {
			content.classList.toggle("active", content.dataset.tab === tabId);
		});

		// Handle tab-specific logic
		TabNavigation.handleTabSwitch(tabId);
	},

	// Handle tab-specific initialization and updates
	handleTabSwitch: (tabId) => {
		switch (tabId) {
			case "jobs":
				// Refresh jobs table if needed
				if (typeof refreshInterface === "function") {
					refreshInterface();
				}
				break;
			case "applications":
				// Initialize applications board if needed
				TabNavigation.initializeApplicationsBoard();
				break;
			case "tasks":
				// Initialize tasks board if needed
				TabNavigation.initializeTasksBoard();
				break;
			case "calendar":
				// Initialize calendar view if needed
				TabNavigation.initializeCalendarView();
				break;
			case "contacts":
				// Initialize contacts view if needed
				TabNavigation.initializeContactsView();
				break;
		}
	},

	// Initialize applications board with kanban
	initializeApplicationsBoard: () => {
		if (typeof KanbanBoard !== "undefined") {
			KanbanBoard.init();
		}
	},

	// Initialize tasks board with task kanban
	initializeTasksBoard: () => {
		if (typeof TasksBoard !== "undefined") {
			TasksBoard.init();
		}
	},

	// Initialize calendar view
	initializeCalendarView: () => {
		if (typeof CalendarView !== "undefined") {
			CalendarView.init();
		}
	},

	// Initialize contacts view
	initializeContactsView: () => {
		if (typeof ContactsView !== "undefined") {
			ContactsView.init();
		}
	},

	// Update tab texts when language changes
	updateLanguage: () => {
		document.querySelectorAll(".tab-button").forEach((btn) => {
			const tabId = btn.dataset.tab;
			const tab = TabNavigation.tabs.find((t) => t.id === tabId);
			if (tab) {
				const textElement = btn.querySelector(".tab-text");
				if (textElement) {
					textElement.textContent = I18n.t(tab.key);
				}
			}
		});
	},

	// Initialize tab navigation
	init: () => {
		// Get tab from URL or use default
		const urlTab = TabNavigation.getTabFromURL();
		const initialTab = urlTab || "jobs";

		// Force switch to show the correct tab on init
		TabNavigation.switchTo(initialTab, true);

		// Mark tabs as initialized to enable smooth transitions after a brief delay
		setTimeout(() => {
			const tabContainer = document.querySelector('.tab-content-container');
			if (tabContainer) {
				tabContainer.classList.add('tabs-initialized');
			}
		}, 50);
	},
};
