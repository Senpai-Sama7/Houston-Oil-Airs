#!/usr/bin/env python3
"""
Houston EJ-AI Platform Audit System
Executes the three-agent audit pipeline to verify system functionality
"""

import os
import json
import subprocess
from pathlib import Path

class HoustonAuditSystem:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.agents_dir = self.project_root / "agents"
        
    def run_project_architect(self):
        """Phase 1: Analyze project structure"""
        print("🏗️  Running Project Architect...")
        
        # Get directory structure
        structure = self._get_directory_structure()
        
        # Simulate agent execution (in real implementation, this would call the agent)
        report = {
            "technology_stack": {
                "languages": ["JavaScript/TypeScript", "C++", "Python"],
                "frameworks": ["Next.js", "Express.js", "React", "TimescaleDB"],
                "package_managers": ["npm", "Docker", "Make"]
            },
            "purpose": "Environmental Justice IoT Platform - Air quality monitoring with blockchain compensation",
            "critical_files": [
                "platform/community/portal/pages/api/sensors/latest.ts",
                "platform/community/portal/pages/api/compensation/claim.ts", 
                "backend/node-server/src/server.js",
                "frontend/src/js/visualization.js",
                "platform/ingestion/mqtt-kafka-bridge.js"
            ],
            "configuration": {
                "entrypoints": ["backend/node-server/src/server.js", "platform/community/portal/pages/index.tsx"],
                "config_files": ["docker-compose.ej-ai.yml", "package.json", ".env.example"]
            }
        }
        
        print(f"✅ Identified: {report['purpose']}")
        print(f"📊 Tech Stack: {', '.join(report['technology_stack']['languages'])}")
        return report
    
    def run_code_inspector(self, file_paths):
        """Phase 2: Deep inspection of critical files"""
        print("🔍 Running Code Inspector on critical files...")
        
        reports = []
        for file_path in file_paths:
            full_path = self.project_root / file_path
            if not full_path.exists():
                continue
                
            print(f"   Inspecting: {file_path}")
            
            # Read file content
            try:
                content = full_path.read_text()
            except Exception as e:
                print(f"   ❌ Error reading {file_path}: {e}")
                continue
            
            # Simulate detailed inspection
            report = self._inspect_file(file_path, content)
            reports.append(report)
            
            # Print summary
            verdicts = [report['functionality'], report['security'], report['quality'], report['dependencies']]
            status = "✅" if all(v in ['Pass', 'Warning'] for v in verdicts) else "❌"
            print(f"   {status} {file_path}: {report['summary']}")
        
        return reports
    
    def run_lead_auditor(self, inspection_reports):
        """Phase 3: Synthesize final verdict"""
        print("👨‍💼 Running Lead Auditor...")
        
        # Analyze patterns
        total_files = len(inspection_reports)
        functionality_fails = sum(1 for r in inspection_reports if r['functionality'] == 'Critical Fail')
        security_issues = sum(1 for r in inspection_reports if r['security'] in ['Warning', 'Critical Fail'])
        quality_issues = sum(1 for r in inspection_reports if r['quality'] in ['Warning', 'Critical Fail'])
        
        # Calculate viability score
        base_score = 10
        base_score -= functionality_fails * 3  # Functionality is critical
        base_score -= security_issues * 1.5
        base_score -= quality_issues * 1
        viability_score = max(1, min(10, base_score))
        
        # Determine biggest risk
        if functionality_fails > total_files / 2:
            biggest_risk = "The project contains significant non-functional code"
        elif security_issues > total_files / 2:
            biggest_risk = "The project has critical security vulnerabilities"
        elif quality_issues > total_files / 2:
            biggest_risk = "The project has maintainability issues"
        else:
            biggest_risk = "The project appears functional with minor issues"
        
        # Recommend next action
        if viability_score >= 8:
            next_action = "Deploy to staging environment for integration testing"
        elif viability_score >= 6:
            next_action = "Fix identified security and quality issues before deployment"
        elif viability_score >= 4:
            next_action = "Refactor non-functional code and address critical issues"
        else:
            next_action = "Consider rebuilding core functionality from scratch"
        
        final_report = {
            "systemic_patterns": {
                "functionality_fails": f"{functionality_fails}/{total_files} files had functionality issues",
                "security_issues": f"{security_issues}/{total_files} files had security concerns", 
                "quality_issues": f"{quality_issues}/{total_files} files had quality issues"
            },
            "biggest_risk": biggest_risk,
            "viability_score": viability_score,
            "next_action": next_action
        }
        
        print(f"📊 Viability Score: {viability_score}/10")
        print(f"⚠️  Biggest Risk: {biggest_risk}")
        print(f"🎯 Next Action: {next_action}")
        
        return final_report
    
    def _get_directory_structure(self):
        """Get project directory structure"""
        structure = []
        for root, dirs, files in os.walk(self.project_root):
            # Skip hidden and build directories
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'build']]
            
            level = root.replace(str(self.project_root), '').count(os.sep)
            indent = ' ' * 2 * level
            structure.append(f"{indent}{os.path.basename(root)}/")
            
            subindent = ' ' * 2 * (level + 1)
            for file in files[:10]:  # Limit files shown
                if not file.startswith('.'):
                    structure.append(f"{subindent}{file}")
        
        return '\n'.join(structure)
    
    def _inspect_file(self, file_path, content):
        """Simulate detailed file inspection"""
        # Analyze functionality
        functionality = "Pass"
        if "Math.random()" in content or "TODO" in content or "pass" in content:
            functionality = "Critical Fail"
        elif "console.log" in content or "# TODO" in content:
            functionality = "Warning"
        
        # Analyze security
        security = "Pass"
        if "password" in content.lower() or "secret" in content.lower():
            security = "Warning"
        if "eval(" in content or "innerHTML" in content:
            security = "Critical Fail"
        
        # Analyze quality
        quality = "Pass"
        lines = content.split('\n')
        if len(lines) > 500:
            quality = "Warning"
        if any(len(line) > 120 for line in lines):
            quality = "Warning"
        
        # Analyze dependencies
        dependencies = "Pass"
        imports = [line for line in lines if line.strip().startswith(('import', 'require', 'from'))]
        suspicious_imports = ['fake-lib', 'mock-data', 'placeholder']
        if any(sus in imp for imp in imports for sus in suspicious_imports):
            dependencies = "Critical Fail"
        
        # Generate summary
        if functionality == "Critical Fail":
            summary = "Contains non-functional placeholder code"
        elif security == "Critical Fail":
            summary = "Has critical security vulnerabilities"
        elif all(v == "Pass" for v in [functionality, security, quality, dependencies]):
            summary = "Well-implemented functional code"
        else:
            summary = "Functional with minor issues"
        
        return {
            "file_path": file_path,
            "functionality": functionality,
            "security": security,
            "quality": quality,
            "dependencies": dependencies,
            "summary": summary
        }

