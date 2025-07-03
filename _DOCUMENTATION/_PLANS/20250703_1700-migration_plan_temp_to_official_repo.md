# Migration Plan: Temp Development to Official Repository
3 July 2025, 17:00

## Overview

This document outlines the process for migrating development changes from the temporary working directory (`C:\temp\speckle-connectors-dui`) to the official repository (`C:\Mac\Home\Documents\GitHub\speckle-connectors-dui`) for GitHub deployment.

**Current State**: Successfully established local development environment with visual confirmation system.

**Goal**: Clean migration of development changes to official repository while maintaining development workflow.

---

## Current Environment Analysis

### Temporary Development Location
- **Path**: `C:\temp\speckle-connectors-dui`
- **Purpose**: Local development with hot reload
- **Status**: ✅ Working with red development banner
- **Server**: Running on localhost:3000

### Official Repository Location  
- **Path**: `C:\Mac\Home\Documents\GitHub\speckle-connectors-dui`
- **Purpose**: Git-tracked official codebase
- **Status**: ✅ Migration completed
- **Target**: Production-ready code with conditional development features

### Connector Integration
- **Path**: `C:\Mac\Home\Documents\GitHub\speckle-sharp-connectors`
- **Status**: ✅ Configured to use localhost:3000
- **Changes**: Minimal, URL configuration only

---

## Migration Strategy

### Phase 1: Preparation ✅ COMPLETED
1. **Backup Current State**
   ```bash
   # Create backup of temp directory
   cp -r C:\temp\speckle-connectors-dui C:\temp\speckle-connectors-dui-backup
   ```

2. **Verify Official Repo Status**
   ```bash
   cd C:\Mac\Home\Documents\GitHub\speckle-connectors-dui
   git status
   git stash  # if needed
   ```

### Phase 2: Change Identification ✅ COMPLETED
1. **Development Banner Addition**
   - File: `layouts/default.vue`
   - Change: Added conditional development indicator
   - Action: ✅ Implemented environment-based conditional banner

2. **Documentation Updates**
   - Files: Development logs and plans
   - Action: ✅ Copied to official repo

3. **Configuration Verification**
   - Files: Package.json, nuxt.config.ts
   - Action: ✅ Updated with host configuration

### Phase 3: Smart Migration ✅ COMPLETED
1. **Create Development Mode Toggle**
   ```typescript
   // In layouts/default.vue
   const isDevelopment = process.dev
   ```

2. **Conditional Development Banner**
   ```vue
   <!-- In layouts/default.vue -->
   <div v-if="isDevelopment" class="bg-red-600 text-white text-center py-2 font-bold text-lg z-50">
     🚨 LOCAL DEVELOPMENT MODE - PORT 3000 🚨
   </div>
   ```

3. **Copy Documentation**
   ✅ Development logs and migration plans copied to official repository

### Phase 4: Testing & Validation
1. **Start Official Repo Server**
   ```bash
   cd C:\Mac\Home\Documents\GitHub\speckle-connectors-dui
   npm run dev:nuxt
   ```

2. **Verify Development Banner**
   - Should show in development mode
   - Should hide in production mode

3. **Test Connector Integration**
   - Launch Revit
   - Verify localhost:3000 loading
   - Confirm banner visibility

### Phase 5: Git Workflow
1. **Stage Changes**
   ```bash
   git add .
   git commit -m "feat: add development environment setup with conditional banner"
   ```

2. **Push to GitHub**
   ```bash
   git push origin main  # or appropriate branch
   ```

---

## File-by-File Migration Checklist

### Core Changes
- [x] `layouts/default.vue` - Add conditional development banner
- [x] `nuxt.config.ts` - Verify development configuration
- [x] `package.json` - Ensure script consistency

### Documentation
- [x] `_DOCUMENTATION/_DEVELOPMENT_LOGS/20250703_1700-FEAT-local_development_environment_setup.md`
- [x] `_DOCUMENTATION/_PLANS/20250703_1700-migration_plan_temp_to_official_repo.md`

### Environment Configuration
- [x] `.env` files (if any)
- [x] Development scripts
- [x] Build configurations

---

## Risk Mitigation

### Potential Issues
1. **Environment Differences**
   - Risk: Different Node.js versions
   - Mitigation: Verify package-lock.json consistency

2. **Git Conflicts**
   - Risk: Conflicting changes in official repo
   - Mitigation: Pull latest before migration

3. **Development Banner in Production**
   - Risk: Banner appears in production builds
   - Mitigation: ✅ Environment-based conditional rendering implemented

### Rollback Plan
1. **If Migration Fails**
   ```bash
   git reset --hard HEAD~1  # Undo last commit
   git clean -fd            # Clean working directory
   ```

2. **Restore from Backup**
   ```bash
   cp -r C:\temp\speckle-connectors-dui-backup/* C:\temp\speckle-connectors-dui/
   ```

---

## Post-Migration Workflow

### Development Process
1. **Primary Development**: Use official repo (`C:\Mac\Home\Documents\GitHub\speckle-connectors-dui`)
2. **Testing**: Run `npm run dev:nuxt` in official repo
3. **Connector**: Continues to use localhost:3000 (no changes needed)

### Deployment Process
1. **Development**: Banner visible, localhost:3000
2. **Production**: Banner hidden, production URL
3. **Git**: All changes tracked and versioned

---

## Success Criteria

- [ ] Official repo runs development server successfully
- [ ] Development banner appears in dev mode only
- [ ] Connector loads from official repo's localhost:3000
- [x] All documentation migrated
- [ ] Git history clean and meaningful
- [ ] Temp directory can be safely removed

---

## Timeline

**Total Estimated Time**: 45 minutes
- Preparation: ✅ 5 minutes
- Change Identification: ✅ 10 minutes  
- Smart Migration: ✅ 15 minutes
- Testing & Validation: 🔄 10 minutes
- Git Workflow: ⏳ 5 minutes

**Recommended Schedule**: Execute during low-activity period to minimize disruption.

---

## Notes

**Critical**: The connector configuration in `speckle-sharp-connectors` requires NO changes. It will continue to work with localhost:3000 regardless of which repository serves the content.

**Advantage**: This migration enables proper version control while maintaining the established development workflow.

**Future**: Consider setting up automated sync between development and official repositories if needed.

**Migration Status**: ✅ Core migration completed. Ready for testing and validation phase.
