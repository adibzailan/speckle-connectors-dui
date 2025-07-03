# Developer Debug UI Implementation
3 January 2025, 12:00

## Overview

Implemented a comprehensive developer debugging interface for the Speckle Connectors DUI to enhance development experience and troubleshooting capabilities. This feature addresses the need for real-time visibility into the bridge communication between the web UI and host applications (Revit, Rhino, etc.), providing developers with tools to monitor, debug, and analyze the connector's behavior without affecting production users.

The implementation follows a non-intrusive approach where debug features are hidden by default and only accessible in development mode or via explicit activation, ensuring zero impact on the official Speckle deployment.

---

## Changes Made

1. **Debug State Management Store**
- Created `store/debug.ts` with comprehensive state management for debug events
- Implemented circular buffer pattern to prevent memory overflow (max 500 events)
- Added categorized event tracking: bridge events, errors, state changes, performance metrics
- Included export functionality for debug logs as JSON files
```typescript
interface DebugEvent {
  id: string
  timestamp: number
  type: 'bridge' | 'error' | 'state' | 'performance'
  category: string
  message: string
  data?: any
  error?: Error
  stackTrace?: string
}
```

2. **Debug Panel Component**
- Created `components/debug/Panel.vue` with tabbed interface
- Implemented floating panel design (bottom-right, z-index: 9999)
- Added four tabs: Errors, Bridge, State, Performance
- Integrated keyboard shortcut (Ctrl+Shift+D) for toggle functionality
- Used Teleport to ensure panel renders above all content

3. **Bridge Communication Interceptor**
- Created `plugins/99.debug.client.ts` to intercept all bridge methods
- Wrapped `window.bindings` methods (send, invoke, on) with logging
- Added performance timing for all bridge operations
- Integrated Vue error handler and unhandled promise rejection tracking
- Implemented Pinia store action monitoring

4. **Error Handling Integration**
- Extended `lib/bridge/errorHandler.ts` to log to debug store
- Maintained existing error dialog functionality
- Added stack trace capture for host app errors

5. **Global Type Definitions**
- Created `types/global.d.ts` for window.bindings interface
- Ensured TypeScript compatibility across the codebase

6. **App Integration**
- Modified `app.vue` to include `<DebugPanel />` component
- Positioned after SingletonToastManager for proper layering

---

## Technical Details

### Architecture/Implementation

1. Core Structure:
```typescript
// Debug Store Pattern
export const useDebugStore = defineStore('debug', () => {
  // State
  const isEnabled = ref(false)
  const isPanelVisible = ref(false)
  const events = ref<DebugEvent[]>([])
  
  // Actions
  function logBridgeEvent(category: string, message: string, data?: any) {
    addEvent({
      type: 'bridge',
      category,
      message,
      data
    })
  }
  
  // Performance tracking
  function startPerformanceMetric(operation: string): string {
    const id = crypto.randomUUID()
    activeMetrics.value.set(id, {
      operation,
      startTime: performance.now()
    })
    return id
  }
})
```

2. Key Integrations:
- Bridge interception occurs at plugin initialization
- Original methods stored and wrapped with logging functionality
- Performance metrics calculated for each bridge operation
- State changes tracked via Pinia plugin architecture

3. Important Workflows:
- Debug mode detection: URL param (?debug=true) → Dev environment → LocalStorage
- Event capture: Bridge call → Interceptor → Log to store → Update UI
- Error flow: Host app error → ErrorHandler → Debug store → Panel display

### Activation Methods

1. **Development Mode**: Automatically enabled when `import.meta.env.DEV` is true
2. **URL Parameter**: Add `?debug=true` to any URL
3. **LocalStorage**: Persistent preference saved as `debugMode`
4. **Keyboard Shortcut**: Ctrl+Shift+D toggles panel visibility

---

## Testing/Validation

### Local Development Testing Setup

1. **DUI Development Environment**:
```bash
cd /Users/adibzailan/Documents/GitHub/speckle-connectors-dui
yarn install
yarn dev  # Runs on http://localhost:8082
```

