# Contributing to Houston Oil Airs

Thank you for your interest in contributing to Houston Oil Airs! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/Houston-Oil-Airs.git`
3. **Set up** development environment: `make dev-setup`
4. **Validate** your setup: `make validate`

## 🛠️ Development Workflow

### Prerequisites
- Node.js 18+
- Docker
- kubectl
- Helm 3+
- Terraform (optional)

### Local Development
```bash
# Set up development environment
make dev-setup

# Start development servers
cd frontend && npm run dev
cd backend && ./start.sh

# Run tests
make test

# Validate configurations
make validate
```

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   make test
   make validate
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

## 📋 Contribution Types

### 🐛 Bug Reports
- Use the bug report template
- Include steps to reproduce
- Provide environment details
- Include relevant logs

### ✨ Feature Requests
- Use the feature request template
- Explain the use case
- Provide implementation ideas
- Consider backward compatibility

### 📖 Documentation
- Fix typos and improve clarity
- Add examples and use cases
- Update outdated information
- Improve API documentation

### 🔧 Code Contributions
- Follow coding standards
- Add tests for new features
- Update documentation
- Ensure CI/CD passes

## 🎯 Coding Standards

### Frontend (React/TypeScript)
- Use TypeScript for type safety
- Follow React best practices
- Use ESLint and Prettier
- Write unit tests with Jest

### Backend (Node.js/Java)
- Use consistent naming conventions
- Write comprehensive tests
- Follow REST API standards
- Document API endpoints

### Infrastructure (Kubernetes/Terraform)
- Use Helm for Kubernetes deployments
- Follow Terraform best practices
- Document infrastructure changes
- Test with multiple environments

### Docker
- Use multi-stage builds
- Minimize image size
- Follow security best practices
- Document Dockerfile changes

## 🧪 Testing Guidelines

### Unit Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend/node-server && npm test
cd backend/java-services && mvn test
```

### Integration Tests
```bash
make test
```

### E2E Tests
```bash
cd frontend && npm run test:e2e
```

### Configuration Validation
```bash
make validate
```

## 📦 Deployment Testing

### Local Testing
```bash
# Build images
make build

# Deploy locally
./deploy.sh dev
```

### Staging Testing
```bash
./deploy.sh staging
```

## 🔒 Security Guidelines

- Never commit secrets or credentials
- Use environment variables for configuration
- Follow OWASP security practices
- Scan dependencies for vulnerabilities
- Use secure communication protocols

## 📝 Commit Message Format

Use conventional commits:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Examples:
```
feat(frontend): add 3D visualization component
fix(backend): resolve memory leak in data processing
docs(readme): update deployment instructions
```

## 🔄 Pull Request Process

1. **Ensure CI/CD passes**
2. **Update documentation** if needed
3. **Add tests** for new functionality
4. **Request review** from maintainers
5. **Address feedback** promptly
6. **Squash commits** before merge

### PR Checklist
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Security considerations addressed
- [ ] Performance impact considered

## 🏗️ Architecture Guidelines

### Adding New Services
1. Create Helm templates
2. Add Kustomize overlays
3. Update Terraform modules
4. Add monitoring configuration
5. Document service interactions

### Database Changes
1. Use migrations for schema changes
2. Consider backward compatibility
3. Update backup procedures
4. Test with production data volume

### API Changes
1. Version APIs appropriately
2. Maintain backward compatibility
3. Update OpenAPI documentation
4. Consider rate limiting impact

## 🎨 UI/UX Guidelines

- Follow Material Design principles
- Ensure accessibility compliance
- Test on multiple devices/browsers
- Maintain consistent styling
- Optimize for performance

## 📊 Performance Guidelines

- Monitor bundle sizes
- Optimize database queries
- Use caching appropriately
- Consider CDN for static assets
- Profile critical code paths

## 🌍 Internationalization

- Use i18n for user-facing text
- Support RTL languages
- Consider cultural differences
- Test with different locales

## 📈 Monitoring and Observability

- Add metrics for new features
- Include structured logging
- Create relevant dashboards
- Set up appropriate alerts

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help newcomers get started
- Share knowledge and best practices
- Participate in discussions
- Follow the Code of Conduct

## 📞 Getting Help

- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Email**: support@houstonoilairs.org
- **Documentation**: Check existing docs first

## 🏆 Recognition

Contributors are recognized in:
- Release notes
- Contributors section
- Special mentions for significant contributions

Thank you for contributing to Houston Oil Airs! 🚀