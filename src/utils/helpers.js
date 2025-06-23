// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Format date for display
const formatDate = (dateString) => {
	const date = new Date(dateString);

	// Use CONFIG.dateFormat to determine format
	switch (CONFIG.dateFormat) {
		case "DD/MM/YY":
			return date.toLocaleDateString("en-GB", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
			});
		case "MM/DD/YY":
			return date.toLocaleDateString("en-US", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
			});
		case "YYYY-MM-DD":
			return date.toISOString().split("T")[0];
		case "DD/MM/YY HH:MM":
			return `${date.toLocaleDateString("en-GB", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
			})} ${date.toLocaleTimeString("en-GB", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			})}`;
		default:
			// Default to DD/MM/YY format
			return date.toLocaleDateString("en-GB", {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
			});
	}
};

function getPhaseClass(phase) {
	return phase.toLowerCase().replace(/\s+/g, "_");
}

function getUniqueValues(array, property) {
	return [...new Set(array.map((item) => item[property]))];
}

function createElement(tag, className, textContent) {
	return $.create(tag, className, textContent);
}

function createOption(value, text, selected = false) {
	const option = createElement("option");
	option.value = value;
	option.textContent = text;
	if (selected) option.selected = true;
	return option;
}

// Helper function for task status text
const getTaskStatusText = (statusKey) => {
	const statusMap = {
		todo: I18n.t("modals.tasks.statusTodo"),
		"in-progress": I18n.t("modals.tasks.statusInProgress"),
		done: I18n.t("modals.tasks.statusDone"),
	};
	return statusMap[statusKey] || statusKey;
};

function updateStaticTexts() {
	// Update header
	$("#appTitle").text(I18n.t("app.title"));

	// Update jobs header title
	$("#jobsTitle").text(I18n.t("headers.jobs"));

	// Update button
	$("#addAppBtn").text(I18n.t("buttons.addApplication"));

	// Update table headers
	$("#priorityHeader").text(I18n.t("table.headers.priority"));
	$("#companyHeader").text(I18n.t("table.headers.company"));
	$("#positionHeader").text(I18n.t("table.headers.position"));
	$("#currentPhaseHeader").text(I18n.t("table.headers.currentPhase"));
	$("#contactPersonHeader").text(I18n.t("table.headers.contactPerson"));
	$("#salaryRangeHeader").text(I18n.t("table.headers.salaryRange"));
	$("#locationHeader").text(I18n.t("table.headers.location"));
	$("#sourceUrlHeader").text(I18n.t("table.headers.sourceUrl"));
	$("#notesHeader").text(I18n.t("table.headers.notes"));
	$("#tasksHeader").text(I18n.t("table.headers.tasks"));
	$("#actionsHeader").text(I18n.t("table.headers.actions"));

	// Update stats labels
	$("#totalAppsLabel").text(I18n.t("stats.totalApplications"));
	$("#activeAppsLabel").text(I18n.t("stats.active"));
	$("#interviewsLabel").text(I18n.t("stats.interviews"));
	$("#offersLabel").text(I18n.t("stats.offers"));
	$("#rejectionsLabel").text(I18n.t("stats.rejections"));

	// Update footer text
	$("#footerMadeWith").text(I18n.t("footer.madeWith"));
	$("#footerBy").text(I18n.t("footer.by"));
}

// Initialize language switcher
function initializeLanguageSwitcher() {
	const container = $("#languageSwitcher");

	if (container) {
		const switcher = LanguageSwitcher.create();
		container.get().innerHTML = "";
		container.get().appendChild(switcher);
		LanguageSwitcher.init();
	}
}

// Initialize tab navigation
function initializeTabNavigation() {
	const container = $("#tabNavigation");

	if (container) {
		const tabNav = TabNavigation.create();
		container.get().innerHTML = "";
		container.get().appendChild(tabNav);
		TabNavigation.init();
	}
}

// Update meta tags for current language
function updateMetaTags() {
	const lang = I18n.currentLanguage;
	const translations = I18n.translations[lang];

	if (!translations || !translations.seo) return;

	const seo = translations.seo;
	const ogLocale = lang === "pt" ? "pt_BR" : "en_US";
	const baseUrl = "http://jobtracker.cv/";
	const currentUrl = lang === "en" ? baseUrl : `${baseUrl}?lang=${lang}`;

	// Update title
	document.title = seo.title;

	// Update meta tags
	updateMetaTag("name", "description", seo.description);
	updateMetaTag("name", "keywords", seo.keywords);
	updateMetaTag("name", "author", seo.author);
	updateMetaTag("name", "language", lang);

	// Update Open Graph tags
	updateMetaTag("property", "og:title", seo.ogTitle);
	updateMetaTag("property", "og:description", seo.ogDescription);
	updateMetaTag("property", "og:url", currentUrl);
	updateMetaTag("property", "og:locale", ogLocale);

	// Update Twitter Card tags
	updateMetaTag("name", "twitter:title", seo.twitterTitle);
	updateMetaTag("name", "twitter:description", seo.twitterDescription);

	// Update canonical URL
	updateCanonicalUrl(currentUrl);

	// Update hreflang links
	updateHreflangLinks(baseUrl);
}

// Helper function to update a meta tag
function updateMetaTag(attribute, name, content) {
	let meta = document.querySelector(`meta[${attribute}="${name}"]`);
	if (!meta) {
		meta = document.createElement("meta");
		meta.setAttribute(attribute, name);
		document.head.appendChild(meta);
	}
	meta.setAttribute("content", content);
}

// Helper function to update canonical URL
function updateCanonicalUrl(url) {
	let canonical = document.querySelector('link[rel="canonical"]');
	if (!canonical) {
		canonical = document.createElement("link");
		canonical.setAttribute("rel", "canonical");
		document.head.appendChild(canonical);
	}
	canonical.setAttribute("href", url);
}

// Helper function to update hreflang links
function updateHreflangLinks(baseUrl) {
	// Remove existing hreflang links
	document.querySelectorAll("link[hreflang]").forEach((link) => link.remove());

	// Add hreflang links for each language
	CONFIG.languages.forEach((language) => {
		const link = document.createElement("link");
		link.setAttribute("rel", "alternate");
		link.setAttribute("hreflang", language.code);

		if (language.code === "en") {
			link.setAttribute("href", baseUrl);
		} else {
			link.setAttribute("href", `${baseUrl}?lang=${language.code}`);
		}

		document.head.appendChild(link);
	});

	// Add x-default hreflang (English as default)
	const defaultLink = document.createElement("link");
	defaultLink.setAttribute("rel", "alternate");
	defaultLink.setAttribute("hreflang", "x-default");
	defaultLink.setAttribute("href", baseUrl);
	document.head.appendChild(defaultLink);
}

// Global function to update UI language - called when language changes
function updateUILanguage() {
	// Update all static texts
	updateStaticTexts();

	// Update meta tags for SEO
	updateMetaTags();

	// Update language switcher
	if (typeof LanguageSwitcher !== "undefined") {
		LanguageSwitcher.updateUI();
	}

	// Update tab navigation language
	if (typeof TabNavigation !== "undefined") {
		TabNavigation.updateLanguage();
	}

	// Update filter dropdowns with new language
	if (typeof setupFilters === "function") {
		setupFilters();
	}

	// Re-render the table to update all dynamic content
	if (typeof refreshInterface === "function") {
		refreshInterface();
	}
}
