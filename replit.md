# Overview

Spliq is a modern expense-sharing web application built with React, Express, and PostgreSQL. The application allows users to split expenses with friends and groups, track balances, and settle debts through an intuitive interface. It features Replit authentication, real-time balance tracking, and comprehensive expense management capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **Styling**: Tailwind CSS with custom design tokens and dark theme
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js RESTful API server
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Authentication**: Replit OpenID Connect integration with Passport.js strategy
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful endpoints with consistent error handling and request logging middleware

## Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless connection pooling
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema**: Comprehensive relational design supporting users, friendships, groups, expenses, and settlements
- **Migrations**: Drizzle Kit for database schema versioning and deployment

## Authentication and Authorization
- **Provider**: Replit OIDC for seamless platform integration
- **Strategy**: Passport.js with custom OpenID Connect strategy
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Security**: HTTP-only cookies with secure flags and CSRF protection
- **User Management**: Automatic user provisioning with profile synchronization

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Connection Management**: WebSocket-based connections for serverless compatibility

### Authentication Services
- **Replit OIDC**: Primary authentication provider
- **OpenID Connect**: Standard protocol implementation for secure authentication flows

### UI and Styling
- **Radix UI**: Accessible, unstyled component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom color palette and design system
- **shadcn/ui**: Pre-built component library built on Radix UI primitives

### Development and Build Tools
- **Vite**: Modern build tool with hot module replacement and optimized bundling
- **TypeScript**: Static type checking across the entire application stack
- **ESBuild**: Fast JavaScript bundler for server-side code compilation

### Third-party Libraries
- **TanStack Query**: Advanced data fetching and caching solution
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation library
- **date-fns**: Modern date utility library for date formatting and manipulation