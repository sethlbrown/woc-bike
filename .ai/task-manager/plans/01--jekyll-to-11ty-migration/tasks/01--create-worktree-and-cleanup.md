---
id: 1
group: "cleanup"
dependencies: []
status: "completed"
created: "2026-03-06"
skills: ["bash"]
---
# Create Migration Worktree and Clean Up Orphaned Files

## Objective
Create the `migrate/11ty-netlify` git branch and worktree to isolate all Phase 1 work from `main`. Then remove all orphaned, legacy, and Firebase-related files as the first commit on that branch — NOT on `main`. This ensures `main` remains fully Jekyll-buildable and Firebase-deployable at all times during the migration window, allowing emergency content fixes to be shipped without interruption.

## Skills Required
- `bash`: git worktree, git rm, branch management

## Acceptance Criteria
- [ ] `migrate/11ty-netlify` branch created from current `main`
- [ ] Git worktree created at `../woc-bike-11ty` (or a sibling directory of choice) pointing to the migration branch
- [ ] All cleanup file removals committed to `migrate/11ty-netlify` branch, **not** to `main`
- [ ] `main` branch: no files changed; Jekyll builds and Firebase deploy still work from `main`
- [ ] The following files removed from the migration branch:
  - `.07-re-homing-project.md` (hidden draft)
  - `.25-calendar.html` (hidden draft)
  - `.babelrc` (Babel config for Gulp)
  - `.ruby-version`
  - `Gemfile` and `Gemfile.lock`
  - `firebase.json`
  - `.firebaserc`
  - `.firebase/` directory
  - `_data/firebase_config.yml`
  - `_includes/firebase-init.html`
  - `_config_development.yml`
  - `.jekyll-cache/` directory (if tracked in git)
  - `.jekyll-metadata` (if tracked in git)
- [ ] `gulpfile.babel.js` and `tailwind.config.js` are **NOT** removed in this task (they are removed in Tasks 7 and 12 respectively)
- [ ] The GitHub Actions workflow file is **NOT** changed in this task (updated in Task 8)
- [ ] `.gitignore` updated to include `.jekyll-cache/` and `.jekyll-metadata` if not already present
- [ ] A cleanup commit is made on the migration branch before Task 2 work begins

## Technical Requirements
- Git worktrees allow two working directories sharing the same git history
- The worktree at `../woc-bike-11ty` is a separate directory on disk — changes there do not affect the `main` checkout in `/woc-bike/`
- If an emergency fix is needed during migration: work in the original `/woc-bike/` directory (on `main`), commit + push + deploy from there; then cherry-pick or merge the fix into the migration branch if needed
- `git rm` removes files from git tracking; `git rm -r` for directories

## Input Dependencies
None — this is the first task.

## Output Artifacts
- `migrate/11ty-netlify` branch (created from `main`)
- Worktree at `../woc-bike-11ty/`
- Clean migration branch with orphaned/legacy files removed (Firebase, Ruby artifacts, hidden drafts)
- `main` branch: unchanged, fully operational

## Implementation Notes

<details>
<summary>Step-by-step commands</summary>

```bash
# In the original /woc-bike/ directory (on main)

# 1. Create branch and worktree
git checkout main
git pull origin main
git checkout -b migrate/11ty-netlify
git worktree add ../woc-bike-11ty migrate/11ty-netlify

# 2. Switch to the worktree for all migration work
cd ../woc-bike-11ty

# 3. Remove orphaned/legacy files from the migration branch
git rm .07-re-homing-project.md .25-calendar.html
git rm .babelrc .ruby-version Gemfile Gemfile.lock
git rm firebase.json .firebaserc
git rm -r .firebase/ || echo "not tracked"
git rm _data/firebase_config.yml
git rm _includes/firebase-init.html
git rm _config_development.yml
git rm -r .jekyll-cache/ || echo "not tracked"
git rm .jekyll-metadata || echo "not tracked"

# 4. Update .gitignore
cat >> .gitignore << 'EOF'
.jekyll-cache/
.jekyll-metadata
EOF
git add .gitignore

# 5. Commit the cleanup
git commit -m "chore: remove orphaned files — Ruby, Firebase, draft pages (migration branch only)"

# 6. Verify main is untouched
cd ../woc-bike
git status  # Should show no changes
git log --oneline -3  # Main commit history unchanged
```

**Emergency fix workflow** (if content change needed during migration):
```bash
# Work in the original /woc-bike/ directory (main branch)
cd ../woc-bike
# Make changes, commit, push to main
git add -p && git commit -m "fix: urgent content update"
git push origin main
# GitHub Actions deploys to Firebase from main automatically

# Then bring the fix into the migration branch
cd ../woc-bike-11ty
git cherry-pick <commit-hash>
# Or: git merge main (if multiple fixes)
```

**To abandon the migration** (if Phase 1 is blocked):
```bash
# From original woc-bike/ directory
git worktree remove ../woc-bike-11ty
git branch -D migrate/11ty-netlify
# main is completely unaffected
```
</details>
