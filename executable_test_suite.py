#!/usr/bin/env python3
"""
Executable Test Suite - Houston Oil Airs Platform
Expert Panel Improvement: Gojko Adzic - Specification by Example

Converts manual verification commands into automated, executable specifications
with concrete examples and measurable outcomes.
"""

import subprocess
import json
import time
import requests
import sys
from dataclasses import dataclass
from typing import List, Dict, Optional
import yaml

@dataclass
class TestResult:
    feature_id: str
    feature_name: str
    status: str  # VERIFIED, UNVERIFIED, FAILED
    execution_time_ms: float
    expected_criteria: Dict
    actual_results: Dict
    evidence_file: Optional[str] = None
    error_message: Optional[str] = None

class SpecificationExecutor:
    """Executable specification framework with automated verification"""

    def __init__(self):
        self.results: List[TestResult] = []
        self.evidence_dir = "evidence"

    def execute_health_check(self) -> TestResult:
        """F1: Server Health Check - Quantitative criteria validation"""
        start_time = time.time()

        expected = {
            "response_time_ms": 100,
            "http_status": 200,
            "required_fields": ["status", "timestamp"],
            "status_value": "alive"
        }

        try:
            response = requests.get("http://localhost:3001/live", timeout=5)
            execution_time = (time.time() - start_time) * 1000

            # Validate response
            actual = {
                "response_time_ms": execution_time,
                "http_status": response.status_code,
                "content": response.json() if response.status_code == 200 else None
            }

            # Check acceptance criteria
            criteria_met = (
                execution_time <= expected["response_time_ms"] and
                response.status_code == expected["http_status"] and
                actual["content"] and
                actual["content"].get("status") == expected["status_value"] and
                "timestamp" in actual["content"]
            )

            status = "VERIFIED" if criteria_met else "UNVERIFIED"

            return TestResult(
                feature_id="F1",
                feature_name="Server Health Check",
                status=status,
                execution_time_ms=execution_time,
                expected_criteria=expected,
                actual_results=actual,
                evidence_file=f"{self.evidence_dir}/f1_health_check.json"
            )

        except Exception as e:
            return TestResult(
                feature_id="F1",
                feature_name="Server Health Check",
                status="FAILED",
                execution_time_ms=(time.time() - start_time) * 1000,
                expected_criteria=expected,
                actual_results={},
                error_message=str(e)
            )

    def execute_build_verification(self) -> TestResult:
        """F8: Vite Build Process - Quantitative quality gates"""
        start_time = time.time()

        expected = {
            "build_time_seconds": 15,
            "bundle_size_mb": 5,
            "exit_code": 0,
            "output_files_min": 3
        }

        try:
            # Execute build command
            result = subprocess.run(
                ["npm", "run", "build"],
                cwd="frontend",
                capture_output=True,
                text=True,
                timeout=30
            )

            execution_time = (time.time() - start_time) * 1000

            # Measure build artifacts
            dist_size = self._get_directory_size("frontend/dist")
            file_count = self._count_files("frontend/dist")

            actual = {
                "build_time_seconds": execution_time / 1000,
                "bundle_size_mb": dist_size / (1024 * 1024),
                "exit_code": result.returncode,
                "output_files_count": file_count,
                "stdout": result.stdout,
                "stderr": result.stderr
            }

            # Validate acceptance criteria
            criteria_met = (
                actual["build_time_seconds"] <= expected["build_time_seconds"] and
                actual["bundle_size_mb"] <= expected["bundle_size_mb"] and
                actual["exit_code"] == expected["exit_code"] and
                actual["output_files_count"] >= expected["output_files_min"]
            )

            status = "VERIFIED" if criteria_met else "UNVERIFIED"

            return TestResult(
                feature_id="F8",
                feature_name="Vite Build Process",
                status=status,
                execution_time_ms=execution_time,
                expected_criteria=expected,
                actual_results=actual,
                evidence_file=f"{self.evidence_dir}/f8_build_verification.json"
            )

        except Exception as e:
            return TestResult(
                feature_id="F8",
                feature_name="Vite Build Process",
                status="FAILED",
                execution_time_ms=(time.time() - start_time) * 1000,
                expected_criteria=expected,
                actual_results={},
                error_message=str(e)
            )

    def execute_failure_scenario(self, scenario_name: str) -> TestResult:
        """Execute operational failure scenarios (Nygard recommendation)"""
        start_time = time.time()

        if scenario_name == "database_connection_loss":
            expected = {
                "fallback_behavior": "Circuit breaker activation",
                "response_time_ms": 500,
                "cached_response": True
            }

            try:
                # Simulate database failure (if iptables available)
                subprocess.run(
                    ["sudo", "iptables", "-A", "OUTPUT", "-p", "tcp", "--dport", "5432", "-j", "DROP"],
                    capture_output=True,
                    timeout=5
                )

                # Test API response under failure
                response = requests.get(
                    "http://localhost:3001/api/research/visualization-data/network",
                    timeout=2
                )

                execution_time = (time.time() - start_time) * 1000

                actual = {
                    "response_time_ms": execution_time,
                    "http_status": response.status_code,
                    "response_data": response.json() if response.status_code == 200 else None
                }

                # Restore network access
                subprocess.run(
                    ["sudo", "iptables", "-D", "OUTPUT", "-p", "tcp", "--dport", "5432", "-j", "DROP"],
                    capture_output=True
                )

                return TestResult(
                    feature_id="F2_FAILURE",
                    feature_name="Database Connection Loss Scenario",
                    status="VERIFIED" if actual["response_time_ms"] <= expected["response_time_ms"] else "UNVERIFIED",
                    execution_time_ms=execution_time,
                    expected_criteria=expected,
                    actual_results=actual,
                    evidence_file=f"{self.evidence_dir}/f2_failure_scenario.json"
                )

            except Exception as e:
                return TestResult(
                    feature_id="F2_FAILURE",
                    feature_name="Database Connection Loss Scenario",
                    status="FAILED",
                    execution_time_ms=(time.time() - start_time) * 1000,
                    expected_criteria=expected,
                    actual_results={},
                    error_message=str(e)
                )

    def execute_integration_test(self) -> TestResult:
        """E2E_001: Frontend to Backend Data Flow (Crispin recommendation)"""
        start_time = time.time()

        expected = {
            "frontend_startup_time_s": 10,
            "backend_response_time_ms": 2000,
            "data_points_min": 1,
            "no_console_errors": True
        }

        try:
            # This would require actual browser automation
            # For now, simulate the test structure
            actual = {
                "test_executed": True,
                "simulation_only": True,
                "would_test": [
                    "Frontend server startup",
                    "Backend API connectivity",
                    "Data visualization rendering",
                    "Error-free operation"
                ]
            }

            execution_time = (time.time() - start_time) * 1000

            return TestResult(
                feature_id="E2E_001",
                feature_name="Frontend to Backend Data Flow",
                status="UNVERIFIED",  # Requires full browser automation
                execution_time_ms=execution_time,
                expected_criteria=expected,
                actual_results=actual,
                evidence_file=f"{self.evidence_dir}/e2e_001_simulation.json"
            )

        except Exception as e:
            return TestResult(
                feature_id="E2E_001",
                feature_name="Frontend to Backend Data Flow",
                status="FAILED",
                execution_time_ms=(time.time() - start_time) * 1000,
                expected_criteria=expected,
                actual_results={},
                error_message=str(e)
            )

    def run_all_tests(self) -> Dict:
        """Execute complete test suite with structured reporting"""
        print("🧪 Executing Houston Oil Airs Specification Test Suite")
        print("=" * 60)

        # Execute core feature tests
        tests = [
            self.execute_health_check,
            self.execute_build_verification,
            self.execute_integration_test
        ]

        for test_func in tests:
            print(f"Running {test_func.__name__}...")
            result = test_func()
            self.results.append(result)
            print(f"  Status: {result.status} ({result.execution_time_ms:.1f}ms)")

            # Save evidence
            if result.evidence_file:
                self._save_evidence(result)

        # Generate summary report
        summary = self._generate_summary()
        self._save_summary(summary)

        return summary

    def _get_directory_size(self, path: str) -> int:
        """Get directory size in bytes"""
        try:
            result = subprocess.run(["du", "-sb", path], capture_output=True, text=True)
            if result.returncode == 0:
                return int(result.stdout.split()[0])
        except:
            pass
        return 0

    def _count_files(self, path: str) -> int:
        """Count files in directory"""
        try:
            result = subprocess.run(["find", path, "-type", "f"], capture_output=True, text=True)
            if result.returncode == 0:
                return len(result.stdout.strip().split('\n'))
        except:
            pass
        return 0

    def _save_evidence(self, result: TestResult):
        """Save test evidence to structured file"""
        evidence_data = {
            "feature_id": result.feature_id,
            "feature_name": result.feature_name,
            "execution_timestamp": time.time(),
            "status": result.status,
            "execution_time_ms": result.execution_time_ms,
            "expected_criteria": result.expected_criteria,
            "actual_results": result.actual_results,
            "error_message": result.error_message
        }

        try:
            with open(result.evidence_file, 'w') as f:
                json.dump(evidence_data, f, indent=2)
        except Exception as e:
            print(f"Warning: Could not save evidence file {result.evidence_file}: {e}")

    def _generate_summary(self) -> Dict:
        """Generate test execution summary"""
        verified = sum(1 for r in self.results if r.status == "VERIFIED")
        unverified = sum(1 for r in self.results if r.status == "UNVERIFIED")
        failed = sum(1 for r in self.results if r.status == "FAILED")
        total = len(self.results)

        return {
            "execution_timestamp": time.time(),
            "total_tests": total,
            "verified": verified,
            "unverified": unverified,
            "failed": failed,
            "success_rate": f"{(verified/total*100):.1f}%" if total > 0 else "0%",
            "total_execution_time_ms": sum(r.execution_time_ms for r in self.results),
            "test_results": [
                {
                    "feature_id": r.feature_id,
                    "feature_name": r.feature_name,
                    "status": r.status,
                    "execution_time_ms": r.execution_time_ms
                }
                for r in self.results
            ]
        }

    def _save_summary(self, summary: Dict):
        """Save test execution summary"""
        try:
            with open(f"{self.evidence_dir}/test_execution_summary.json", 'w') as f:
                json.dump(summary, f, indent=2)

            print("\n📊 Test Execution Summary")
            print("-" * 30)
            print(f"Total Tests: {summary['total_tests']}")
            print(f"Verified: {summary['verified']}")
            print(f"Unverified: {summary['unverified']}")
            print(f"Failed: {summary['failed']}")
            print(f"Success Rate: {summary['success_rate']}")
            print(f"Total Time: {summary['total_execution_time_ms']:.1f}ms")

        except Exception as e:
            print(f"Warning: Could not save summary: {e}")

if __name__ == "__main__":
    executor = SpecificationExecutor()
    summary = executor.run_all_tests()

    # Exit with appropriate code
    if summary['failed'] > 0:
        sys.exit(1)
    elif summary['verified'] == summary['total_tests']:
        sys.exit(0)
    else:
        sys.exit(2)  # Some tests unverified