// ============================================================================
// EVENT MANAGER - CENTRALIZED EVENT DELEGATION SYSTEM
// ============================================================================

const EventManager = {
	// Store all registered handlers
	handlers: new Map(),

	// Keyboard shortcuts registry
	shortcuts: new Map(),

	// Initialize the event manager
	init: () => {
		// Set up global event delegation on document body
		document.body.addEventListener("click", EventManager.handleClick);
		document.body.addEventListener("change", EventManager.handleChange);
		document.body.addEventListener("input", EventManager.handleInput);
		document.body.addEventListener("submit", EventManager.handleSubmit);
		document.body.addEventListener("keydown", EventManager.handleKeydown);
		document.body.addEventListener("keyup", EventManager.handleKeyup);

		// Set up drag and drop events
		document.body.addEventListener("dragstart", EventManager.handleDragStart);
		document.body.addEventListener("dragover", EventManager.handleDragOver);
		document.body.addEventListener("drop", EventManager.handleDrop);
		document.body.addEventListener("dragend", EventManager.handleDragEnd);

		// Global escape key handler for modals
		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				EventManager.handleEscape(e);
			}
		});
	},

	/**
	 * Register a click handler for elements matching a selector
	 * @param {string} selector - CSS selector
	 * @param {Function} handler - Event handler function
	 * @param {Object} options - Additional options
	 */
	onClick: (selector, handler, options = {}) => {
		EventManager.register("click", selector, handler, options);
	},

	/**
	 * Register a change handler for form elements
	 * @param {string} selector - CSS selector
	 * @param {Function} handler - Event handler function
	 * @param {Object} options - Additional options
	 */
	onChange: (selector, handler, options = {}) => {
		EventManager.register("change", selector, handler, options);
	},

	/**
	 * Register an input handler for form elements
	 * @param {string} selector - CSS selector
	 * @param {Function} handler - Event handler function
	 * @param {Object} options - Additional options
	 */
	onInput: (selector, handler, options = {}) => {
		EventManager.register("input", selector, handler, options);
	},

	/**
	 * Register a submit handler for forms
	 * @param {string} selector - CSS selector
	 * @param {Function} handler - Event handler function
	 * @param {Object} options - Additional options
	 */
	onSubmit: (selector, handler, options = {}) => {
		EventManager.register("submit", selector, handler, options);
	},

	/**
	 * Register a keyboard shortcut
	 * @param {string|Array} keys - Key combination (e.g., 'Ctrl+S' or ['Ctrl', 'Shift', 'N'])
	 * @param {Function} handler - Handler function
	 * @param {Object} options - Additional options
	 */
	onShortcut: (keys, handler, options = {}) => {
		const keyString = Array.isArray(keys) ? keys.join("+") : keys;
		EventManager.shortcuts.set(keyString.toLowerCase(), { handler, options });
	},

	/**
	 * Register a drag and drop handler
	 * @param {string} selector - CSS selector for draggable elements
	 * @param {Object} handlers - Object with dragstart, dragover, drop, dragend handlers
	 */
	onDragDrop: (selector, handlers = {}) => {
		if (handlers.dragstart) EventManager.register("dragstart", selector, handlers.dragstart);
		if (handlers.dragover) EventManager.register("dragover", selector, handlers.dragover);
		if (handlers.drop) EventManager.register("drop", selector, handlers.drop);
		if (handlers.dragend) EventManager.register("dragend", selector, handlers.dragend);
	},

	/**
	 * Register an event handler
	 * @param {string} eventType - Event type (click, change, etc.)
	 * @param {string} selector - CSS selector
	 * @param {Function} handler - Event handler function
	 * @param {Object} options - Additional options
	 */
	register: (eventType, selector, handler, options = {}) => {
		if (!EventManager.handlers.has(eventType)) {
			EventManager.handlers.set(eventType, []);
		}

		EventManager.handlers.get(eventType).push({
			selector,
			handler,
			options,
		});
	},

	/**
	 * Unregister event handlers for a selector
	 * @param {string} eventType - Event type
	 * @param {string} selector - CSS selector
	 */
	unregister: (eventType, selector) => {
		if (EventManager.handlers.has(eventType)) {
			const handlers = EventManager.handlers.get(eventType);
			const filtered = handlers.filter((h) => h.selector !== selector);
			EventManager.handlers.set(eventType, filtered);
		}
	},

	// Internal event handlers
	handleClick: (e) => {
		EventManager.dispatch("click", e);
	},

	handleChange: (e) => {
		EventManager.dispatch("change", e);
	},

	handleInput: (e) => {
		EventManager.dispatch("input", e);
	},

	handleSubmit: (e) => {
		EventManager.dispatch("submit", e);
	},

	handleKeydown: (e) => {
		EventManager.dispatch("keydown", e);
		EventManager.handleShortcuts(e);
	},

	handleKeyup: (e) => {
		EventManager.dispatch("keyup", e);
	},

	handleDragStart: (e) => {
		EventManager.dispatch("dragstart", e);
	},

	handleDragOver: (e) => {
		EventManager.dispatch("dragover", e);
	},

	handleDrop: (e) => {
		EventManager.dispatch("drop", e);
	},

	handleDragEnd: (e) => {
		EventManager.dispatch("dragend", e);
	},

	/**
	 * Dispatch event to matching handlers
	 * @param {string} eventType - Event type
	 * @param {Event} e - Event object
	 */
	dispatch: (eventType, e) => {
		if (!EventManager.handlers.has(eventType)) return;

		const handlers = EventManager.handlers.get(eventType);

		for (const { selector, handler, options } of handlers) {
			// Find the closest matching element
			const target = e.target.closest(selector);
			if (target) {
				// Prevent default if specified
				if (options.preventDefault) {
					e.preventDefault();
				}

				// Stop propagation if specified
				if (options.stopPropagation) {
					e.stopPropagation();
				}

				// Call handler with context
				try {
					handler.call(target, e, target);
				} catch (error) {
					console.error("Event handler error:", error);
				}

				// Stop after first match if specified
				if (options.once) {
					break;
				}
			}
		}
	},

	/**
	 * Handle keyboard shortcuts
	 * @param {KeyboardEvent} e - Keyboard event
	 */
	handleShortcuts: (e) => {
		// Build key combination string
		const keys = [];
		if (e.ctrlKey || e.metaKey) keys.push("ctrl");
		if (e.shiftKey) keys.push("shift");
		if (e.altKey) keys.push("alt");

		// Add the main key
		if (e.key && e.key !== "Control" && e.key !== "Shift" && e.key !== "Alt" && e.key !== "Meta") {
			keys.push(e.key.toLowerCase());
		}

		const keyString = keys.join("+");

		if (EventManager.shortcuts.has(keyString)) {
			const { handler, options } = EventManager.shortcuts.get(keyString);

			// Check if we're in an input field and shortcut should be disabled
			if (options.disableInInputs && EventManager.isInInputField(e.target)) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();

			try {
				handler(e);
			} catch (error) {
				console.error("Shortcut handler error:", error);
			}
		}
	},

	/**
	 * Handle escape key for closing modals
	 * @param {KeyboardEvent} e - Keyboard event
	 */
	handleEscape: (e) => {
		// Close top-most modal
		const modals = document.querySelectorAll(".modal-overlay");
		if (modals.length > 0) {
			const topModal = modals[modals.length - 1];
			const closeButton = topModal.querySelector(".modal-close");
			if (closeButton) {
				closeButton.click();
			} else {
				topModal.remove();
			}
		}
	},

	/**
	 * Check if element is an input field
	 * @param {Element} element - DOM element
	 * @returns {boolean} True if element is an input field
	 */
	isInInputField: (element) => {
		const inputTags = ["INPUT", "TEXTAREA", "SELECT"];
		return inputTags.includes(element.tagName) || element.contentEditable === "true";
	},

	/**
	 * Trigger a custom event
	 * @param {string} eventName - Custom event name
	 * @param {any} detail - Event detail data
	 * @param {Element} target - Target element (defaults to document)
	 */
	trigger: (eventName, detail = null, target = document) => {
		const event = new CustomEvent(eventName, { detail });
		target.dispatchEvent(event);
	},

	/**
	 * Listen for custom events
	 * @param {string} eventName - Custom event name
	 * @param {Function} handler - Event handler
	 * @param {Element} target - Target element (defaults to document)
	 */
	on: (eventName, handler, target = document) => {
		target.addEventListener(eventName, handler);
	},

	/**
	 * Remove custom event listener
	 * @param {string} eventName - Custom event name
	 * @param {Function} handler - Event handler
	 * @param {Element} target - Target element (defaults to document)
	 */
	off: (eventName, handler, target = document) => {
		target.removeEventListener(eventName, handler);
	},
};

