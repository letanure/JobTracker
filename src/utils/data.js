// ============================================================================
// DATA MIGRATION AND PERSISTENCE
// ============================================================================

// Migrate old notes format (string) to new format (array of note objects)
const migrateNotesData = (jobs) => {
	return jobs.map((job) => {
		// If notes is a string, convert it to the new format
		if (typeof job.notes === "string" && job.notes.trim() !== "") {
			return {
				...job,
				notes: [
					{
						id: Date.now(),
						date: job.appliedDate || new Date().toISOString().split("T")[0],
						phase: job.currentPhase || "applicationReview",
						text: job.notes,
					},
				],
			};
		}
		// If notes is already an array or empty, keep as is
		if (Array.isArray(job.notes)) {
			return job;
		}
		// If notes is undefined or empty string, set to empty array
		return {
			...job,
			notes: [],
		};
	});
};

// Migrate old task format and create tasks array for jobs that don't have it
const migrateTasksData = (jobs) => {
	return jobs.map((job) => {
		// If job has nextTask or dueDate, migrate them to tasks array
		if ((job.nextTask && job.nextTask.trim() !== "") || job.dueDate) {
			const existingTasks = Array.isArray(job.tasks) ? job.tasks : [];

			// Only add migration task if there's actual content and no tasks exist yet
			if (
				existingTasks.length === 0 &&
				job.nextTask &&
				job.nextTask.trim() !== ""
			) {
				const migrationTask = {
					id: Date.now().toString(),
					text: job.nextTask,
					status: "todo",
					priority: "medium",
					createdAt: job.appliedDate || new Date().toISOString(),
					completedAt: null,
					dueDate: job.dueDate ? new Date(job.dueDate).toISOString() : null,
				};

				return {
					...job,
					tasks: [migrationTask],
				};
			}
		}

		// If tasks is already an array, keep as is
		if (Array.isArray(job.tasks)) {
			return job;
		}

		// If tasks is undefined, set to empty array
		return {
			...job,
			tasks: [],
		};
	});
};

// Save to localStorage
const saveToLocalStorage = () => {
	DataStore.save({
		jobs: jobsData,
		language: I18n.currentLanguage,
	});
};

// Load from localStorage
const loadFromLocalStorage = () => {
	const savedData = DataStore.load();
	
	if (savedData) {
		// Set language first
		if (savedData.language) {
			I18n.setLanguage(savedData.language);
		}
		
		// Migrate and load jobs data
		if (savedData.jobs && Array.isArray(savedData.jobs)) {
			let migratedJobs = migrateNotesData(savedData.jobs);
			migratedJobs = migrateTasksData(migratedJobs);
			return migratedJobs;
		}
	}
	
	return null;
};