# JobTracker

A local-first, privacy-focused job application tracker that runs entirely in your browser. No backend, no subscriptions, no tracking - just you and your job search data.

## The Story

I'm looking for a job, so I created a spreadsheet...
But it was too simple, so I checked some services online - all of them try to sell expensive monthly subscriptions.

So I created a simple spreadsheet HTML page, single file...
Now, let's add a select. If I add a select, I need to manage the options...
another select, datalist, another, another

and this idea - single HTML file, old school, 2000's JS - grew too much, but was fun! No build, no deps, all local.

After some refactoring and some more features, more refactoring, and now it looks like something usable. It was fun, but now I remember better why we evolved to the current FE complexity! 😅

If someone finds useful, I will rebuild using react, Lit or something like this

## 🎯 Philosophy

**Local-First, Privacy-First** - Your job search data belongs to you, not in some company's database.

**Single File Simplicity** - One HTML file with everything embedded. Open it, use it, done.

**Old School Fun** - Vanilla JavaScript, manual DOM manipulation, no build complexity. Sometimes simple is better. not in this case, after one day

**No Subscriptions** - Because job searching is stressful enough without monthly fees.

## ✨ Features

### 📊 Core Tracking
- **Job Applications** - Add, edit, manage applications with full workflow
- **Kanban Board** - Visual pipeline from wishlist to offer with drag & drop
- **Task Management** - Track next steps and deadlines with status boards
- **Calendar Views** - Month, week, and day views for interviews and deadlines
- **Contact Management** - Store recruiter and hiring manager details
- **Notes System** - Keep detailed notes on each application
- **CV/Resume Builder** - Generate and preview your resume

### 🎨 Views & Interface
- **Dashboard** - Statistics overview and today's tasks at a glance
- **Jobs Table** - Sortable, filterable list of all applications
- **Applications Board** - Kanban-style visual workflow (Wishlist → Applied → Screening → Interview → Final → Offer)
- **Task Board** - Manage todos by status (TODO → In Progress → Done)
- **Calendar** - Visualize your schedule with month, week, and day views
- **Contacts** - Centralized contact management for your network

### 🌍 User Experience  
- **Multi-language** - English and Portuguese support (i18n ready)
- **Mobile Responsive** - Optimized layouts for all screen sizes
- **Drag & Drop** - Move tasks and jobs between columns
- **Keyboard Shortcuts** - Efficient navigation (Shift+Enter to submit forms)
- **Auto-save** - Changes saved automatically to localStorage
- **Demo Mode** - Try with sample data before adding your own

### 🔧 Technical Features
- **Single File Build** - Everything bundled into one HTML file (~300KB)
- **Offline First** - No internet required after initial load
- **Local Storage** - All data stays in your browser
- **No Dependencies** - Pure vanilla JavaScript, no runtime dependencies
- **Component Architecture** - Modular design with reusable components
- **Event Delegation** - Centralized event management system

## 📋 Workflow Support

Track your complete job search journey:

**Wishlist** → **Applied** → **Screening** → **Interview** → **Final** → **Offer**

Each stage has customizable substeps and automatic workflow progression.

## 🚀 Getting Started

