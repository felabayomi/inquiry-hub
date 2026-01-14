# Inquiry Hub + Report Builder

## Overview

A collaborative web application designed for inquiry cohort members to work together on research projects. The platform helps small groups (4–5 people per inquiry group, plus facilitators) track individual research inquiries, share resources, manage meetings, and collaboratively build structured reports with customizable section templates. Adaptable for any inquiry topic or research focus.

Key features include:
- **Dashboard** with cohort timeline and progress tracking
- **Personal Inquiry Tracking** for questions, learning pathways, and weekly reflections
- **Shared Resource Library** for collaborative bookmarking and annotation
- **Meeting Management** with agendas, notes, and Zoom links
- **Report Builder** with structured sections, version history, and ethics-focused tagging

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