// Common keyboard shortcuts
const CommonShortcuts = {
	init: () => {
		// Global shortcuts
		EventManager.onShortcut(
			"ctrl+s",
			(e) => {
				// Prevent browser save dialog
				e.preventDefault();
				// Trigger auto-save if available
				EventManager.trigger("app:save");
			},
			{ disableInInputs: false }
		);

		EventManager.onShortcut(
			"ctrl+z",
			(e) => {
				// Global undo - could be implemented later
				EventManager.trigger("app:undo");
			},
			{ disableInInputs: true }
		);

		EventManager.onShortcut(
			"ctrl+shift+z",
			(e) => {
				// Global redo - could be implemented later
				EventManager.trigger("app:redo");
			},
			{ disableInInputs: true }
		);

		// Tab navigation shortcuts
		EventManager.onShortcut("ctrl+1", () => EventManager.trigger("tab:switch", { tab: "jobs" }));
		EventManager.onShortcut("ctrl+2", () =>
			EventManager.trigger("tab:switch", { tab: "applications" })
		);
		EventManager.onShortcut("ctrl+3", () => EventManager.trigger("tab:switch", { tab: "tasks" }));
		EventManager.onShortcut("ctrl+4", () =>
			EventManager.trigger("tab:switch", { tab: "calendar" })
		);
		EventManager.onShortcut("ctrl+5", () =>
			EventManager.trigger("tab:switch", { tab: "dashboard" })
		);
		EventManager.onShortcut("ctrl+6", () =>
			EventManager.trigger("tab:switch", { tab: "contacts" })
		);
	},
};

// Export to global scope
window.EventManager = EventManager;
window.CommonShortcuts = CommonShortcuts;
