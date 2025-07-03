# Path Mapping Issues Resolution - Parallels Filesystem

3 July 2025, 2:50pm

## Overview

Resolved critical path mapping issues preventing the Speckle Connectors DUI from running in a Windows VM environment using Parallels Desktop. The primary issue was Node.js/npm confusion between Parallels filesystem mapping paths (`//psf/Home/Documents/`) and native Windows paths (`C:\Mac\Home\Documents\`), causing Nuxt development server failures and preventing the Revit panel UI from loading.

---

## Changes Made

1. **Identified Core Issue**

- Nuxt/Node.js unable to resolve package.json due to Parallels PSF (Parallels Shared Folders) path format
- Error: `Cannot find matching package.json in //psf/Home/Documents/GitHub/speckle-connectors-dui/`
- Python compilation issues with node-gyp for native modules (utf-8-validate)

2. **Python Installation**

- Installed Python 3.11.9 via winget: `winget install Python.Python.3.11`
- Resolved node-gyp compilation errors for native dependencies
- Verified Python and pip installation working correctly

3. **Temporary Workaround Implementation**

- Copied project to native Windows path: `C:\temp\speckle-connectors-dui`
- Successfully ran `npm install --legacy-peer-deps` in native Windows location
- Nuxt development server now running on `localhost:3000`

---

## Technical Details

### Architecture/Implementation

1. **Path Mapping Issue Root Cause**:

```bash
# Problematic Parallels PSF path format
//psf/Home/Documents/GitHub/speckle-connectors-dui/

# Expected Windows path format
C:\Mac\Home\Documents\GitHub\speckle-connectors-dui\
```

2. **Python Resolution**:

```bash
# Successful Python installation
python --version  # Python 3.11.9
pip --version     # pip 24.0
```

3. **Working Development Setup**:

```bash
# Current working location
C:\temp\speckle-connectors-dui

# Development server
npm run dev:nuxt  # Running on localhost:3000
```

---

## Testing/Validation

1. **Verified Functionality**:

- ✅ Python 3.11.9 installed and accessible
- ✅ npm install completes successfully with --legacy-peer-deps
- ✅ Nuxt development server starts without path errors
- ✅ Server running on localhost:3000
- ❌ Revit panel still shows black screen (port mismatch suspected)

2. **Console Output**:

```bash
Nuxt 3.17.6 with Nitro 2.11.13
➜ Local:    http://localhost:3000/
➜ Network:  use --host to expose
✔ Nuxt Nitro server built in 2206ms
```

3. **Outstanding Issues**:

- Revit panel expects localhost:8082, server running on localhost:3000
- Working in temp folder disconnected from git repository

---

## Future Considerations

1. **Immediate TODOs**:

   - **CRITICAL**: Fix port configuration mismatch (8082 vs 3000)
   - **CRITICAL**: Implement proper path mapping solution for original repository location
   - Investigate Revit connector configuration for port settings
   - Test UI functionality once port issue resolved

2. **Long-term Improvements**:
   - Implement permanent path mapping solution using:
     - Windows symbolic links (`mklink /D`)
     - npm configuration adjustments
     - Parallels Desktop mount point optimization
   - Document development environment setup for Parallels users
   - Consider Docker containerization to avoid filesystem mapping issues

---

## Dependencies

- Node.js: v22.17.0
- Python: 3.11.9 (ARM64)
- npm: Latest with --legacy-peer-deps flag
- Nuxt: 3.17.6
- Nitro: 2.11.13

---

## Related Documentation

- Original repository: `C:\Mac\Home\Documents\GitHub\speckle-connectors-dui`
- Working copy: `C:\temp\speckle-connectors-dui`
- Development server: http://localhost:3000/
- Expected Revit connection: localhost:8082

---

## Notes

**IMPORTANT**: Currently working in a temporary copy disconnected from the git repository. All changes made in `C:\temp\speckle-connectors-dui` will need to be manually copied back to the original repository location once path mapping issues are resolved.

**Next Steps**:

1. Resolve port mismatch between Nuxt server (3000) and Revit panel expectation (8082)
2. Implement permanent path mapping solution to work directly in original repository
3. Test complete UI functionality end-to-end

---

# 3-Point Public Summary

**🔧 Development Environment Fixed**
Resolved critical setup issues preventing the Speckle Revit connector development environment from running
→ Developers can now run the UI development server successfully

**🐍 Python Dependencies Resolved**  
Installed proper Python environment to compile native Node.js modules
→ No more build failures when installing project dependencies

**📁 Temporary Workaround Active**
Created working development setup in native Windows location to bypass filesystem mapping issues
→ Development can proceed while permanent solution is implemented

---

# Critical Note for Handoff

This development log documents a critical infrastructure issue resolution for Speckle Connectors DUI development in Parallels Desktop environments. The core issue was Parallels Shared Folders (PSF) path format incompatibility with Node.js/Nuxt tooling. A temporary workaround is active using a native Windows path copy, but a permanent solution involving proper path mapping configuration is needed to maintain git repository connectivity and avoid manual file synchronization. The next critical step is resolving the port mismatch (3000 vs 8082) to restore Revit panel functionality.
