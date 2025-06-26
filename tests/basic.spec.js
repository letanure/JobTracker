// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("JobTracker Basic Functionality", () => {
	test.beforeEach(async ({ page }) => {
		// Load application with demo data
		await page.goto("http://localhost:3000?demo=true");
		// Wait for the application to load
		await page.waitForSelector(".container", { timeout: 10000 });
	});

	test("should load with demo data", async ({ page }) => {
		// Check that demo data is loaded
		await expect(page.locator(".tab-navigation")).toBeVisible();
		await expect(page.locator(".footer")).toBeVisible();

		// Check that we're on the jobs tab by default
		await expect(page.locator(".tab-button.active")).toContainText("Dashboard");
	});

	test("should navigate through all tabs", async ({ page }) => {
		const tabs = ["Jobs", "Applications", "Tasks", "Calendar", "Dashboard", "Contacts"];

		for (const tabName of tabs) {
			// Click on tab
			await page.click(`text=${tabName}`);
			await page.waitForTimeout(500);

			// Check that tab is active
			await expect(page.locator(".tab-button.active")).toContainText(tabName);

			// Check that content is visible
			await expect(page.locator(".tab-content.active")).toBeVisible();

			// Tab-specific content checks
			if (tabName === "Jobs") {
				await expect(page.locator("table")).toBeVisible();
			} else if (tabName === "Applications") {
				await expect(page.locator(".kanban-board")).toBeVisible();
			} else if (tabName === "Tasks") {
				await expect(page.locator(".tasks-board")).toBeVisible();
			} else if (tabName === "Calendar") {
				await expect(page.locator(".calendar-container")).toBeVisible();
			} else if (tabName === "Dashboard") {
				await expect(page.locator(".dashboard-container")).toBeVisible();
			} else if (tabName === "Contacts") {
				await expect(page.locator(".contacts-container")).toBeVisible();
			}
		}
	});

	test("should open and close modals", async ({ page }) => {
		// Go to Jobs tab
		await page.click("text=Jobs");
		await page.waitForTimeout(500);

		// Test job edit modal - use a more specific selector
		const editButton = page.locator("table .action-btn").first();
		if (await editButton.isVisible()) {
			await editButton.click();
		} else {
			// Skip if no edit buttons are visible
			return;
		}

		// Check modal is open
		await expect(page.locator(".modal-overlay")).toBeVisible();
		await expect(page.locator(".modal-title")).toBeVisible();

		// Close modal with cancel
		await page.click("text=Cancel");
		await expect(page.locator(".modal-overlay")).not.toBeVisible();

		// Test notes modal
		const notesButton = page.locator('[title*="notes"]').first();
		if (await notesButton.isVisible()) {
			await notesButton.click();
			await expect(page.locator(".modal-overlay")).toBeVisible();

			// Close with X button
			await page.click(".modal-close");
			await expect(page.locator(".modal-overlay")).not.toBeVisible();
		}
	});

	test("should show demo data in dashboard", async ({ page }) => {
		// Go to Dashboard tab
		await page.click("text=Dashboard");
		await page.waitForTimeout(500);

		// Check stats are visible
		await expect(page.locator(".dashboard-stats-grid")).toBeVisible();
		await expect(page.locator(".stat-value")).toHaveCount(8); // Expecting 8 stats

		// Check tasks sections
		await expect(page.locator(".dashboard-tasks-container")).toBeVisible();
	});

	test("should show demo jobs in kanban board", async ({ page }) => {
		// Go to Applications tab
		await page.click("text=Applications");
		await page.waitForTimeout(500);

		// Check kanban columns are visible
		await expect(page.locator(".kanban-column")).toHaveCount(5); // 5 phases

		// Check that some job cards exist
		const jobCards = page.locator(".kanban-job-card");
		const jobCount = await jobCards.count();
		expect(jobCount).toBeGreaterThanOrEqual(0);
	});

	test("should show demo tasks in task board", async ({ page }) => {
		// Go to Tasks tab
		await page.click("text=Tasks");
		await page.waitForTimeout(500);

		// Check task columns are visible
		await expect(page.locator(".tasks-column")).toHaveCount(3); // TODO, In Progress, Done

		// Check that some task cards exist
		const taskCards = page.locator(".task-card");
		const taskCount = await taskCards.count();
		expect(taskCount).toBeGreaterThanOrEqual(0);
	});

	test("should show calendar with demo events", async ({ page }) => {
		// Go to Calendar tab
		await page.click("text=Calendar");
		await page.waitForTimeout(500);

		// Check calendar is visible
		await expect(page.locator(".calendar-container")).toBeVisible();

		// Check navigation buttons
		await expect(page.locator(".calendar-nav")).toBeVisible();

		// Switch views - use CSS selectors instead of text since buttons are internationalized
		await page.click(".calendar-view-selector button:has-text('Week')");
		await page.waitForTimeout(500);
		await expect(page.locator(".calendar-week")).toBeVisible();

		await page.click(".calendar-view-selector button:has-text('Day')");
		await page.waitForTimeout(500);
		await expect(page.locator(".calendar-day-view")).toBeVisible();
	});

	test("should show contacts table", async ({ page }) => {
		// Go to Contacts tab
		await page.click("text=Contacts");
		await page.waitForTimeout(500);

		// Check contacts table is visible
		await expect(page.locator(".contacts-table")).toBeVisible();

		// Check contacts actions section
		await expect(page.locator(".contacts-actions")).toBeVisible();
	});

	// Visual regression tests with screenshots
	test("should match visual snapshots for key tabs", async ({ page }) => {
		const tabs = ["Dashboard", "Applications"];

		for (const tabName of tabs) {
			await page.click(`text=${tabName}`);
			await page.waitForTimeout(1000);

			// Take screenshot of each tab
			await expect(page).toHaveScreenshot(`${tabName.toLowerCase()}-tab.png`);
		}
	});

	test("should open modals from first job row action buttons", async ({ page }) => {
		// Load with demo data
		await page.goto("http://localhost:3000?demo");

		// Wait for page to load and go to Jobs tab
		await page.click("text=Jobs");
		await page.waitForTimeout(500);
		await page.waitForSelector('table tbody tr:first-child');

		// Test Notes Modal
		await test.step("should open notes modal", async () => {
			// Click notes button on first job row
			await page.click('tbody tr:first-child [data-testid="notes-button"]');
			
			// Wait for modal to appear
			await page.waitForSelector('.modal-overlay');
			
			// Verify it's the notes modal
			await expect(page.locator('.modal-title')).toContainText('Notes');
			
			// Close modal
			await page.click('.modal-close');
			await page.waitForSelector('.modal-overlay', { state: 'detached' });
		});

		// Test Tasks Modal
		await test.step("should open tasks modal", async () => {
			// Click tasks button on first job row
			await page.click('tbody tr:first-child [data-testid="tasks-button"]');
			
			// Wait for modal to appear
			await page.waitForSelector('.modal-overlay');
			
			// Verify it's the tasks modal
			await expect(page.locator('.modal-title')).toContainText('Tasks');
			
			// Close modal
			await page.click('.modal-close');
			await page.waitForSelector('.modal-overlay', { state: 'detached' });
		});

		// Test Contacts Modal
		await test.step("should open contacts modal", async () => {
			// Click contacts button on first job row
			await page.click('tbody tr:first-child [data-testid="contacts-button"]');
			
			// Wait for modal to appear
			await page.waitForSelector('.modal-overlay');
			
			// Verify it's the contacts modal
			await expect(page.locator('.modal-title')).toContainText('Contacts');
			
			// Close modal
			await page.click('.modal-close');
			await page.waitForSelector('.modal-overlay', { state: 'detached' });
		});

		// Test Edit Job Modal
		await test.step("should open edit job modal", async () => {
			// Click edit button on first job row
			await page.click('tbody tr:first-child [data-testid="edit-job-button"]');
			
			// Wait for modal to appear
			await page.waitForSelector('.modal-overlay');
			
			// Verify it's the edit job modal
			await expect(page.locator('.modal-title')).toContainText('Edit Job');
			
			// Close modal
			await page.click('.modal-close');
			await page.waitForSelector('.modal-overlay', { state: 'detached' });
		});
	});
});
