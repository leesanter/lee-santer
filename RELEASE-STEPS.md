# One-time: mark repo as a GitHub template (UI)
# Settings → Template repository → ✅

# Tag the stable baseline
git add -A
git commit -m "chore: baseline stable starter (v1.0.0)"
git tag -a v1.0.0 -m "Stable baseline"
git push origin main --follow-tags
git push origin v1.0.0

# Cut a new release later
# 1. Update CHANGELOG.md
# 2. Bump version in package.json (optional)
git tag -a v1.1.0 -m "Feature/bugfix summary"
git push origin v1.1.0
