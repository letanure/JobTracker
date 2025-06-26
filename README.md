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

1. **Download** `dist/index.html` 
2. **Open** in any modern browser
3. **Start tracking jobs** - Demo data included to show features

### Live Demo
Visit [jobtracker.cv](http://jobtracker.cv) to try it online.

## 💾 Data Management

- **Local Storage** - Data saved in your browser
- **Privacy** - No external services, no tracking*

*\*Note: Visit tracking works only on jobtracker.cv domain, not locally*

## 🛠️ Development

Built with vanilla JavaScript and a philosophy of simplicity:

```bash
# Build optimized single file
npm run build

# Build with dead CSS analysis  
npm run build:analyze

# Development server
npm run dev

# Watch mode
npm run watch
```

### Architecture
- **Component System** - Not so React-like components in vanilla JS + emmet style
- **State Management** - Simple localStorage persistence  
- **Modular CSS** - Component-based styling. that was the idea, right?
- **Build System** - Custom bundler for single-file output.  dont try that at home, ok?

## 🎨 Design Philosophy

**Embrace Constraints** - Single file, no dependencies, old school JS
**User Control** - Your data, your device, your rules
**Feature Creep Resistance** - Every feature must solve a real job search problem
**Progressive Enhancement** - Start simple, add complexity only when needed. if have more that 5 files, add a batle etsted server and build. I skiped because was kind of fun

## 📁 Project Structure

```
src/
├── components/        # UI components
├── utils/            # Utilities and constants  
├── styles/           # Modular CSS
└── index.html        # Main template

dist/
└── index.html        # Built single file
```

## 🔮 Future Ideas

- **Better Resume Builder** - More templates and export formats

## 🤝 Contributing

Contributions welcome! If you're crazy enought, just create a MR or issue

Ideas:
- New language translations
- UI improvements  
- Feature additions
- Performance optimizations

## 📄 License

MIT - Use it, modify it, share it. Happy job hunting! 🎯

---