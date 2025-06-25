// ============================================================================
// CALENDAR UTILITIES - Date formatting and helper functions
// ============================================================================

import { CALENDAR_CONSTANTS } from "../../utils/shared-constants.js";

/**
 * Calendar utility functions for date manipulation and formatting
 */
export const CalendarUtils = {
	/**
	 * Format time in 12-hour format
	 */
	formatTime12Hour: (hour, minute) => {
		const period = hour < 12 ? "AM" : "PM";
		const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
		const minuteStr = minute === 0 ? "" : `:${minute.toString().padStart(2, "0")}`;
		return `${hour12}${minuteStr} ${period}`;
	},

	/**
	 * Get the start of the week for a given date
	 */
	getWeekStart: (date) => {
		const start = new Date(date);
		const day = start.getDay();
		const diff = start.getDate() - day;
		start.setDate(diff);
		start.setHours(0, 0, 0, 0);
		return start;
	},

	/**
	 * Get the end of the week for a given date
	 */
	getWeekEnd: (date) => {
		const end = new Date(date);
		const day = end.getDay();
		const diff = end.getDate() + (6 - day);
		end.setDate(diff);
		end.setHours(23, 59, 59, 999);
		return end;
	},

	/**
	 * Format date as YYYY-MM-DD key
	 */
	formatDateKey: (date) => {
		return date.toISOString().split("T")[0];
	},

	/**
	 * Parse ISO date string to Date object
	 */
	parseISODate: (dateString) => {
		return new Date(dateString);
	},

	/**
	 * Check if two dates are the same day
	 */
	isSameDay: (date1, date2) => {
		return CalendarUtils.formatDateKey(date1) === CalendarUtils.formatDateKey(date2);
	},

	/**
	 * Check if date is today
	 */
	isToday: (date) => {
		return CalendarUtils.isSameDay(date, new Date());
	},

	/**
	 * Get days in month
	 */
	getDaysInMonth: (year, month) => {
		return new Date(year, month + 1, 0).getDate();
	},

	/**
	 * Get first day of month (0 = Sunday, 6 = Saturday)
	 */
	getFirstDayOfMonth: (year, month) => {
		return new Date(year, month, 1).getDay();
	},

	/**
	 * Generate time slots for business hours
	 */
	generateTimeSlots: () => {
		const slots = [];
		const { START, END } = CALENDAR_CONSTANTS.BUSINESS_HOURS;

		// Generate slots from business start to end in 30-minute intervals
		for (let hour = START; hour <= END; hour++) {
			for (let minute = 0; minute < 60; minute += 30) {
				const time24 = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
				const time12 = CalendarUtils.formatTime12Hour(hour, minute);

				slots.push({
					time24,
					time12,
					hour,
					minute,
				});
			}
		}
		return slots;
	},

	/**
	 * Calculate position for time-based events
	 */
	calculateTimePosition: (dateTime, durationMinutes = 30) => {
		const date = new Date(dateTime);
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const { START, END } = CALENDAR_CONSTANTS.BUSINESS_HOURS;

		// Only position events within business hours
		if (hours < START || hours > END) {
			return null;
		}

		// Calculate position: each 30-min slot is TIME_SLOT_HEIGHT pixels
		const slotsFromStart = (hours - START) * 2 + Math.floor(minutes / 30);
		const topPosition = slotsFromStart * CALENDAR_CONSTANTS.TIME_SLOT_HEIGHT;

		// Height is proportional to duration
		const height = Math.max(15, (durationMinutes / 30) * CALENDAR_CONSTANTS.TIME_SLOT_HEIGHT);

		return {
			top: topPosition,
			height,
			style: `top: ${topPosition}px; height: ${height}px;`,
			className: 'calendar-event-positioned'
		};
	},

	/**
	 * Calculate time from mouse position
	 */
	calculateTimeFromPosition: (mouseY, containerTop = 0) => {
		const relativeY = mouseY - containerTop;
		const { START } = CALENDAR_CONSTANTS.BUSINESS_HOURS;

		// Calculate which 15-minute slot the mouse is over
		const quarterSlotHeight = CALENDAR_CONSTANTS.QUARTER_SLOT_HEIGHT;
		const slotIndex = Math.floor(relativeY / quarterSlotHeight);
		const totalQuarters = slotIndex;
		const hours = Math.floor(totalQuarters / 4) + START;
		const minutes = (totalQuarters % 4) * 15;

		return {
			hours,
			minutes,
			valid: hours >= START && hours <= CALENDAR_CONSTANTS.BUSINESS_HOURS.END,
		};
	},

	/**
	 * Format event time display
	 */
	formatEventTime: (event) => {
		if (!event.date) return "";

		const date = new Date(event.date);
		const hours = date.getHours();
		const minutes = date.getMinutes();

		// Show time only if it's set (not midnight)
		if (hours === 0 && minutes === 0) {
			return "";
		}

		return CalendarUtils.formatTime12Hour(hours, minutes);
	},

	/**
	 * Get event start time in minutes from start of business day
	 */
	getEventStartMinutes: (event) => {
		if (!event.date) return null;

		const date = new Date(event.date);
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const { START, END } = CALENDAR_CONSTANTS.BUSINESS_HOURS;

		if (hours < START || hours > END) return null;

		return (hours - START) * 60 + minutes;
	},

	/**
	 * Get event end time in minutes from start of business day
	 */
	getEventEndMinutes: (event) => {
		const startMinutes = CalendarUtils.getEventStartMinutes(event);
		if (startMinutes === null) return null;

		// Default duration if not specified
		let durationMinutes = 30;
		if (event.task?.duration) {
			durationMinutes = CalendarUtils.parseDuration(event.task.duration) || 30;
		}

		return startMinutes + durationMinutes;
	},

	/**
	 * Parse duration string to minutes
	 */
	parseDuration: (duration) => {
		if (!duration) return null;

		const durationMap = {
			"15min": 15,
			"30min": 30,
			"1h": 60,
			"1h30": 90,
			"2h": 120,
			"3h": 180,
		};

		return durationMap[duration] || null;
	},

	/**
	 * Check if two events overlap in time
	 */
	eventsOverlap: (event1, event2) => {
		const start1 = CalendarUtils.getEventStartMinutes(event1);
		const end1 = CalendarUtils.getEventEndMinutes(event1);
		const start2 = CalendarUtils.getEventStartMinutes(event2);
		const end2 = CalendarUtils.getEventEndMinutes(event2);

		if (start1 === null || start2 === null) return false;

		return start1 < end2 && start2 < end1;
	},

	/**
	 * Group overlapping events for column layout
	 */
	groupOverlappingEvents: (events) => {
		const groups = [];
		const processed = new Set();

		events.forEach((event) => {
			if (processed.has(event.id)) return;

			const group = [event];
			processed.add(event.id);

			// Find all events that overlap with this one
			events.forEach((otherEvent) => {
				if (processed.has(otherEvent.id)) return;

				if (CalendarUtils.eventsOverlap(event, otherEvent)) {
					group.push(otherEvent);
					processed.add(otherEvent.id);
				}
			});

			groups.push(group);
		});

		return groups;
	},
};
