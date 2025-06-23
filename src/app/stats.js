// ============================================================================
// STATISTICS CALCULATIONS
// ============================================================================

// Update statistics
function updateStats(filteredJobs = null) {
	const jobs = filteredJobs || jobsData;
	const total = jobs.length;
	let active = 0;
	let interviews = 0;
	let offers = 0;
	let rejections = 0;

	for (const job of jobs) {
		const phase = job.currentPhase;
		if (phase !== "rejected_withdrawn") active++;
		if (phase === "interview") interviews++;
		if (phase === "offer") offers++;
		if (phase === "rejected_withdrawn") rejections++;
	}

	$("#totalApps").text(total.toString());
	$("#activeApps").text(active.toString());
	$("#interviews").text(interviews.toString());
	$("#offers").text(offers.toString());
	$("#rejections").text(rejections.toString());
}
