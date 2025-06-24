// ============================================================================
// MINI DOM UTILITY LIBRARY (jQuery-style)
// ============================================================================

// jQuery-style DOM wrapper class
class DOMElement {
	constructor(element) {
		this.element = element;
	}

	// Chainable text method
	text(content) {
		if (content === undefined) {
			return this.element.textContent;
		}
		this.element.textContent = content;
		return this;
	}

	// Chainable html method
	html(content) {
		if (content === undefined) {
			return this.element.innerHTML;
		}
		this.element.innerHTML = content;
		return this;
	}

	// Chainable show/hide methods
	show() {
		this.element.style.display = "block";
		return this;
	}

	hide() {
		this.element.style.display = "none";
		return this;
	}

	toggle() {
		const isVisible = this.element.style.display === "block";
		this.element.style.display = isVisible ? "none" : "block";
		return this;
	}

	// Chainable event method
	on(event, handler) {
		this.element.addEventListener(event, handler);
		return this;
	}

	// Chainable addClass/removeClass
	addClass(className) {
		this.element.classList.add(className);
		return this;
	}

	removeClass(className) {
		this.element.classList.remove(className);
		return this;
	}

	// Chainable attr method
	attr(name, value) {
		if (value === undefined) {
			return this.element.getAttribute(name);
		}
		this.element.setAttribute(name, value);
		return this;
	}

	// Chainable css method
	css(property, value) {
		if (typeof property === "object") {
			Object.assign(this.element.style, property);
		} else if (value === undefined) {
			return getComputedStyle(this.element)[property];
		} else {
			this.element.style[property] = value;
		}
		return this;
	}

	// Append child
	append(child) {
		if (typeof child === "string") {
			this.element.appendChild(document.createTextNode(child));
		} else {
			this.element.appendChild(child);
		}
		return this;
	}

	// Get the raw DOM element
	get() {
		return this.element;
	}
}

// Enhanced $ function with jQuery-style API
const $ = (selector) => {
	if (typeof selector === "string") {
		if (selector.startsWith('#')) {
			// ID selector
			const element = document.getElementById(selector.slice(1));
			return element ? new DOMElement(element) : null;
		}
		// CSS selector
		const element = document.querySelector(selector);
		return element ? new DOMElement(element) : null;
	}
	if (selector instanceof Element) {
		// Wrap existing element
		return new DOMElement(selector);
	}
	return null;
};

// Static methods for backwards compatibility and utility
Object.assign($, {
	// Get element by ID (returns raw element)
	id: (id) => document.getElementById(id),

	// Query selector (single element)
	qs: (selector) => document.querySelector(selector),

	// Query selector all (multiple elements)
	qsa: (selector) => document.querySelectorAll(selector),

	// Create element with optional class and text
	create: (tag, className, textContent) => {
		const element = document.createElement(tag);
		if (className) element.className = className;
		if (textContent) element.textContent = textContent;
		return element;
	},

	// Add event listener (static)
	on: (element, event, handler) => element.addEventListener(event, handler),
	// Set innerHTML (static)
	html: (element, html) => {
		element.innerHTML = html;
	},

	// Set textContent (static)
	text: (element, text) => {
		element.textContent = text;
	},
	// Show/hide element (static)
	show: (element) => {
		element.style.display = "block";
	},
	hide: (element) => {
		element.style.display = "none";
	},

	// Toggle display (static)
	toggle: (element) => {
		const isVisible = element.style.display === "block";
		element.style.display = isVisible ? "none" : "block";
	}});

// Enhanced h function with Emmet-style syntax support
const h = (selector, propsOrChildren, ...children) => {
	// Parse Emmet-style selector
	const parsed = parseSelector(selector);
	const element = document.createElement(parsed.tag);

	// Apply parsed attributes
	if (parsed.id) element.id = parsed.id;
	if (parsed.classes.length) element.className = parsed.classes.join(' ');
	if (parsed.attributes) {
		for (const [key, value] of Object.entries(parsed.attributes)) {
			element.setAttribute(key, value);
		}
	}

	// Handle different argument patterns
	let props = {};
	let childrenArray = [];

	if (Array.isArray(propsOrChildren)) {
		// h('div.class', [children])
		childrenArray = propsOrChildren;
	} else if (typeof propsOrChildren === 'string' || typeof propsOrChildren === 'number') {
		// h('div.class', 'text content')
		childrenArray = [propsOrChildren];
	} else if (propsOrChildren && typeof propsOrChildren === 'object' && !propsOrChildren.nodeType) {
		// h('div.class', {props}, ...children)
		props = propsOrChildren;
		childrenArray = children;
	} else if (propsOrChildren) {
		// h('div.class', elementNode)
		childrenArray = [propsOrChildren, ...children];
	}

	// Set properties
	for (const [key, value] of Object.entries(props)) {
		if (key === "className") {
			// Merge with existing classes from selector
			const existingClasses = element.className ? element.className.split(' ') : [];
			const newClasses = value.split(' ');
			element.className = [...new Set([...existingClasses, ...newClasses])].join(' ');
		} else if (key === "style" && typeof value === "object") {
			Object.assign(element.style, value);
		} else if (key === "innerHTML") {
			element.innerHTML = value;
		} else if (key === "textContent") {
			element.textContent = value;
		} else if (key.startsWith('on') && typeof value === "function") {
			const eventType = key.slice(2).toLowerCase();
			element.addEventListener(eventType, value);
		} else if (key.startsWith('data-')) {
			element.setAttribute(key, value);
		} else {
			element.setAttribute(key, value);
		}
	}

	// Add children
	for (const child of childrenArray) {
		if (child !== null && child !== undefined) {
			if (typeof child === "string" || typeof child === "number") {
				element.appendChild(document.createTextNode(child.toString()));
			} else if (child instanceof Node) {
				element.appendChild(child);
			}
		}
	}

	return element;
};

// Parse Emmet-style selector
const parseSelector = (selector) => {
	// Default tag is div
	let tag = 'div';
	let id = '';
	let classes = [];
	let attributes = {};

	// Extract tag name (everything before first . # or [)
	const tagMatch = selector.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
	if (tagMatch) {
		tag = tagMatch[1];
		selector = selector.slice(tagMatch[0].length);
	}

	// Extract ID (#id)
	const idMatch = selector.match(/#([a-zA-Z][a-zA-Z0-9_-]*)/);
	if (idMatch) {
		id = idMatch[1];
		selector = selector.replace(idMatch[0], '');
	}

	// Extract classes (.class1.class2)
	const classMatches = selector.match(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g);
	if (classMatches) {
		classes = classMatches.map(match => match.slice(1));
		selector = selector.replace(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g, '');
	}

	// Extract attributes ([attr=value attr2="value with spaces"])
	const attrMatch = selector.match(/\[([^\]]+)\]/);
	if (attrMatch) {
		const attrString = attrMatch[1];
		// Parse attributes - handle both quoted and unquoted values
		const attrRegex = /([a-zA-Z][a-zA-Z0-9_-]*)(?:=(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g;
		let match;
		while ((match = attrRegex.exec(attrString)) !== null) {
			const attrName = match[1];
			const attrValue = match[2] || match[3] || match[4] || '';
			attributes[attrName] = attrValue;
		}
	}

	return { tag, id, classes, attributes };
};
