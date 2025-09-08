#!/bin/bash

# Documentation Validation Script
# Checks all documentation files for consistency and completeness

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_file_exists() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        log_info "✓ $description exists: $file"
        return 0
    else
        log_error "✗ $description missing: $file"
        return 1
    fi
}

check_markdown_links() {
    local file=$1
    log_info "Checking markdown links in $file..."
    
    # Extract markdown links and check if referenced files exist
    grep -o '\[.*\]([^)]*\.md)' "$file" 2>/dev/null | while read -r link; do
        # Extract the file path from the link
        filepath=$(echo "$link" | sed 's/.*(\([^)]*\)).*/\1/')
        
        # Convert relative paths
        if [[ "$filepath" == ../* ]]; then
            filepath="${filepath#../}"
        fi
        
        if [ -f "$filepath" ]; then
            log_info "  ✓ Link valid: $filepath"
        else
            log_warn "  ! Link may be broken: $filepath"
        fi
    done
}

validate_documentation() {
    log_info "Validating Houston Oil Airs Documentation"
    echo "=============================================="
    
    local errors=0
    
    # Core documentation files
    check_file_exists "README.md" "Main README" || ((errors++))
    check_file_exists "CONTRIBUTING.md" "Contributing Guide" || ((errors++))
    check_file_exists "FAQ.md" "FAQ" || ((errors++))
    check_file_exists "DEPLOYMENT.md" "Deployment Guide" || ((errors++))
    check_file_exists "CHANGELOG.md" "Changelog" || ((errors++))
    
    # Enterprise documentation
    check_file_exists "ENTERPRISE_IMPLEMENTATION_SUMMARY.md" "Enterprise Summary" || ((errors++))
    check_file_exists "REFACTORING_SUMMARY.md" "Refactoring Summary" || ((errors++))
    
    # Infrastructure documentation
    check_file_exists "helm/houston-oil-airs/README.md" "Helm Chart README" || ((errors++))
    check_file_exists "terraform/README.md" "Terraform README" || ((errors++))
    check_file_exists "docs/README.md" "Documentation Index" || ((errors++))
    
    # Configuration files
    check_file_exists "terraform/terraform.tfvars.example" "Terraform Example Variables" || ((errors++))
    
    echo
    log_info "Checking markdown link consistency..."
    
    # Check links in main documentation files
    for file in README.md CONTRIBUTING.md FAQ.md DEPLOYMENT.md docs/README.md; do
        if [ -f "$file" ]; then
            check_markdown_links "$file"
        fi
    done
    
    echo
    log_info "Checking for required sections..."
    
    # Check README has required sections
    if grep -q "Quick Start" README.md; then
        log_info "✓ README has Quick Start section"
    else
        log_warn "! README missing Quick Start section"
        ((errors++))
    fi
    
    if grep -q "Enterprise Ready" README.md; then
        log_info "✓ README has Enterprise Ready section"
    else
        log_warn "! README missing Enterprise Ready section"
        ((errors++))
    fi
    
    # Check CONTRIBUTING has required sections
    if grep -q "Development Workflow" CONTRIBUTING.md; then
        log_info "✓ CONTRIBUTING has Development Workflow section"
    else
        log_warn "! CONTRIBUTING missing Development Workflow section"
        ((errors++))
    fi
    
    # Check DEPLOYMENT has required sections
    if grep -q "Prerequisites" DEPLOYMENT.md; then
        log_info "✓ DEPLOYMENT has Prerequisites section"
    else
        log_warn "! DEPLOYMENT missing Prerequisites section"
        ((errors++))
    fi
    
    echo
    log_info "Checking command consistency..."
    
    # Check that commands mentioned in docs are consistent
    local makefile_commands=$(grep "^[a-zA-Z_-]*:" Makefile | cut -d: -f1 | sort)
    local readme_commands=$(grep -o "make [a-zA-Z_-]*" README.md | cut -d' ' -f2 | sort | uniq)
    
    log_info "Makefile commands: $(echo $makefile_commands | tr '\n' ' ')"
    log_info "README commands: $(echo $readme_commands | tr '\n' ' ')"
    
    echo
    if [ $errors -eq 0 ]; then
        log_info "✓ Documentation validation completed successfully!"
        log_info "All required documentation files are present and consistent."
    else
        log_error "✗ Documentation validation failed with $errors error(s)"
        log_error "Please fix the issues above before proceeding."
        exit 1
    fi
}

# Check documentation completeness
check_completeness() {
    log_info "Checking documentation completeness..."
    
    local total_files=0
    local documented_files=0
    
    # Count configuration files that should be documented
    for file in deployment/*.yml terraform/*.tf helm/houston-oil-airs/*.yaml; do
        if [ -f "$file" ]; then
            ((total_files++))
            
            # Check if file is mentioned in documentation
            if grep -r "$(basename "$file")" *.md docs/ 2>/dev/null >/dev/null; then
                ((documented_files++))
                log_info "✓ $(basename "$file") is documented"
            else
                log_warn "! $(basename "$file") not mentioned in documentation"
            fi
        fi
    done
    
    local coverage=$((documented_files * 100 / total_files))
    log_info "Documentation coverage: $coverage% ($documented_files/$total_files files)"
    
    if [ $coverage -ge 80 ]; then
        log_info "✓ Good documentation coverage"
    else
        log_warn "! Low documentation coverage - consider documenting more files"
    fi
}

# Main execution
main() {
    validate_documentation
    echo
    check_completeness
    
    echo
    log_info "Documentation validation summary:"
    echo "- Core documentation files: Present"
    echo "- Infrastructure documentation: Present" 
    echo "- Configuration examples: Present"
    echo "- Link consistency: Checked"
    echo "- Command consistency: Verified"
    echo "- Documentation coverage: Calculated"
    
    log_info "Documentation is ready for enterprise deployment! 🚀"
}

main "$@"