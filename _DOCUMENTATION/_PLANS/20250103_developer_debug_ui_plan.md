# Developer Debug UI Implementation Plan

**Date**: 2025-01-03  
**Status**: Proposed  
**Approach**: Option A - Local Development  

## Executive Summary

This document outlines the plan to enhance the Speckle Connectors DUI (Desktop UI) with developer-focused debugging features. These features will help developers understand and troubleshoot the communication between the web UI and host applications (Revit, Rhino, etc.) without affecting the production deployment managed by the Speckle team.

## Background

### Current Architecture Understanding

1. **Speckle Connectors DUI** (This repository)
   - Vue 3/Nuxt 3 web application
   - Deployed to Netlify at: `https://boisterous-douhua-e3cefb.netlify.app/`
   - Provides the UI for all desktop connectors

2. **Speckle Sharp Connectors** (Separate repository)
   - .NET/C# desktop integrations
   - References the DUI via URL in `DUI3/Speckle.Connectors.DUI/Url.cs`
   - Embeds the web UI using WebView2 (Revit 2026+) or CefSharp (older versions)

3. **Communication Bridge**
   - Bridge pattern connects JavaScript UI to C# backend
   - Bidirectional communication via `window.bindings` object
   - Events flow: UI → Bridge → Host App → Bridge → UI

## Goals

1. **Add developer debugging capabilities** to the DUI without modifying production behavior
2. **Enable real-time monitoring** of bridge communications
3. **Provide visibility** into state management and performance metrics
4. **Maintain zero impact** on regular users and official Speckle deployment

## Implementation Approach: Option A - Local Development

### Overview
Run the DUI locally and point the Sharp connectors to the local development server. This allows for rapid iteration and debugging without affecting production.

### Setup Steps

1. **DUI Development Environment**
   ```bash
   cd /Users/adibzailan/Documents/GitHub/speckle-connectors-dui
   yarn install
   yarn dev  # Runs on http://localhost:8082
   ```

2. **Modify Sharp Connectors to Use Local UI**
   ```csharp
   // In speckle-sharp-connectors/DUI3/Speckle.Connectors.DUI/Url.cs
   // Comment out production URL:
   // public static readonly Uri Netlify = new("https://boisterous-douhua-e3cefb.netlify.app/");
   
   // Use local development URL:
   public static readonly Uri Netlify = new("http://localhost:8082/");
   ```

3. **Rebuild the Connector**
   ```powershell
   cd /Users/adibzailan/Documents/GitHub/speckle-sharp-connectors
   .\build.ps1 build
   ```

4. **Launch Host Application**
   - Start Revit/Rhino/etc. normally
   - The Speckle panel will now load from your local development server

## Planned Debug Features

### 1. Debug Panel Component
**Location**: `/components/dev/DebugPanel.vue`

**Features**:
- Floating panel with bridge event log
- Real-time state inspection (Pinia stores)
- Performance metrics
- Collapsible/expandable interface
- Keyboard shortcut toggle (Ctrl+Shift+D)

**Activation**:
- Automatically visible in development mode (`import.meta.env.DEV`)
- Can be enabled in production via URL parameter (`?debug=true`)

### 2. Bridge Communication Logger
**Implementation**: Intercept `window.bindings` methods

**Captures**:
- All `send()` calls from UI to backend
- All `invoke()` calls and their responses
- Event names, payloads, and timing
- Latency measurements

**Display**:
- Chronological event log
- JSON payload inspection
- Performance statistics

### 3. State Management Inspector
**Shows**:
- Current model cards (senders/receivers)
- User accounts and active account
- Selection state from host application
- Configuration settings

### 4. Error Boundary Enhancement
**Features**:
- Detailed error messages with stack traces
- Component hierarchy at error time
- State snapshot when error occurred
- One-click error report generation

### 5. Performance Monitoring
**Tracks**:
- Component render times
- Bridge method latencies
- GraphQL query performance
- Memory usage indicators

## Implementation Timeline

### Phase 1: Core Debug Panel (Week 1)
- [x] Create DebugPanel.vue component
- [ ] Integrate into main app layout
- [ ] Add bridge event interception
- [ ] Implement keyboard shortcut activation

### Phase 2: Enhanced Logging (Week 2)
- [ ] Add structured logging system
- [ ] Create error boundary wrapper
- [ ] Implement performance timing
- [ ] Add state snapshot functionality

### Phase 3: Developer Tools (Week 3)
- [ ] Mock mode for testing without host app
- [ ] GraphQL query inspector
- [ ] Export/import debug sessions
- [ ] Performance profiling tools

## Technical Implementation Details

### Debug Mode Detection
```javascript
// Multiple ways to enable debug mode
const isDebugMode = computed(() => {
  return (
    route.query.debug === 'true' ||           // URL parameter
    import.meta.env.DEV ||                    // Development environment
    localStorage.getItem('debug') === 'true'  // Persistent setting
  )
})
```

### Bridge Interception Pattern
```javascript
// Store original methods
const originalSend = window.bindings?.send
const originalInvoke = window.bindings?.invoke

// Override with logging wrapper
window.bindings.send = function(...args) {
  logBridgeEvent('SEND', args)
  return originalSend.apply(this, args)
}
```

### Conditional UI Rendering
```vue
<template>
  <!-- Debug features only render when enabled -->
  <DebugPanel v-if="isDebugMode" />
  
  <!-- Regular UI always renders -->
  <div class="main-content">
    <!-- ... -->
  </div>
</template>
```

## Benefits

1. **Faster Development**: See exactly what's happening between UI and host app
2. **Better Debugging**: Detailed logs and state inspection
3. **Performance Insights**: Identify bottlenecks and optimization opportunities
4. **Zero Production Impact**: Features hidden unless explicitly enabled
5. **Knowledge Transfer**: New developers can understand system behavior quickly

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Debug code affecting production | Use conditional compilation/rendering |
| Performance overhead | Only intercept when debug mode active |
| Exposing sensitive data | Add data sanitization for logs |
| Accidental commits of local URL | Add pre-commit hook to check Url.cs |

## Future Enhancements

1. **Remote Debugging**: Connect to production instances for troubleshooting
2. **Replay System**: Record and replay bridge communication sessions
3. **Automated Testing**: Use debug data to generate test cases
4. **Documentation Generation**: Auto-generate API docs from bridge calls
5. **Multi-connector Support**: Compare behavior across different host apps

## Conclusion

This developer debug UI will significantly improve the development experience for working with Speckle connectors. By implementing these features in a non-intrusive way, we can maintain the stability of the production system while providing powerful tools for developers to understand and debug the complex interactions between the web UI and desktop applications.

The Option A approach (local development) provides the fastest iteration cycle and most control, making it ideal for active development and debugging scenarios.