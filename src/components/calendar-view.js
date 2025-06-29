// ============================================================================
// CALENDAR VIEW COMPONENT
// ============================================================================

const CalendarView = {
	// Current view settings
	currentView: "month", // month, week, day
	currentDate: new Date(),
	selectedDate: null,
	events: [],

	// Get calendar state from URL
	getStateFromURL: () => {
		const urlParams = new URLSearchParams(window.location.search);
		const view = urlParams.get("view");
		const date = urlParams.get("date");

		return {
			view: ["month", "week", "day"].includes(view) ? view : "month",
			date: date ? new Date(date) : new Date(),
		};
	},

	// Set calendar state in URL
	setStateInURL: () => {
		const url = new URL(window.location);
		const currentTab = url.searchParams.get("tab");

		// Only update URL if we're on calendar tab
		if (currentTab === "calendar") {
			url.searchParams.set("view", CalendarView.currentView);
			url.searchParams.set("date", CalendarView.currentDate.toISOString().split("T")[0]);
		}

		window.history.replaceState({}, "", url);
	},

	// Initialize calendar view
	init: () => {
		const calendarTab = document.querySelector('.tab-content[data-tab="calendar"]');

		if (calendarTab) {
			// Load state from URL
			const urlState = CalendarView.getStateFromURL();
			CalendarView.currentView = urlState.view;
			CalendarView.currentDate = urlState.date;

			// Always reload events to get latest data
			CalendarView.loadEvents();

			// Only clear and initialize if not already initialized
			if (!calendarTab.querySelector(".calendar-container")) {
				// Clear existing content
				calendarTab.innerHTML = "";

				// Create calendar container
				const container = CalendarView.create();
				calendarTab.appendChild(container);
			} else {
				// If already initialized, just update the view
				CalendarView.updateView();
			}

			// Update URL with current state
			CalendarView.setStateInURL();
		}
	},

	// Create the main calendar structure
	create: () => {
		const container = h(
			"div.calendar-container",
			// Header with title and controls
			h(
				"div.tab-header",
				h("h2.tab-title", CalendarView.getCurrentPeriodText()),

				// View selector
				h(
					"div.calendar-controls",
					h(
						"div.calendar-view-selector",
						h(
							"button",
							{
								className: `view-btn ${CalendarView.currentView === "month" ? "active" : ""}`,
								onclick: () => CalendarView.switchView("month"),
							},
							I18n.t("calendar.month")
						),
						h(
							"button",
							{
								className: `view-btn ${CalendarView.currentView === "week" ? "active" : ""}`,
								onclick: () => CalendarView.switchView("week"),
							},
							I18n.t("calendar.week")
						),
						h(
							"button",
							{
								className: `view-btn ${CalendarView.currentView === "day" ? "active" : ""}`,
								onclick: () => CalendarView.switchView("day"),
							},
							I18n.t("calendar.day")
						)
					),

					// Navigation controls
					h(
						"div.calendar-nav",
						h(
							"button.nav-btn",
							{
								onclick: () => CalendarView.navigate("prev"),
								title: I18n.t("calendar.previous"),
							},
							h("span.material-symbols-outlined", "chevron_left")
						),

						h(
							"button.nav-btn.today-btn",
							{
								onclick: () => CalendarView.navigateToday(),
							},
							I18n.t("calendar.today")
						),

						h(
							"button.nav-btn",
							{
								onclick: () => CalendarView.navigate("next"),
								title: I18n.t("calendar.next"),
							},
							h("span.material-symbols-outlined", "chevron_right")
						)
					)
				)
			),

			// Calendar body
			h("div.calendar-body", { id: "calendarBody" }, CalendarView.renderCurrentView())
		);

		return container;
	},

	// Switch between views
	switchView: (view) => {
		CalendarView.currentView = view;
		CalendarView.updateView();
		CalendarView.setStateInURL();
	},

	// Navigate calendar
	navigate: (direction) => {
		const date = new Date(CalendarView.currentDate);

		switch (CalendarView.currentView) {
			case "month":
				if (direction === "prev") {
					date.setMonth(date.getMonth() - 1);
				} else {
					date.setMonth(date.getMonth() + 1);
				}
				break;
			case "week":
				if (direction === "prev") {
					date.setDate(date.getDate() - 7);
				} else {
					date.setDate(date.getDate() + 7);
				}
				break;
			case "day":
				if (direction === "prev") {
					date.setDate(date.getDate() - 1);
				} else {
					date.setDate(date.getDate() + 1);
				}
				break;
		}

		CalendarView.currentDate = date;
		CalendarView.updateView();
		CalendarView.setStateInURL();
	},

	// Navigate to today
	navigateToday: () => {
		CalendarView.currentDate = new Date();
		CalendarView.updateView();
		CalendarView.setStateInURL();
	},

	// Update calendar view
	updateView: () => {
		// Update view selector buttons
		document.querySelectorAll(".view-btn").forEach((btn) => {
			btn.classList.toggle("active", btn.textContent.toLowerCase() === CalendarView.currentView);
		});

		// Update period text in title
		const titleText = document.querySelector('.tab-content[data-tab="calendar"] .tab-title');
		if (titleText) {
			titleText.textContent = CalendarView.getCurrentPeriodText();
		}

		// Update calendar body
		const calendarBody = document.getElementById("calendarBody");
		if (calendarBody) {
			calendarBody.innerHTML = "";
			calendarBody.appendChild(CalendarView.renderCurrentView());
		}
	},

	// Get current period text
	getCurrentPeriodText: () => {
		const date = CalendarView.currentDate;
		const months = I18n.t("calendar.months");

		switch (CalendarView.currentView) {
			case "month":
				return `${months[date.getMonth()]} ${date.getFullYear()}`;
			case "week": {
				const weekStart = CalendarView.getWeekStart(date);
				const weekEnd = CalendarView.getWeekEnd(date);
				if (weekStart.getMonth() === weekEnd.getMonth()) {
					return `${weekStart.getDate()}-${weekEnd.getDate()} ${months[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
				}
				if (weekStart.getFullYear() === weekEnd.getFullYear()) {
					return `${weekStart.getDate()} ${months[weekStart.getMonth()]} - ${weekEnd.getDate()} ${months[weekEnd.getMonth()]} ${weekStart.getFullYear()}`;
				}
				return `${weekStart.getDate()} ${months[weekStart.getMonth()]} ${weekStart.getFullYear()} - ${weekEnd.getDate()} ${months[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
			}
			case "day": {
				const weekdays = I18n.t("calendar.weekdaysFull");
				return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
			}
		}
	},

	// Render current view
	renderCurrentView: () => {
		switch (CalendarView.currentView) {
			case "month":
				return CalendarView.renderMonthView();
			case "week":
				return CalendarView.renderWeekView();
			case "day":
				return CalendarView.renderDayView();
		}
	},

	// Render month view
	renderMonthView: () => {
		const year = CalendarView.currentDate.getFullYear();
		const month = CalendarView.currentDate.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());

		const weekdays = I18n.t("calendar.weekdays");

		const monthGrid = h(
			"div.calendar-month",
			// Weekday headers
			h("div.calendar-weekdays", ...weekdays.map((day) => h("div.calendar-weekday", day))),

			// Days grid
			h("div.calendar-days", ...CalendarView.generateMonthDays(startDate, firstDay, lastDay))
		);

		return monthGrid;
	},

	// Generate month days
	generateMonthDays: (startDate, firstDay, lastDay) => {
		const days = [];
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const current = new Date(startDate);

		// Generate 6 weeks of days
		for (let week = 0; week < 6; week++) {
			for (let day = 0; day < 7; day++) {
				const date = new Date(current);
				const isCurrentMonth = date.getMonth() === firstDay.getMonth();
				const isToday = date.getTime() === today.getTime();
				const dayEvents = CalendarView.getEventsForDate(date);

				const dayContent = [h("div.calendar-day-number", date.getDate())];

				if (dayEvents.length > 0) {
					dayContent.push(
						h("div.calendar-day-events", ...CalendarView.renderDayEventCards(dayEvents))
					);
				}

				days.push(
					h(
						"div",
						{
							className: `calendar-day ${!isCurrentMonth ? "other-month" : ""} ${isToday ? "today" : ""} ${dayEvents.length > 0 ? "has-events" : ""}`,
							onclick: () => CalendarView.selectDate(date),
							ondragover: (e) => CalendarView.handleDragOver(e),
							ondragleave: (e) => CalendarView.handleDragLeave(e),
							ondrop: (e) => CalendarView.handleDrop(e, date),
							"data-date": CalendarView.formatDateKey(date),
						},
						...dayContent
					)
				);

				current.setDate(current.getDate() + 1);
			}
		}

		return days;
	},

	// Render week view
	renderWeekView: () => {
		const weekStart = CalendarView.getWeekStart(CalendarView.currentDate);
		const weekdays = I18n.t("calendar.weekdays");
		const weekdaysFull = I18n.t("calendar.weekdaysFull");

		const weekGrid = h(
			"div.calendar-week",
			// Time column
			h(
				"div.calendar-week-times",
				h("div.calendar-week-time-header", ""),
				...CalendarView.generateTimeSlots()
			),

			// Days columns
			...Array.from({ length: 7 }, (_, i) => {
				const date = new Date(weekStart);
				date.setDate(date.getDate() + i);
				const dayEvents = CalendarView.getEventsForDate(date);
				const isToday = CalendarView.isToday(date);

				return h(
					"div",
					{ className: `calendar-week-day ${isToday ? "today" : ""}` },
					h(
						"div.calendar-week-day-header",
						h("div.calendar-week-day-name", weekdays[i]),
						h("div.calendar-week-day-number", date.getDate())
					),
					h(
						"div.calendar-week-day-events",
						{
							ondragover: (e) => CalendarView.handleDragOver(e),
							ondragleave: (e) => CalendarView.handleDragLeave(e),
							ondrop: (e) => CalendarView.handleDrop(e, date),
							"data-date": CalendarView.formatDateKey(date),
						},
						...CalendarView.renderWeekEvents(dayEvents)
					)
				);
			})
		);

		return weekGrid;
	},

	// Render day view
	renderDayView: () => {
		const date = CalendarView.currentDate;
		const dayEvents = CalendarView.getEventsForDate(date);

		const dayView = h("div.calendar-day-view", [
			// Time slots
			h("div.calendar-day-times", [...CalendarView.generateTimeSlots()]),

			// Events column with drag and drop support
			h(
				"div.calendar-day-events-column[data-date]",
				{
					ondragover: (e) => CalendarView.handleDragOver(e),
					ondragleave: (e) => CalendarView.handleDragLeave(e),
					ondrop: (e) => CalendarView.handleDrop(e, date),
					"data-date": CalendarView.formatDateKey(date),
				},
				...(dayEvents.length === 0
					? [h("div.calendar-no-events", I18n.t("calendar.noEvents"))]
					: CalendarView.renderDayEvents(dayEvents))
			),
		]);

		return dayView;
	},

	// Generate time slots (30-minute intervals from 8am to 8pm)
	generateTimeSlots: () => {
		const slots = [];
		// Generate slots from 8am (8) to 8pm (20) in 30-minute intervals
		for (let hour = 8; hour <= 20; hour++) {
			for (let minute = 0; minute < 60; minute += 30) {
				const time24 = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
				const time12 = CalendarView.formatTime12Hour(hour, minute);

				const isFullHour = minute === 0;
				const className = `calendar-time-slot ${isFullHour ? "full-hour" : "half-hour"}`;

				slots.push(
					h(
						`div.${className}[data-time="${time24}" data-hour="${hour}" data-minute="${minute}"]`,
						time12
					)
				);
			}
		}
		return slots;
	},

	// Format time in 12-hour format
	formatTime12Hour: (hour, minute) => {
		const period = hour < 12 ? "AM" : "PM";
		const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
		const minuteStr = minute === 0 ? "" : `:${minute.toString().padStart(2, "0")}`;
		return `${hour12}${minuteStr} ${period}`;
	},

	// Load events from jobs data
	loadEvents: () => {
		const events = [];

		jobsData.forEach((job) => {
			// Add application date event
			if (job.appliedDate) {
				events.push({
					id: `applied-${job.id}`,
					type: "applied",
					date: new Date(job.appliedDate),
					title: `${I18n.t("calendar.applied")}: ${job.company}`,
					job: job,
					color: "green",
				});
			}

			// Add tasks with due dates
			if (job.tasks) {
				job.tasks.forEach((task) => {
					if (task.dueDate && task.status !== "done" && !task.archived) {
						events.push({
							id: `task-${job.id}-${task.id}`,
							type: "task",
							date: new Date(task.dueDate),
							title: task.text,
							job: job,
							task: task,
							priority: task.priority,
							color: "blue",
						});
					}
				});
			}

			// Add interview events based on substeps
			const interviewSubsteps = [
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

			if (interviewSubsteps.includes(job.currentSubstep)) {
				// For demo purposes, set interview date to near future
				const interviewDate = new Date();
				interviewDate.setDate(interviewDate.getDate() + Math.floor(Math.random() * 7) + 1);

				events.push({
					id: `interview-${job.id}`,
					type: "interview",
					date: interviewDate,
					title: `${I18n.t("calendar.interview")}: ${job.company} - ${job.position}`,
					job: job,
					color: "orange",
				});
			}

			// Add follow-up reminders
			if (job.currentPhase === "applied" && job.appliedDate) {
				const followUpDate = new Date(job.appliedDate);
				followUpDate.setDate(followUpDate.getDate() + 7); // Follow up after 1 week

				if (followUpDate > new Date()) {
					events.push({
						id: `followup-${job.id}`,
						type: "followup",
						date: followUpDate,
						title: `${I18n.t("calendar.followUp")}: ${job.company}`,
						job: job,
						color: "purple",
					});
				}
			}
		});

		// Sort events by date and time, with tasks ordered by priority within the same time
		events.sort((a, b) => {
			// First sort by date
			const dateCompare = a.date.getTime() - b.date.getTime();
			if (dateCompare !== 0) return dateCompare;

			// If same date, prioritize tasks by priority (high > medium > low)
			if (a.type === "task" && b.type === "task") {
				const priorityOrder = { high: 3, medium: 2, low: 1 };
				const aPriority = priorityOrder[a.priority] || 0;
				const bPriority = priorityOrder[b.priority] || 0;
				return bPriority - aPriority; // Higher priority first
			}

			// If one is task and other isn't, tasks come first
			if (a.type === "task" && b.type !== "task") return -1;
			if (a.type !== "task" && b.type === "task") return 1;

			// For same type non-tasks, maintain current order
			return 0;
		});

		CalendarView.events = events;
	},

	// Get events for a specific date
	getEventsForDate: (date) => {
		const dateStr = CalendarView.formatDateKey(date);
		return CalendarView.events.filter(
			(event) => CalendarView.formatDateKey(event.date) === dateStr
		);
	},

	// Format date as key
	formatDateKey: (date) => {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
	},

	// Check if date is today
	isToday: (date) => {
		const today = new Date();
		return (
			date.getFullYear() === today.getFullYear() &&
			date.getMonth() === today.getMonth() &&
			date.getDate() === today.getDate()
		);
	},

	// Get week start
	getWeekStart: (date) => {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day;
		return new Date(d.setDate(diff));
	},

	// Get week end
	getWeekEnd: (date) => {
		const d = new Date(date);
		const day = d.getDay();
		const diff = d.getDate() - day + 6;
		return new Date(d.setDate(diff));
	},

	// Select a date
	selectDate: (date) => {
		CalendarView.selectedDate = date;
		const events = CalendarView.getEventsForDate(date);

		// Always show the day view modal with tasks for this date
		CalendarView.showDayTasksModal(date, events);
	},

	// Render day event cards (mini cards with text)
	renderDayEventCards: (events) => {
		// Limit to first 3 events to avoid overflow
		const displayEvents = events.slice(0, 3);
		const cards = [];

		displayEvents.forEach((event) => {
			const eventColorClass = CalendarView.getEventClass(
				event.type,
				event.task?.priority || event.priority
			);
			let eventText = "";

			// Format event text based on type
			switch (event.type) {
				case "task":
					eventText = event.task.text;
					break;
				case "applied":
					eventText = `${I18n.t("calendar.eventPrefixes.applied")} ${event.job.company}`;
					break;
				case "interview":
					eventText = `${I18n.t("calendar.eventPrefixes.interview")} ${event.job.position}`;
					break;
				case "followup":
					eventText = `${I18n.t("calendar.eventPrefixes.followup")} ${event.job.company}`;
					break;
			}

			cards.push(
				h(
					"div",
					{
						className: `calendar-day-event-mini calendar-event-${event.type} ${eventColorClass}`,
						draggable: event.type === "task", // Only tasks can be dragged
						onclick: (e) => {
							e.stopPropagation();
							if (
								event.type === "task" &&
								typeof TasksBoard !== "undefined" &&
								TasksBoard.openTaskEditModal
							) {
								TasksBoard.openTaskEditModal(event.task);
							} else {
								CalendarView.selectDate(new Date(event.date));
							}
						},
						ondragstart: (e) => {
							if (event.type === "task") {
								CalendarView.handleDragStart(e, event);
							}
						},
						ondragend: (e) => {
							// Clean up drag state
							CalendarView.handleDragEnd(e);
						},
						title: eventText,
					},
					h("div.calendar-event-mini-text", eventText)
				)
			);
		});

		// Add overflow indicator if there are more events
		if (events.length > 3) {
			cards.push(
				h(
					"div.calendar-event-more",
					{
						onclick: (e) => {
							e.stopPropagation();
							CalendarView.selectDate(new Date(events[0].date));
						},
					},
					`+${events.length - 3} more`
				)
			);
		}

		return cards;
	},

	// Render week events
	renderWeekEvents: (events) => {
		// Calculate overlapping events and their positions
		const eventsWithPositions = CalendarView.calculateEventPositions(events);

		return eventsWithPositions.map((event) => {
			const eventColorClass = CalendarView.getEventClass(
				event.type,
				event.task?.priority || event.priority
			);
			const positionClass = event.positionStyle ? "calendar-event-positioned" : "";
			return h(
				"div",
				{
					className:
						`calendar-week-event calendar-event-${event.type} ${eventColorClass} ${positionClass}`.trim(),
					style: event.positionStyle,
					draggable: event.type === "task", // Only tasks can be dragged
					onclick: () => {
						if (
							event.type === "task" &&
							typeof TasksBoard !== "undefined" &&
							TasksBoard.openTaskEditModal
						) {
							TasksBoard.openTaskEditModal(event.task);
						} else {
							CalendarView.showEventDetails(event);
						}
					},
					ondragstart: (e) => {
						if (event.type === "task") {
							CalendarView.handleDragStart(e, event);
						}
					},
					ondragend: (e) => {
						// Clean up drag state
						CalendarView.handleDragEnd(e);
					},
				},
				h(
					"div.calendar-event-header",
					h("div.calendar-event-time", CalendarView.formatEventTime(event)),
					h("div.calendar-event-title", event.title),
					h(
						"button.calendar-event-job-btn",
						{
							onclick: (e) => {
								e.stopPropagation();
								if (typeof KanbanBoard !== "undefined" && KanbanBoard.openJobEditModal) {
									KanbanBoard.openJobEditModal(event.job);
								}
							},
							title: `View job: ${event.job.company} - ${event.job.position}`,
						},
						h("span.material-symbols-outlined", "work")
					)
				)
			);
		});
	},

	// Calculate event position based on time
	calculateEventPosition: (event) => {
		// Only position tasks with specific times, others use default flow
		if (event.type !== "task" || !event.task.dueDate) {
			return "";
		}

		const eventDate = new Date(event.task.dueDate);
		const hours = eventDate.getHours();
		const minutes = eventDate.getMinutes();

		// Only position events within business hours (8am-8pm)
		if (hours < 8 || hours > 20) {
			return "";
		}

		// Calculate position: each 30-min slot is about 20px high
		const slotsFromStart = (hours - 8) * 2 + Math.floor(minutes / 30);
		const topPosition = slotsFromStart * 20; // 20px per 30-min slot

		// Calculate height based on duration if available (default 30 min)
		let durationMinutes = 30; // default 30 minutes if no duration
		if (event.task.duration) {
			const parsedDuration = CalendarView.parseDuration(event.task.duration);
			if (parsedDuration) {
				durationMinutes = parsedDuration;
			}
		}
		// Height is proportional to duration: 20px per 30 minutes
		const height = Math.max(15, (durationMinutes / 30) * 20); // min 15px height

		return `top: ${topPosition}px; height: ${height}px;`;
	},

	// Parse duration string to minutes
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

	// Calculate positions for events, handling overlaps
	calculateEventPositions: (events) => {
		// First, calculate basic position for each event
		const eventsWithBasicPosition = events.map((event) => ({
			...event,
			positionStyle: CalendarView.calculateEventPosition(event),
			startMinutes: CalendarView.getEventStartMinutes(event),
			endMinutes: CalendarView.getEventEndMinutes(event),
		}));

		// Filter out events that don't have time-based positioning
		const timedEvents = eventsWithBasicPosition.filter(
			(event) => event.startMinutes !== null && event.positionStyle !== ""
		);
		const untimedEvents = eventsWithBasicPosition.filter(
			(event) => event.startMinutes === null || event.positionStyle === ""
		);

		// Group overlapping events
		const groups = CalendarView.groupOverlappingEvents(timedEvents);

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
	},

	// Get event start time in minutes from start of day
	getEventStartMinutes: (event) => {
		if (event.type !== "task" || !event.task.dueDate) return null;

		const eventDate = new Date(event.task.dueDate);
		const hours = eventDate.getHours();
		const minutes = eventDate.getMinutes();

		// Only consider business hours
		if (hours < 8 || hours > 20) return null;

		return hours * 60 + minutes;
	},

	// Get event end time in minutes from start of day
	getEventEndMinutes: (event) => {
		const startMinutes = CalendarView.getEventStartMinutes(event);
		if (startMinutes === null) return null;

		const durationMinutes = CalendarView.parseDuration(event.task?.duration) || 30; // default 30 min
		return startMinutes + durationMinutes;
	},

	// Group events that overlap in time
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

				if (CalendarView.eventsOverlap(event, otherEvent)) {
					group.push(otherEvent);
					processed.add(otherEvent.id);
				}
			});

			groups.push(group);
		});

		return groups;
	},

	// Check if two events overlap in time
	eventsOverlap: (event1, event2) => {
		const start1 = event1.startMinutes;
		const end1 = event1.endMinutes;
		const start2 = event2.startMinutes;
		const end2 = event2.endMinutes;

		return start1 < end2 && start2 < end1;
	},

	// Render day events
	renderDayEvents: (events) => {
		// Calculate overlapping events and their positions for day view too
		const eventsWithPositions = CalendarView.calculateEventPositions(events);

		return eventsWithPositions.map((event) => {
			const eventColorClass = CalendarView.getEventClass(
				event.type,
				event.task?.priority || event.priority
			);
			const positionClass = event.positionStyle ? "calendar-event-positioned" : "";
			return h(
				"div",
				{
					className:
						`calendar-day-event calendar-event-${event.type} ${eventColorClass} ${positionClass}`.trim(),
					style: event.positionStyle,
					draggable: event.type === "task", // Only tasks can be dragged
					onclick: () => {
						if (
							event.type === "task" &&
							typeof TasksBoard !== "undefined" &&
							TasksBoard.openTaskEditModal
						) {
							TasksBoard.openTaskEditModal(event.task);
						} else {
							CalendarView.showEventDetails(event);
						}
					},
					ondragstart: (e) => {
						if (event.type === "task") {
							CalendarView.handleDragStart(e, event);
						}
					},
					ondragend: (e) => {
						// Clean up drag state
						CalendarView.handleDragEnd(e);
					},
				},
				h(
					"div.calendar-event-header",
					h("div.calendar-event-time", CalendarView.formatEventTime(event)),
					h("div.calendar-event-title", event.title),
					event.type === "task" &&
						event.priority &&
						h("span", { className: `calendar-event-priority priority-${event.priority}` }),
					h(
						"button.calendar-event-job-btn",
						{
							onclick: (e) => {
								e.stopPropagation();
								if (typeof KanbanBoard !== "undefined" && KanbanBoard.openJobEditModal) {
									KanbanBoard.openJobEditModal(event.job);
								}
							},
							title: `View job: ${event.job.company} - ${event.job.position}`,
						},
						h("span.material-symbols-outlined", "work")
					)
				),
				h("div.calendar-event-subtitle", `${event.job.company} - ${event.job.position}`)
			);
		});
	},

	// Get event CSS class based on type and priority
	getEventClass: (type, priority = null) => {
		// For tasks, use priority-based classes
		if (type === "task" && priority) {
			return `calendar-event-task-${priority}`;
		}

		// For tasks without priority, use default
		if (type === "task") {
			return "calendar-event-task-default";
		}

		// For other event types, use type-based classes
		const typeClasses = {
			applied: "calendar-event-applied",
			interview: "calendar-event-interview",
			followup: "calendar-event-followup",
		};
		return typeClasses[type] || "calendar-event-default";
	},

	// Format event time
	formatEventTime: (event) => {
		// For now, just return the type icon
		const icons = {
			applied: "work",
			task: "task_alt",
			interview: "groups",
			followup: "follow_the_signs",
		};
		return h("span.material-symbols-outlined", icons[event.type] || "event");
	},

	// Format task date and time
	formatTaskDateTime: (dueDate) => {
		const date = new Date(dueDate);
		const now = new Date();
		const isToday = date.toDateString() === now.toDateString();
		const isTomorrow =
			date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

		// Format time part
		const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

		// Return appropriate format
		if (isToday) {
			return `Today ${timeStr}`;
		}
		if (isTomorrow) {
			return `Tomorrow ${timeStr}`;
		}
		return `${date.toLocaleDateString()} ${timeStr}`;
	},

	// Show date events modal
	showDateEvents: (date, events) => {
		const months = I18n.t("calendar.months");
		const weekdays = I18n.t("calendar.weekdaysFull");
		const dateStr = `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;

		const modal = h(
			"div.modal-overlay",
			{
				onclick: (e) => {
					if (e.target.className === "modal-overlay") e.target.remove();
				},
			},
			h(
				"div.modal.calendar-events-modal",
				h(
					"div.modal-header",
					h("h3.modal-title", dateStr),
					h(
						"button.modal-close",
						{
							onclick: (e) => e.target.closest(".modal-overlay").remove(),
						},
						"×"
					)
				),
				h(
					"div.modal-body",
					h(
						"div.calendar-events-list",
						...events.map((event) => CalendarView.renderEventCard(event))
					)
				)
			)
		);

		document.body.appendChild(modal);
	},

	// Show day tasks modal (enhanced version that shows all tasks for a day)
	showDayTasksModal: (date, events) => {
		const months = I18n.t("calendar.months");
		const weekdays = I18n.t("calendar.weekdaysFull");
		const dateStr = `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

		// Get all tasks for this date from all jobs
		const allTasks = CalendarView.getAllTasksForDate(date);

		// Filter tasks into calendar events (with specific times) and other tasks
		const timedTasks = allTasks.filter(
			(task) => task.dueDate && CalendarView.hasSpecificTime(task.dueDate)
		);
		const otherTasks = allTasks.filter(
			(task) => !task.dueDate || !CalendarView.hasSpecificTime(task.dueDate)
		);

		const modal = h(
			"div.modal-overlay",
			{
				onclick: (e) => {
					if (e.target.className === "modal-overlay") e.target.remove();
				},
			},
			h(
				"div.modal.calendar-day-tasks-modal",
				h(
					"div.modal-header",
					h("h3.modal-title", `${I18n.t("calendar.tasksForDate") || "Tasks for"} ${dateStr}`),
					h(
						"button.modal-close",
						{
							onclick: (e) => e.target.closest(".modal-overlay").remove(),
						},
						"×"
					)
				),
				h(
					"div.modal-body",
					// Calendar events section
					events.length > 0 &&
						h(
							"div.day-modal-section",
							h(
								"h4.day-modal-section-title",
								I18n.t("calendar.calendarEvents") || "Calendar Events"
							),
							h(
								"div.calendar-events-list",
								...events.map((event) => CalendarView.renderEventCard(event))
							)
						),

					// Timed tasks section
					timedTasks.length > 0 &&
						h(
							"div.day-modal-section",
							h(
								"h4.day-modal-section-title",
								I18n.t("calendar.scheduledTasks") || "Scheduled Tasks"
							),
							h(
								"div.day-tasks-list",
								...timedTasks.map((task) => CalendarView.renderTaskCard(task))
							)
						),

					// Other tasks section
					otherTasks.length > 0 &&
						h(
							"div.day-modal-section",
							h("h4.day-modal-section-title", I18n.t("calendar.otherTasks") || "Other Tasks Due"),
							h(
								"div.day-tasks-list",
								...otherTasks.map((task) => CalendarView.renderTaskCard(task))
							)
						),

					// Empty state
					events.length === 0 &&
						allTasks.length === 0 &&
						h(
							"div.empty-state",
							h("p", I18n.t("calendar.noTasksForDay") || "No tasks or events for this day"),
							h(
								"p.empty-state-hint",
								I18n.t("calendar.createTaskHint") || "You can create tasks from the Tasks tab"
							)
						)
				)
			)
		);

		document.body.appendChild(modal);
	},

	// Get all tasks for a specific date (from all jobs)
	getAllTasksForDate: (date) => {
		const targetDateStr = CalendarView.formatDateKey(date);
		const tasks = [];

		jobsData.forEach((job) => {
			if (job.tasks && job.tasks.length > 0) {
				job.tasks.forEach((task) => {
					if (!task.archived && task.dueDate) {
						const taskDateStr = CalendarView.formatDateKey(new Date(task.dueDate));
						if (taskDateStr === targetDateStr) {
							tasks.push({
								...task,
								jobId: job.id,
								jobCompany: job.company,
								jobPosition: job.position,
								job: job,
							});
						}
					}
				});
			}
		});

		return tasks;
	},

	// Check if a date has a specific time (not just date)
	hasSpecificTime: (dateString) => {
		const date = new Date(dateString);
		return date.getHours() !== 0 || date.getMinutes() !== 0;
	},

	// Render task card for the day modal
	renderTaskCard: (task) => {
		const priorityClass = task.priority ? `priority-${task.priority}` : "";
		const statusClass = task.status ? `status-${task.status}` : "";

		return h(
			"div",
			{
				className: `day-task-card ${priorityClass}`,
				onclick: () => CalendarView.openTaskForEdit(task),
			},
			h(
				"div.day-task-header",
				h("div.day-task-title", task.text || task.task || "Untitled task"),
				task.priority &&
					h("span.task-priority-badge", {
						className: `priority-dot priority-${task.priority}`,
					}),
				h(
					"span.task-status-badge",
					{
						className: `status-indicator ${statusClass}`,
					},
					getTaskStatusText(task.status)
				)
			),
			h(
				"div.day-task-meta",
				h("span.day-task-job", `${task.jobCompany} - ${task.jobPosition}`),
				task.dueDate &&
					CalendarView.hasSpecificTime(task.dueDate) &&
					h(
						"span.day-task-time",
						new Date(task.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
					)
			)
		);
	},

	// Open task for editing
	openTaskForEdit: (task) => {
		// Close the day modal first
		const dayModal = document.querySelector(".calendar-day-tasks-modal");
		if (dayModal) {
			dayModal.closest(".modal-overlay").remove();
		}

		// Open task edit modal if TasksBoard is available
		if (typeof TasksBoard !== "undefined" && TasksBoard.openTaskEditModal) {
			TasksBoard.openTaskEditModal(task);
		} else {
			// Fallback - could implement a simple task view/edit
			alert(
				`Task: ${task.text}\nJob: ${task.jobCompany} - ${task.jobPosition}\nStatus: ${getTaskStatusText(task.status)}`
			);
		}
	},

	// Render event card
	renderEventCard: (event) => {
		const eventColorClass = CalendarView.getEventClass(
			event.type,
			event.task?.priority || event.priority
		);
		return h(
			"div",
			{
				className: `calendar-event-card calendar-event-${event.type}`,
				onclick: () => CalendarView.handleEventClick(event),
			},
			h(
				"div.calendar-event-card-header",
				h(
					"span.calendar-event-type-badge",
					{
						className: eventColorClass,
					},
					I18n.t(`calendar.${event.type}`)
				),
				event.type === "task" &&
					event.priority &&
					h(
						"span",
						{ className: `priority-badge priority-${event.priority}` },
						I18n.t(
							`modals.tasks.priority${event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}`
						)
					)
			),
			h("div.calendar-event-card-title", event.title),
			h("div.calendar-event-card-subtitle", `${event.job.company} - ${event.job.position}`),
			// Show duration and due time for tasks
			event.type === "task" &&
				(event.task.duration || event.task.dueDate) &&
				h(
					"div.calendar-event-card-meta",
					...[
						event.task.dueDate &&
							h(
								"span.calendar-event-meta-item",
								h("span.material-symbols-outlined.calendar-meta-icon", "schedule"),
								CalendarView.formatTaskDateTime(event.task.dueDate)
							),
						event.task.duration &&
							h(
								"span.calendar-event-meta-item",
								h("span.material-symbols-outlined.calendar-meta-icon", "timer"),
								event.task.duration
							),
					].filter(Boolean)
				)
		);
	},

	// Handle event click
	handleEventClick: (event) => {
		// Close any existing modal
		const existingModal = document.querySelector(".modal-overlay");
		if (existingModal) existingModal.remove();

		// For tasks, open task edit modal; for other events, show details
		if (
			event.type === "task" &&
			typeof TasksBoard !== "undefined" &&
			TasksBoard.openTaskEditModal
		) {
			TasksBoard.openTaskEditModal(event.task);
		} else {
			CalendarView.showEventDetailsModal(event);
		}
	},

	// Show event details modal
	showEventDetailsModal: (event) => {
		const modal = h(
			"div.modal-overlay",
			{
				onclick: (e) => {
					if (e.target.className === "modal-overlay") e.target.remove();
				},
			},
			h(
				"div.modal.calendar-event-details-modal",
				h(
					"div.modal-header",
					h("h3.modal-title", event.title),
					h(
						"button.modal-close",
						{
							onclick: (e) => e.target.closest(".modal-overlay").remove(),
						},
						"×"
					)
				),
				h(
					"div.modal-body",
					h(
						"div.event-details",
						h(
							"div.event-detail-row",
							h("strong", "Type: "),
							h(
								"span",
								{
									className: `event-type-badge event-type-${event.type} ${CalendarView.getEventClass(event.type, event.task?.priority || event.priority)}`,
								},
								I18n.t(`calendar.${event.type}`)
							)
						),
						h("div.event-detail-row", h("strong", "Company: "), h("span", event.job.company)),
						h("div.event-detail-row", h("strong", "Position: "), h("span", event.job.position)),
						h(
							"div.event-detail-row",
							h("strong", "Date: "),
							h("span", event.date.toLocaleDateString())
						),
						event.type === "task" &&
							event.task && [
								h(
									"div.event-detail-row",
									h("strong", "Priority: "),
									h(
										"span",
										{
											className: `priority-badge priority-${event.task.priority} ${CalendarView.getEventClass("task", event.task.priority)}`,
										},
										event.task.priority
									)
								),
								h("div.event-detail-row", h("strong", "Status: "), h("span", event.task.status)),
							]
					)
				),
				h(
					"div.modal-footer",
					event.type === "task" &&
						h(
							"button.btn-primary",
							{
								onclick: () => {
									modal.remove();
									openTasksModal(event.job);
								},
							},
							"Open Tasks"
						),
					h(
						"button.btn-secondary",
						{
							onclick: () => {
								modal.remove();
								TabNavigation.switchTo("jobs");
							},
						},
						"View Job"
					),
					h(
						"button.btn-secondary",
						{
							onclick: () => modal.remove(),
						},
						"Close"
					)
				)
			)
		);

		document.body.appendChild(modal);
	},

	// Show event details
	showEventDetails: (event) => {
		CalendarView.handleEventClick(event);
	},

	// Drag and drop handlers
	handleDragEnd: (e) => {
		// Remove dragging class from all elements
		document.querySelectorAll(".dragging").forEach((el) => {
			el.classList.remove("dragging");
		});

		// Remove any drop indicators
		document.querySelectorAll(".time-drop-indicator, .time-drop-label").forEach((indicator) => {
			indicator.remove();
		});

		// Remove drag-over effects
		document.querySelectorAll(".drag-over").forEach((el) => {
			el.classList.remove("drag-over");
		});

		// Reset processing flag
		CalendarView._isProcessingDrop = false;
	},

	handleDragStart: (e, event) => {
		e.stopPropagation();

		// Only allow dragging tasks
		if (event.type !== "task") {
			e.preventDefault();
			return;
		}

		// Store the event data
		e.dataTransfer.setData(
			"text/plain",
			JSON.stringify({
				eventId: event.id,
				jobId: event.job.id,
				taskId: event.task.id,
				eventType: event.type,
			})
		);

		e.dataTransfer.effectAllowed = "move";

		// Add visual feedback
		e.target.classList.add("dragging");
	},

	handleDragOver: (e) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";

		// Add visual feedback to drop target
		const dayElement = e.currentTarget;
		dayElement.classList.add("drag-over");

		// Calculate time position for grid snapping in week/day views
		if (
			dayElement.classList.contains("calendar-week-day-events") ||
			dayElement.classList.contains("calendar-day-events-column")
		) {
			CalendarView.showTimeGridIndicator(e, dayElement);
		}
	},

	// Show time grid indicator for precise dropping
	showTimeGridIndicator: (e, container) => {
		// Remove ALL existing indicators from all containers
		document.querySelectorAll(".time-drop-indicator, .time-drop-label").forEach((indicator) => {
			indicator.remove();
		});

		const rect = container.getBoundingClientRect();
		const mouseY = e.clientY - rect.top;

		// Calculate which 15-minute slot the mouse is over
		const slotHeight = 30; // 30-min slot = 30px
		const quarterSlotHeight = 15; // 15-min = 15px

		const slotIndex = Math.floor(mouseY / quarterSlotHeight);
		const snapY = slotIndex * quarterSlotHeight;

		// Calculate the time this represents
		const totalQuarters = slotIndex;
		const hours = Math.floor(totalQuarters / 4) + 8; // Start at 8am
		const minutes = (totalQuarters % 4) * 15;

		// Only show if within business hours
		if (hours >= 8 && hours <= 20) {
			const timeStr = CalendarView.formatTime12Hour(hours, minutes);

			const indicator = h(
				"div.time-drop-indicator",
				{
					style: `top: ${snapY}px;`,
				},
				h("div.time-drop-label", {}, `Drop at ${timeStr}`)
			);

			container.appendChild(indicator);
		}
	},

	handleDragLeave: (e) => {
		// Remove visual feedback
		const dayElement = e.currentTarget;
		dayElement.classList.remove("drag-over");

		// Remove time indicators when leaving the container
		document.querySelectorAll(".time-drop-indicator, .time-drop-label").forEach((indicator) => {
			indicator.remove();
		});
	},

	handleDrop: (e, targetDate) => {
		e.preventDefault();
		e.stopPropagation();

		// Prevent duplicate drops
		if (CalendarView._isProcessingDrop) {
			return;
		}
		CalendarView._isProcessingDrop = true;

		// Remove visual feedback and indicators
		const dayElement = e.currentTarget;
		dayElement.classList.remove("drag-over");
		document.querySelectorAll(".time-drop-indicator, .time-drop-label").forEach((indicator) => {
			indicator.remove();
		});

		// Remove dragging class from all elements
		document.querySelectorAll(".dragging").forEach((el) => {
			el.classList.remove("dragging");
		});

		try {
			const dragDataText = e.dataTransfer.getData("text/plain");
			if (!dragDataText) {
				console.error("No drag data found");
				return;
			}

			const dragData = JSON.parse(dragDataText);

			if (dragData.eventType === "task" && dragData.jobId && dragData.taskId) {
				// Calculate new time if dropping on time grid
				const newDateTime = new Date(targetDate);

				if (
					dayElement.classList.contains("calendar-week-day-events") ||
					dayElement.classList.contains("calendar-day-events-column")
				) {
					const rect = dayElement.getBoundingClientRect();
					const mouseY = e.clientY - rect.top;

					// Calculate 15-minute slot
					const quarterSlotHeight = 10; // 15-min = 10px
					const slotIndex = Math.floor(mouseY / quarterSlotHeight);
					const totalQuarters = slotIndex;
					const hours = Math.floor(totalQuarters / 4) + 8; // Start at 8am
					const minutes = (totalQuarters % 4) * 15;

					// Only update time if within business hours
					if (hours >= 8 && hours <= 20) {
						newDateTime.setHours(hours, minutes, 0, 0);
					}
				}

				CalendarView.moveTaskToDateTime(dragData.jobId, dragData.taskId, newDateTime);
			}
		} catch (error) {
			console.error("Error handling drop:", error);
		} finally {
			// Reset drop processing flag after a short delay
			setTimeout(() => {
				CalendarView._isProcessingDrop = false;
			}, 100);
		}
	},

	// Move task to new date and time
	moveTaskToDateTime: (jobId, taskId, newDateTime) => {
		// Ensure IDs are properly compared
		const targetJobId = String(jobId);
		const targetTaskId = String(taskId);

		// Find the job
		const jobIndex = jobsData.findIndex((job) => String(job.id) === targetJobId);
		if (jobIndex === -1) {
			console.error("Job not found:", targetJobId);
			return;
		}

		// Find the task
		const taskIndex = jobsData[jobIndex].tasks.findIndex(
			(task) => String(task.id) === targetTaskId
		);
		if (taskIndex === -1) {
			console.error("Task not found:", targetTaskId);
			return;
		}

		// Create a deep copy of the task to avoid mutations
		const task = { ...jobsData[jobIndex].tasks[taskIndex] };
		const job = { ...jobsData[jobIndex] };

		// Update ONLY the specific task's due date
		jobsData[jobIndex].tasks[taskIndex].dueDate = newDateTime.toISOString();

		// Save changes
		saveToLocalStorage();

		// Reload events and refresh calendar
		CalendarView.loadEvents();
		CalendarView.updateView();

		// Show confirmation
		CalendarView.showMoveConfirmation(task, job, newDateTime);
	},

	// Move task to new date (legacy function for compatibility)
	moveTaskToDate: (jobId, taskId, newDate) => {
		CalendarView.moveTaskToDateTime(jobId, taskId, newDate);
	},

	// Show confirmation of task move
	showMoveConfirmation: (task, job, newDate) => {
		const dateStr = newDate.toLocaleDateString();
		const hours = newDate.getHours();
		const minutes = newDate.getMinutes();
		const timeStr = CalendarView.formatTime12Hour(hours, minutes);

		// Create more informative message
		const message =
			hours >= 8 && hours <= 20 && (hours !== 0 || minutes !== 0)
				? `Moved with success to ${dateStr} at ${timeStr}`
				: `Moved with success to ${dateStr}`;

		// Create temporary notification
		const notification = h(
			"div.calendar-move-notification",
			{},
			h("div.calendar-move-notification-title", {}, message),
			h("div.calendar-move-notification-subtitle", {}, `"${task.text}"`)
		);

		document.body.appendChild(notification);

		// Remove notification after 3 seconds
		setTimeout(() => {
			if (notification.parentNode) {
				notification.parentNode.removeChild(notification);
			}
		}, 3000);
	},
};

// Make CalendarView available globally
window.CalendarView = CalendarView;
