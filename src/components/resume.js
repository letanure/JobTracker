// ============================================================================
// RESUME BUILDER COMPONENT
// ============================================================================

const ResumeBuilder = {
	// Initialize resume data structure
	data: {
		basics: {
			name: "",
			label: "",
			summary: "",
			email: "",
			phone: "",
			location: { city: "", country: "" },
			profiles: [],
			languages: [],
			personalStatement: "",
		},
		skills: [],
		experience: [],
		projects: [],
		portfolio: [],
		education: [],
		certifications: [],
		awards: [],
		volunteer: [],
		interests: [],
	},

	// Track section collapsed states
	collapsedSections: {},

	// Country codes for country selector
	countryCodes: [
		"US",
		"DE",
		"BR",
		"IN",
		"CN",
		"JP",
		"RU",
		"FR",
		"IT",
		"GB",
		"ES",
		"CA",
		"AU",
		"MX",
		"KR",
		"NL",
		"TR",
		"AR",
		"SA",
		"ZA",
		"PL",
		"SE",
		"NO",
		"DK",
		"FI",
		"BE",
		"CH",
		"IE",
		"AT",
		"PT",
		"GR",
		"HU",
		"CZ",
		"SK",
		"RO",
		"IL",
		"NZ",
		"TH",
		"ID",
		"MY",
		"PH",
		"VN",
		"EG",
		"NG",
		"KE",
		"PK",
		"UA",
		"BD",
		"CL",
		"CO",
	],

	// Language codes for language selector
	languageCodes: [
		"en",
		"zh",
		"es",
		"hi",
		"ar",
		"bn",
		"fr",
		"ru",
		"pt",
		"ur",
		"id",
		"de",
		"ja",
		"sw",
		"mr",
		"te",
		"vi",
		"ta",
		"ko",
		"fa",
		"tr",
		"it",
		"pl",
		"jv",
		"ms",
		"th",
		"gu",
		"pa",
		"ro",
		"nl",
	],

	// Skills suggestions for autocomplete
	skillsSuggestions: {
		languages: [
			"JavaScript",
			"TypeScript",
			"Python",
			"Java",
			"C#",
			"C++",
			"Go",
			"Ruby",
			"Rust",
			"PHP",
			"SQL",
			"Shell",
		],
		frameworks: [
			"React",
			"Next.js",
			"Vue",
			"Nuxt",
			"Svelte",
			"Angular",
			"Express",
			"Django",
			"Flask",
			"Spring Boot",
			"FastAPI",
		],
		tools: [
			"Git",
			"Docker",
			"Postman",
			"ESLint",
			"Prettier",
			"Webpack",
			"Vite",
			"TurboRepo",
			"pnpm",
			"Vitest",
			"Playwright",
			"Cypress",
		],
		databases: [
			"PostgreSQL",
			"MySQL",
			"MongoDB",
			"SQLite",
			"Redis",
			"Supabase",
			"Firebase",
			"Prisma",
		],
		cloud: [
			"Vercel",
			"Netlify",
			"Railway",
			"Heroku",
			"AWS",
			"GCP",
			"Azure",
			"Cloudflare",
			"Docker Hub",
		],
		testing: ["Jest", "Vitest", "Playwright", "Cypress", "Testing Library", "Mocha", "Chai"],
		devops: ["CI/CD", "GitHub Actions", "Docker Compose", "Terraform", "Kubernetes", "Nginx"],
		uiux: [
			"Tailwind CSS",
			"Shadcn/ui",
			"Radix UI",
			"Figma",
			"Storybook",
			"Framer Motion",
			"Material UI",
		],
		soft: [
			"Problem Solving",
			"Teamwork",
			"Mentoring",
			"Communication",
			"Remote Collaboration",
			"Time Management",
		],
	},

	// Degree types for education
	degreeTypes: {
		undergraduate: [
			{
				label: "Bachelor of Science (BSc)",
				description: "Undergraduate degree in computer science, IT, or engineering",
			},
			{
				label: "Bachelor of Engineering (BEng)",
				description: "Technical degree focused on software, electrical, or systems engineering",
			},
			{
				label: "Associate Degree",
				description: "2-year tech-focused degree, often in IT or programming",
			},
		],

		postgraduate: [
			{
				label: "Master of Science (MSc)",
				description: "Advanced degree in computer science, data science, or software engineering",
			},
			{
				label: "Master of Engineering (MEng)",
				description: "Specialized engineering degree in software, hardware, or IT systems",
			},
			{
				label: "Doctor of Philosophy (PhD)",
				description: "Research doctorate in computer science or related tech fields",
			},
		],

		professional: [
			{
				label: "Bootcamp Certificate",
				description: "Intensive program in coding, data, DevOps, or design",
			},
			{
				label: "Nanodegree",
				description: "Compact online program in web, data, AI, or mobile development",
			},
			{
				label: "Certificate of Completion",
				description: "Proof of finishing a relevant IT course",
			},
			{
				label: "Professional Certification",
				description: "Recognized credential from a tech organization (e.g. AWS, Microsoft, Google)",
			},
			{
				label: "Online Course",
				description: "Unaccredited but useful online course in tech topics",
			},
			{
				label: "Diploma",
				description: "Formal training program in IT or computer-related fields",
			},
		],
	},

	// Get country options for select dropdown
	getCountryOptions: () => {
		try {
			const regionNames = new Intl.DisplayNames([navigator.language], { type: "region" });
			const countries = ResumeBuilder.countryCodes.map((code) => ({
				code,
				name: regionNames.of(code),
			}));

			// Sort by name in user's locale
			countries.sort((a, b) => a.name.localeCompare(b.name, navigator.language));

			return countries.map((country) => h("option", { value: country.code }, country.name));
		} catch (error) {
			// Fallback to country codes if Intl.DisplayNames is not supported
			console.error("Intl.DisplayNames not supported:", error);
			return ResumeBuilder.countryCodes.map((code) => h("option", { value: code }, code));
		}
	},

	// Get language options for select dropdown
	getLanguageOptions: () => {
		try {
			const languageNames = new Intl.DisplayNames([navigator.language], { type: "language" });
			const languages = ResumeBuilder.languageCodes.map((code) => ({
				code,
				name: languageNames.of(code),
			}));

			// Sort by name in user's locale
			languages.sort((a, b) => a.name.localeCompare(b.name, navigator.language));

			return languages.map((language) => h("option", { value: language.code }, language.name));
		} catch (error) {
			// Fallback to language codes if Intl.DisplayNames is not supported
			console.error("Intl.DisplayNames not supported:", error);
			return ResumeBuilder.languageCodes.map((code) => h("option", { value: code }, code));
		}
	},

	// Format skill group name for display
	formatSkillGroupName: (groupName) => {
		const formatMap = {
			languages: "Languages",
			frameworks: "Frameworks",
			tools: "Tools",
			databases: "Databases",
			cloud: "Cloud",
			testing: "Testing",
			devops: "DevOps",
			uiux: "UI/UX",
			soft: "Soft Skills",
		};
		return formatMap[groupName] || groupName.charAt(0).toUpperCase() + groupName.slice(1);
	},

	// Toggle section collapse state
	toggleSection: (sectionId) => {
		ResumeBuilder.collapsedSections[sectionId] = !ResumeBuilder.collapsedSections[sectionId];
		const content = document.querySelector(`[data-section="${sectionId}"] .section-content`);
		const arrow = document.querySelector(`[data-section="${sectionId}"] .section-arrow`);

		if (content && arrow) {
			const isCollapsed = ResumeBuilder.collapsedSections[sectionId];
			content.classList.toggle("collapsed", isCollapsed);
			arrow.classList.toggle("collapsed", isCollapsed);
		}
	},

	// Calculate completion for basics section
	calculateBasicsCompletion: () => {
		const basics = ResumeBuilder.data.basics;
		const fields = ["name", "label", "email", "phone"];
		const completed = fields.filter((field) => basics[field]?.trim()).length;
		const locationComplete = basics.location.city && basics.location.country ? 1 : 0;
		const summaryComplete = basics.summary?.trim() ? 1 : 0;
		const total = fields.length + 2; // +2 for location and summary
		return { completed: completed + locationComplete + summaryComplete, total };
	},

	// Calculate completion for array sections
	calculateArrayCompletion: (sectionName, requiredFields, customData = null) => {
		const data = customData || ResumeBuilder.data[sectionName];
		if (!data || data.length === 0) return { completed: 0, total: 0 };

		let completed = 0;
		data.forEach((item) => {
			const itemCompleted = requiredFields.filter((field) => {
				const value = field.includes(".")
					? field.split(".").reduce((obj, key) => obj?.[key], item)
					: item[field];
				return value?.toString().trim();
			}).length;
			if (itemCompleted === requiredFields.length) completed++;
		});

		return { completed, total: data.length };
	},

	// Create collapsible section wrapper
	createCollapsibleSection: (sectionId, titleKey, content, completionData) => {
		// Initialize all sections as expanded (not collapsed)
		const isCollapsed = ResumeBuilder.collapsedSections[sectionId] || false;
		const completionText =
			completionData.total > 0 ? `(${completionData.completed}/${completionData.total})` : "(0/0)";

		return h(
			"div.resume-section",
			{
				"data-section": sectionId,
			},
			h(
				"h3.resume-section-title",
				{
					onclick: () => ResumeBuilder.toggleSection(sectionId),
				},
				h(
					"div.section-title-content",
					h("span", I18n.t(titleKey)),
					h("span.section-completion", completionText)
				),
				h(
					"span.section-arrow",
					{
						className: isCollapsed ? "collapsed" : "",
					},
					h("span.material-symbols-outlined", "keyboard_arrow_down")
				)
			),
			h(
				"div.section-content",
				{
					className: isCollapsed ? "collapsed" : "",
				},
				...content
			)
		);
	},

	// Create the resume builder interface
	create: () => {
		const container = h(
			"div.resume-container",
			// Header
			h("div.tab-header", h("h2.tab-title", I18n.t("headers.resume"))),

			// Two-column layout: form + JSON preview
			h(
				"div.resume-layout",
				// Left column: Form
				h(
					"div.resume-form-column",
					ResumeBuilder.createBasicsSection(),
					ResumeBuilder.createProfilesSection(),
					ResumeBuilder.createLanguagesSection(),
					ResumeBuilder.createSkillsSection(),
					ResumeBuilder.createExperienceSection(),
					ResumeBuilder.createProjectsSection(),
					ResumeBuilder.createPortfolioSection(),
					ResumeBuilder.createEducationSection(),
					ResumeBuilder.createCertificationsSection(),
					ResumeBuilder.createAwardsSection(),
					ResumeBuilder.createVolunteerSection(),
					ResumeBuilder.createInterestsSection()
				),

				// Right column: Resume preview
				h(
					"div.resume-preview-column",
					h("div.preview-header", I18n.t("resume.previewHeader")),
					h(
						"div.cv-container",
						{
							id: "resume-html-preview",
						},
						ResumeBuilder.generateResumeHTML()
					)
				)
			)
		);

		return container;
	},

	// Update resume preview and auto-save
	updatePreview: () => {
		const preview = document.getElementById("resume-html-preview");
		if (preview) {
			preview.innerHTML = "";
			preview.appendChild(ResumeBuilder.generateResumeHTML());
		}
		ResumeBuilder.updateCompletionCounters();

		// Auto-save on every change
		ResumeBuilder.save();
	},

	// Generate HTML resume
	generateResumeHTML: () => {
		const data = ResumeBuilder.data;

		// Generate all sections and filter out empty ones
		const headerSection = ResumeBuilder.generateHeaderHTML(data.basics);

		// Main content sections
		const contentSections = [
			ResumeBuilder.generateSummaryHTML(data.basics),
			ResumeBuilder.generateExperienceHTML(data.experience),
			ResumeBuilder.generateEducationHTML(data.education),
			ResumeBuilder.generateProjectsHTML(data.projects),
			ResumeBuilder.generateCertificationsHTML(data.certifications),
			ResumeBuilder.generateAwardsHTML(data.awards),
			ResumeBuilder.generateVolunteerHTML(data.volunteer),
		].filter((section) => section !== "");

		// Sidebar sections
		const sidebarSections = [
			ResumeBuilder.generateContactHTML(data.basics),
			ResumeBuilder.generateLanguagesHTML(data.basics.languages),
			ResumeBuilder.generateSkillsHTML(data.skills),
		].filter((section) => section !== "");

		return h(
			"div.cv-paper-container",
			h(
				"article.cv-resume",
				// Header section (only if exists)
				headerSection,

				// Main content sections (only if there are any)
				contentSections.length > 0 || sidebarSections.length > 0
					? h(
							"main.cv-main",
							// Left column - Main content
							contentSections.length > 0 ? h("section.cv-content", ...contentSections) : "",

							// Right column - Sidebar
							sidebarSections.length > 0 ? h("section.cv-sidebar", ...sidebarSections) : ""
						)
					: ""
			)
		);
	},

	// Generate header section
	generateHeaderHTML: (basics) => {
		if (!basics.name && !basics.label) return "";

		return h(
			"header.cv-header",
			basics.name ? h("h1.cv-name", basics.name) : "",
			basics.label ? h("h2.cv-title", basics.label) : ""
		);
	},

	// Generate contact section
	generateContactHTML: (basics) => {
		const hasContact =
			basics.email ||
			basics.phone ||
			(basics.location && (basics.location.city || basics.location.country)) ||
			(basics.profiles && basics.profiles.length > 0);

		if (!hasContact) return "";

		const contactItems = [];

		if (basics.email) {
			contactItems.push(
				h(
					"div.cv-contact-item",
					h("span.cv-contact-label", I18n.t("resume.contact.email")),
					h("a.cv-contact-value", { href: `mailto:${basics.email}` }, basics.email)
				)
			);
		}

		if (basics.phone) {
			contactItems.push(
				h(
					"div.cv-contact-item",
					h("span.cv-contact-label", I18n.t("resume.contact.phone")),
					h("span.cv-contact-value", basics.phone)
				)
			);
		}

		if (basics.location && (basics.location.city || basics.location.country)) {
			const location = [basics.location.city, basics.location.country].filter(Boolean).join(", ");
			contactItems.push(
				h(
					"div.cv-contact-item",
					h("span.cv-contact-label", I18n.t("resume.contact.location")),
					h("span.cv-contact-value", location)
				)
			);
		}

		if (basics.profiles && basics.profiles.length > 0) {
			basics.profiles.forEach((profile) => {
				if (profile.url && profile.type) {
					contactItems.push(
						h(
							"div.cv-contact-item",
							h("span.cv-contact-label", profile.type),
							h("a.cv-contact-value", { href: profile.url, target: "_blank" }, profile.url)
						)
					);
				}
			});
		}

		return h(
			"section.cv-contact",
			h("h3.cv-section-title", "Contact"),
			h("div.cv-contact-list", ...contactItems)
		);
	},

	// Generate summary section
	generateSummaryHTML: (basics) => {
		if (!basics.summary && !basics.personalStatement) return "";

		return h(
			"section.cv-summary",
			h("h3.cv-section-title", "Summary"),
			basics.summary ? h("p.cv-summary-text", basics.summary) : "",
			basics.personalStatement ? h("p.cv-summary-text", basics.personalStatement) : ""
		);
	},

	// Generate experience section
	generateExperienceHTML: (experience) => {
		if (!experience || experience.length === 0) return "";

		return h(
			"section.cv-experience",
			h("h3.cv-section-title", "Work Experience"),
			h(
				"div.cv-experience-list",
				...experience.map((exp) => ResumeBuilder.generateExperienceItemHTML(exp))
			)
		);
	},

	// Generate single experience item
	generateExperienceItemHTML: (exp) => {
		return h(
			"div.cv-experience-item",
			h(
				"div.cv-experience-header",
				exp.position ? h("h4.cv-experience-position", exp.position) : "",
				exp.company ? h("h5.cv-experience-company", exp.company) : ""
			),
			h(
				"div.cv-experience-meta",
				exp.startDate || exp.endDate
					? h(
							"span.cv-experience-dates",
							`${exp.startDate || ""} - ${exp.endDate || I18n.t("resume.present")}`
						)
					: "",
				exp.location ? h("span.cv-experience-location", exp.location) : ""
			),
			exp.summary ? h("p.cv-experience-summary", exp.summary) : "",
			exp.highlights && exp.highlights.length > 0
				? h(
						"ul.cv-experience-highlights",
						...exp.highlights.map((highlight) => h("li.cv-experience-highlight", highlight))
					)
				: ""
		);
	},

	// Generate education section
	generateEducationHTML: (education) => {
		if (!education || education.length === 0) return "";

		return h(
			"section.cv-education",
			h("h3.cv-section-title", "Education"),
			h(
				"div.cv-education-list",
				...education.map((edu) => ResumeBuilder.generateEducationItemHTML(edu))
			)
		);
	},

	// Generate single education item
	generateEducationItemHTML: (edu) => {
		return h(
			"div.cv-education-item",
			edu.studyType ? h("h4.cv-education-degree", edu.studyType) : "",
			edu.area ? h("h5.cv-education-field", edu.area) : "",
			edu.institution ? h("h6.cv-education-institution", edu.institution) : "",
			edu.startDate || edu.endDate
				? h(
						"span.cv-education-dates",
						`${edu.startDate || ""} - ${edu.endDate || I18n.t("resume.present")}`
					)
				: ""
		);
	},

	// Generate skills section
	generateSkillsHTML: (skills) => {
		if (!skills || skills.length === 0) return "";

		return h(
			"section.cv-skills",
			h("h3.cv-section-title", "Skills"),
			h("div.cv-skills-list", ...skills.map((skill) => ResumeBuilder.generateSkillItemHTML(skill)))
		);
	},

	// Generate single skill item
	generateSkillItemHTML: (skill) => {
		if (!skill.name) return "";

		return h(
			"div.cv-skill-item",
			h("h4.cv-skill-category", skill.name),
			skill.keywords && skill.keywords.length > 0
				? h(
						"div.cv-skill-keywords",
						...skill.keywords
							.filter((k) => k.trim())
							.map((keyword) => h("span.cv-skill-keyword", keyword))
					)
				: ""
		);
	},

	// Generate languages section
	generateLanguagesHTML: (languages) => {
		if (!languages || languages.length === 0) return "";

		return h(
			"section.cv-languages",
			h("h3.cv-section-title", "Languages"),
			h(
				"div.cv-languages-list",
				...languages.map((lang) => ResumeBuilder.generateLanguageItemHTML(lang))
			)
		);
	},

	// Generate single language item
	generateLanguageItemHTML: (lang) => {
		if (!lang.language) return "";

		return h(
			"div.cv-language-item",
			h("span.cv-language-name", lang.language),
			lang.fluency ? h("span.cv-language-level", lang.fluency) : ""
		);
	},

	// Generate projects section
	generateProjectsHTML: (projects) => {
		if (!projects || projects.length === 0) return "";

		return h(
			"section.cv-projects",
			h("h3.cv-section-title", "Projects"),
			h(
				"div.cv-projects-list",
				...projects.map((project) => ResumeBuilder.generateProjectItemHTML(project))
			)
		);
	},

	// Generate single project item
	generateProjectItemHTML: (project) => {
		if (!project.name) return "";

		return h(
			"div.cv-project-item",
			h("h4.cv-project-name", project.name),
			project.description ? h("p.cv-project-description", project.description) : "",
			project.url
				? h("a.cv-project-url", { href: project.url, target: "_blank" }, project.url)
				: "",
			project.tags && project.tags.length > 0
				? h("div.cv-project-tags", ...project.tags.map((tag) => h("span.cv-project-tag", tag)))
				: ""
		);
	},

	// Generate certifications section
	generateCertificationsHTML: (certifications) => {
		if (!certifications || certifications.length === 0) return "";

		return h(
			"section.cv-certifications",
			h("h3.cv-section-title", "Certifications"),
			h(
				"div.cv-certifications-list",
				...certifications.map((cert) => ResumeBuilder.generateCertificationItemHTML(cert))
			)
		);
	},

	// Generate single certification item
	generateCertificationItemHTML: (cert) => {
		if (!cert.name) return "";

		return h(
			"div.cv-certification-item",
			h("h4.cv-certification-name", cert.name),
			cert.issuer ? h("h5.cv-certification-issuer", cert.issuer) : "",
			cert.date ? h("span.cv-certification-date", cert.date) : ""
		);
	},

	// Generate awards section
	generateAwardsHTML: (awards) => {
		if (!awards || awards.length === 0) return "";

		return h(
			"section.cv-awards",
			h("h3.cv-section-title", "Awards"),
			h("div.cv-awards-list", ...awards.map((award) => ResumeBuilder.generateAwardItemHTML(award)))
		);
	},

	// Generate single award item
	generateAwardItemHTML: (award) => {
		if (!award.title) return "";

		return h(
			"div.cv-award-item",
			h("h4.cv-award-title", award.title),
			award.awarder ? h("h5.cv-award-awarder", award.awarder) : "",
			award.date ? h("span.cv-award-date", award.date) : ""
		);
	},

	// Generate volunteer section
	generateVolunteerHTML: (volunteer) => {
		if (!volunteer || volunteer.length === 0) return "";

		return h(
			"section.cv-volunteer",
			h("h3.cv-section-title", "Volunteer Experience"),
			h(
				"div.cv-volunteer-list",
				...volunteer.map((vol) => ResumeBuilder.generateVolunteerItemHTML(vol))
			)
		);
	},

	// Generate single volunteer item
	generateVolunteerItemHTML: (vol) => {
		if (!vol.organization) return "";

		return h(
			"div.cv-volunteer-item",
			h("h4.cv-volunteer-role", vol.position || vol.role),
			h("h5.cv-volunteer-organization", vol.organization),
			vol.startDate || vol.endDate
				? h(
						"span.cv-volunteer-dates",
						`${vol.startDate || ""} - ${vol.endDate || I18n.t("resume.present")}`
					)
				: ""
		);
	},

	// Helper function for smooth add animation and scroll
	animateNewItem: (sectionId, newIndex) => {
		setTimeout(() => {
			const items = document.querySelectorAll(`[data-section="${sectionId}"] .dynamic-item`);
			const newItem = items[newIndex];
			if (newItem) {
				newItem.classList.add("newly-added");

				// Smart scroll that keeps add button visible
				const addButton = document.querySelector(`[data-section="${sectionId}"] .add-item-btn`);
				const formColumn = document.querySelector(".resume-form-column");

				if (addButton && formColumn) {
					// Calculate if we need to scroll and how much
					const itemRect = newItem.getBoundingClientRect();
					const buttonRect = addButton.getBoundingClientRect();
					const formRect = formColumn.getBoundingClientRect();

					// Check if new item is below the visible area
					if (itemRect.bottom > formRect.bottom) {
						// Scroll just enough to show the new item but keep add button visible
						const scrollAmount = Math.min(
							itemRect.bottom - formRect.bottom + 20, // Show item with some padding
							buttonRect.top - formRect.top - 60 // Keep button visible with padding
						);

						if (scrollAmount > 0) {
							formColumn.scrollBy({
								top: scrollAmount,
								behavior: "smooth",
							});
						}
					}
				}

				setTimeout(() => newItem.classList.remove("newly-added"), 300);
			}

			// Focus on first field of new item
			const focusElement = document.querySelector(".focus-first");
			if (focusElement) {
				focusElement.focus();
				focusElement.classList.remove("focus-first");
			}
		}, 10);
	},

	// Update completion counters for all sections
	updateCompletionCounters: () => {
		const sections = [
			{ id: "basics", completion: ResumeBuilder.calculateBasicsCompletion() },
			{
				id: "profiles",
				completion: ResumeBuilder.calculateArrayCompletion(
					"profiles",
					["type", "url"],
					ResumeBuilder.data.basics.profiles
				),
			},
			{
				id: "languages",
				completion: ResumeBuilder.calculateArrayCompletion(
					"languages",
					["language", "fluency"],
					ResumeBuilder.data.basics.languages
				),
			},
			{ id: "skills", completion: ResumeBuilder.calculateArrayCompletion("skills", ["name"]) },
			{
				id: "experience",
				completion: ResumeBuilder.calculateArrayCompletion("experience", ["position", "company"]),
			},
			{
				id: "projects",
				completion: ResumeBuilder.calculateArrayCompletion("projects", ["name", "description"]),
			},
			{
				id: "portfolio",
				completion: ResumeBuilder.calculateArrayCompletion("portfolio", ["title", "url"]),
			},
			{
				id: "education",
				completion: ResumeBuilder.calculateArrayCompletion("education", ["institution", "degree"]),
			},
			{
				id: "certifications",
				completion: ResumeBuilder.calculateArrayCompletion("certifications", ["name", "issuer"]),
			},
			{
				id: "awards",
				completion: ResumeBuilder.calculateArrayCompletion("awards", ["title", "awarder"]),
			},
			{
				id: "volunteer",
				completion: ResumeBuilder.calculateArrayCompletion("volunteer", [
					"organization",
					"position",
				]),
			},
			{
				id: "interests",
				completion: ResumeBuilder.calculateArrayCompletion("interests", ["name"]),
			},
		];

		sections.forEach((section) => {
			const completionElement = document.querySelector(
				`[data-section="${section.id}"] .section-completion`
			);
			if (completionElement) {
				const completionText =
					section.completion.total > 0
						? `(${section.completion.completed}/${section.completion.total})`
						: "(0/0)";
				completionElement.textContent = completionText;
			}
		});
	},

	// Create basics section
	createBasicsSection: () => {
		const completion = ResumeBuilder.calculateBasicsCompletion();
		const content = [
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					h("label", I18n.t("resume.basics.name")),
					h('input[type="text"]', {
						value: ResumeBuilder.data.basics.name,
						oninput: (e) => {
							ResumeBuilder.data.basics.name = e.target.value;
							ResumeBuilder.updatePreview();
						},
					})
				),
				h(
					"div.form-field",
					h("label", I18n.t("resume.basics.label")),
					h('input[type="text"]', {
						value: ResumeBuilder.data.basics.label,
						oninput: (e) => {
							ResumeBuilder.data.basics.label = e.target.value;
							ResumeBuilder.updatePreview();
						},
					})
				)
			),
			h(
				"div.form-field",
				h("label", I18n.t("resume.basics.summary")),
				h("textarea", {
					rows: 2,
					value: ResumeBuilder.data.basics.summary,
					oninput: (e) => {
						ResumeBuilder.data.basics.summary = e.target.value;
						ResumeBuilder.updatePreview();
					},
				})
			),
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					h("label", I18n.t("resume.basics.email")),
					h('input[type="email"]', {
						value: ResumeBuilder.data.basics.email,
						oninput: (e) => {
							ResumeBuilder.data.basics.email = e.target.value;
							ResumeBuilder.updatePreview();
						},
					})
				),
				h(
					"div.form-field",
					h("label", I18n.t("resume.basics.phone")),
					h('input[type="tel"]', {
						value: ResumeBuilder.data.basics.phone,
						oninput: (e) => {
							ResumeBuilder.data.basics.phone = e.target.value;
							ResumeBuilder.updatePreview();
						},
					})
				)
			),
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					h("label", I18n.t("resume.basics.city")),
					h('input[type="text"]', {
						value: ResumeBuilder.data.basics.location.city,
						oninput: (e) => {
							ResumeBuilder.data.basics.location.city = e.target.value;
							ResumeBuilder.updatePreview();
						},
					})
				),
				h(
					"div.form-field",
					h("label", I18n.t("resume.basics.country")),
					h(
						"select",
						{
							value: ResumeBuilder.data.basics.location.country,
							onchange: (e) => {
								ResumeBuilder.data.basics.location.country = e.target.value;
								ResumeBuilder.updatePreview();
							},
						},
						h("option", { value: "" }, ""),
						...ResumeBuilder.getCountryOptions()
					)
				)
			),
			h(
				"div.form-field",
				h("label", I18n.t("resume.basics.personalStatement")),
				h("textarea", {
					rows: 2,
					value: ResumeBuilder.data.basics.personalStatement,
					oninput: (e) => {
						ResumeBuilder.data.basics.personalStatement = e.target.value;
						ResumeBuilder.updatePreview();
					},
				})
			),
		];

		return ResumeBuilder.createCollapsibleSection(
			"basics",
			"resume.basics.title",
			content,
			completion
		);
	},

	// Create profiles section
	createProfilesSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion(
			"profiles",
			["type", "url"],
			ResumeBuilder.data.basics.profiles
		);
		const profileItems = ResumeBuilder.data.basics.profiles.map((profile, index) =>
			ResumeBuilder.createProfileItem(profile, index)
		);

		const content = [
			h("div.dynamic-list", { id: "profiles-list" }, ...profileItems),
			h(
				"div.add-item-section",
				h(
					"button.add-item-btn",
					{
						type: "button",
						onclick: (e) => {
							e.preventDefault();
							ResumeBuilder.addProfile();
						},
					},
					h("span.material-symbols-outlined", "add"),
					" ",
					I18n.t("resume.profiles.addProfile")
				)
			),
		];

		return ResumeBuilder.createCollapsibleSection(
			"profiles",
			"resume.profiles.title",
			content,
			completion
		);
	},

	// Create profile item
	createProfileItem: (profile, index) => {
		if (!profile || typeof profile !== "object") {
			console.error("Invalid profile data:", profile, "at index:", index);
			return h("div.dynamic-item", "Error: Invalid profile data");
		}

		const isFirst = index === 0;
		return h(
			"div.dynamic-item",
			{
				"data-index": index,
			},
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					...(isFirst ? [h("label", I18n.t("resume.profiles.type"))] : []),
					h(
						"select",
						{
							value: profile.type || "linkedin",
							className:
								index === ResumeBuilder.data.basics.profiles.length - 1 ? "focus-first" : "",
							onchange: (e) => {
								ResumeBuilder.data.basics.profiles[index].type = e.target.value;
								ResumeBuilder.updatePreview();
							},
						},
						h('option[value="linkedin"]', I18n.t("resume.profiles.platforms.linkedin")),
						h('option[value="github"]', I18n.t("resume.profiles.platforms.github")),
						h('option[value="twitter"]', I18n.t("resume.profiles.platforms.twitter")),
						h('option[value="website"]', I18n.t("resume.profiles.platforms.website")),
						h('option[value="other"]', I18n.t("resume.profiles.platforms.other"))
					)
				),
				h(
					"div.form-field",
					...(isFirst ? [h("label", I18n.t("resume.profiles.url"))] : []),
					h('input[type="url"]', {
						value: profile.url || "",
						placeholder: isFirst ? "" : I18n.t("resume.profiles.url"),
						oninput: (e) => {
							ResumeBuilder.data.basics.profiles[index].url = e.target.value;
							ResumeBuilder.updatePreview();
						},
					})
				)
			),
			h(
				"button.btn-remove",
				{
					type: "button",
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.removeProfile(index);
					},
				},
				h("span.material-symbols-outlined", "close")
			)
		);
	},

	// Create languages section
	createLanguagesSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion(
			"languages",
			["language", "fluency"],
			ResumeBuilder.data.basics.languages
		);
		const content = [
			h(
				"div.dynamic-list",
				...ResumeBuilder.data.basics.languages.map((lang, index) =>
					ResumeBuilder.createLanguageItem(lang, index)
				)
			),
			h(
				"div.add-item-section",
				h(
					"button.add-item-btn",
					{
						type: "button",
						onclick: (e) => {
							e.preventDefault();
							ResumeBuilder.addLanguage();
						},
					},
					h("span.material-symbols-outlined", "add"),
					" ",
					I18n.t("resume.languages.addLanguage")
				)
			),
		];

		return ResumeBuilder.createCollapsibleSection(
			"languages",
			"resume.languages.title",
			content,
			completion
		);
	},

	// Create language item
	createLanguageItem: (lang, index) => {
		const isFirst = index === 0;
		return h(
			"div.dynamic-item",
			{
				"data-index": index,
			},
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					...(isFirst ? [h("label", I18n.t("resume.languages.language"))] : []),
					h(
						"select",
						{
							value: lang.language || "",
							className:
								index === ResumeBuilder.data.basics.languages.length - 1 ? "focus-first" : "",
							onchange: (e) => {
								ResumeBuilder.data.basics.languages[index].language = e.target.value;
								ResumeBuilder.updatePreview();
							},
						},
						h("option", { value: "" }, ""),
						...ResumeBuilder.getLanguageOptions()
					)
				),
				h(
					"div.form-field",
					...(isFirst ? [h("label", I18n.t("resume.languages.fluency"))] : []),
					h(
						"select",
						{
							value: lang.fluency,
							onchange: (e) => {
								ResumeBuilder.data.basics.languages[index].fluency = e.target.value;
								ResumeBuilder.updatePreview();
							},
						},
						h('option[value="native"]', I18n.t("resume.languages.levels.native")),
						h('option[value="fluent"]', I18n.t("resume.languages.levels.fluent")),
						h('option[value="intermediate"]', I18n.t("resume.languages.levels.intermediate")),
						h('option[value="beginner"]', I18n.t("resume.languages.levels.beginner"))
					)
				)
			),
			h(
				"button.btn-remove",
				{
					type: "button",
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.removeLanguage(index);
					},
				},
				h("span.material-symbols-outlined", "close")
			)
		);
	},

	// Create skills section
	createSkillsSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion("skills", ["name"]);
		const content = [
			h(
				"div.dynamic-list",
				...ResumeBuilder.data.skills.map((skill, index) =>
					ResumeBuilder.createSkillItem(skill, index)
				)
			),
			h(
				"div.add-item-section",
				h(
					"button.add-item-btn",
					{
						type: "button",
						onclick: (e) => {
							e.preventDefault();
							ResumeBuilder.addSkill();
						},
					},
					h("span.material-symbols-outlined", "add"),
					" ",
					I18n.t("resume.skills.addSkill")
				)
			),
		];

		return ResumeBuilder.createCollapsibleSection(
			"skills",
			"resume.skills.title",
			content,
			completion
		);
	},

	// Create skill item
	createSkillItem: (skill, index) => {
		const datalistId = `skill-group-list-${index}`;
		return h(
			"div.dynamic-item.skill-item",
			{
				"data-index": index,
			},
			h(
				"div.skill-header",
				h(
					"div.form-field",
					h("label", I18n.t("resume.skills.name")),
					h('input[type="text"]', {
						value: skill.name,
						list: datalistId,
						className: index === ResumeBuilder.data.skills.length - 1 ? "focus-first" : "",
						oninput: (e) => {
							ResumeBuilder.data.skills[index].name = e.target.value;
							ResumeBuilder.updatePreview();
						},
					}),
					h(
						`datalist#${datalistId}`,
						...Object.keys(ResumeBuilder.skillsSuggestions).map((group) =>
							h("option", { value: group }, ResumeBuilder.formatSkillGroupName(group))
						)
					)
				),
				h(
					"button.btn-remove",
					{
						type: "button",
						onclick: (e) => {
							e.preventDefault();
							ResumeBuilder.removeSkill(index);
						},
					},
					h("span.material-symbols-outlined", "close")
				)
			),
			h(
				"div.skills-keywords",
				h("label", I18n.t("resume.skills.keywords")),
				h(
					"div.keyword-tags",
					...skill.keywords.flatMap((keyword, keywordIndex) => {
						const result = ResumeBuilder.createSkillKeywordTag(skill, index, keyword, keywordIndex);
						return Array.isArray(result) ? result : [result];
					}),
					h(
						"button.add-keyword-btn",
						{
							type: "button",
							onclick: (e) => {
								e.preventDefault();
								ResumeBuilder.addSkillKeyword(index);
							},
						},
						h("span.material-symbols-outlined", "add")
					)
				)
			)
		);
	},

	// Create skill keyword tag
	createSkillKeywordTag: (skill, skillIndex, keyword, keywordIndex) => {
		if (!keyword || keyword.trim() === "") {
			const datalistId = `skill-keyword-list-${skillIndex}-${keywordIndex}`;
			const skillGroup = skill.name.toLowerCase();
			const suggestions = ResumeBuilder.skillsSuggestions[skillGroup] || [];

			// Show input field for empty keywords
			return [
				h("input.keyword-input", {
					type: "text",
					list: datalistId,
					placeholder: "Add skill...",
					value: keyword,
					oninput: (e) => {
						ResumeBuilder.data.skills[skillIndex].keywords[keywordIndex] = e.target.value;
						ResumeBuilder.updatePreview();
					},
					onblur: (e) => {
						// Remove empty keywords on blur
						if (!e.target.value.trim()) {
							ResumeBuilder.removeSkillKeyword(skillIndex, keywordIndex);
						}
					},
					onkeydown: (e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							e.target.blur();
							if (e.target.value.trim()) {
								ResumeBuilder.addSkillKeyword(skillIndex);
							}
						}
					},
				}),
				h(
					`datalist#${datalistId}`,
					...suggestions.map((suggestion) => h("option", { value: suggestion }))
				),
			];
		}

		// Show tag for non-empty keywords
		return h(
			"div.keyword-tag",
			h("span.keyword-text", keyword),
			h(
				"button.keyword-remove",
				{
					type: "button",
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.removeSkillKeyword(skillIndex, keywordIndex);
					},
				},
				"×"
			)
		);
	},

	// Create experience section
	createExperienceSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion("experience", [
			"position",
			"company",
		]);
		const content = [
			h(
				"div.dynamic-list",
				{ id: "experience-list" },
				...ResumeBuilder.data.experience.map((exp, index) =>
					ResumeBuilder.createExperienceItem(exp, index)
				)
			),
			h(
				"div.add-item-section",
				h(
					"button.btn-secondary.add-item-btn",
					{
						onclick: () => ResumeBuilder.addExperience(),
					},
					I18n.t("resume.experience.addExperience")
				)
			),
		];

		return ResumeBuilder.createCollapsibleSection(
			"experience",
			"resume.experience.title",
			content,
			completion
		);
	},

	// Create experience item
	createExperienceItem: (exp, index) => {
		const isFirst = index === 0;
		return h(
			"div.dynamic-item.experience-item",
			h(
				"div.experience-header",
				h(
					"div.form-grid-2",
					h(
						"div.form-field",
						isFirst ? h("label", I18n.t("resume.experience.company")) : null,
						h('input[type="text"]', {
							value: exp.company,
							placeholder: isFirst ? "" : I18n.t("resume.experience.company"),
							className: index === ResumeBuilder.data.experience.length - 1 ? "focus-first" : "",
							oninput: (e) => {
								ResumeBuilder.data.experience[index].company = e.target.value;
								ResumeBuilder.updatePreview();
							},
						})
					),
					h(
						"div.form-field",
						isFirst ? h("label", I18n.t("resume.experience.position")) : null,
						h('input[type="text"]', {
							value: exp.position,
							placeholder: isFirst ? "" : I18n.t("resume.experience.position"),
							oninput: (e) => {
								ResumeBuilder.data.experience[index].position = e.target.value;
								ResumeBuilder.updatePreview();
							},
						})
					)
				),
				h(
					"button.btn-remove",
					{
						type: "button",
						onclick: (e) => {
							e.preventDefault();
							ResumeBuilder.removeExperience(index);
						},
					},
					h("span.material-symbols-outlined", "close")
				)
			),
			h(
				"div.form-grid-3",
				h(
					"div.form-field",
					isFirst ? h("label", I18n.t("resume.experience.location")) : null,
					h('input[type="text"]', {
						value: exp.location,
						placeholder: isFirst ? "" : I18n.t("resume.experience.location"),
						oninput: (e) => {
							ResumeBuilder.data.experience[index].location = e.target.value;
							ResumeBuilder.updatePreview();
						},
					})
				),
				h(
					"div.form-field",
					isFirst ? h("label", I18n.t("resume.experience.startDate")) : null,
					h('input[type="month"]', {
						value: exp.startDate,
						oninput: (e) => {
							ResumeBuilder.data.experience[index].startDate = e.target.value;
							ResumeBuilder.updatePreview();
						},
					})
				),
				h(
					"div.form-field",
					isFirst ? h("label", I18n.t("resume.experience.endDate")) : null,
					h('input[type="month"]', {
						value: exp.endDate || "",
						oninput: (e) => {
							ResumeBuilder.data.experience[index].endDate = e.target.value;
							ResumeBuilder.updatePreview();
						},
					})
				)
			),
			isFirst
				? h(
						"div.form-field",
						h("label", I18n.t("resume.experience.summary")),
						h("textarea", {
							rows: 2,
							value: exp.summary,
							oninput: (e) => {
								ResumeBuilder.data.experience[index].summary = e.target.value;
								ResumeBuilder.updatePreview();
							},
						})
					)
				: h("textarea", {
						rows: 2,
						value: exp.summary,
						placeholder: I18n.t("resume.experience.summary"),
						oninput: (e) => {
							ResumeBuilder.data.experience[index].summary = e.target.value;
							ResumeBuilder.updatePreview();
						},
					}),
			isFirst
				? h(
						"div.form-field",
						h("label", I18n.t("resume.experience.highlights")),
						h("textarea", {
							rows: 2,
							value: exp.highlights.join("\n"),
							oninput: (e) => {
								ResumeBuilder.data.experience[index].highlights = e.target.value
									.split("\n")
									.filter((h) => h.trim());
								ResumeBuilder.updatePreview();
							},
						})
					)
				: h("textarea", {
						rows: 2,
						value: exp.highlights.join("\n"),
						placeholder: I18n.t("resume.experience.highlights"),
						oninput: (e) => {
							ResumeBuilder.data.experience[index].highlights = e.target.value
								.split("\n")
								.filter((h) => h.trim());
							ResumeBuilder.updatePreview();
						},
					})
		);
	},

	// Create projects section
	createProjectsSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion("projects", ["name", "description"]);
		const content = [
			h(
				"div.dynamic-list",
				{ id: "projects-list" },
				...ResumeBuilder.data.projects.map((project, index) =>
					ResumeBuilder.createProjectItem(project, index)
				)
			),
			h(
				"div.add-item-section",
				h(
					"button.btn-secondary.add-item-btn",
					{
						onclick: () => ResumeBuilder.addProject(),
					},
					I18n.t("resume.projects.addProject")
				)
			),
		];

		return ResumeBuilder.createCollapsibleSection(
			"projects",
			"resume.projects.title",
			content,
			completion
		);
	},

	// Create project item
	createProjectItem: (project, index) => {
		return h(
			"div.dynamic-item",
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					h("label", I18n.t("resume.projects.name")),
					h('input[type="text"]', {
						value: project.name,
						oninput: (e) => {
							ResumeBuilder.data.projects[index].name = e.target.value;
						},
					})
				),
				h(
					"div.form-field",
					h("label", I18n.t("resume.projects.url")),
					h('input[type="url"]', {
						value: project.url || "",
						oninput: (e) => {
							ResumeBuilder.data.projects[index].url = e.target.value;
						},
					})
				)
			),
			h(
				"div.form-field",
				h("label", I18n.t("resume.projects.description")),
				h("textarea", {
					rows: 2,
					value: project.description,
					oninput: (e) => {
						ResumeBuilder.data.projects[index].description = e.target.value;
					},
				})
			),
			h(
				"div.form-field",
				h("label", I18n.t("resume.projects.tags")),
				h('input[type="text"]', {
					value: (project.tags || []).join(", "),
					oninput: (e) => {
						ResumeBuilder.data.projects[index].tags = e.target.value
							.split(",")
							.map((t) => t.trim())
							.filter((t) => t);
					},
				})
			),
			h(
				"button.btn-remove",
				{
					type: "button",
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.removeProject(index);
					},
				},
				h("span.material-symbols-outlined", "close")
			)
		);
	},

	// Create portfolio section
	createPortfolioSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion("portfolio", ["title", "url"]);
		const content = [
			h(
				"div.dynamic-list",
				{ id: "portfolio-list" },
				...ResumeBuilder.data.portfolio.map((item, index) =>
					ResumeBuilder.createPortfolioItem(item, index)
				)
			),
			h(
				"div.add-item-section",
				h(
					"button.btn-secondary.add-item-btn",
					{
						onclick: () => ResumeBuilder.addPortfolio(),
					},
					I18n.t("resume.portfolio.addPortfolio")
				)
			),
		];

		return ResumeBuilder.createCollapsibleSection(
			"portfolio",
			"resume.portfolio.title",
			content,
			completion
		);
	},

	// Create portfolio item
	createPortfolioItem: (item, index) => {
		return h(
			"div.dynamic-item",
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					h("label", I18n.t("resume.portfolio.type")),
					h(
						"select",
						{
							value: item.type,
							onchange: (e) => {
								ResumeBuilder.data.portfolio[index].type = e.target.value;
							},
						},
						h('option[value="case-study"]', I18n.t("resume.portfolio.types.case-study")),
						h('option[value="artwork"]', I18n.t("resume.portfolio.types.artwork")),
						h('option[value="website"]', I18n.t("resume.portfolio.types.website")),
						h('option[value="app"]', I18n.t("resume.portfolio.types.app")),
						h('option[value="other"]', I18n.t("resume.portfolio.types.other"))
					)
				),
				h(
					"div.form-field",
					h("label", I18n.t("resume.portfolio.title_field")),
					h('input[type="text"]', {
						value: item.title,
						oninput: (e) => {
							ResumeBuilder.data.portfolio[index].title = e.target.value;
						},
					})
				)
			),
			h(
				"div.form-field",
				h("label", I18n.t("resume.portfolio.url")),
				h('input[type="url"]', {
					value: item.url,
					oninput: (e) => {
						ResumeBuilder.data.portfolio[index].url = e.target.value;
					},
				})
			),
			h(
				"button.btn-remove",
				{
					type: "button",
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.removePortfolio(index);
					},
				},
				h("span.material-symbols-outlined", "close")
			)
		);
	},

	// Create education section
	createEducationSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion("education", [
			"institution",
			"degree",
		]);
		const content = [
			h(
				"div.dynamic-list",
				{ id: "education-list" },
				...ResumeBuilder.data.education.map((edu, index) =>
					ResumeBuilder.createEducationItem(edu, index)
				)
			),
			h(
				"div.add-item-section",
				h(
					"button.btn-secondary.add-item-btn",
					{
						onclick: () => ResumeBuilder.addEducation(),
					},
					I18n.t("resume.education.addEducation")
				)
			),
		];

		return ResumeBuilder.createCollapsibleSection(
			"education",
			"resume.education.title",
			content,
			completion
		);
	},

	// Create education item
	createEducationItem: (edu, index) => {
		return h(
			"div.dynamic-item",
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					h("label", I18n.t("resume.education.institution")),
					h('input[type="text"]', {
						value: edu.institution,
						className: index === ResumeBuilder.data.education.length - 1 ? "focus-first" : "",
						oninput: (e) => {
							ResumeBuilder.data.education[index].institution = e.target.value;
						},
					})
				),
				h(
					"div.form-field",
					h("label", I18n.t("resume.education.area")),
					h('input[type="text"]', {
						value: edu.area,
						oninput: (e) => {
							ResumeBuilder.data.education[index].area = e.target.value;
						},
					})
				)
			),
			h(
				"div.form-field",
				h("label", I18n.t("resume.education.studyType")),
				h('input[type="text"]', {
					value: edu.studyType,
					list: `education-degree-list-${index}`,
					oninput: (e) => {
						ResumeBuilder.data.education[index].studyType = e.target.value;
					},
				}),
				h(
					`datalist#education-degree-list-${index}`,
					...Object.values(ResumeBuilder.degreeTypes).flatMap((category) =>
						category.map((degree) =>
							h("option", {
								value: degree.label,
								title: degree.description,
							})
						)
					)
				)
			),
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					h("label", I18n.t("resume.education.startDate")),
					h('input[type="month"]', {
						value: edu.startDate,
						oninput: (e) => {
							ResumeBuilder.data.education[index].startDate = e.target.value;
						},
					})
				),
				h(
					"div.form-field",
					h("label", I18n.t("resume.education.endDate")),
					h('input[type="month"]', {
						value: edu.endDate || "",
						oninput: (e) => {
							ResumeBuilder.data.education[index].endDate = e.target.value;
						},
					})
				)
			),
			h(
				"button.btn-remove",
				{
					type: "button",
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.removeEducation(index);
					},
				},
				h("span.material-symbols-outlined", "close")
			)
		);
	},

	// Create certifications section
	createCertificationsSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion("certifications", ["name", "issuer"]);
		const content = [
			h(
				"div.dynamic-list",
				{ id: "certifications-list" },
				...ResumeBuilder.data.certifications.map((cert, index) =>
					ResumeBuilder.createCertificationItem(cert, index)
				)
			),
			h(
				"div.add-item-section",
				h(
					"button.btn-secondary.add-item-btn",
					{
						onclick: () => ResumeBuilder.addCertification(),
					},
					I18n.t("resume.certifications.addCertification")
				)
			),
		];

		return ResumeBuilder.createCollapsibleSection(
			"certifications",
			"resume.certifications.title",
			content,
			completion
		);
	},

	// Create certification item
	createCertificationItem: (cert, index) => {
		return h(
			"div.dynamic-item",
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					h("label", I18n.t("resume.certifications.type")),
					h('input[type="text"]', {
						value: cert.type,
						className: index === ResumeBuilder.data.certifications.length - 1 ? "focus-first" : "",
						oninput: (e) => {
							ResumeBuilder.data.certifications[index].type = e.target.value;
						},
					})
				),
				h(
					"div.form-field",
					h("label", I18n.t("resume.certifications.name")),
					h('input[type="text"]', {
						value: cert.name,
						oninput: (e) => {
							ResumeBuilder.data.certifications[index].name = e.target.value;
						},
					})
				)
			),
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					h("label", I18n.t("resume.certifications.issuer")),
					h('input[type="text"]', {
						value: cert.issuer,
						oninput: (e) => {
							ResumeBuilder.data.certifications[index].issuer = e.target.value;
						},
					})
				),
				h(
					"div.form-field",
					h("label", I18n.t("resume.certifications.date")),
					h('input[type="month"]', {
						value: cert.date,
						oninput: (e) => {
							ResumeBuilder.data.certifications[index].date = e.target.value;
						},
					})
				)
			),
			h(
				"button.btn-remove",
				{
					type: "button",
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.removeCertification(index);
					},
				},
				h("span.material-symbols-outlined", "close")
			)
		);
	},

	// Create awards section
	createAwardsSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion("awards", ["title", "awarder"]);
		const content = [
			h(
				"div.dynamic-list",
				{ id: "awards-list" },
				...ResumeBuilder.data.awards.map((award, index) =>
					ResumeBuilder.createAwardItem(award, index)
				)
			),
			h(
				"div.add-item-section",
				h(
					"button.btn-secondary.add-item-btn",
					{
						onclick: () => ResumeBuilder.addAward(),
					},
					I18n.t("resume.awards.addAward")
				)
			),
		];

		return ResumeBuilder.createCollapsibleSection(
			"awards",
			"resume.awards.title",
			content,
			completion
		);
	},

	// Create award item
	createAwardItem: (award, index) => {
		return h(
			"div.dynamic-item",
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					h("label", I18n.t("resume.awards.type")),
					h('input[type="text"]', {
						value: award.type,
						className: index === ResumeBuilder.data.awards.length - 1 ? "focus-first" : "",
						oninput: (e) => {
							ResumeBuilder.data.awards[index].type = e.target.value;
						},
					})
				),
				h(
					"div.form-field",
					h("label", I18n.t("resume.awards.title_field")),
					h('input[type="text"]', {
						value: award.title,
						oninput: (e) => {
							ResumeBuilder.data.awards[index].title = e.target.value;
						},
					})
				)
			),
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					h("label", I18n.t("resume.awards.issuer")),
					h('input[type="text"]', {
						value: award.issuer,
						oninput: (e) => {
							ResumeBuilder.data.awards[index].issuer = e.target.value;
						},
					})
				),
				h(
					"div.form-field",
					h("label", I18n.t("resume.awards.date")),
					h('input[type="month"]', {
						value: award.date,
						oninput: (e) => {
							ResumeBuilder.data.awards[index].date = e.target.value;
						},
					})
				)
			),
			h(
				"button.btn-remove",
				{
					type: "button",
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.removeAward(index);
					},
				},
				h("span.material-symbols-outlined", "close")
			)
		);
	},

	// Create volunteer section
	createVolunteerSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion("volunteer", [
			"organization",
			"position",
		]);
		const content = [
			h(
				"div.dynamic-list",
				{ id: "volunteer-list" },
				...ResumeBuilder.data.volunteer.map((vol, index) =>
					ResumeBuilder.createVolunteerItem(vol, index)
				)
			),
			h(
				"div.add-item-section",
				h(
					"button.btn-secondary.add-item-btn",
					{
						onclick: () => ResumeBuilder.addVolunteer(),
					},
					I18n.t("resume.volunteer.addVolunteer")
				)
			),
		];

		return ResumeBuilder.createCollapsibleSection(
			"volunteer",
			"resume.volunteer.title",
			content,
			completion
		);
	},

	// Create volunteer item
	createVolunteerItem: (vol, index) => {
		return h(
			"div.dynamic-item",
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					h("label", I18n.t("resume.volunteer.organization")),
					h('input[type="text"]', {
						value: vol.organization,
						className: index === ResumeBuilder.data.volunteer.length - 1 ? "focus-first" : "",
						oninput: (e) => {
							ResumeBuilder.data.volunteer[index].organization = e.target.value;
						},
					})
				),
				h(
					"div.form-field",
					h("label", I18n.t("resume.volunteer.role")),
					h('input[type="text"]', {
						value: vol.role,
						oninput: (e) => {
							ResumeBuilder.data.volunteer[index].role = e.target.value;
						},
					})
				)
			),
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					h("label", I18n.t("resume.volunteer.startDate")),
					h('input[type="month"]', {
						value: vol.startDate,
						oninput: (e) => {
							ResumeBuilder.data.volunteer[index].startDate = e.target.value;
						},
					})
				),
				h(
					"div.form-field",
					h("label", I18n.t("resume.volunteer.endDate")),
					h('input[type="month"]', {
						value: vol.endDate || "",
						oninput: (e) => {
							ResumeBuilder.data.volunteer[index].endDate = e.target.value;
						},
					})
				)
			),
			h(
				"button.btn-remove",
				{
					type: "button",
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.removeVolunteer(index);
					},
				},
				h("span.material-symbols-outlined", "close")
			)
		);
	},

	// Create interests section
	createInterestsSection: () => {
		const completion = ResumeBuilder.calculateArrayCompletion("interests", ["name"]);
		const content = [
			h(
				"div.dynamic-list",
				{ id: "interests-list" },
				...ResumeBuilder.data.interests.map((interest, index) =>
					ResumeBuilder.createInterestItem(interest, index)
				)
			),
			h(
				"div.add-item-section",
				h(
					"button.btn-secondary.add-item-btn",
					{
						onclick: () => ResumeBuilder.addInterest(),
					},
					I18n.t("resume.interests.addInterest")
				)
			),
		];

		return ResumeBuilder.createCollapsibleSection(
			"interests",
			"resume.interests.title",
			content,
			completion
		);
	},

	// Create interest item
	createInterestItem: (interest, index) => {
		return h(
			"div.dynamic-item",
			h(
				"div.form-grid-2",
				h(
					"div.form-field",
					h("label", I18n.t("resume.interests.type")),
					h('input[type="text"]', {
						value: interest.type,
						className: index === ResumeBuilder.data.interests.length - 1 ? "focus-first" : "",
						oninput: (e) => {
							ResumeBuilder.data.interests[index].type = e.target.value;
						},
					})
				),
				h(
					"div.form-field",
					h("label", I18n.t("resume.interests.value")),
					h('input[type="text"]', {
						value: interest.value,
						oninput: (e) => {
							ResumeBuilder.data.interests[index].value = e.target.value;
						},
					})
				)
			),
			h(
				"button.btn-remove",
				{
					type: "button",
					onclick: (e) => {
						e.preventDefault();
						ResumeBuilder.removeInterest(index);
					},
				},
				h("span.material-symbols-outlined", "close")
			)
		);
	},

	// Add/Remove methods for dynamic sections
	addProfile: () => {
		ResumeBuilder.data.basics.profiles.push({ type: "linkedin", url: "" });
		const newIndex = ResumeBuilder.data.basics.profiles.length - 1;
		ResumeBuilder.refresh();
		ResumeBuilder.animateNewItem("profiles", newIndex);
	},

	removeProfile: (index) => {
		// Find the specific dynamic item and animate it out
		const items = document.querySelectorAll('[data-section="profiles"] .dynamic-item');
		const itemToRemove = items[index];

		if (itemToRemove) {
			itemToRemove.classList.add("removing");
			setTimeout(() => {
				ResumeBuilder.data.basics.profiles.splice(index, 1);
				ResumeBuilder.refresh(true); // Preserve scroll position
			}, 200); // Match animation duration
		} else {
			// Fallback if item not found
			ResumeBuilder.data.basics.profiles.splice(index, 1);
			ResumeBuilder.refresh(true); // Preserve scroll position
		}
	},

	addLanguage: () => {
		ResumeBuilder.data.basics.languages.push({ language: "", fluency: "intermediate" });
		const newIndex = ResumeBuilder.data.basics.languages.length - 1;
		ResumeBuilder.refresh();
		ResumeBuilder.animateNewItem("languages", newIndex);
	},

	removeLanguage: (index) => {
		// Find the specific dynamic item and animate it out
		const items = document.querySelectorAll('[data-section="languages"] .dynamic-item');
		const itemToRemove = items[index];

		if (itemToRemove) {
			itemToRemove.classList.add("removing");
			setTimeout(() => {
				ResumeBuilder.data.basics.languages.splice(index, 1);
				ResumeBuilder.refresh(true); // Preserve scroll position
			}, 200); // Match animation duration
		} else {
			// Fallback if item not found
			ResumeBuilder.data.basics.languages.splice(index, 1);
			ResumeBuilder.refresh(true); // Preserve scroll position
		}
	},

	addSkill: () => {
		ResumeBuilder.data.skills.push({ name: "", keywords: [""] });
		const newIndex = ResumeBuilder.data.skills.length - 1;
		ResumeBuilder.refresh();
		ResumeBuilder.animateNewItem("skills", newIndex);
	},

	removeSkill: (index) => {
		ResumeBuilder.data.skills.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addSkillKeyword: (skillIndex) => {
		ResumeBuilder.data.skills[skillIndex].keywords.push("");
		ResumeBuilder.refresh(true); // Preserve scroll position
	},

	removeSkillKeyword: (skillIndex, keywordIndex) => {
		ResumeBuilder.data.skills[skillIndex].keywords.splice(keywordIndex, 1);
		ResumeBuilder.refresh(true); // Preserve scroll position
	},

	addExperience: () => {
		ResumeBuilder.data.experience.push({
			company: "",
			position: "",
			location: "",
			startDate: "",
			endDate: "",
			summary: "",
			highlights: [],
		});
		ResumeBuilder.refresh();
	},

	removeExperience: (index) => {
		ResumeBuilder.data.experience.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addProject: () => {
		ResumeBuilder.data.projects.push({
			name: "",
			description: "",
			url: "",
			tags: [],
		});
		ResumeBuilder.refresh();
	},

	removeProject: (index) => {
		ResumeBuilder.data.projects.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addPortfolio: () => {
		ResumeBuilder.data.portfolio.push({
			type: "case-study",
			title: "",
			url: "",
		});
		ResumeBuilder.refresh();
	},

	removePortfolio: (index) => {
		ResumeBuilder.data.portfolio.splice(index, 1);
		ResumeBuilder.refresh();
	},

	addEducation: () => {
		ResumeBuilder.data.education.push({
			institution: "",
			area: "",
			studyType: "",
			startDate: "",
			endDate: "",
		});
		const newIndex = ResumeBuilder.data.education.length - 1;
		ResumeBuilder.refresh();
		ResumeBuilder.animateNewItem("education", newIndex);
	},

	removeEducation: (index) => {
		// Find the specific dynamic item and animate it out
		const items = document.querySelectorAll('[data-section="education"] .dynamic-item');
		const itemToRemove = items[index];

		if (itemToRemove) {
			itemToRemove.classList.add("removing");
			setTimeout(() => {
				ResumeBuilder.data.education.splice(index, 1);
				ResumeBuilder.refresh(true); // Preserve scroll position
			}, 200); // Match animation duration
		} else {
			// Fallback if item not found
			ResumeBuilder.data.education.splice(index, 1);
			ResumeBuilder.refresh(true); // Preserve scroll position
		}
	},

	addCertification: () => {
		ResumeBuilder.data.certifications.push({
			type: "",
			name: "",
			issuer: "",
			date: "",
		});
		const newIndex = ResumeBuilder.data.certifications.length - 1;
		ResumeBuilder.refresh();
		ResumeBuilder.animateNewItem("certifications", newIndex);
	},

	removeCertification: (index) => {
		// Find the specific dynamic item and animate it out
		const items = document.querySelectorAll('[data-section="certifications"] .dynamic-item');
		const itemToRemove = items[index];

		if (itemToRemove) {
			itemToRemove.classList.add("removing");
			setTimeout(() => {
				ResumeBuilder.data.certifications.splice(index, 1);
				ResumeBuilder.refresh(true); // Preserve scroll position
			}, 200); // Match animation duration
		} else {
			// Fallback if item not found
			ResumeBuilder.data.certifications.splice(index, 1);
			ResumeBuilder.refresh(true); // Preserve scroll position
		}
	},

	addAward: () => {
		ResumeBuilder.data.awards.push({
			type: "",
			title: "",
			issuer: "",
			date: "",
		});
		const newIndex = ResumeBuilder.data.awards.length - 1;
		ResumeBuilder.refresh();
		ResumeBuilder.animateNewItem("awards", newIndex);
	},

	removeAward: (index) => {
		// Find the specific dynamic item and animate it out
		const items = document.querySelectorAll('[data-section="awards"] .dynamic-item');
		const itemToRemove = items[index];

		if (itemToRemove) {
			itemToRemove.classList.add("removing");
			setTimeout(() => {
				ResumeBuilder.data.awards.splice(index, 1);
				ResumeBuilder.refresh(true); // Preserve scroll position
			}, 200); // Match animation duration
		} else {
			// Fallback if item not found
			ResumeBuilder.data.awards.splice(index, 1);
			ResumeBuilder.refresh(true); // Preserve scroll position
		}
	},

	addVolunteer: () => {
		ResumeBuilder.data.volunteer.push({
			organization: "",
			role: "",
			startDate: "",
			endDate: "",
		});
		const newIndex = ResumeBuilder.data.volunteer.length - 1;
		ResumeBuilder.refresh();
		ResumeBuilder.animateNewItem("volunteer", newIndex);
	},

	removeVolunteer: (index) => {
		// Find the specific dynamic item and animate it out
		const items = document.querySelectorAll('[data-section="volunteer"] .dynamic-item');
		const itemToRemove = items[index];

		if (itemToRemove) {
			itemToRemove.classList.add("removing");
			setTimeout(() => {
				ResumeBuilder.data.volunteer.splice(index, 1);
				ResumeBuilder.refresh(true); // Preserve scroll position
			}, 200); // Match animation duration
		} else {
			// Fallback if item not found
			ResumeBuilder.data.volunteer.splice(index, 1);
			ResumeBuilder.refresh(true); // Preserve scroll position
		}
	},

	addInterest: () => {
		ResumeBuilder.data.interests.push({
			type: "",
			value: "",
		});
		const newIndex = ResumeBuilder.data.interests.length - 1;
		ResumeBuilder.refresh();
		ResumeBuilder.animateNewItem("interests", newIndex);
	},

	removeInterest: (index) => {
		// Find the specific dynamic item and animate it out
		const items = document.querySelectorAll('[data-section="interests"] .dynamic-item');
		const itemToRemove = items[index];

		if (itemToRemove) {
			itemToRemove.classList.add("removing");
			setTimeout(() => {
				ResumeBuilder.data.interests.splice(index, 1);
				ResumeBuilder.refresh(true); // Preserve scroll position
			}, 200); // Match animation duration
		} else {
			// Fallback if item not found
			ResumeBuilder.data.interests.splice(index, 1);
			ResumeBuilder.refresh(true); // Preserve scroll position
		}
	},

	// Save to localStorage
	save: () => {
		ResumeStorage.save(ResumeBuilder.data);
		// Show success message or notification here
		console.log("Resume saved successfully");
	},

	// Load from localStorage
	load: () => {
		const saved = ResumeStorage.load();
		if (saved) {
			ResumeBuilder.data = saved;

			// Migrate country field if needed
			if (saved.basics?.location?.country) {
				const countryValue = saved.basics.location.country;
				// Check if it's not already a country code
				if (countryValue.length > 2) {
					// Try to find matching country code
					const matchingCode = ResumeBuilder.findCountryCode(countryValue);
					if (matchingCode) {
						ResumeBuilder.data.basics.location.country = matchingCode;
					}
				}
			}

			// Migrate language fields if needed
			if (saved.basics?.languages) {
				saved.basics.languages.forEach((lang, index) => {
					if (lang.language && lang.language.length > 3) {
						// Try to find matching language code
						const matchingCode = ResumeBuilder.findLanguageCode(lang.language);
						if (matchingCode !== lang.language) {
							ResumeBuilder.data.basics.languages[index].language = matchingCode;
						}
					}
				});
			}

			ResumeBuilder.refresh();
		}
	},

	// Find country code from country name
	findCountryCode: (countryName) => {
		try {
			const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

			// Check each country code to see if its name matches
			for (const code of ResumeBuilder.countryCodes) {
				const name = regionNames.of(code);
				if (name.toLowerCase() === countryName.toLowerCase()) {
					return code;
				}
			}

			// Also check in user's locale
			const userLocaleNames = new Intl.DisplayNames([navigator.language], { type: "region" });
			for (const code of ResumeBuilder.countryCodes) {
				const name = userLocaleNames.of(code);
				if (name.toLowerCase() === countryName.toLowerCase()) {
					return code;
				}
			}
		} catch (error) {
			console.error("Error finding country code:", error);
		}

		// Return original value if no match found
		return countryName;
	},

	// Find language code from language name
	findLanguageCode: (languageName) => {
		try {
			const languageNames = new Intl.DisplayNames(["en"], { type: "language" });

			// Check each language code to see if its name matches
			for (const code of ResumeBuilder.languageCodes) {
				const name = languageNames.of(code);
				if (name.toLowerCase() === languageName.toLowerCase()) {
					return code;
				}
			}

			// Also check in user's locale
			const userLocaleNames = new Intl.DisplayNames([navigator.language], { type: "language" });
			for (const code of ResumeBuilder.languageCodes) {
				const name = userLocaleNames.of(code);
				if (name.toLowerCase() === languageName.toLowerCase()) {
					return code;
				}
			}

			// Check common variations
			const languageMap = {
				english: "en",
				chinese: "zh",
				spanish: "es",
				hindi: "hi",
				arabic: "ar",
				bengali: "bn",
				french: "fr",
				russian: "ru",
				portuguese: "pt",
				urdu: "ur",
				indonesian: "id",
				german: "de",
				japanese: "ja",
				swahili: "sw",
				marathi: "mr",
				telugu: "te",
				vietnamese: "vi",
				tamil: "ta",
				korean: "ko",
				persian: "fa",
				turkish: "tr",
				italian: "it",
				polish: "pl",
				javanese: "jv",
				malay: "ms",
				thai: "th",
				gujarati: "gu",
				punjabi: "pa",
				romanian: "ro",
				dutch: "nl",
			};

			const lowerName = languageName.toLowerCase();
			if (languageMap[lowerName]) {
				return languageMap[lowerName];
			}
		} catch (error) {
			console.error("Error finding language code:", error);
		}

		// Return original value if no match found
		return languageName;
	},

	// Export JSON
	exportJSON: () => {
		const dataStr = JSON.stringify(ResumeBuilder.data, null, 2);
		const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

		const exportFileDefaultName = "resume.json";

		const linkElement = document.createElement("a");
		linkElement.setAttribute("href", dataUri);
		linkElement.setAttribute("download", exportFileDefaultName);
		linkElement.click();
	},

	// Import JSON
	importJSON: () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";

		input.onchange = (event) => {
			const file = event.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					try {
						const imported = JSON.parse(e.target.result);
						ResumeBuilder.data = imported;
						ResumeBuilder.save();
						ResumeBuilder.refresh();
						console.log("Resume imported successfully");
					} catch (error) {
						console.error("Error importing resume:", error);
						alert("Error importing resume. Please check the file format.");
					}
				};
				reader.readAsText(file);
			}
		};

		input.click();
	},

	// Refresh the interface
	refresh: (preserveScroll = false) => {
		const container = document.querySelector('.tab-content[data-tab="resume"]');
		if (container) {
			// Store current collapsed states and scroll position before refresh
			const currentCollapsedStates = { ...ResumeBuilder.collapsedSections };
			const formColumn = container.querySelector(".resume-form-column");
			const currentScrollTop = preserveScroll && formColumn ? formColumn.scrollTop : 0;

			container.innerHTML = "";
			const newContent = ResumeBuilder.create();
			container.appendChild(newContent);
			ResumeBuilder.updatePreview();

			// Restore collapsed states and scroll position after refresh
			setTimeout(() => {
				Object.keys(currentCollapsedStates).forEach((sectionId) => {
					if (currentCollapsedStates[sectionId]) {
						const content = document.querySelector(
							`[data-section="${sectionId}"] .section-content`
						);
						const arrow = document.querySelector(`[data-section="${sectionId}"] .section-arrow`);
						if (content && arrow) {
							content.classList.add("collapsed");
							arrow.classList.add("collapsed");
						}
					}
				});

				// Restore scroll position if requested
				if (preserveScroll && currentScrollTop > 0) {
					const newFormColumn = container.querySelector(".resume-form-column");
					if (newFormColumn) {
						newFormColumn.scrollTop = currentScrollTop;
					}
				}
			}, 10);
		}
	},

	// Initialize resume tab
	init: () => {
		const container = document.querySelector('.tab-content[data-tab="resume"]');
		if (container) {
			// Load saved data
			ResumeBuilder.load();
			// Create and append the resume builder
			container.appendChild(ResumeBuilder.create());
		}
	},
};

// Resume storage utilities
const ResumeStorage = {
	STORAGE_KEY: "jobtracker_resume",

	save: (data) => {
		try {
			localStorage.setItem(ResumeStorage.STORAGE_KEY, JSON.stringify(data));
			return true;
		} catch (error) {
			console.error("Error saving resume:", error);
			return false;
		}
	},

	load: () => {
		try {
			const data = localStorage.getItem(ResumeStorage.STORAGE_KEY);
			return data ? JSON.parse(data) : null;
		} catch (error) {
			console.error("Error loading resume:", error);
			return null;
		}
	},

	clear: () => {
		localStorage.removeItem(ResumeStorage.STORAGE_KEY);
	},
};

// Export to global scope
window.ResumeBuilder = ResumeBuilder;
window.ResumeStorage = ResumeStorage;
