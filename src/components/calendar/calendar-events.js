// ============================================================================
// CALENDAR EVENTS - Event loading and management
// ============================================================================

import { EVENT_COLORS, EVENT_TYPES, INTERVIEW_SUBSTEPS } from "../../utils/shared-constants.js";
import { CalendarUtils } from "./calendar-utils.js";

/**
 * Calendar events management
 */
export const CalendarEvents = {
	events: [],

	/**
	 * Load events from jobs data
	 */
	loadEvents: () => {
		const events = [];

		jobsData.forEach((job) => {
			// Add application date event
			if (job.appliedDate) {
				events.push({
					id: `applied-${job.id}`,
					type: EVENT_TYPES.APPLIED,
					date: new Date(job.appliedDate),
					title: `${I18n.t("calendar.applied")}: ${job.company}`,
					job: job,
					color: EVENT_COLORS[EVENT_TYPES.APPLIED]});
			}

			// Add tasks with due dates
			if (job.tasks) {
				job.tasks.forEach((task) => {
					if (task.dueDate && task.status !== "done" && !task.archived) {
						events.push({
							id: `task-${job.id}-${task.id}`,
							type: EVENT_TYPES.TASK,
							date: new Date(task.dueDate),
							title: task.text,
							job: job,
							task: task,
							priority: task.priority,
							color: EVENT_COLORS[EVENT_TYPES.TASK]});
					}
				});
			}

			// Add interview events based on substeps
			if (INTERVIEW_SUBSTEPS.includes(job.currentSubstep)) {
				// For demo purposes, set interview date to near future
				const interviewDate = new Date();
				interviewDate.setDate(interviewDate.getDate() + Math.floor(Math.random() * 7) + 1);

				events.push({
					id: `interview-${job.id}`,
					type: EVENT_TYPES.INTERVIEW,
					date: interviewDate,
					title: `${I18n.t("calendar.interview")}: ${job.company} - ${job.position}`,
					job: job,
					color: EVENT_COLORS[EVENT_TYPES.INTERVIEW]});
			}

			// Add follow-up reminders
			if (job.currentPhase === "applied" && job.appliedDate) {
				const followUpDate = new Date(job.appliedDate);
				followUpDate.setDate(followUpDate.getDate() + 7); // Follow up after 1 week

				if (followUpDate > new Date()) {
					events.push({
						id: `followup-${job.id}`,
						type: EVENT_TYPES.FOLLOWUP,
						date: followUpDate,
						title: `${I18n.t("calendar.followUp")}: ${job.company}`,
						job: job,
						color: EVENT_COLORS[EVENT_TYPES.FOLLOWUP]});
				}
			}
		});

		// Sort events by date and time, with tasks ordered by priority within the same time
		events.sort((a, b) => {
			// First sort by date
			const dateCompare = a.date.getTime() - b.date.getTime();
			if (dateCompare !== 0) return dateCompare;

			// If same date, prioritize tasks by priority (high > medium > low)
			if (a.type === EVENT_TYPES.TASK && b.type === EVENT_TYPES.TASK) {
				const priorityOrder = { high: 3, medium: 2, low: 1 };
				const aPriority = priorityOrder[a.priority] || 1;
				const bPriority = priorityOrder[b.priority] || 1;
				return bPriority - aPriority;
			}

			// If different types, maintain date order
			return 0;
		});

		CalendarEvents.events = events;
		return events;
	},

	/**
	 * Get events for a specific date
	 */
	getEventsForDate: (date) => {
		const targetDateKey = CalendarUtils.formatDateKey(date);

		return CalendarEvents.events.filter((event) => {
			const eventDateKey = CalendarUtils.formatDateKey(event.date);
			return eventDateKey === targetDateKey;
		});
	},

	/**
	 * Get events for a date range
	 */
	getEventsForDateRange: (startDate, endDate) => {
		return CalendarEvents.events.filter((event) => {
			return event.date >= startDate && event.date <= endDate;
		});
	},

	/**
	 * Get events for a week
	 */
	getEventsForWeek: (date) => {
		const weekStart = CalendarUtils.getWeekStart(date);
		const weekEnd = CalendarUtils.getWeekEnd(date);

		return CalendarEvents.getEventsForDateRange(weekStart, weekEnd);
	},

	/**
	 * Get events for a month
	 */
	getEventsForMonth: (year, month) => {
		const monthStart = new Date(year, month, 1);
		const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

		return CalendarEvents.getEventsForDateRange(monthStart, monthEnd);
	},

	/**
	 * Get event color based on type and priority
	 */
	getEventColor: (type, priority = null) => {
		if (type === EVENT_TYPES.TASK && priority) {
			const priorityColors = {
				high: "red",
				medium: "orange",
				low: "blue"};
			return priorityColors[priority] || EVENT_COLORS[type];
		}

		return EVENT_COLORS[type] || "gray";
	},

	/**
	 * Move task to new date and time
	 */
	moveTaskToDateTime: (jobId, taskId, newDateTime) => {
		// Ensure IDs are properly compared
		const targetJobId = String(jobId);
		const targetTaskId = String(taskId);

		// Find the job
		const jobIndex = jobsData.findIndex((job) => String(job.id) === targetJobId);
		if (jobIndex === -1) {
			console.error("Job not found:", targetJobId);
			return false;
		}

		// Find the task
		const taskIndex = jobsData[jobIndex].tasks.findIndex(
			(task) => String(task.id) === targetTaskId
		);
		if (taskIndex === -1) {
			console.error("Task not found:", targetTaskId);
			return false;
		}

		// Update ONLY the specific task's due date
		jobsData[jobIndex].tasks[taskIndex].dueDate = newDateTime.toISOString();

		// Save changes
		saveToLocalStorage();

		// Reload events
		CalendarEvents.loadEvents();

		return true;
	},

	/**
	 * Calculate event positions with overlap handling
	 */
	calculateEventPositions: (events) => {
		// First, calculate basic position for each event
		const eventsWithBasicPosition = events.map((event) => {
			const position = CalendarUtils.calculateTimePosition(
				event.date,
				event.task ? CalendarUtils.parseDuration(event.task.duration) : 30
			);

			return {
				...event,
				positionStyle: position ? position.style : "",
				startMinutes: CalendarUtils.getEventStartMinutes(event),
				endMinutes: CalendarUtils.getEventEndMinutes(event)};
		});

		// Filter out events that don't have time-based positioning
		const timedEvents = eventsWithBasicPosition.filter(
			(event) => event.startMinutes !== null && event.positionStyle !== ""
		);
		const untimedEvents = eventsWithBasicPosition.filter(
			(event) => event.startMinutes === null || event.positionStyle === ""
		);

		// Group overlapping events
		const groups = CalendarUtils.groupOverlappingEvents(timedEvents);

		// Calculate column positions for overlapping events
		const positionedTimedEvents = [];
		groups.forEach((group) => {
			group.forEach((event, index) => {
				const columnWidth = 100 / group.length;
				const leftOffset = index * columnWidth;

				// Modify the position style to include column positioning
				event.positionStyle = event.positionStyle.replace(
					"width: calc(100% - 8px);",
					`width: calc(${columnWidth}% - 6px); left: ${leftOffset}%;`
				);

				positionedTimedEvents.push(event);
			});
		});

		// Return all events (timed + untimed)
		return [...positionedTimedEvents, ...untimedEvents];
	}};
