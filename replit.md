# Inquiry Hub + Report Builder

## Overview

A collaborative web application designed for inquiry cohort members to work together on research projects. The platform helps small groups (4–5 people per inquiry group, plus facilitators) track individual research inquiries, share resources, manage meetings, and collaboratively build structured reports with customizable section templates. Adaptable for any inquiry topic or research focus.

Key features include:
- **Dashboard** with cohort timeline and progress tracking
- **Personal Inquiry Tracking** for questions, learning pathways, and weekly reflections with visibility controls
- **Shared Resource Library** for collaborative bookmarking and annotation with privacy settings
- **Meeting Management** with agendas, notes, and Zoom links
- **Report Builder** with structured sections, version history, ethics-focused tagging, and AI-powered synthesis
- **AI Insights** with evidence-backed citations linking to source content
- **Privacy Controls** allowing content to be marked as private, group-visible, or cohort-wide
- **Admin-editable Report Templates** with customizable sections and reordering

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with Shadcn UI component library (New York style)
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Design**: RESTful JSON API with typed contracts defined in `shared/routes.ts`
- **Authentication**: Passport.js with Local Strategy, session-based auth using express-session
- **Password Security**: Scrypt hashing with random salt

### Data Storage
- **Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Session Store**: connect-pg-simple for PostgreSQL-backed sessions
- **Schema Location**: `shared/schema.ts` contains all table definitions

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components (Shadcn + custom)
    hooks/        # React Query hooks for data fetching
    pages/        # Route page components
    lib/          # Utilities and query client
server/           # Express backend
  auth.ts         # Passport authentication setup
  db.ts           # Database connection
  routes.ts       # API route handlers
  storage.ts      # Data access layer
shared/           # Shared between client/server
  schema.ts       # Drizzle database schema
  routes.ts       # API contract definitions with Zod
```

### Authentication Flow
- Magic invite code required for registration (default: `cohort2026`)
- Default admin credentials: `admin` / `admin123`
- Session cookies with 30-day expiry
- Role-based access control (admin vs member)

### Key Design Patterns
- **Shared Type Definitions**: API contracts in `shared/routes.ts` ensure type safety across client/server
- **Custom Hooks**: Each data domain has dedicated hooks (use-auth, use-inquiries, use-report, etc.)
- **Component Composition**: PageLayout wrapper provides consistent navigation and styling
- **Optimistic Updates**: React Query handles caching and invalidation

## External Dependencies

### Database
- **PostgreSQL**: Primary database via Neon serverless (`DATABASE_URL` environment variable required)
- **Drizzle Kit**: Database migrations via `npm run db:push`

### Authentication & Sessions
- **Passport.js**: Authentication middleware with Local Strategy
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### UI Components
- **Radix UI**: Headless accessible components (accordion, dialog, tabs, etc.)
- **Shadcn UI**: Pre-styled component library built on Radix
- **Lucide React**: Icon library
- **date-fns**: Date formatting and manipulation

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: (Optional) Secret for session encryption, defaults to dev key

## Feature Details

### Visibility/Privacy System
Content types (reflections, resources, report contributions) support three visibility levels:
- **Private**: Only visible to the content author
- **Group**: Visible to members of the author's inquiry group
- **Cohort**: Visible to all cohort members

Visibility is set when creating content and stored in the database. The AI indexing system respects these visibility settings when generating insights.

### AI-Powered Features
- **AI Indexing**: Content is automatically indexed for AI analysis in `server/ai-service.ts`
- **Evidence-Backed Citations**: AI insights include clickable source links that navigate to original posts/reflections/resources
- **Section Synthesis**: Admins can generate AI summaries of report section contributions
- **AI Inquiry Mapping**: Admins can create reusable templates that map specific lenses/indices to each report section, enabling focused AI analysis
- Uses OpenAI integration for embeddings and completions

### AI Inquiry Mapping System
Allows admins to define templates specifying which lenses and indices apply to each report section:
- **Mapping Templates**: Create named mappings with description (stored in `inquiryMappings` table)
- **Section-Lens Associations**: For each section, define which lenses and specific indices to apply (stored in `sectionLensMappings` table)
- **Section Focus Context**: Per-section focus descriptions stored in `sectionFocusContext` table, providing additional analytical framing for AI synthesis
- **Inquiry Focus Setting**: Global cohort inquiry focus (e.g., "AI", "Climate Change") set in Settings, explicitly referenced in all AI synthesis prompts
- **Active Mapping**: Only one mapping can be active at a time; the AI synthesis uses the active mapping
- **Three-Layer Context**: AI synthesis incorporates: (1) global inquiry focus setting, (2) section-specific focus context, (3) mapped lenses/indices
- **Integration with Synthesis**: When `generateSectionSynthesis` runs, it includes inquiry focus, section context, and mapped lenses/indices in the AI prompt
- **Admin UI**: `/ai-mapping` page allows full CRUD operations on mappings with visual section-by-section configuration including focus context editing

### Admin Report Template Management
Admins can customize report sections via Settings page:
- Add/edit/delete section templates with title and description
- Reorder sections using up/down arrow controls
- Sections are stored in `reportSections` table with `displayOrder` field

### Public Information Pages
The following pages are publicly accessible without authentication:
- **/about** - Platform overview and features
- **/privacy** - Privacy policy with data handling practices
- **/terms** - Terms of use and user responsibilities
- **/help** - Searchable FAQ with categorized questions

Footer links appear on the Auth page and in the sidebar (for logged-in users).

### Recent Changes (January 2026)
- Renamed app from "Ed.D. AI Inquiry Hub" to "Inquiry Hub" for topic-agnostic use
- Added visibility controls (private/group/cohort) to reflections, resources, and report posts
- Implemented admin-editable report section templates with reordering
- Fixed auth query caching to prevent UI flickering
- Added public About, Privacy, Terms, and Help pages with footer navigation