2. **Point Sharp Connectors to Local UI**:
```csharp
// In speckle-sharp-connectors/DUI3/Speckle.Connectors.DUI/Url.cs
// Comment out production:
// public static readonly Uri Netlify = new("https://boisterous-douhua-e3cefb.netlify.app/");

// Use local development:
public static readonly Uri Netlify = new("http://localhost:8082/");
```

3. **Rebuild and Test**:
```powershell
cd /Users/adibzailan/Documents/GitHub/speckle-sharp-connectors
.\build.ps1 build
# Launch Revit/Rhino/etc. - Speckle panel now loads from localhost
```

### Testing Scenarios

1. **Bridge Communication Testing**:
- Open Speckle panel in host app
- Debug panel should show all send/invoke operations
- Create/modify model cards to see bridge events
- Monitor latency in Performance tab

2. **Error Handling Testing**:
- Trigger errors (e.g., disconnect network during send)
- Verify errors appear in Errors tab with stack traces
- Check that original error dialogs still function

3. **State Inspection Testing**:
- Switch between accounts in State tab
- Verify model card counts update in real-time
- Check selection state changes when selecting objects

4. **Performance Testing**:
- Send large models and monitor operation timings
- Check average bridge latency calculation
- Verify no performance impact when debug mode is off

### Console Output Example:
```
✔ debugBindings connector binding added successfully.
[Debug] Bridge event logged: SEND - updateModelCard
[Debug] Performance metric: bridge.send.updateModelCard completed in 23.45ms
```

---

## Future Considerations

1. Immediate TODOs:
   - Add filter/search functionality for event logs
   - Implement event replay system for debugging
   - Add GraphQL query/mutation tracking
   - Create mock mode for testing without host app

2. Long-term Improvements:
   - Remote debugging capabilities (connect to production instances)
   - Integration with browser DevTools
   - Automated error reporting system
   - Performance profiling with flame graphs
   - WebSocket event tracking for real-time updates

---

## Dependencies

- Vue: ^3.5.13
- Nuxt: ^3.15.0
- Pinia: ^2.3.0
- @speckle/ui-components: catalog:
- TypeScript: ^5.7.2

---

## Related Documentation

- Development Plan: `_DOCUMENTATION/_PLANS/20250103_developer_debug_ui_plan.md`
- Main Architecture: `/CLAUDE.md`
- Bridge Documentation: See Sharp Connectors `/CLAUDE.md`
- Revit UI Improvements: `speckle-sharp-connectors/_DOCUMENTATION/_PLANS/_REVIT_SPECKLE_UI_IMPROVEMENTS/`

---

## Notes

### Environment Requirements
- Node.js v22.14.0 required
- Yarn 4.9.1 (via Corepack)
- Chrome 65+ compatibility (for CEF support)

### Security Considerations
- Debug panel only accessible with explicit activation
- No sensitive data logged by default
- Export functionality sanitizes data before download

### Production Safety
- All debug code is conditionally rendered
- No performance impact when disabled
- Official Netlify deployment remains unchanged

---

# 3-Point Public Summary

**🔍 Real-time Bridge Monitoring**
See exactly what's happening between Speckle and your CAD software in real-time
→ Instantly identify communication issues without digging through logs

**🐛 Smart Error Tracking**
Catch and understand errors with full context and stack traces
→ Fix problems faster with detailed error information at your fingertips

**📊 Performance Insights**
Monitor operation speeds and identify bottlenecks as they happen
→ Optimize your workflows by seeing which operations take the longest

---

# Critical Note for Handoff

Intended for SOTA LLM analysis: This development log documents the implementation of a comprehensive debugging interface for the Speckle Connectors DUI. The debug panel provides real-time visibility into bridge communications, error tracking, state inspection, and performance monitoring. The implementation is designed to have zero impact on production users while providing powerful tools for developers.

Key architectural decisions include:
1. Non-intrusive design with conditional rendering
2. Circular buffer pattern for memory management
3. Bridge method interception via plugin architecture
4. Integration with existing error handling systems

The testing setup requires coordination between two repositories (DUI and Sharp Connectors) but provides a seamless debugging experience once configured. All code follows existing patterns and conventions established in the codebase.