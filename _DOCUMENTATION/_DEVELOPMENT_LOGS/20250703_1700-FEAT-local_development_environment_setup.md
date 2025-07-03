# Local Development Environment Setup for DUI
3 July 2025, 17:00

## Overview

Successfully established a local development environment for the Speckle Connectors DUI, enabling real-time development and testing of UI changes within Revit. This setup allows developers to see changes immediately without rebuilding the entire connector, significantly improving development velocity.

The key achievement was connecting the Revit connector to a local Nuxt development server running on localhost:3000, with visual confirmation through a red development banner.

---

## Changes Made

1. **DUI Development Server Setup**
- Configured Nuxt development server to run on localhost:3000
- Added visual development indicator (red banner) to confirm local loading
- Verified server accessibility and proper response headers

2. **Connector Configuration**
- Confirmed connector URL configuration points to localhost:3000
- Verified WebView2 integration for local development
- Fixed compilation issues in RevitControlWebView.xaml.cs

3. **Visual Development Indicator**
- Added prominent red banner: "🚨 LOCAL DEVELOPMENT MODE - PORT 3000 🚨"
- Positioned at top of layout for immediate visibility
- Styled with high z-index to ensure visibility

---

## Technical Details

### Architecture/Implementation

1. **DUI Server Configuration**:
```typescript
// Server runs on localhost:3000 via npm run dev:nuxt
// Nuxt.config.ts configured for development mode
```

2. **Connector Integration**:
```csharp
// In Url.cs
public static readonly Uri Netlify = new("http://localhost:3000/");
```

3. **Development Indicator**:
```vue
<!-- In layouts/default.vue -->
<div v-if="isDevelopment" class="bg-red-600 text-white text-center py-2 font-bold text-lg z-50">
  🚨 LOCAL DEVELOPMENT MODE - PORT 3000 🚨
</div>
```

### Key Integrations:
- WebView2 loads localhost:3000 instead of production URL
- Nuxt development server provides hot reload capabilities
- Visual confirmation system prevents confusion about which version is loading

### Important Workflows:
1. Start DUI development server: `npm run dev:nuxt`
2. Build connector in Visual Studio (Debug configuration)
3. Launch Revit and open Speckle panel
4. Verify red banner appears to confirm local development mode

---

## Testing/Validation

1. **Verified Functionality**:
- ✅ DUI server responds correctly on localhost:3000
- ✅ Connector successfully loads from localhost
- ✅ Red development banner visible in Revit
- ✅ WebView2 navigation working properly
- ✅ Console logs show successful binding initialization

2. **Console Output**:
```
✔ testBinding connector binding added succesfully.
✔ configBinding connector binding added succesfully.
✔ accountsBinding connector binding added succesfully.
✔ baseBinding connector binding added succesfully.
✔ sendBinding connector binding added succesfully.
✔ receiveBinding connector binding added succesfully.
✔ selectionBinding connector binding added succesfully.
✔ topLevelExceptionHandlerBinding connector binding added succesfully.
```

3. **Build Resolution**:
- Fixed WebView2 DOMContentLoaded compatibility issue
- Added TaskScheduler parameters to resolve CA2008 warnings
- Maintained Debug configuration for development

---

## Future Considerations

1. **Immediate TODOs**:
   - Remove red banner before production deployment
   - Address remaining console errors (accounts.ts null reference)
   - Consider adding development mode toggle

2. **Long-term Improvements**:
   - Implement hot reload for connector changes
   - Add development tools integration
   - Consider automated testing pipeline

---

## Dependencies

- Nuxt: 3.17.6
- Nitro: 2.11.13
- WebView2: Latest
- .NET: As per connector requirements

---

## Related Documentation

- Connector URL configuration: DUI3/Speckle.Connectors.DUI/Url.cs
- Layout modifications: layouts/default.vue
- WebView integration: RevitControlWebView.xaml.cs

---

## Notes

**Important**: The red development banner is now conditional and only appears in development mode. This is controlled by the `process.dev` environment variable in Nuxt.

The setup enables rapid iteration on DUI changes without full connector rebuilds, significantly improving development workflow efficiency.

---

# 3-Point Public Summary

**🚀 Faster Development**
Set up instant preview of UI changes in Revit without rebuilding the entire connector
→ Developers can see changes immediately, reducing development time from minutes to seconds

**🔍 Clear Environment Indication**
Added conditional visual indicator to show when running in development mode
→ No more confusion about whether you're testing local changes or production code

**⚡ Streamlined Workflow**
Established seamless connection between local development server and Revit connector
→ Edit code, save file, see changes instantly in Revit - just like web development

---

# Critical Note for Handoff

This development log documents the successful establishment of a local development environment for the Speckle Connectors DUI. The setup enables real-time development with immediate feedback, crucial for efficient UI development. The visual confirmation system (conditional red banner) is essential for preventing confusion during development. Future developers should maintain this setup and ensure the development indicator is properly managed across different deployment environments.