### Option 1: Use Online
Visit [jobtracker.cv](http://jobtracker.cv) to try it instantly.

### Option 2: Download & Run Locally
1. **Download** `dist/index.html` 
2. **Open** in any modern browser
3. **Start tracking jobs** - Add `?demo` to URL to load sample data

### Option 3: Development Setup
```bash
# Clone the repository
git clone https://github.com/letanure/job-tracker-plain.git
cd job-tracker-plain

# Install dependencies
pnpm install  # or npm install

# Start development server
pnpm run dev  # Opens at http://localhost:3000
```

## 💾 Data Management

- **Local Storage** - All data saved in your browser's localStorage
- **Export/Import** - Backup and restore your data anytime
- **Demo Data** - Load sample data with `?demo` or `?seed` URL parameter
- **Privacy** - No external services, no tracking, no analytics
- **Data Persistence** - Your data remains until you clear browser storage

## 🛠️ Development

Built with vanilla JavaScript and a philosophy of simplicity:

### Scripts
```bash
# Development server with hot reload
pnpm run dev              # Starts at http://localhost:3000

# Build optimized single file
pnpm run build            # Creates dist/index.html

# Build with CSS analysis  
pnpm run build:analyze    # Reports unused CSS

# Code quality
pnpm run lint             # Run Biome linter
pnpm run lint:fix         # Auto-fix linting issues

# Testing
pnpm run test             # Run Playwright tests
pnpm run test:ui          # Run tests with UI mode
pnpm run test:headed      # Run tests in browser
pnpm run test:update-snapshots  # Update visual regression snapshots
```

### Architecture
- **Component System** - Vanilla JS components with hyperscript-like helper (h function)
- **State Management** - Simple localStorage persistence with auto-save
- **Event System** - Centralized event delegation for better performance
- **CSS Organization** - Modular component styles with shared constants
- **Form Validation** - Reusable validation utilities with rule-based system
- **Modal System** - Base modal component for consistent UI patterns
- **Build System** - Custom bundler that creates a single HTML file with everything embedded

### Testing
- **Framework**: Playwright for end-to-end testing
- **Coverage**: 10 tests covering all major features
- **Visual Regression**: Screenshot comparisons for UI consistency
- **Test Data**: Uses demo mode for consistent test environment

## 🎨 Design Philosophy

- **Embrace Constraints** - Single file, no dependencies, vanilla JavaScript
- **User Control** - Your data, your device, your rules
- **Privacy First** - No tracking, no analytics, no external services
- **Feature Creep Resistance** - Every feature must solve a real job search problem
- **Progressive Enhancement** - Start simple, add complexity only when needed
- **Mobile First** - Responsive design that works on all devices
- **Performance** - Fast load times, efficient updates, minimal overhead

## 📁 Project Structure

```
src/
├── components/       # UI components (jobs, tasks, calendar, etc.)
├── utils/           # Utilities and helpers
│   ├── constants.js     # App constants and enums
│   ├── data-models.js   # Data structure definitions
│   ├── event-manager.js # Centralized event delegation
│   ├── form-validation.js # Validation utilities
│   └── storage.js       # localStorage management
├── styles/          # Modular CSS
│   ├── constants.css    # CSS variables and constants
│   ├── base.css        # Reset and foundation
│   └── components/     # Component-specific styles
├── index.html       # Main template
└── styles.css       # Main stylesheet

dist/
└── index.html       # Built single file (~300KB)

tests/
├── basic.spec.js    # Playwright E2E tests
└── basic.spec.js-snapshots/  # Visual regression screenshots
```

## 🔮 Future Ideas

- **Resume Export** - PDF export for CV/Resume builder
- **Data Sync** - Optional encrypted cloud backup
- **More Languages** - Additional language translations
- **Advanced Analytics** - Deeper insights into job search progress
- **Interview Prep** - Question banks and preparation tools
- **Email Templates** - Follow-up email generators

## 🤝 Contributing

Contributions welcome! If you're crazy enough to work with vanilla JS in 2024, feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`pnpm test`)
4. Commit your changes
5. Push to the branch
6. Open a Pull Request

### Contribution Ideas
- New language translations
- UI/UX improvements
- Bug fixes
- Performance optimizations
- Documentation improvements
- Test coverage expansion

### Development Guidelines
- Follow existing code style (Biome enforced)
- Update tests for new features
- Keep the single-file philosophy
- Test on mobile devices
- Update CLAUDE.md for AI assistance context

## 🛠 Technologies Used

### Core
- **Vanilla JavaScript** - No frameworks, just pure JS
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **LocalStorage API** - Data persistence

### Build Tools
- **Custom Build Script** - Node.js based bundler
- **Terser** - JavaScript minification
- **CSSO** - CSS optimization
- **HTML Minifier** - HTML compression
- **PostCSS** - CSS processing with PurgeCSS

### Development Tools
- **Biome** - Fast linter and formatter
- **Playwright** - E2E testing framework
- **Node.js** - Development server and build tools
- **PNPM** - Package management

## 📄 License

MIT - Use it, modify it, share it. Happy job hunting! 🎯

---