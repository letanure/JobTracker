// ============================================================================
// TASK COUNT COMPONENT
// ============================================================================

// Tasks count display component with colored counters
const TasksCount = ({ tasks = [], onClick }) => {
	const activeTasks = tasks.filter((task) => !task.archived);
	const todoCount = activeTasks.filter((task) => task.status === "todo").length;
	const inProgressCount = activeTasks.filter((task) => task.status === "in-progress").length;
	const doneCount = activeTasks.filter((task) => task.status === "done").length;
	const totalActiveCount = activeTasks.length;
	const archivedCount = tasks.length - totalActiveCount;

	const className = totalActiveCount === 0 ? "tasks-count zero" : "tasks-count";

	return h(`span.${className}`, 
		{
			onclick: onClick, // Always allow clicks to open modal
			title: `${totalActiveCount} active task${totalActiveCount !== 1 ? "s" : ""} (${todoCount} todo, ${inProgressCount} in progress, ${doneCount} done)${archivedCount > 0 ? ` + ${archivedCount} archived` : ""}`},
		h('span.task-count-todo', todoCount.toString()),
		h('span.task-count-separator', '/'),
		h('span.task-count-in-progress', inProgressCount.toString()),
		h('span.task-count-separator', '/'),
		h('span.task-count-done', doneCount.toString())
	);
};

// Make TasksCount available globally
window.TasksCount = TasksCount;
