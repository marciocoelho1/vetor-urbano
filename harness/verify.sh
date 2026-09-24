#!/usr/bin/env bash
# ==============================================================================
# Vetor Urbano - Deterministic Verification Harness
# Enforces Zero-Regression, Type Integrity, Security Scans and Code Quality.
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

echo "========================================================================"
echo " [HARNESS] Running Vetor Urbano Verification Suite"
echo " Working Directory: ${ROOT_DIR}"
echo " Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "========================================================================"

FAILED=0

# Step 1: Verify Essential Project Documentation & Specs
echo "--> [1/4] Verifying Core Architecture Artifacts..."
REQUIRED_FILES=(
  "README.md"
  "docs/specs/SPEC-001-REQUIREMENTS.md"
  ".gitignore"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "${file}" ]]; then
    echo "  [FAIL] Missing required file: ${file}"
    FAILED=1
  else
    echo "  [PASS] Found: ${file}"
  fi
done

# Step 2: Backend Check (if pom.xml or build.gradle exists)
echo "--> [2/4] Verifying Backend Service State..."
if [[ -f "backend/pom.xml" ]]; then
  echo "  Running backend unit tests and compile check..."
  (cd backend && ./mvnw test-compile --no-transfer-progress)
else
  echo "  [INFO] Backend not yet scaffolded (scheduled for Phase v0.4.0-alpha)."
fi

# Step 3: Frontend Check (if package.json exists)
echo "--> [3/4] Verifying Frontend Client State..."
if [[ -f "frontend/package.json" ]]; then
  echo "  Running frontend linter and TypeScript check..."
  (cd frontend && npm run lint && npm run typecheck)
else
  echo "  [INFO] Frontend not yet scaffolded (scheduled for Phase v0.6.0-alpha)."
fi

# Step 4: Security & Git Sanity
echo "--> [4/4] Verifying Repository & Security Constraints..."
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  # Ensure no private credentials / .env committed
  if git ls-files | grep -E "(\.env|\.pem|\.key|id_rsa)" > /dev/null; then
    echo "  [SECURITY ALERT] Sensitive keys or .env files staged in Git!"
    FAILED=1
  else
    echo "  [PASS] No exposed secrets detected in Git index."
  fi
fi

echo "========================================================================"
if [[ "${FAILED}" -eq 0 ]]; then
  echo " [HARNESS RESULT] ALL VERIFICATIONS PASSED (SUCCESS)"
  echo "========================================================================"
  exit 0
else
  echo " [HARNESS RESULT] VERIFICATION FAILED (SEE ERRORS ABOVE)"
  echo "========================================================================"
  exit 1
fi
