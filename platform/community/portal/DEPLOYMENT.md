# Houston EJ-AI Community Portal - Deployment Guide

## 🚀 Quick Start

### Local Development
```bash
npm install
npm run dev
```
Visit http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

### Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📦 Deployment

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages via GitHub Actions.

#### Prerequisites
1. Enable GitHub Pages in repository settings
2. Set deployment source to "GitHub Actions"
3. Ensure `gh-pages` branch exists or will be created by workflow

#### Manual Deployment
```bash
# Set environment variable for GitHub Pages
export GITHUB_PAGES=true

# Build the project
npm run build

# Export static site
npx next export -o out

# Deploy (requires gh CLI or manual push to gh-pages branch)
gh-pages -d out
```

#### Automatic Deployment
Push to `main` branch triggers automatic deployment via GitHub Actions workflow (`.github/workflows/ci-cd.yml`).

### Custom Domain Setup
1. Add CNAME file to `public/` directory with your domain
2. Configure DNS records:
   - For apex domain: A records to GitHub Pages IPs
   - For subdomain: CNAME to `username.github.io`
3. Enable HTTPS in repository settings

## 🔒 Security

### Security Headers
Security headers are configured in:
- `next.config.js` - Base headers for all pages
- `middleware.ts` - Runtime security middleware

### Content Security Policy
CSP is configured to:
- Allow scripts only from same origin
- Allow styles from same origin and inline
- Allow images from same origin, data URIs, and HTTPS
- Block frame embedding except from same origin

### Environment Variables
Create `.env.local` for development:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=houston_ej_ai
DB_USER=houston
DB_PASSWORD=your_password_here

# API Keys (optional)
AIRNOW_API_KEY=your_key_here
PURPLEAIR_API_KEY=your_key_here
```

## 🧪 Testing

### Unit Tests (Jest)
```bash
npm test
npm run test:watch
npm run test:coverage
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
npm run test:e2e:ui      # Interactive mode
npm run test:e2e:headed  # See browser
```

### Validation Script
```bash
./validate-deployment.sh
```

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Testing**: Jest + Playwright
- **PWA**: Service Worker with Workbox
- **Privacy**: K-anonymity + Differential Privacy

### Project Structure
```
platform/community/portal/
├── pages/              # Next.js pages and API routes
│   ├── index.tsx       # Landing page
│   ├── data-portal.tsx # Data exploration
│   ├── simulator.tsx   # Policy simulator
│   └── api/            # API endpoints
├── components/         # React components
├── utils/              # Utility functions
│   ├── privacy.ts      # Privacy-preserving algorithms
│   ├── errorHandler.ts # Error handling
│   └── validation.ts   # Input validation
├── public/             # Static assets
│   ├── manifest.json   # PWA manifest
│   ├── sw.js           # Service worker
│   └── offline.html    # Offline fallback
├── tests/              # Test files
│   └── e2e/            # Playwright E2E tests
└── __tests__/          # Jest unit tests
```

## 📊 Features

### ✅ Implemented
- **Next.js 15**: Latest framework with React Server Components
- **TypeScript Strict Mode**: Full type safety
- **Accessibility**: WCAG 2.1 AA compliant, ARIA labels, keyboard navigation
- **PWA**: Installable, offline support, push notifications
- **Privacy Layer**: K-anonymity and differential privacy
- **Forensic Tools**: Evidence ledger, Title VI packet assembler
- **CI/CD**: Automated testing, building, and deployment
- **Security**: CSP, security headers, vulnerability scanning
- **Testing**: 70%+ coverage with Jest and Playwright

### 🔄 API Endpoints
- `GET /api/sensors/latest` - Latest sensor data
- `POST /api/compensation/claim` - Submit compensation claim
- `POST /api/privacy/aggregate` - Privacy-preserving aggregation
- `GET/POST /api/forensics/ledger` - Evidence ledger
- `POST /api/forensics/title-vi` - Generate Title VI packet

### 🎨 Pages
- `/` - Landing page with live data dashboard
- `/data-portal` - Searchable dataset catalog
- `/simulator` - Air quality policy simulator

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Type Errors
```bash
npm run type-check
```

### Test Failures
```bash
# Update snapshots
npm test -- -u

# Run specific test
npm test -- privacy.test.ts
```

### Service Worker Issues
```bash
# Clear browser cache and service workers
# Chrome: chrome://serviceworker-internals/
# Firefox: about:debugging#/runtime/this-firefox
```

## 📝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test: `npm test && npm run type-check`
3. Commit with meaningful message
4. Push and create pull request
5. Wait for CI/CD checks to pass

## 📄 License

See LICENSE file in repository root.

## 📞 Support

For issues or questions:
- Open GitHub issue
- Contact: DouglasMitchell@HoustonOilAirs.org

## 🔗 Links

- **Live Site**: https://houstonoilairs.org
- **Repository**: https://github.com/Senpai-Sama7/Houston-Oil-Airs
- **Documentation**: See `/docs` directory in repository root
