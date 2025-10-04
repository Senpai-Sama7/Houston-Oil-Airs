#!/bin/bash
# Deployment validation script for Houston EJ-AI Platform
# Validates build output and deployment readiness

set -e

echo "🔍 Houston EJ-AI Platform - Deployment Validation"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to report error
error() {
  echo -e "${RED}✗ ERROR: $1${NC}"
  ERRORS=$((ERRORS + 1))
}

# Function to report warning
warning() {
  echo -e "${YELLOW}⚠ WARNING: $1${NC}"
  WARNINGS=$((WARNINGS + 1))
}

# Function to report success
success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Check if build directory exists
echo "1. Checking build output..."
if [ ! -d ".next" ]; then
  error "Build directory (.next) not found. Run 'npm run build' first."
else
  success "Build directory exists"
fi

# Check for critical files
echo ""
echo "2. Checking critical files..."
CRITICAL_FILES=(
  "package.json"
  "next.config.js"
  "tsconfig.json"
  "public/manifest.json"
  "public/sw.js"
  "public/offline.html"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    success "$file exists"
  else
    error "$file not found"
  fi
done

# Check TypeScript compilation
echo ""
echo "3. Running TypeScript type check..."
if npm run type-check > /dev/null 2>&1; then
  success "TypeScript compilation successful"
else
  error "TypeScript compilation failed"
fi

# Check for security vulnerabilities
echo ""
echo "4. Checking for security vulnerabilities..."
if npm audit --audit-level=high --production > /dev/null 2>&1; then
  success "No high/critical vulnerabilities found"
else
  warning "Security vulnerabilities detected (run 'npm audit' for details)"
fi

# Check environment variables
echo ""
echo "5. Checking environment variables..."
if [ -n "$GITHUB_PAGES" ]; then
  success "GITHUB_PAGES environment variable set"
else
  warning "GITHUB_PAGES not set - deployment may use incorrect base path"
fi

# Check manifest.json validity
echo ""
echo "6. Validating PWA manifest..."
if [ -f "public/manifest.json" ]; then
  if command -v jq &> /dev/null; then
    if jq empty public/manifest.json 2>/dev/null; then
      success "manifest.json is valid JSON"
    else
      error "manifest.json contains invalid JSON"
    fi
  else
    warning "jq not installed - cannot validate manifest.json format"
  fi
fi

# Check for required pages
echo ""
echo "7. Checking required pages..."
REQUIRED_PAGES=(
  "pages/index.tsx"
  "pages/data-portal.tsx"
  "pages/simulator.tsx"
  "pages/_document.tsx"
)

for page in "${REQUIRED_PAGES[@]}"; do
  if [ -f "$page" ]; then
    success "$page exists"
  else
    error "$page not found"
  fi
done

# Check for API endpoints
echo ""
echo "8. Checking API endpoints..."
API_ENDPOINTS=(
  "pages/api/sensors/latest.ts"
  "pages/api/compensation/claim.ts"
  "pages/api/privacy/aggregate.ts"
  "pages/api/forensics/ledger.ts"
  "pages/api/forensics/title-vi.ts"
)

for endpoint in "${API_ENDPOINTS[@]}"; do
  if [ -f "$endpoint" ]; then
    success "$endpoint exists"
  else
    error "$endpoint not found"
  fi
done

# Summary
echo ""
echo "=================================================="
echo "Validation Summary"
echo "=================================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! Ready for deployment.${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ $WARNINGS warning(s) found. Review before deploying.${NC}"
  exit 0
else
  echo -e "${RED}✗ $ERRORS error(s) and $WARNINGS warning(s) found.${NC}"
  echo -e "${RED}Fix errors before deploying.${NC}"
  exit 1
fi
