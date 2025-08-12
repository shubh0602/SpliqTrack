# Spliq - Modern Expense Sharing Platform

<div align="center">

![Spliq Logo](https://img.shields.io/badge/Spliq-Split%20%2B%20Quick-purple?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K)

*Split expenses quickly and beautifully with friends*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61dafb)](https://reactjs.org/)

</div>

## 🌟 Overview

Spliq is a modern, full-stack expense-sharing web application that makes splitting bills with friends, roommates, and groups effortless. Built with a focus on user experience and inspired by CRED's beautiful design language, Spliq combines powerful functionality with an intuitive interface.

### ✨ Key Features

- **🔗 Smart Invitations**: Share links that allow users to join with Google authentication or as guests with just their name
- **💰 Advanced Expense Splitting**: Equal splits, custom amounts, percentages, and share-based calculations
- **🌍 Multi-Currency Support**: Real-time exchange rates with automatic conversion
- **📊 Analytics Dashboard**: Comprehensive spending insights, trends, and reports
- **📱 Mobile-First Design**: Responsive interface optimized for all devices
- **🔄 Offline Sync**: Queue operations when offline, sync automatically when back online
- **💾 Data Export**: Export your data in CSV and JSON formats
- **🎯 Smart Categories**: AI-powered expense categorization
- **🏦 Settlement Tracking**: Track who owes what and manage payments

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Wouter** for lightweight client-side routing
- **TanStack Query** for advanced server state management
- **Radix UI + shadcn/ui** for accessible, customizable components
- **Tailwind CSS** with custom CRED-inspired design system
- **React Hook Form + Zod** for robust form handling and validation
- **Vite** for lightning-fast development and optimized builds

### Backend Stack
- **Node.js + Express.js** RESTful API server
- **TypeScript** with ES modules
- **Replit OpenID Connect** for seamless authentication
- **PostgreSQL** with Neon serverless hosting
- **Drizzle ORM** for type-safe database operations
- **Passport.js** for authentication strategies

### Database Design
```sql
-- Core Tables
users              -- User profiles with flexible auth (Replit, Google, Guest)
friendships        -- Bilateral friend relationships
groups             -- Expense sharing groups
expenses           -- Individual expenses with metadata
expense_splits     -- How expenses are divided among users
settlements        -- Payment tracking between users
invitations        -- Shareable invitation system
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- PostgreSQL database (or Neon account)
- Replit account (for authentication)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/spliq.git
cd spliq
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Required environment variables
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secure_session_secret
REPLIT_DOMAINS=your_replit_domain.com
REPL_ID=your_repl_id
ISSUER_URL=https://replit.com/oidc
```

4. **Initialize the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🎨 Design System

Spliq uses a custom design system inspired by CRED's visual language:

### Color Palette
```css
/* Primary Colors */
--cred-purple: #6366f1    /* Primary actions */
--cred-pink: #ec4899      /* Accents and highlights */
--cred-dark: #0f0f0f      /* Background */
--cred-gray: #1a1a1a      /* Cards and containers */
--cred-light: #2a2a2a     /* Input fields */

/* Gradients */
--cred-gradient: linear-gradient(135deg, #6366f1 0%, #ec4899 100%)
--green-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%)
```

### Typography
- **Primary**: Inter (system font fallback)
- **Monospace**: JetBrains Mono for code and IDs

## 📱 Features Deep Dive

### Invitation System
Create shareable links with flexible authentication:
- **Authenticated Users**: Direct join via Google/Replit login
- **Guest Users**: Quick join with name-only registration
- **Configurable**: Set expiration dates and usage limits
- **QR Codes**: Generate QR codes for easy mobile sharing

### Expense Management
Advanced splitting capabilities:
```typescript
// Equal Split Example
{
  amount: 120.00,
  splitType: "equal",
  participants: ["user1", "user2", "user3"] // $40 each
}

// Custom Split Example
{
  amount: 150.00,
  splitType: "custom",
  splits: [
    { userId: "user1", amount: 75.00 },
    { userId: "user2", amount: 50.00 },
    { userId: "user3", amount: 25.00 }
  ]
}

// Percentage Split Example
{
  amount: 200.00,
  splitType: "percentage",
  splits: [
    { userId: "user1", percentage: 60 }, // $120
    { userId: "user2", percentage: 40 }  // $80
  ]
}
```

### Analytics Dashboard
Comprehensive financial insights:
- Monthly/yearly spending trends
- Category-wise breakdowns
- Friend-wise balances
- Group expense summaries
- Exportable reports

### Offline Functionality
Robust offline support:
- Queue operations when offline
- Automatic sync when connection restored
- Visual indicators for sync status
- Conflict resolution for simultaneous edits

## 🔧 API Endpoints

### Authentication
```
GET  /api/auth/user          - Get current user
GET  /api/login              - Initiate login flow
GET  /api/logout             - Logout user
POST /api/callback           - OAuth callback
```

### Invitations
```
POST   /api/invitations       - Create invitation
GET    /api/invitations       - List user invitations
GET    /api/invitations?code= - Get invitation by code
POST   /api/invitations/accept - Accept invitation
DELETE /api/invitations/:id   - Deactivate invitation
```

### Expenses
```
GET    /api/expenses         - List expenses
POST   /api/expenses         - Create expense
PUT    /api/expenses/:id     - Update expense
DELETE /api/expenses/:id     - Delete expense
GET    /api/expenses/export  - Export data
```

### Groups & Friends
```
GET    /api/groups           - List groups
POST   /api/groups           - Create group
GET    /api/friends          - List friends
POST   /api/friends          - Add friend
```

## 🛠️ Development

### Project Structure
```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   └── styles/         # Global styles
│   └── index.html
├── server/                 # Backend Express server
│   ├── services/           # Business logic services
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data access layer
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
└── package.json
```

### Development Commands
```bash
npm run dev          # Start development servers
npm run build        # Build for production
npm run db:push      # Push schema changes to database
npm run db:studio    # Open database studio
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Code Style
- TypeScript strict mode enabled
- ESLint with React and TypeScript rules
- Prettier for code formatting
- Husky for pre-commit hooks

## 📊 Performance

### Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)

### Optimizations
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format with fallbacks
- **Bundle Analysis**: Regular size monitoring
- **Caching Strategy**: Service worker for static assets
- **Database Indexing**: Optimized queries with proper indexes

## 🔒 Security

### Authentication & Authorization
- OAuth 2.0 with OpenID Connect
- Session-based authentication with secure cookies
- CSRF protection enabled
- Rate limiting on API endpoints

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention via parameterized queries
- XSS protection with Content Security Policy
- Secure headers with Helmet.js

### Privacy
- Guest user data anonymization
- GDPR-compliant data export/deletion
- Minimal data collection principle
- Encrypted data transmission (HTTPS only)

## 🌍 Deployment

### Replit Deployment
The application is optimized for Replit's deployment platform:

1. **Automatic Deployment**: Push to main branch triggers deployment
2. **Environment Variables**: Configure in Replit secrets
3. **Database**: Uses Neon PostgreSQL for production
4. **Domain**: Custom domain support available

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented
- [ ] Error tracking configured (Sentry)

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Jest for utility functions
- **Component Tests**: React Testing Library
- **Integration Tests**: Supertest for API endpoints
- **E2E Tests**: Playwright for critical user flows

```bash
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:coverage # Generate coverage report
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Commit using conventional commits: `git commit -m 'feat: add amazing feature'`
6. Push to your fork and create a Pull Request

### Code of Conduct
This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: CRED for the beautiful UI/UX patterns
- **Icons**: Lucide React for the comprehensive icon set
- **UI Components**: Radix UI for accessible component primitives
- **Hosting**: Replit for seamless development and deployment

## 📞 Support

- **Documentation**: [docs.spliq.app](https://docs.spliq.app)
- **Issue Tracker**: [GitHub Issues](https://github.com/yourusername/spliq/issues)
- **Community**: [Discord Server](https://discord.gg/spliq)
- **Email**: support@spliq.app

---

<div align="center">

**Made with ❤️ by the Spliq team**

[Website](https://spliq.app) • [Documentation](https://docs.spliq.app) • [Twitter](https://twitter.com/spliqapp)

</div>