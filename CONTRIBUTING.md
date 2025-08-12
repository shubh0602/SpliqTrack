# Contributing to Spliq

Thank you for your interest in contributing to Spliq! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- PostgreSQL database
- Git
- A Replit account (for authentication testing)

### Development Setup

1. **Fork and clone the repository**
```bash
git clone https://github.com/yourusername/spliq.git
cd spliq
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up your environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Initialize the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

## 📋 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code style (ESLint + Prettier)
- Write meaningful commit messages using [Conventional Commits](https://conventionalcommits.org/)
- Add tests for new functionality

### Component Guidelines
- Use functional components with hooks
- Implement proper TypeScript types
- Follow the established design system
- Ensure mobile responsiveness
- Add accessibility attributes where needed

### API Guidelines
- Use RESTful conventions
- Implement proper error handling
- Add input validation with Zod schemas
- Document new endpoints
- Include proper HTTP status codes

### Database Guidelines
- Use Drizzle ORM for all database operations
- Define proper relations between tables
- Add appropriate indexes for performance
- Use migrations for schema changes
- Follow naming conventions (snake_case for columns)

## 🐛 Bug Reports

When filing a bug report, please include:

1. **Description**: Clear description of the issue
2. **Reproduction Steps**: How to reproduce the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, Node.js version
6. **Screenshots**: If applicable

### Bug Report Template
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- Browser: [e.g., Chrome 91]
- OS: [e.g., macOS 12.0]
- Node.js: [e.g., 18.15.0]

## Additional Context
Add any other context about the problem here
```

## 💡 Feature Requests

We welcome feature suggestions! Please:

1. Check if the feature already exists or has been requested
2. Clearly describe the use case
3. Explain how it would benefit users
4. Consider implementation complexity
5. Be open to discussion and iteration

### Feature Request Template
```markdown
## Feature Summary
Brief summary of the feature

## Problem/Use Case
What problem does this solve? Who would benefit?

## Proposed Solution
Detailed description of the proposed feature

## Alternatives Considered
What other solutions did you consider?

## Additional Context
Mockups, examples, or other relevant information
```

## 🔄 Pull Request Process

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
- Follow the coding guidelines
- Add tests for new functionality
- Update documentation if needed
- Ensure all tests pass

3. **Test your changes**
```bash
npm run test
npm run type-check
npm run lint
```

4. **Commit your changes**
```bash
git commit -m "feat: add your feature description"
```

5. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

6. **Create a Pull Request**
- Use a clear title and description
- Reference any related issues
- Include screenshots if applicable
- Mark as draft if work in progress

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots
If applicable, add screenshots to help explain your changes
```

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://conventionalcommits.org/):

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Examples
```bash
feat: add expense splitting by percentage
fix: resolve calculation error in group balances
docs: update API documentation for invitations
style: format code according to prettier rules
refactor: extract expense calculation logic
perf: optimize database queries for analytics
test: add unit tests for invitation service
chore: update dependencies to latest versions
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

### Writing Tests

#### Unit Tests
```typescript
// Example unit test
import { calculateSplit } from '@/lib/calculations';

describe('calculateSplit', () => {
  it('should split amount equally among participants', () => {
    const result = calculateSplit({
      amount: 120,
      type: 'equal',
      participants: ['user1', 'user2', 'user3']
    });
    
    expect(result).toEqual([
      { userId: 'user1', amount: 40 },
      { userId: 'user2', amount: 40 },
      { userId: 'user3', amount: 40 }
    ]);
  });
});
```

#### Component Tests
```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import ExpenseModal from '@/components/modals/expense-modal';

describe('ExpenseModal', () => {
  it('should show validation errors for invalid input', async () => {
    render(<ExpenseModal isOpen onClose={jest.fn()} />);
    
    const submitButton = screen.getByRole('button', { name: /create expense/i });
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/description is required/i)).toBeInTheDocument();
  });
});
```

#### API Tests
```typescript
// Example API test
import request from 'supertest';
import { app } from '@/server';

describe('POST /api/expenses', () => {
  it('should create a new expense', async () => {
    const response = await request(app)
      .post('/api/expenses')
      .send({
        description: 'Dinner',
        amount: 50.00,
        currency: 'USD'
      })
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.description).toBe('Dinner');
  });
});
```

## 📚 Documentation

### Code Documentation
- Use JSDoc comments for functions and classes
- Document complex algorithms and business logic
- Include examples for public APIs
- Keep comments up-to-date with code changes

### API Documentation
- Document all endpoints with OpenAPI/Swagger
- Include request/response examples
- Describe error scenarios
- Update documentation with changes

## 🏷️ Release Process

1. **Version Bump**: Update version in `package.json`
2. **Changelog**: Update `CHANGELOG.md` with new features and fixes
3. **Testing**: Ensure all tests pass and manual testing is complete
4. **Tag Release**: Create a git tag for the release
5. **Deploy**: Deploy to production environment
6. **Announce**: Communicate the release to users

## 🆘 Getting Help

If you need help while contributing:

1. **Documentation**: Check the README and inline documentation
2. **Issues**: Search existing issues for similar problems
3. **Discussions**: Use GitHub Discussions for questions
4. **Discord**: Join our community Discord server
5. **Email**: Contact the maintainers directly

## 🎉 Recognition

Contributors will be:
- Listed in our `CONTRIBUTORS.md` file
- Mentioned in release notes for significant contributions
- Invited to our contributor Discord channel
- Eligible for contributor swag (coming soon!)

## 📄 License

By contributing to Spliq, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

Thank you for contributing to Spliq! 🚀