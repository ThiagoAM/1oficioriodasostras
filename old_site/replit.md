# Barristar Law Firm Website

## Overview

This is a full-stack web application for Barristar Law Firm, a professional legal services website built with React, Express, and TypeScript. The application showcases the law firm's services, attorneys, and provides appointment booking functionality. It's designed as a modern, responsive marketing website with a professional aesthetic featuring serif typography and a blue/gold color scheme.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite

**Design System**
The application uses a custom design system with:
- **Typography**: Playfair Display (serif) for headings, Open Sans for body text
- **Color Scheme**: Custom CSS variables defining brand colors (brand-blue, brand-gold, brand-light-gray, brand-dark-gray)
- **Component Library**: shadcn/ui components configured with "new-york" style variant
- **Icons**: Iconify for vector icons

**Component Structure**
The frontend follows a component-based architecture with:
- **Page Components**: 
  - `/` - Home page with all marketing sections
  - `/login` - Admin login page
  - `/admin` - Admin dashboard for user management (protected route)
  - `*` - 404 fallback page
- **Feature Components**: Modular sections (Header, Hero, AboutSection, PracticeAreas, Attorneys, Testimonials, etc.)
- **UI Components**: Reusable primitives in `client/src/components/ui/`
- **Hooks**: Custom React hooks for common functionality

**Admin Interface**
- **Login Page** (`/login`): Form-based authentication with username/password
- **Admin Dashboard** (`/admin`): Complete user management interface
  - User listing table with all user details
  - Create new users with full form validation
  - Edit existing users (name, email, username, password, admin status)
  - Delete users (with protection against self-deletion)
  - Logout functionality

### Backend Architecture

**Technology Stack**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Authentication**: Passport.js with local strategy
- **Development**: tsx for TypeScript execution
- **Build**: esbuild for production bundling

**Server Structure**
The backend implements a full authentication and admin system:
- **Development Mode**: Vite middleware integration for HMR and dev server
- **Production Mode**: Serves static files from built client
- **API Routes**: Prefixed with `/api`
  - `/api/auth/*` - Authentication endpoints (login, logout, me)
  - `/api/users/*` - User management (CRUD, admin-only)
- **Logging**: Custom request/response logging middleware
- **Configuration**: Environment-based config via `server/config.ts` that reads from `.env`

**Storage Layer**
The application implements a storage interface pattern:
- **Interface**: `IStorage` defines CRUD operations for users
- **Implementation**: `DbStorage` provides MySQL database storage
- **Extensibility**: Designed to swap storage implementations without changing application code

### Data Storage

**Database Configuration**
- **Database**: MySQL (configured via `.env` credentials)
- **ORM**: Drizzle ORM with MySQL2 dialect
- **Connection**: MySQL connection pool via `mysql2/promise`
- **Schema Location**: `shared/schema.ts` for type-safe schema sharing between client/server
- **Configuration**: Environment variables loaded from `.env` via `server/config.ts`

**Current Schema**
- **Users Table**: Complete user model with:
  - `id` (auto-increment integer)
  - `username` (unique, varchar 255)
  - `password` (hashed with bcrypt, varchar 255)
  - `full_name` (varchar 255)
  - `email` (unique, varchar 255)
  - `is_admin` (boolean, default false)
  - `created_at` (timestamp, auto-generated)
- **Validation**: Zod schemas generated from Drizzle schema for runtime validation

**Security Features**
- Passwords hashed using bcrypt (10 rounds)
- Environment-based configuration (no hardcoded credentials)
- MySQL credentials loaded from `.env` file
- Session secret from environment variable

### Authentication & Session Management

**Implementation**
- **Library**: Passport.js with local strategy
- **Session Storage**: Express-session with in-memory store
- **Password Security**: bcrypt hashing (10 rounds)
- **Session Cookie**: 
  - Max age: 7 days
  - HTTP-only flag enabled
  - Secure flag in production
- **Protected Routes**: Middleware checks authentication and admin status

**User Roles**
- **Admin**: Full access to user management (CRUD operations)
- **Regular User**: Limited access (future feature expansion)

**Initial Setup**
- Default admin user created: `admin@barristar.com` / `admin` / `admin123`

## External Dependencies

### Third-Party Services

**Neon Database**
- Serverless PostgreSQL database
- Connection via `DATABASE_URL` environment variable
- WebSocket-based connection pooling

**Unsplash**
- Image hosting for attorney photos, office images, and marketing content
- Images served directly via Unsplash CDN URLs

**Google Fonts**
- Playfair Display and Open Sans font families
- Loaded via Google Fonts CDN

**Iconify**
- Icon library loaded via CDN
- Provides Material Design Icons and other icon sets

### Build & Development Tools

**Replit Integrations**
- `@replit/vite-plugin-runtime-error-modal`: Development error overlay
- `@replit/vite-plugin-cartographer`: Code navigation tool
- `@replit/vite-plugin-dev-banner`: Development environment banner

**Development Server**
- Vite dev server with HMR
- Express backend proxying API requests
- Custom logging middleware for request monitoring

### UI Component Libraries

**Radix UI**
- Unstyled, accessible component primitives
- Includes 25+ component primitives (Dialog, Dropdown, Popover, etc.)
- Provides keyboard navigation, focus management, and ARIA attributes

**Form Management**
- `react-hook-form`: Form state management
- `@hookform/resolvers`: Validation resolver integration
- `zod`: Schema validation (integrated with Drizzle)

**Date Handling**
- `date-fns`: Date manipulation and formatting utilities

**Carousel**
- `embla-carousel-react`: Touch-friendly carousel component

### Styling Stack

**Tailwind CSS**
- Utility-first CSS framework
- Custom configuration in `tailwind.config.ts`
- PostCSS processing with Autoprefixer
- `class-variance-authority`: Type-safe variant styling
- `tailwind-merge`: Utility class merging
- `clsx`: Conditional class composition