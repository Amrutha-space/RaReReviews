# RaReReviews - Review Platform

## Overview

RaReReviews is a full-stack web application for sharing and browsing honest reviews about products, services, and experiences. The platform features user authentication, categorized reviews, image uploads, and a voting system for helpful reviews.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with a clear separation between frontend and backend code:

- **Frontend**: React with TypeScript using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth integration
- **UI Framework**: shadcn/ui with Tailwind CSS
- **File Structure**: Shared schema and types between client and server

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and caching
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database ORM**: Drizzle with Neon serverless PostgreSQL
- **File Uploads**: Multer for image handling
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple

### Database Schema
- **Users**: Profile information with Replit Auth integration
- **Categories**: Predefined review categories (Restaurants, Technology, Travel, etc.)
- **Reviews**: Core review content with ratings, images, and draft support
- **Review Votes**: Helpful/unhelpful voting system
- **Sessions**: Authentication session storage

### Authentication & Authorization
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-based sessions
- **Authorization**: Route-level protection for authenticated endpoints
- **User Management**: Automatic user creation/update on login

## Data Flow

1. **Authentication Flow**:
   - Users authenticate via Replit Auth
   - Sessions stored in PostgreSQL
   - User data synchronized with local database

2. **Review Creation Flow**:
   - Form validation with Zod schemas
   - Image uploads processed via Multer
   - Reviews stored with category associations
   - Real-time updates via TanStack Query

3. **Review Browsing Flow**:
   - Category-based filtering
   - Search functionality across titles and content
   - Sorting by recency, rating, or helpfulness
   - Pagination for large result sets

4. **Voting System**:
   - Users can vote reviews as helpful/unhelpful
   - Vote statistics tracked per review
   - Prevents duplicate votes per user

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **wouter**: Lightweight React router
- **multer**: File upload handling

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **Zod**: Runtime type validation
- **React Hook Form**: Form state management

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: Direct TypeScript execution with tsx
- **Database**: Neon serverless PostgreSQL
- **File Storage**: Local uploads directory

### Production
- **Build Process**: 
  - Frontend: Vite production build to `dist/public`
  - Backend: esbuild bundle to `dist/index.js`
- **Static Files**: Express serves built frontend and uploaded images
- **Database**: Neon production instance
- **Environment**: Node.js with ESM modules

### Configuration
- Database connection via `DATABASE_URL` environment variable
- Session security via `SESSION_SECRET`
- Replit Auth configuration via environment variables
- File upload limits and validation configured in server routes

The application is designed to run seamlessly on Replit's platform while maintaining compatibility with standard Node.js hosting environments.