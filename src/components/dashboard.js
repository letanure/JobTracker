// ============================================================================
// DASHBOARD COMPONENT
// ============================================================================

const Dashboard = {
	// Create the dashboard
	create: () => {
		const container = h('div.dashboard-container');

		// Create stats section
		const statsSection = Dashboard.createStatsSection();

		// Create tasks sections
		const tasksContainer = h('div.dashboard-tasks-container',
			Dashboard.createTodayTasksSection(),
			Dashboard.createTomorrowTasksSection()
		);

		// Assemble dashboard
		container.appendChild(statsSection);
		container.appendChild(tasksContainer);

		return container;
	},

	// Create stats section
	createStatsSection: () => {
		const stats = Dashboard.calculateStats();

		const statsGrid = h('div.dashboard-stats-grid',
			// Total Jobs
			Dashboard.createStatCard(
				"work",
				I18n.t("dashboard.stats.totalJobs"),
				stats.totalJobs.toString(),
				"primary"
			),
			// Active Applications
			Dashboard.createStatCard(
				"trending_up",
				I18n.t("dashboard.stats.activeApplications"),
				stats.activeApplications.toString(),
				"success"
			),
			// Interviews
			Dashboard.createStatCard(
				"groups",
				I18n.t("dashboard.stats.interviews"),
				stats.interviews.toString(),
				"info"
			),
			// Offers
			Dashboard.createStatCard(
				"celebration",
				I18n.t("dashboard.stats.offers"),
				stats.offers.toString(),
				"warning"
			),
			// Active Tasks
			Dashboard.createStatCard(
				"task_alt",
				I18n.t("dashboard.stats.activeTasks"),
				stats.activeTasks.toString(),
				"secondary"
			),
			// Total Contacts
			Dashboard.createStatCard(
				"contacts",
				I18n.t("dashboard.stats.totalContacts"),
				stats.totalContacts.toString(),
				"default"
			),
			// Total Notes
			Dashboard.createStatCard(
				"description",
				I18n.t("dashboard.stats.totalNotes"),
				stats.totalNotes.toString(),
				"default"
			),
			// Tasks This Week
			Dashboard.createStatCard(
				"calendar_today",
				I18n.t("dashboard.stats.thisWeek"),
				stats.tasksThisWeek.toString(),
				"info"
			)
		);

		return h('div.dashboard-stats-section',
			h('h3.dashboard-section-title', I18n.t("dashboard.stats.title")),
			statsGrid
		);
	},

	// Create a stat card
	createStatCard: (icon, label, value, variant = "default") => {
		return h('div',
			{ className: `dashboard-stat-card stat-${variant}` },
			h('div.stat-icon',
				h('span.material-symbols-outlined', icon)
			),
			h('div.stat-content',
				h('div.stat-value', value),
				h('div.stat-label', label)
			)
		);
	},

	// Create today's tasks section
	createTodayTasksSection: () => {
		const todayTasks = Dashboard.getTasksForDate(new Date());

		const tasksList = h('div.dashboard-tasks-list');

		if (todayTasks.length === 0) {
			tasksList.appendChild(
				h('div.empty-state', I18n.t("dashboard.todayTasks.noTasks"))
			);
		} else {
			todayTasks.forEach((task) => {
				tasksList.appendChild(Dashboard.createTaskItem(task));
			});
		}

		return h('div.dashboard-tasks-section',
			h('h3.dashboard-section-title', I18n.t("dashboard.todayTasks.title")),
			tasksList
		);
	},

	// Create tomorrow's tasks section
	createTomorrowTasksSection: () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const tomorrowTasks = Dashboard.getTasksForDate(tomorrow);

		const tasksList = h('div.dashboard-tasks-list');

		if (tomorrowTasks.length === 0) {
			tasksList.appendChild(
				h('div.empty-state', I18n.t("dashboard.tomorrowTasks.noTasks"))
			);
		} else {
			tomorrowTasks.forEach((task) => {
				tasksList.appendChild(Dashboard.createTaskItem(task));
			});
		}

		return h('div.dashboard-tasks-section',
			h('h3.dashboard-section-title', I18n.t("dashboard.tomorrowTasks.title")),
			tasksList
		);
	},

	// Create a task item
	createTaskItem: (task) => {
		const priorityClass = `priority-${task.priority}`;
		const statusClass = `status-${task.status}`;

		// Format time if available
		let timeStr = "";
		if (task.dueDate) {
			const dueDate = new Date(task.dueDate);
			timeStr = dueDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
		}

		return h('div',
			{
				className: `dashboard-task-item ${priorityClass}`,
				onclick: () => Dashboard.openTaskModal(task)},
			h('div.task-time', timeStr || "—"),
			h('div.task-info',
				h('div.task-text', task.task || task.text || task.description),
				h('div.task-job',
					h('span.material-symbols-outlined', "work"),
					h('span', `${task.jobCompany} - ${task.jobPosition}`)
				)
			),
			h('div', { className: `task-status ${statusClass}` }, getTaskStatusText(task.status))
		);
	},

	// Calculate dashboard statistics
	calculateStats: () => {
		const totalJobs = jobsData.length;
		let activeApplications = 0;
		let interviews = 0;
		let offers = 0;
		let activeTasks = 0;
		let totalContacts = 0;
		let totalNotes = 0;
		let tasksThisWeek = 0;

		// Calculate job-related stats
		jobsData.forEach((job) => {
			// Active applications (not rejected/withdrawn)
			if (job.currentPhase !== "rejected_withdrawn") {
				activeApplications++;
			}

			// Interviews
			if (job.currentPhase === "interview") {
				interviews++;
			}

			// Offers
			if (job.currentPhase === "offer") {
				offers++;
			}

			// Count tasks
			if (job.tasks) {
				job.tasks.forEach((task) => {
					if (!task.archived && task.status !== "done") {
						activeTasks++;
					}

					// Tasks this week
					if (task.dueDate) {
						const taskDate = new Date(task.dueDate);
						const startOfWeek = new Date();
						startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
						startOfWeek.setHours(0, 0, 0, 0);
						const endOfWeek = new Date(startOfWeek);
						endOfWeek.setDate(endOfWeek.getDate() + 7);

						if (taskDate >= startOfWeek && taskDate < endOfWeek && !task.archived) {
							tasksThisWeek++;
						}
					}
				});
			}

			// Count contacts
			if (job.contacts) {
				totalContacts += job.contacts.filter((c) => !c.archived).length;
			}

			// Count notes
			if (job.notes) {
				totalNotes += job.notes.filter((n) => !n.archived).length;
			}
		});

		return {
			totalJobs,
			activeApplications,
			interviews,
			offers,
			activeTasks,
			totalContacts,
			totalNotes,
			tasksThisWeek};
	},

	// Get tasks for a specific date
	getTasksForDate: (date) => {
		const tasks = [];
		const dateStr = date.toDateString();

		jobsData.forEach((job) => {
			if (job.tasks) {
				job.tasks.forEach((task) => {
					if (!task.archived && task.dueDate) {
						const taskDate = new Date(task.dueDate);
						if (taskDate.toDateString() === dateStr) {
							tasks.push({
								...task,
								jobId: job.id,
								jobCompany: job.company,
								jobPosition: job.position,
								jobPhase: job.currentPhase});
						}
					}
				});
			}
		});

		// Sort by time
		tasks.sort((a, b) => {
			const timeA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
			const timeB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
			return timeA - timeB;
		});

		return tasks;
	},

	// Open task modal
	openTaskModal: (task) => {
		const job = jobsData.find((j) => j.id === task.jobId);
		if (job) {
			openTasksModal(job);
		}
	},

	// Initialize dashboard
	init: () => {
		const dashboardTab = document.querySelector('.tab-content[data-tab="dashboard"]');
		if (dashboardTab) {
			dashboardTab.innerHTML = "";
			const dashboard = Dashboard.create();
			dashboardTab.appendChild(dashboard);
		} else {
			console.error("Dashboard tab not found");
		}
	},

	// Refresh dashboard
	refresh: () => {
		Dashboard.init();
	}};

// Make Dashboard available globally
window.Dashboard = Dashboard;
