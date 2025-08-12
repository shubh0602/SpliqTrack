# Changelog

All notable changes to Spliq will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive invitation system with shareable links
- Guest user support with name-only registration
- QR code generation for easy mobile sharing
- Multi-currency support with real-time exchange rates
- Advanced expense splitting options (equal, custom, percentage, shares)
- Analytics dashboard with spending insights and charts
- Offline sync functionality with operation queuing
- Data export capabilities (CSV and JSON formats)
- Receipt OCR preparation and data storage
- Enhanced expense modal with tabbed interface
- Mobile-responsive CRED-inspired design system

### Enhanced
- User authentication system to support multiple providers
- Database schema to include invitation and guest user management
- Storage layer for comprehensive expense and user data management
- API endpoints for invitation creation, acceptance, and management

### Technical Improvements
- Added Drizzle ORM for type-safe database operations
- Implemented PostgreSQL with proper schema design
- Added TanStack Query for advanced data fetching and caching
- Integrated Radix UI components with shadcn/ui
- Set up comprehensive TypeScript configuration
- Added Tailwind CSS with custom design tokens

## [1.0.0] - 2024-01-15

### Added
- Initial release of Spliq
- Core expense splitting functionality
- User authentication with Replit OpenID Connect
- Friend management system
- Group expense tracking
- Basic dashboard with expense overview
- Mobile-responsive design
- Real-time balance calculations
- Settlement tracking between users

### Core Features
- **Expense Management**: Create, edit, and delete expenses with detailed information
- **Friend System**: Add friends and track shared expenses
- **Group Management**: Create groups for recurring expense sharing
- **Balance Tracking**: Real-time calculation of who owes what to whom
- **Settlement System**: Track payments and settle debts between users
- **Responsive Design**: Mobile-first approach with desktop optimization

### Technical Foundation
- **Frontend**: React 18 with TypeScript and Vite
- **Backend**: Node.js with Express.js and TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OpenID Connect with Passport.js
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form with Zod validation

### Security
- Session-based authentication with secure cookies
- Input validation and sanitization
- CSRF protection
- Rate limiting on API endpoints
- Secure headers configuration

### Performance
- Code splitting with lazy loading
- Optimized bundle size
- Database query optimization
- Caching strategies for API responses
- Image optimization and compression

---

## Release Notes Format

Each release includes:
- **Added**: New features and capabilities
- **Changed**: Modifications to existing functionality
- **Deprecated**: Features marked for removal in future versions
- **Removed**: Features removed in this version
- **Fixed**: Bug fixes and issue resolutions
- **Security**: Security-related improvements

## Version Numbering

Spliq follows semantic versioning (SemVer):
- **Major** (x.0.0): Breaking changes that require user action
- **Minor** (0.x.0): New features that are backwards compatible
- **Patch** (0.0.x): Bug fixes and small improvements

## Contributing to Changelog

When contributing:
1. Add entries under the "Unreleased" section
2. Use the established categories (Added, Changed, etc.)
3. Write clear, user-focused descriptions
4. Include relevant issue/PR numbers
5. Follow the existing format and style