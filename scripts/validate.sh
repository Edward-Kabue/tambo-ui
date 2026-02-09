#!/bin/bash
# validate.sh — Quick tsc validation for generated components
set -euo pipefail

FILE="${1:?Usage: validate.sh <path-to-tsx>}"
cd "$(dirname "$0")/../preview"

echo "Validating: $FILE"
npx tsc --noEmit --esModuleInterop --jsx react-jsx \
  --moduleResolution bundler --skipLibCheck "$FILE"
echo "✅ No errors."