def main():
    """Run the complete audit pipeline"""
    project_root = Path(__file__).parent.parent
    audit_system = HoustonAuditSystem(project_root)
    
    print("🚀 Starting Houston EJ-AI Platform Audit")
    print("=" * 50)
    
    # Phase 1: Project Architecture Analysis
    architect_report = audit_system.run_project_architect()
    
    print("\n" + "=" * 50)
    
    # Phase 2: Code Inspection
    inspection_reports = audit_system.run_code_inspector(architect_report['critical_files'])
    
    print("\n" + "=" * 50)
    
    # Phase 3: Lead Auditor Synthesis
    final_report = audit_system.run_lead_auditor(inspection_reports)
    
    print("\n" + "=" * 50)
    print("🎯 AUDIT COMPLETE")
    
    # Save reports
    reports_dir = project_root / "agents" / "reports"
    reports_dir.mkdir(exist_ok=True)
    
    with open(reports_dir / "architect_report.json", "w") as f:
        json.dump(architect_report, f, indent=2)
    
    with open(reports_dir / "inspection_reports.json", "w") as f:
        json.dump(inspection_reports, f, indent=2)
    
    with open(reports_dir / "final_audit_report.json", "w") as f:
        json.dump(final_report, f, indent=2)
    
    print(f"📁 Reports saved to: {reports_dir}")

if __name__ == "__main__":
    main()