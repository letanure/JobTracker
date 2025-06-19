# Job Search Tracker

A super simple, lightweight job application tracking tool that helps you manage your job search process efficiently. No login required, no complex setup - just open and start tracking!

## 🎯 Project Concept

This is a **minimalist job tracker** designed for simplicity and ease of use:

- **No backend required** - Everything runs in your browser
- **No user accounts** - Just open the file and use it
- **Single file application** - Self-contained HTML with embedded CSS/JS
- **Local storage only** - Your data stays on your device
- **Privacy-first** - No data collection or external dependencies

Perfect for job seekers who want a straightforward tool without the complexity of full-featured job tracking platforms.

## ✨ Features

### 📊 Core Functionality
- **Job Application Tracking** - Add, edit, and delete job applications
- **Status Management** - Track applications from wishlist to offer
- **Priority System** - Set priorities (high, medium, low) for your applications
- **Process Phases** - Monitor your progress through different interview stages
- **Contact Management** - Store recruiter and hiring manager information
- **Notes & Tasks** - Keep track of important details and next steps

### 🔍 Smart Filtering
- **Status Filters** - Filter by application status (wishlist, applied, interview, etc.)
- **Priority Filters** - View applications by priority level
- **Phase Filters** - Filter by current interview phase
- **Real-time Updates** - Filters update automatically as you add new data

### 🚀 User Experience
- **Double-click Editing** - Double-click any row to quickly edit
- **Keyboard Shortcuts** - Press ESC to cancel editing
- **Auto-complete** - Smart suggestions for companies, positions, and locations
- **Date Management** - Easy date picking for applications and due dates
- **Statistics Dashboard** - Real-time stats on your job search progress

### 🌍 Internationalization
- **Multi-language Support** - Currently supports English and Portuguese
- **Automatic Detection** - Detects browser language preference
- **Easy Translation** - Simple system for adding new languages

## 📋 Tracked Information

Each job application includes:

| Field | Description |
|-------|-------------|
| **Priority** | High, Medium, or Low priority |
| **Company** | Company name with autocomplete |
| **Position** | Job title/position |
| **Applied Date** | When you applied |
| **Status** | Current status (Wishlist → Applied → Interview → Offer) |
| **Current Phase** | Detailed interview phase tracking |
| **Next Task** | What you need to do next |
| **Due Date** | Important upcoming dates |
| **Contact Person** | Recruiter/hiring manager details |
| **Salary Range** | Expected or offered compensation |
| **Location** | Job location (remote, city, etc.) |
| **Notes** | Additional details and observations |

## 🎨 Status Workflow

The application supports a complete job search workflow:

1. **Wishlist** 🎯 - Jobs you're interested in
2. **Applied** 📤 - Applications submitted
3. **Phone Screening** 📞 - Initial recruiter calls
4. **Interview** 💼 - In the interview process
5. **Final Round** 🏆 - Last stage interviews
6. **Offer** 🎉 - Job offers received
7. **Rejected** ❌ - Applications declined
8. **Withdrawn** 🚫 - Applications you withdrew

## 🛠️ Technical Features

### Architecture
- **Component-based Design** - React-like component system
- **jQuery-style API** - Chainable DOM manipulation methods
- **Modular Structure** - Clean separation of concerns
- **Event-driven** - Responsive user interactions

### Data Management
- **LocalStorage Integration** - Persistent data storage
- **JSON Data Format** - Easy to backup and transfer
- **Auto-save** - Changes saved automatically
- **Demo Data** - Sample applications for new users

### UI/UX Enhancements
- **Material Design Icons** - Clean, modern iconography
- **Responsive Design** - Works on desktop and mobile
- **Smooth Interactions** - Polished user experience
- **Color-coded Status** - Visual status indicators

## 🚀 Getting Started

1. **Download** the HTML file
2. **Open** it in any modern web browser
3. **Start tracking** your job applications immediately!

### First Run
- The app will offer to create sample data to help you understand the features
- All data is stored locally in your browser
- No internet connection required after initial load

## 💾 Data Management

### Backup Your Data
Your job search data is stored in your browser's local storage. To backup:
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Find Local Storage → your file
4. Copy the `jobTrackerData` value

### Import/Export
The application includes built-in data export functionality for easy backup and transfer between devices.

## 🔮 Future Ideas

### Potential Enhancements
- **Configurable Columns** - Show/hide table columns
- **Export to PDF/CSV** - Generate reports and resumes
- **Calendar Integration** - Interview scheduling
- **Application Templates** - Quick application setup
- **Search Functionality** - Find specific applications
- **Dark Mode** - Alternative color scheme
- **Backup to Cloud** - Optional cloud storage integration
- **Mobile App** - Native mobile version
- **Analytics** - Job search insights and trends

### Advanced Features (Maybe)
- **Interview Preparation** - Question banks and notes
- **Salary Negotiation Tools** - Compensation tracking
- **Network Management** - Contact relationship tracking
- **Document Storage** - Resume and cover letter versions
- **Follow-up Reminders** - Automated task management

## 🎯 Design Philosophy

**Simplicity First** - Every feature should be intuitive and add real value to the job search process.

**Privacy by Design** - No external dependencies, no data collection, complete user control.

**Single File Approach** - Easy to share, backup, and use without installation.

**Progressive Enhancement** - Start simple, add features thoughtfully.

## 📁 File Structure

```
job-tracker-plain/
├── index.html          # Main application file
├── styles.css          # Application styling
├── constants.css       # CSS variables and theme
├── script.js          # Application logic
└── README.md          # This file
```

## 🤝 Contributing

This project welcomes contributions! Ideas for improvements:
- Additional language translations
- UI/UX enhancements
- New feature implementations
- Bug fixes and optimizations

## 📄 License

Open source - feel free to use, modify, and distribute as needed for your job search!

---

**Happy job hunting!** 🎯✨