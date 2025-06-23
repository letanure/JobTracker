// ============================================================================
// MAIN APPLICATION ENTRY POINT - MODULAR SYSTEM
// ============================================================================
/*
 * This file serves as the main entry point for the application.
 *
 * The app logic has been split into modular files for better maintainability:
 *
 * - app/init.js:    Application initialization, setup, filters, rendering
 * - app/editing.js: Inline editing functions, add/edit/delete jobs
 * - app/stats.js:   Statistics calculations and updates
 * - app/events.js:  Event handlers and utility functions
 *
 * For development, you can work with individual modules.
 * The build process combines them into a single file for production.
 */

/* This file is intentionally minimal to save tokens when reading.
   All application logic is now in the modular files listed above. */

/* If you need to add any logic that doesn't fit the above categories,
   add it here temporarily and then move it to the appropriate
   modular file. */
