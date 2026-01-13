# Ed.D. AI Inquiry Hub + Report Builder

A collaborative web application for the Ed.D. AI Inquiry Cohort (January–July 2026).

## Features
- **Dashboard**: Cohort timeline and key dates.
- **My Inquiry**: Track your question, pathway, and weekly reflections.
- **Shared Resources**: collaborative library of links and tools.
- **Meetings**: Agendas, notes, and Zoom links.
- **Report Builder**: Structured collaborative writing with version history and "Justice & Ethics" lens.

## Getting Started

### 1. Initial Setup
The application comes pre-seeded with:
- **Magic Invite Code**: `cohort2026` (Used for new user registration)
- **Admin User**:
  - Username: `admin`
  - Password: `admin123`

### 2. How to Create the First Admin
The system automatically creates a default admin user (`admin` / `admin123`) on first run.
You can log in with these credentials to configure the application settings.
It is highly recommended to change the admin password or create a new admin account and delete the default one.

### 3. How to Invite Users
Share the URL of the deployed application and the Magic Invite Code (`cohort2026`) with your cohort members.
They can sign up using the "Register" link on the login page.

### 4. Admin Settings
Log in as an admin to access the "Settings" page where you can:
- Update the **Magic Invite Code**.
- Change the **Cohort Name**.
- Update **Zoom Links** and **Key Dates**.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express, Passport.js (Local Auth)
- **Database**: PostgreSQL (via Neon), Drizzle ORM
