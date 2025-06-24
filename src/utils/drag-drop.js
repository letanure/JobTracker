// ============================================================================
// DRAG & DROP UTILITY - Shared drag and drop functionality
// ============================================================================

import { ANIMATION_DURATIONS, DRAG_CLASSES } from "./shared-constants.js";

/**
 * Shared drag and drop utility for calendar, kanban, and tasks board
 */
export const DragDropUtils = {
	/**
	 * Initialize drag start for an element
	 */
	handleDragStart: (e, data, allowedTypes = ["task"]) => {
		e.stopPropagation();

		// Only allow dragging specified types
		if (!allowedTypes.includes(data.type)) {
			e.preventDefault();
			return false;
		}

		// Store the drag data
		e.dataTransfer.setData("text/plain", JSON.stringify(data));
		e.dataTransfer.effectAllowed = "move";

		// Add visual feedback
		e.target.classList.add(DRAG_CLASSES.DRAGGING);

		return true;
	},

	/**
	 * Handle drag over event with visual feedback
	 */
	handleDragOver: (e, container) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";

		// Add visual feedback to drop target
		container.classList.add(DRAG_CLASSES.DRAG_OVER);
	},

	/**
	 * Handle drag leave event
	 */
	handleDragLeave: (e, container) => {
		// Remove visual feedback
		container.classList.remove(DRAG_CLASSES.DRAG_OVER);

		// Remove any drop indicators
		container.querySelectorAll(`.${DRAG_CLASSES.DROP_INDICATOR}`).forEach((indicator) => {
			indicator.remove();
		});
	},

	/**
	 * Handle drop event with data validation
	 */
	handleDrop: (e, container, onDrop) => {
		e.preventDefault();
		e.stopPropagation();

		// Remove visual feedback
		container.classList.remove(DRAG_CLASSES.DRAG_OVER);

		// Remove all drag indicators
		document.querySelectorAll(`.${DRAG_CLASSES.DRAGGING}`).forEach((el) => {
			el.classList.remove(DRAG_CLASSES.DRAGGING);
		});

		// Remove drop indicators
		document.querySelectorAll(`.${DRAG_CLASSES.DROP_INDICATOR}`).forEach((indicator) => {
			indicator.remove();
		});

		try {
			const dragDataText = e.dataTransfer.getData("text/plain");
			if (!dragDataText) {
				console.error("No drag data found");
				return false;
			}

			const dragData = JSON.parse(dragDataText);

			// Call the provided drop handler
			if (typeof onDrop === "function") {
				return onDrop(dragData, e);
			}

			return true;
		} catch (error) {
			console.error("Error handling drop:", error);
			return false;
		}
	},

	/**
	 * Create a drop indicator element
	 */
	createDropIndicator: (position, text = null) => {
		const indicator = document.createElement("div");
		indicator.className = DRAG_CLASSES.DROP_INDICATOR;
		indicator.style.cssText = `
			position: absolute;
			top: ${position.y}px;
			left: ${position.x || 0}px;
			right: ${position.right || 0}px;
			height: 2px;
			background: var(--blue-500);
			z-index: 10;
			pointer-events: none;
		`;

		// Add text label if provided
		if (text) {
			const label = document.createElement("div");
			label.className = `${DRAG_CLASSES.DROP_INDICATOR}-label`;
			label.textContent = text;
			label.style.cssText = `
				position: absolute;
				top: -10px;
				left: 4px;
				background: var(--blue-500);
				color: white;
				padding: 2px 6px;
				border-radius: 3px;
				font-size: 10px;
				white-space: nowrap;
				pointer-events: none;
			`;
			indicator.appendChild(label);
		}

		return indicator;
	},

	/**
	 * Remove all drop indicators from document
	 */
	clearDropIndicators: () => {
		document.querySelectorAll(`.${DRAG_CLASSES.DROP_INDICATOR}`).forEach((indicator) => {
			indicator.remove();
		});
	},

	/**
	 * Check if element or its parents have a specific class
	 */
	hasParentWithClass: (element, className) => {
		let current = element;
		while (current && current !== document.body) {
			if (current.classList?.contains(className)) {
				return current;
			}
			current = current.parentElement;
		}
		return null;
	},

	/**
	 * Get drop target element from event
	 */
	getDropTarget: (e, targetClass) => {
		return DragDropUtils.hasParentWithClass(e.target, targetClass);
	},

	/**
	 * Create drag data object
	 */
	createDragData: (type, id, additionalData = {}) => {
		return {
			type,
			id,
			timestamp: Date.now(),
			...additionalData};
	},

	/**
	 * Validate drag data object
	 */
	validateDragData: (dragData, requiredFields = ["type", "id"]) => {
		if (!dragData || typeof dragData !== "object") {
			return false;
		}

		// biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
		return requiredFields.every((field) => dragData.hasOwnProperty(field));
	},

	/**
	 * Add draggable attributes to element
	 */
	makeDraggable: (element, dragData, allowedTypes = ["task"]) => {
		element.draggable = true;
		element.style.cursor = "grab";

		element.addEventListener("dragstart", (e) => {
			DragDropUtils.handleDragStart(e, dragData, allowedTypes);
		});

		element.addEventListener("dragend", (e) => {
			e.target.classList.remove(DRAG_CLASSES.DRAGGING);
			DragDropUtils.clearDropIndicators();
		});

		return element;
	},

	/**
	 * Add drop zone functionality to element
	 */
	makeDropZone: (element, onDrop, options = {}) => {
		const { showIndicators = true, dragOverClass = DRAG_CLASSES.DRAG_OVER } = options;

		element.addEventListener("dragover", (e) => {
			DragDropUtils.handleDragOver(e, element);
		});

		element.addEventListener("dragleave", (e) => {
			DragDropUtils.handleDragLeave(e, element);
		});

		element.addEventListener("drop", (e) => {
			DragDropUtils.handleDrop(e, element, onDrop);
		});

		return element;
	}};
