// ============================================================================
// CALENDAR VIEW COMPONENT
// ============================================================================

const CalendarView = {
	// Current view settings
	currentView: 'month', // month, week, day
	currentDate: new Date(),
	selectedDate: null,
	events: [],

	// Initialize calendar view
	init: () => {
		const calendarTab = document.querySelector('.tab-content[data-tab="calendar"]');
		
		if (calendarTab) {
			// Always reload events to get latest data
			CalendarView.loadEvents();
			
			// Only clear and initialize if not already initialized
			if (!calendarTab.querySelector('.calendar-container')) {
				// Clear existing content
				calendarTab.innerHTML = '';
				
				// Create calendar container
				const container = CalendarView.create();
				calendarTab.appendChild(container);
			} else {
				// If already initialized, just update the view
				CalendarView.updateView();
			}
		}
	},

	// Create the main calendar structure
	create: () => {
		const container = h("div", { className: "calendar-container" },
			// Header with title and controls
			h("div", { className: "calendar-header" },
				h("h2", { className: "calendar-title" }, I18n.t("calendar.title")),
				
				// View selector
				h("div", { className: "calendar-controls" },
					h("div", { className: "calendar-view-selector" },
						h("button", {
							className: `view-btn ${CalendarView.currentView === 'month' ? 'active' : ''}`,
							onclick: () => CalendarView.switchView('month')
						}, I18n.t("calendar.month")),
						h("button", {
							className: `view-btn ${CalendarView.currentView === 'week' ? 'active' : ''}`,
							onclick: () => CalendarView.switchView('week')
						}, I18n.t("calendar.week")),
						h("button", {
							className: `view-btn ${CalendarView.currentView === 'day' ? 'active' : ''}`,
							onclick: () => CalendarView.switchView('day')
						}, I18n.t("calendar.day"))
					),
					
					// Navigation controls
					h("div", { className: "calendar-nav" },
						h("button", {
							className: "nav-btn",
							onclick: () => CalendarView.navigate('prev'),
							title: I18n.t("calendar.previous")
						}, h("span", { className: "material-symbols-outlined" }, "chevron_left")),
						
						h("button", {
							className: "nav-btn today-btn",
							onclick: () => CalendarView.navigateToday()
						}, I18n.t("calendar.today")),
						
						h("button", {
							className: "nav-btn",
							onclick: () => CalendarView.navigate('next'),
							title: I18n.t("calendar.next")
						}, h("span", { className: "material-symbols-outlined" }, "chevron_right"))
					)
				)
			),
			
			// Current period display
			h("div", { className: "calendar-period" },
				h("h3", { className: "calendar-period-text" }, CalendarView.getCurrentPeriodText())
			),
			
			// Calendar body
			h("div", { className: "calendar-body", id: "calendarBody" },
				CalendarView.renderCurrentView()
			)
		);
		
		return container;
	},

	// Switch between views
	switchView: (view) => {
		CalendarView.currentView = view;
		CalendarView.updateView();
	},

	// Navigate calendar
	navigate: (direction) => {
		const date = new Date(CalendarView.currentDate);
		
		switch (CalendarView.currentView) {
			case 'month':
				if (direction === 'prev') {
					date.setMonth(date.getMonth() - 1);
				} else {
					date.setMonth(date.getMonth() + 1);
				}
				break;
			case 'week':
				if (direction === 'prev') {
					date.setDate(date.getDate() - 7);
				} else {
					date.setDate(date.getDate() + 7);
				}
				break;
			case 'day':
				if (direction === 'prev') {
					date.setDate(date.getDate() - 1);
				} else {
					date.setDate(date.getDate() + 1);
				}
				break;
		}
		
		CalendarView.currentDate = date;
		CalendarView.updateView();
	},

	// Navigate to today
	navigateToday: () => {
		CalendarView.currentDate = new Date();
		CalendarView.updateView();
	},

	// Update calendar view
	updateView: () => {
		// Update view selector buttons
		document.querySelectorAll('.view-btn').forEach(btn => {
			btn.classList.toggle('active', btn.textContent.toLowerCase() === CalendarView.currentView);
		});
		
		// Update period text
		const periodText = document.querySelector('.calendar-period-text');
		if (periodText) {
			periodText.textContent = CalendarView.getCurrentPeriodText();
		}
		
		// Update calendar body
		const calendarBody = document.getElementById('calendarBody');
		if (calendarBody) {
			calendarBody.innerHTML = '';
			calendarBody.appendChild(CalendarView.renderCurrentView());
		}
	},

	// Get current period text
	getCurrentPeriodText: () => {
		const date = CalendarView.currentDate;
		const months = I18n.t("calendar.months");
		
		switch (CalendarView.currentView) {
			case 'month':
				return `${months[date.getMonth()]} ${date.getFullYear()}`;
			case 'week':
				const weekStart = CalendarView.getWeekStart(date);
				const weekEnd = CalendarView.getWeekEnd(date);
				if (weekStart.getMonth() === weekEnd.getMonth()) {
					return `${weekStart.getDate()}-${weekEnd.getDate()} ${months[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
				} else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
					return `${weekStart.getDate()} ${months[weekStart.getMonth()]} - ${weekEnd.getDate()} ${months[weekEnd.getMonth()]} ${weekStart.getFullYear()}`;
				} else {
					return `${weekStart.getDate()} ${months[weekStart.getMonth()]} ${weekStart.getFullYear()} - ${weekEnd.getDate()} ${months[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
				}
			case 'day':
				const weekdays = I18n.t("calendar.weekdaysFull");
				return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
		}
	},

	// Render current view
	renderCurrentView: () => {
		switch (CalendarView.currentView) {
			case 'month':
				return CalendarView.renderMonthView();
			case 'week':
				return CalendarView.renderWeekView();
			case 'day':
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
		
		const monthGrid = h("div", { className: "calendar-month" },
			// Weekday headers
			h("div", { className: "calendar-weekdays" },
				...weekdays.map(day => 
					h("div", { className: "calendar-weekday" }, day)
				)
			),
			
			// Days grid
			h("div", { className: "calendar-days" },
				...CalendarView.generateMonthDays(startDate, firstDay, lastDay)
			)
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
				
				const dayContent = [
					h("div", { className: "calendar-day-number" }, date.getDate())
				];
				
				if (dayEvents.length > 0) {
					dayContent.push(
						h("div", { className: "calendar-day-events" },
							...CalendarView.renderDayEventCards(dayEvents)
						)
					);
				}
				
				days.push(
					h("div", {
						className: `calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`,
						onclick: () => CalendarView.selectDate(date)
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
		
		const weekGrid = h("div", { className: "calendar-week" },
			// Time column
			h("div", { className: "calendar-week-times" },
				h("div", { className: "calendar-week-time-header" }, ""),
				...CalendarView.generateTimeSlots()
			),
			
			// Days columns
			...Array.from({ length: 7 }, (_, i) => {
				const date = new Date(weekStart);
				date.setDate(date.getDate() + i);
				const dayEvents = CalendarView.getEventsForDate(date);
				const isToday = CalendarView.isToday(date);
				
				return h("div", { className: `calendar-week-day ${isToday ? 'today' : ''}` },
					h("div", { className: "calendar-week-day-header" },
						h("div", { className: "calendar-week-day-name" }, weekdays[i]),
						h("div", { className: "calendar-week-day-number" }, date.getDate())
					),
					h("div", { className: "calendar-week-day-events" },
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
		
		const dayView = h("div", { className: "calendar-day-view" },
			// Time slots
			h("div", { className: "calendar-day-times" },
				...CalendarView.generateTimeSlots()
			),
			
			// Events column
			h("div", { className: "calendar-day-events-column" },
				...(dayEvents.length === 0 ? 
					[h("div", { className: "calendar-no-events" }, I18n.t("calendar.noEvents"))] :
					CalendarView.renderDayEvents(dayEvents))
			)
		);
		
		return dayView;
	},

	// Generate time slots
	generateTimeSlots: () => {
		const slots = [];
		for (let hour = 0; hour < 24; hour++) {
			const time = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
			slots.push(
				h("div", { className: "calendar-time-slot" }, time)
			);
		}
		return slots;
	},

	// Load events from jobs data
	loadEvents: () => {
		const events = [];
		
		jobsData.forEach(job => {
			// Add application date event
			if (job.appliedDate) {
				events.push({
					id: `applied-${job.id}`,
					type: 'applied',
					date: new Date(job.appliedDate),
					title: `${I18n.t("calendar.applied")}: ${job.company}`,
					job: job,
					color: 'green'
				});
			}
			
			// Add tasks with due dates
			if (job.tasks) {
				job.tasks.forEach(task => {
					if (task.dueDate && task.status !== 'done' && !task.archived) {
						events.push({
							id: `task-${job.id}-${task.id}`,
							type: 'task',
							date: new Date(task.dueDate),
							title: task.text,
							job: job,
							task: task,
							priority: task.priority,
							color: 'blue'
						});
					}
				});
			}
			
			// Add interview events based on substeps
			const interviewSubsteps = [
				'hr_phone_screen', 'phone_screening', 'technical_phone_screen',
				'technical_interview', 'behavioral_interview', 'team_interview',
				'hiring_manager_interview', 'panel_interview', 'final_round'
			];
			
			if (interviewSubsteps.includes(job.currentSubstep)) {
				// For demo purposes, set interview date to near future
				const interviewDate = new Date();
				interviewDate.setDate(interviewDate.getDate() + Math.floor(Math.random() * 7) + 1);
				
				events.push({
					id: `interview-${job.id}`,
					type: 'interview',
					date: interviewDate,
					title: `${I18n.t("calendar.interview")}: ${job.company} - ${job.position}`,
					job: job,
					color: 'orange'
				});
			}
			
			// Add follow-up reminders
			if (job.currentPhase === 'applied' && job.appliedDate) {
				const followUpDate = new Date(job.appliedDate);
				followUpDate.setDate(followUpDate.getDate() + 7); // Follow up after 1 week
				
				if (followUpDate > new Date()) {
					events.push({
						id: `followup-${job.id}`,
						type: 'followup',
						date: followUpDate,
						title: `${I18n.t("calendar.followUp")}: ${job.company}`,
						job: job,
						color: 'purple'
					});
				}
			}
		});
		
		CalendarView.events = events;
	},

	// Get events for a specific date
	getEventsForDate: (date) => {
		const dateStr = CalendarView.formatDateKey(date);
		return CalendarView.events.filter(event => 
			CalendarView.formatDateKey(event.date) === dateStr
		);
	},

	// Format date as key
	formatDateKey: (date) => {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	},

	// Check if date is today
	isToday: (date) => {
		const today = new Date();
		return date.getFullYear() === today.getFullYear() &&
			date.getMonth() === today.getMonth() &&
			date.getDate() === today.getDate();
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
		
		if (events.length > 0) {
			CalendarView.showDateEvents(date, events);
		}
	},

	// Render day event cards (mini cards with text)
	renderDayEventCards: (events) => {
		// Limit to first 3 events to avoid overflow
		const displayEvents = events.slice(0, 3);
		const cards = [];
		
		displayEvents.forEach(event => {
			const color = CalendarView.getEventColor(event.type);
			let eventText = '';
			
			// Format event text based on type
			switch(event.type) {
				case 'task':
					eventText = event.task.text;
					break;
				case 'applied':
					eventText = `Applied: ${event.job.company}`;
					break;
				case 'interview':
					eventText = `Interview: ${event.job.position}`;
					break;
				case 'followup':
					eventText = `Follow up: ${event.job.company}`;
					break;
			}
			
			cards.push(
				h("div", {
					className: `calendar-day-event-mini calendar-event-${event.type}`,
					style: `background-color: var(--${color}-100); border-left: 2px solid var(--${color}-500);`,
					onclick: (e) => {
						e.stopPropagation();
						CalendarView.selectDate(new Date(event.date));
					},
					title: eventText
				},
					h("div", { className: "calendar-event-mini-text" }, eventText)
				)
			);
		});
		
		// Add overflow indicator if there are more events
		if (events.length > 3) {
			cards.push(
				h("div", { 
					className: "calendar-event-more",
					onclick: (e) => {
						e.stopPropagation();
						CalendarView.selectDate(new Date(events[0].date));
					}
				}, `+${events.length - 3} more`)
			);
		}
		
		return cards;
	},

	// Render week events
	renderWeekEvents: (events) => {
		return events.map(event => 
			h("div", {
				className: `calendar-week-event calendar-event-${event.type}`,
				style: `background-color: var(--${CalendarView.getEventColor(event.type)}-100); border-left: 3px solid var(--${CalendarView.getEventColor(event.type)}-500);`,
				onclick: () => CalendarView.showEventDetails(event)
			},
				h("div", { className: "calendar-event-time" }, CalendarView.formatEventTime(event)),
				h("div", { className: "calendar-event-title" }, event.title)
			)
		);
	},

	// Render day events
	renderDayEvents: (events) => {
		return events.map(event => 
			h("div", {
				className: `calendar-day-event calendar-event-${event.type}`,
				style: `background-color: var(--${CalendarView.getEventColor(event.type)}-100); border-left: 4px solid var(--${CalendarView.getEventColor(event.type)}-500);`,
				onclick: () => CalendarView.showEventDetails(event)
			},
				h("div", { className: "calendar-event-header" },
					h("div", { className: "calendar-event-time" }, CalendarView.formatEventTime(event)),
					event.type === 'task' && event.priority && 
						h("span", { className: `calendar-event-priority priority-${event.priority}` })
				),
				h("div", { className: "calendar-event-title" }, event.title),
				h("div", { className: "calendar-event-subtitle" }, 
					`${event.job.company} - ${event.job.position}`
				)
			)
		);
	},

	// Get event color
	getEventColor: (type) => {
		const colors = {
			applied: 'green',
			task: 'blue',
			interview: 'orange',
			followup: 'purple'
		};
		return colors[type] || 'gray';
	},

	// Format event time
	formatEventTime: (event) => {
		// For now, just return the type icon
		const icons = {
			applied: 'work',
			task: 'task_alt',
			interview: 'groups',
			followup: 'follow_the_signs'
		};
		return h("span", { className: "material-symbols-outlined" }, icons[event.type] || 'event');
	},

	// Show date events modal
	showDateEvents: (date, events) => {
		const months = I18n.t("calendar.months");
		const weekdays = I18n.t("calendar.weekdaysFull");
		const dateStr = `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
		
		const modal = h("div", { className: "modal-overlay", onclick: (e) => {
			if (e.target.className === "modal-overlay") e.target.remove();
		}},
			h("div", { className: "modal calendar-events-modal" },
				h("div", { className: "modal-header" },
					h("h3", { className: "modal-title" }, dateStr),
					h("button", {
						className: "modal-close",
						onclick: (e) => e.target.closest('.modal-overlay').remove()
					}, "×")
				),
				h("div", { className: "modal-body" },
					h("div", { className: "calendar-events-list" },
						...events.map(event => CalendarView.renderEventCard(event))
					)
				)
			)
		);
		
		document.body.appendChild(modal);
	},

	// Render event card
	renderEventCard: (event) => {
		return h("div", {
			className: `calendar-event-card calendar-event-${event.type}`,
			onclick: () => CalendarView.handleEventClick(event)
		},
			h("div", { className: "calendar-event-card-header" },
				h("span", {
					className: "calendar-event-type-badge",
					style: `background-color: var(--${CalendarView.getEventColor(event.type)}-100); color: var(--${CalendarView.getEventColor(event.type)}-700);`
				}, I18n.t(`calendar.${event.type}`)),
				event.type === 'task' && event.priority && 
					h("span", { className: `priority-badge priority-${event.priority}` }, 
						I18n.t(`modals.tasks.priority${event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}`)
					)
			),
			h("div", { className: "calendar-event-card-title" }, event.title),
			h("div", { className: "calendar-event-card-subtitle" }, 
				`${event.job.company} - ${event.job.position}`
			)
		);
	},

	// Handle event click
	handleEventClick: (event) => {
		// Close modal
		const modal = document.querySelector('.modal-overlay');
		if (modal) modal.remove();
		
		// Navigate based on event type
		if (event.type === 'task') {
			// Open tasks modal for the job
			openTasksModal(event.job);
		} else {
			// Switch to jobs tab and highlight the job
			TabNavigation.switchTo('jobs');
			// Could add highlighting logic here
		}
	},

	// Show event details
	showEventDetails: (event) => {
		CalendarView.handleEventClick(event);
	}
};

// Make CalendarView available globally
window.CalendarView = CalendarView;