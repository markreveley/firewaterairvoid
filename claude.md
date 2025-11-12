# Claude Code Project Instructions

## 🚀 On Every New Session: READ THIS FIRST

When starting a new conversation, you (Claude) should:

1. **Read plan.md** - Contains current status, work log, and agent instructions
2. **Read any docs mentioned** in Current Status if needed for context

## 🤖 Agent Responsibilities (Quick Reference)

**After EVERY commit:**
- Update plan.md with work log entry
- Update "Current Status" section
- Commit plan.md changes
- DO NOT wait for user to request this

**When context is low ("compact", "context-low", "oom"):**
- Return ≤30 lines of tool output
- Prefer `grep`, `head` over full file reads
- Ask before showing >500 lines

**Memory Model:**
- Git = real long-term memory (permanent, searchable)
- plan.md = lightweight index (~150 lines)
- Detailed docs = DESIGN.md, USER_STORIES.md, STRATEGY.md

## 📝 Git Workflow (Standard Process)

**IMPORTANT - Testing Before Commits:**
- **DO NOT** run `npm run dev` (it's always running in user's environment)
- **DO NOT** begin the commit phase independently
- **ALWAYS** tell the user to test the changes first
- **WAIT** for user to relay test results
- **THEN** proceed to git commit workflow

**Two-Commit Pattern** - Use this workflow after making code changes:

1. **Commit 1: Feature/Fix Commit**
   ```bash
   git add <changed files>
   git commit -m "type: descriptive summary

   - Bullet point of key change
   - Another key change
   - Brief explanation of why

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```
   **Commit types**: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`

2. **Update plan.md**
   - Add work log entry at the top of Work Log section
   - Use template: date, goal, key files, changes, UX improvements, next steps
   - Update "Current Status" if needed

3. **Commit 2: Documentation Commit**
   ```bash
   git add plan.md
   git commit -m "docs: update plan.md with [feature name]

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

4. **Push both commits**
   ```bash
   git push
   ```

**Why Two Commits?**
- Separates code changes from documentation for cleaner history
- Makes code review easier (review feature, then review docs)
- plan.md updates are self-contained and searchable

**Important**: Always run `git status` and `git diff` before committing to verify changes.

## 🧪 Test-Driven Development (TDD) Workflow

**CRITICAL: Always follow TDD for features and bug fixes**

### When to Use TDD

- **All new features**: Write failing tests first
- **Bug fixes**: Create failing test that reproduces the bug
- **Refactoring**: Ensure tests exist before refactoring

### TDD Cycle (Red-Green-Refactor)

1. **RED: Write Failing Tests**
   ```bash
   # Create test file if it doesn't exist
   # Write tests that describe expected behavior
   # Run tests - they MUST fail
   npm test -- path/to/test.test.ts
   ```

2. **GREEN: Make Tests Pass**
   ```bash
   # Write minimal code to pass tests
   # Run tests - they MUST pass
   npm test -- path/to/test.test.ts
   ```

3. **REFACTOR: Improve Code**
   ```bash
   # Clean up code while keeping tests green
   # Run tests - they MUST stay passing
   npm test -- path/to/test.test.ts
   ```

### Test Requirements

**Before implementing any feature or bug fix:**
1. Create test file: `[filename].test.ts` or `[filename].test.tsx`
2. Write tests describing expected behavior
3. **Verify tests fail** (proves they're testing the right thing)
4. Implement solution
5. **Verify tests pass** (proves solution works)

**Example: Bug Fix Workflow**
```bash
# User reports: "Tags display in wrong order"
# 1. Write failing test
it('should display tags in order: child, parent, grandparent', () => {
  const result = getTagsWithParents([childTag], allTags);
  expect(result[0].name).toBe('Child');
  expect(result[1].name).toBe('Parent');
  expect(result[2].name).toBe('Grandparent');
});

# 2. Run test - should FAIL
npm test

# 3. Fix the code
# 4. Run test - should PASS
npm test

# 5. Commit with test
git add src/utils/tagHierarchy.ts src/utils/tagHierarchy.test.ts
git commit -m "fix: correct tag display order from child to parent"
```

### Test Coverage Guidelines

- **Utilities**: 100% coverage for pure functions
- **Components**: Test behavior, not implementation
- **Integration**: Test user workflows end-to-end
- **Edge cases**: Always test null, empty, and error states

### Testing Tools

- **Unit tests**: Vitest + React Testing Library
- **E2E tests**: Playwright (via MCP when needed)
- **Run tests**: `npm test -- path/to/test.test.ts`
- **Watch mode**: `npm test -- --watch`

**Remember**: If tests don't exist for a feature or bug, CREATE THEM FIRST before writing code!

## 📚 Documentation Structure

- **plan.md** - Current status, work log, agent meta-instructions (READ THIS FIRST)
- **USER.md** - User guide for working with Claude Code workflow
- **DESIGN.md** - Architecture decisions, database schema, technical rationale
- **USER_STORIES.md** - User workflows, feature descriptions, edge cases
- **STRATEGY.md** - Business strategy, pricing analysis, commercialization

## 🎯 Project Overview

Fire Water is a task/project management application that organizes items into five elemental types: fire, water, air, void, and earth.

**Tech Stack**: React 18 + TypeScript + Vite, shadcn/ui, Supabase (PostgreSQL), TanStack Query

**Current Focus**: See plan.md "Current Status" section

## 🔧 Common Commands

```bash
npm run dev          # Start dev server
npm test             # Run tests
git status           # Check changes
git pull             # Pull latest
```

## ⚡️ Quick Start for New Session

1. User says: "Read claude.md" (you're reading this now!)
2. You read plan.md automatically
3. Check "Current Status" section in plan.md
4. Ask user: "What would you like to work on?"

---

**Remember**: You are responsible for maintaining plan.md. After every commit, update the work log. Don't wait to be asked!
