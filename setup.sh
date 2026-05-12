#!/bin/bash
# Med Tracker — one-time git setup script
# Run this from the med-tracker folder: bash setup.sh

set -e
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

echo ""
echo "🏥  Med Tracker — Git Setup"
echo "================================"
echo ""

# Init git
if [ ! -d ".git" ]; then
  git init
  git branch -m main
  echo "✅  Initialized git repo"
else
  echo "ℹ️   Git repo already initialized"
fi

# Stage and commit
git add -A
git commit -m "Initial commit: bupropion med tracker" 2>/dev/null || \
  echo "ℹ️   Nothing new to commit (already up to date)"

echo ""
echo "✅  All files committed to 'main' branch"
echo ""
echo "─────────────────────────────────────────"
echo "NEXT STEPS"
echo "─────────────────────────────────────────"
echo ""
echo "1. Create a new GitHub repo at:"
echo "   https://github.com/new"
echo "   Name it: med-tracker"
echo "   (Leave it empty — don't add README/license)"
echo ""
echo "2. Then run these two commands"
echo "   (replace YOUR_USERNAME with your GitHub handle):"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/med-tracker.git"
echo "   git push -u origin main"
echo ""
echo "3. Go to https://vercel.com/new"
echo "   → Import your med-tracker repo"
echo "   → Click Deploy (no env vars needed)"
echo ""
echo "Done! 🚀 Vercel will auto-deploy on every push."
echo ""
