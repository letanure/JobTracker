// ============================================================================
// SHARED CONSTANTS - Common configurations used across components
// ============================================================================

// Event type configurations
export const EVENT_TYPES = {
	TASK: "task",
	APPLIED: "applied",
	INTERVIEW: "interview",
	FOLLOWUP: "followup",
};

// Event colors mapping
export const EVENT_COLORS = {
	[EVENT_TYPES.TASK]: "blue",
	[EVENT_TYPES.APPLIED]: "green",
	[EVENT_TYPES.INTERVIEW]: "orange",
	[EVENT_TYPES.FOLLOWUP]: "purple",
};

// Task status configurations
export const TASK_STATUSES = {
	TODO: "todo",
	IN_PROGRESS: "in-progress",
	DONE: "done",
};

// Task priority configurations
export const TASK_PRIORITIES = {
	HIGH: "high",
	MEDIUM: "medium",
	LOW: "low",
};

// Priority order for sorting
export const PRIORITY_ORDER = {
	[TASK_PRIORITIES.HIGH]: 3,
	[TASK_PRIORITIES.MEDIUM]: 2,
	[TASK_PRIORITIES.LOW]: 1,
};

// Duration options for tasks
export const DURATION_OPTIONS = [
	{ value: "15min", label: "15 minutes" },
	{ value: "30min", label: "30 minutes" },
	{ value: "1h", label: "1 hour" },
	{ value: "1h30", label: "1.5 hours" },
	{ value: "2h", label: "2 hours" },
	{ value: "3h", label: "3 hours" },
];

// Duration mapping to minutes
export const DURATION_MINUTES = {
	"15min": 15,
	"30min": 30,
	"1h": 60,
	"1h30": 90,
	"2h": 120,
	"3h": 180,
};

// Common modal class names
export const MODAL_CLASSES = {
	OVERLAY: "modal-overlay",
	CONTAINER: "modal-container",
	HEADER: "modal-header",
	BODY: "modal-body",
	FOOTER: "modal-footer",
	CLOSE_BTN: "modal-close-btn",
};

// Drag & drop class names
export const DRAG_CLASSES = {
	DRAGGING: "dragging",
	DRAG_OVER: "drag-over",
	DROP_INDICATOR: "drop-indicator",
	TIME_DROP_INDICATOR: "time-drop-indicator",
	TIME_DROP_LABEL: "time-drop-label",
};

// Common animation durations (ms)
export const ANIMATION_DURATIONS = {
	FAST: 150,
	NORMAL: 300,
	SLOW: 500,
	NOTIFICATION: 3000,
};

// Calendar constants
export const CALENDAR_CONSTANTS = {
	BUSINESS_HOURS: {
		START: 8, // 8am
		END: 20, // 8pm
	},
	TIME_SLOT_HEIGHT: 30, // pixels
	QUARTER_SLOT_HEIGHT: 7.5, // 15-minute intervals (30px / 4)
	WEEKDAYS: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	WEEKDAYS_SHORT: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

// Form validation patterns
export const VALIDATION_PATTERNS = {
	EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	PHONE: /^\+?[\d\s\-\(\)]+$/,
	URL: /^https?:\/\/.+/,
};

// Interview substeps for calendar events
export const INTERVIEW_SUBSTEPS = [
	"hr_phone_screen",
	"phone_screening",
	"technical_phone_screen",
	"technical_interview",
	"behavioral_interview",
	"team_interview",
	"hiring_manager_interview",
	"panel_interview",
	"final_round",
];

// Table column configurations
export const TABLE_COLUMNS = {
	ACTIONS_WIDTH: "120px",
	PRIORITY_WIDTH: "80px",
	STATUS_WIDTH: "100px",
	DATE_WIDTH: "120px",
	COMPACT_PADDING: "var(--space-2) var(--space-3)",
	NORMAL_PADDING: "var(--space-3) var(--space-4)",
};

// Responsive breakpoints (match CSS)
export const BREAKPOINTS = {
	MOBILE: "768px",
	TABLET: "1024px",
	DESKTOP: "1200px",
};

// Common error messages
export const ERROR_MESSAGES = {
	REQUIRED_FIELD: "This field is required",
	INVALID_EMAIL: "Please enter a valid email address",
	INVALID_URL: "Please enter a valid URL",
	SAVE_FAILED: "Failed to save changes",
	DELETE_FAILED: "Failed to delete item",
	LOAD_FAILED: "Failed to load data",
};

// Success messages
export const SUCCESS_MESSAGES = {
	SAVED: "Changes saved successfully",
	DELETED: "Item deleted successfully",
	CREATED: "Item created successfully",
	MOVED: "Item moved successfully",
};

// Default values
export const DEFAULTS = {
	TASK_PRIORITY: TASK_PRIORITIES.MEDIUM,
	TASK_STATUS: TASK_STATUSES.TODO,
	TASK_DURATION: "30min",
	PAGE_SIZE: 50,
	DEBOUNCE_DELAY: 300,
};
