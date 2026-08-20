---
name: changelog
description: Update CHANGELOG.md with git history before merging
---

# Changelog Management Skill

This skill updates the project's CHANGELOG.md file by examining git commits since the last release and organizing them by date. Use this before merging to ensure the changelog reflects all work completed.

## What This Skill Does

1. **Reads** the existing CHANGELOG.md (if it exists)
2. **Examines** git history to find new commits
3. **Extracts** commit messages and dates
4. **Organizes** commits by date with descriptive categories
5. **Updates** the [Unreleased] section with new entries
6. **Preserves** previous release notes

## How to Use

### Automatic (Recommended)
When ready to merge or tag a release, invoke this skill:

```bash
/changelog
```

Then:
1. Review the extracted commits
2. Agree to the proposed changes
3. Claude will update CHANGELOG.md automatically

### Manual Update
If you need to manually update the changelog:

1. Review git log: `git log --oneline [base-branch]..HEAD`
2. Organize commits by category (Added, Changed, Fixed, Removed)
3. Edit CHANGELOG.md in the [Unreleased] section
4. Use date headings for significant milestones

## Changelog Format

The changelog uses this structure:

```markdown
# Changelog

## [Unreleased]

### Added
- Feature 1
- Feature 2

### Changed
- Enhancement 1
- Enhancement 2

### Fixed
- Bug fix 1

## [1.0.0] - 2026-08-20

### Added
- ...
```

## Categories to Use

- **Added**: New features, new test files, new documentation
- **Changed**: Modifications to existing features, refactoring, updates
- **Fixed**: Bug fixes, corrections
- **Removed**: Deprecated features, deleted functionality
- **Security**: Security-related changes or fixes
- **Deprecated**: Features scheduled for removal

## Commit Message Best Practices

For easier changelog generation, write commit messages following this pattern:

```
<type>: <description>

[optional body]
```

Where type is one of:
- `feat:` - A new feature (maps to Added)
- `fix:` - A bug fix (maps to Fixed)
- `docs:` - Documentation changes
- `refactor:` - Code refactoring (maps to Changed)
- `test:` - Test additions/changes
- `chore:` - Build, CI, dependencies
- `style:` - Code style (formatting, etc)
- `perf:` - Performance improvements

Example:
```
feat: Add responsive design to all pages

- Added media queries for mobile (320px)
- Added touch-friendly tap targets (44px)
- Updated dashboard for tablet support
```

## Workflow

### Before Merging to Main
1. Finalize all commits on your branch
2. Run: `/changelog`
3. Review the proposed updates
4. Commit the updated CHANGELOG.md
5. Create/update pull request with changelog changes

### Before Tagging Release
1. Ensure all PRs are merged to main
2. Run: `/changelog`
3. Rename [Unreleased] section to the version number (e.g., [1.1.0])
4. Add release date: `## [1.1.0] - 2026-09-01`
5. Commit: `git commit -m "Bump version to 1.1.0 and update changelog"`
6. Tag: `git tag -a v1.1.0 -m "Release version 1.1.0"`

## What Gets Extracted

The skill extracts:
- Commit hash (short form)
- Commit date
- Commit message
- Categorizes by type (feat, fix, docs, etc.)
- Groups by date with most recent first

## Filtering Out Commits

Some commits are automatically excluded:
- Merge commits (git merge messages)
- Revert commits (git revert messages)
- CI/CD automation
- "Update changelog" commits (avoid loops)

## Manual Overrides

If the automatic extraction misses something or includes something wrong:

1. Edit CHANGELOG.md directly
2. Add/remove entries as needed
3. Keep the format consistent
4. The next `/changelog` run will preserve manually edited sections

## Tips

- Run `/changelog` frequently to keep it up-to-date
- Write clear, user-friendly commit messages (they'll be in the changelog)
- Group related commits in the same section
- Include the issue/ticket number in related entries
- Highlight breaking changes under a special section
- Link to related documentation or issues when relevant

## Examples

### Good Changelog Entry
```markdown
### Added
- Responsive design with mobile-first approach
- Vitest test suite with 35+ test cases
- Comprehensive testing documentation
```

### Another Example
```markdown
### Changed
- Refactored authentication middleware for better performance
- Updated CSS with flexible grid layouts
- Improved form accessibility with 44px touch targets
```

## Related Files

- **CHANGELOG.md** - Main changelog file (root directory)
- **README.md** - Project overview with quick links to changelog
- **.git/logs/** - Git reflog for historical reference

## Automation Notes

This skill should be invoked:
- ✅ Before merging PRs (recommended)
- ✅ Before tagging releases (required)
- ✅ At the end of development sprints/cycles
- ✅ When preparing deployment notes
