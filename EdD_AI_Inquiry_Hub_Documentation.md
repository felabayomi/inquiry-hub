# Ed.D. AI Inquiry Hub + Report Builder

## Executive Summary

The Ed.D. AI Inquiry Hub is a collaborative web application designed specifically for the Ed.D. AI Inquiry Cohort (January - July 2026). This platform enables small groups of 4-5 cohort members, along with their facilitators, to track individual research inquiries, share resources, manage meetings, and collaboratively build structured reports with a "Justice & Ethics" lens.

The application is hosted on Replit's cloud infrastructure with a PostgreSQL database, providing secure, accessible storage for all cohort content throughout the inquiry journey.

---

## Platform Features

### 1. Dashboard
The central hub for cohort members featuring:
- **Cohort Timeline** - Visual timeline of milestones from January to July 2026
- **Upcoming Meetings** - Quick view of scheduled cohort gatherings
- **Quick Actions** - Fast access to common tasks
- **Recent Activity** - Feed of cohort member contributions

### 2. My Inquiry (Personal Research Journal)
Each cohort member maintains their own inquiry space:
- **Research Questions** - Document and evolve inquiry questions over time
- **Learning Pathway** - Track books, articles, tools, and resources being studied
- **Weekly Reflections** - Write brief reflections on learning each week
- **Progress Tracking** - Visual representation of inquiry evolution
- **AI Summary Button** - Generate AI-powered summaries of personal journey

### 3. Shared Resources (Collaborative Library)
A cohort-wide resource repository:
- **Add Resources** - Share articles, tools, videos, books, and links
- **Categories & Tags** - Organize resources by type and topic
- **Notes & Annotations** - Add personal insights about each resource
- **Search & Filter** - Find resources by category, tag, or keyword

### 4. Meetings Management
Centralized meeting coordination:
- **Meeting Schedule** - View all upcoming and past meetings
- **Zoom Integration** - Store and access meeting links
- **Agendas** - Plan meeting topics in advance
- **Meeting Notes** - Collaborative note-taking during sessions
- **Action Items** - Track tasks assigned during meetings

### 5. Report Builder (Collaborative Writing)
The core collaborative authoring tool with 8 structured sections:

1. **Introduction** - Setting the stage for the inquiry
2. **Background/Context** - Historical and situational context
3. **Methods** - Approaches and methodologies used
4. **Findings** - Key discoveries and insights
5. **Discussion** - Analysis and interpretation
6. **Implications** - Practical applications and recommendations
7. **Conclusion** - Summary and final thoughts
8. **References** - Sources and citations

**Collaboration Features:**
- **Post Contributions** - Each member adds their voice to any section
- **Justice Lens Tags** - Tag contributions with ethics/justice perspectives
- **Discussion Sidebar** - Section-level conversations
- **Read Tracking** - See who has read each contribution (e.g., "3/5 read")
- **Reactions** - Respond with "Insightful," "Well Written," "Makes Me Think," or "Love This"
- **Version History** - Track changes over time
- **Unread Indicators** - Badges showing new content

### 6. AI Insights (Powered by OpenAI)
Intelligent summarization and synthesis tools:

**Personal Journey Summary:**
- Generate AI summaries of individual inquiries and reflections
- Identify key themes across personal work
- Surface notable quotes from writing
- Discover emerging open questions
- Receive AI-suggested next steps

**Section Synthesis (Report Builder):**
- Summarize all contributions within a report section
- Identify common themes across cohort members
- Help synthesize collective thinking for final drafts

**Privacy Controls:**
- Toggle AI access to private reflections
- Private content never shared with other cohort members
- User-controlled data inclusion

---

## Technical Specifications

### Infrastructure
- **Hosting**: Replit Cloud Platform
- **Database**: PostgreSQL (Neon serverless) with 10 GB storage capacity
- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js with Express
- **AI Integration**: OpenAI GPT-4o-mini for summarization

### Security Features
- **Authentication**: Session-based with encrypted passwords (scrypt hashing)
- **Invite Code**: Registration requires cohort-specific code ("cohort2026")
- **Role-Based Access**: Admin and member roles with appropriate permissions
- **SQL Injection Protection**: Built-in through Drizzle ORM
- **Secure Credentials**: Environment variables for sensitive data

### Data Persistence & Backup
- **Cloud Storage**: All data stored on remote servers, accessible from any device
- **Point-in-Time Restore**: Production databases support checkpoint recovery
- **7-Day Soft Delete**: Accidentally deleted databases recoverable via support
- **Always Available**: Data persists whether app is actively used or not

---

## User Roles

### Administrator
- Create and manage meetings
- Access Settings page for cohort configuration
- Reindex content for AI processing
- All member capabilities

### Member
- Track personal inquiries and reflections
- Share resources with cohort
- Contribute to report sections
- React and comment on contributions
- View meetings and add notes
- Generate AI summaries

---

## Access & Registration

**Registration Process:**
1. Navigate to the application URL
2. Click "Register" 
3. Enter username, display name, and password
4. Enter the invite code: `cohort2026`
5. Begin using the platform

**Default Admin Access:**
- Username: `admin`
- Password: `admin123`
- (Should be changed after first login)

---

## Cohort Timeline

The platform is designed around the Ed.D. AI Inquiry Cohort schedule:

| Phase | Dates | Focus |
|-------|-------|-------|
| **Orientation** | January 2026 | Platform onboarding, inquiry question development |
| **Exploration** | February - March 2026 | Research, resource gathering, weekly reflections |
| **Synthesis** | April - May 2026 | Report contributions, AI-assisted summaries |
| **Finalization** | June - July 2026 | Report completion, final presentations |

---

## Justice & Ethics Lens

The platform emphasizes ethical and justice-oriented inquiry through:

**Justice Lens Tags** (available when contributing to reports):
- Equity & Access
- Cultural Responsiveness
- Systemic Change
- Student Voice
- Community Impact
- Ethical Considerations
- Power Dynamics
- Inclusive Practices

These tags help cohort members categorize their contributions and ensure the final report addresses multiple dimensions of educational justice.

---

## Benefits for the Ed.D. Program

1. **Structured Collaboration** - Organized framework for group research projects
2. **Documentation** - Automatic tracking of inquiry evolution over time
3. **Accessibility** - Cloud-based access from any device, anywhere
4. **AI Assistance** - Reduce cognitive load with intelligent summarization
5. **Engagement Tracking** - Visibility into cohort participation and contributions
6. **Version Control** - Historical record of report development
7. **Justice Focus** - Built-in tagging system for ethics-centered inquiry

---

## Future Considerations

The platform can be extended to support:
- Export functionality for final reports
- Integration with learning management systems
- Additional AI features (e.g., literature review assistance)
- Multi-cohort support for future inquiry groups
- Enhanced analytics and reporting dashboards

---

## Contact & Support

For technical support or questions about the platform, please contact:
- [Your contact information here]

---

*Documentation prepared for Ed.D. AI Inquiry Cohort (January - July 2026)*
*Platform Version: 1.0*
*Last Updated: January 2026*
