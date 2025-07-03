# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Speckle Connectors Desktop UI (DUI) - a Vue 3/Nuxt 3 application that serves as the frontend interface embedded inside desktop connectors (Revit, Rhino, SketchUp, AutoCAD, etc.). It enables users to sync 3D models with Speckle servers.

## Key Architecture

### Bridge Pattern Communication
The app communicates with host applications through a bridge pattern in `/lib/bridge/`:
- `Bridge.ts` - Base class defining the interface
- `BasicBridge.ts` - Default implementation
- `CefSharpBridge.ts` - CEF Sharp integration (C# hosts)
- `SketchUpBridge.ts` - SketchUp-specific implementation

The bridge handles bidirectional communication between the web UI and native desktop applications.

### State Management
Uses Pinia stores in `/store/`:
- `hostApp.ts` - Manages model cards (senders/receivers) and host application state
- `accounts.ts` - User authentication and multi-account management
- `selection.ts` - Object selection state from host application

### Model Cards System
Core functionality revolves around "model cards" - UI components for sending/receiving data:
- Sender cards: Send models to Speckle
- Receiver cards: Receive models from Speckle
- Located in `/components/model/`

### Dynamic Forms
Uses a JSON Form system (`/components/form/`) to generate UI dynamically based on connector capabilities.

## Development Commands

```bash
# Install dependencies
yarn install

# Run development server with GraphQL code generation watching
yarn dev

# Build for production
yarn build

# Run all linting checks (required before committing)
yarn lint

# Individual lint commands
yarn lint:js      # ESLint
yarn lint:tsc     # TypeScript type checking
yarn lint:prettier # Code formatting
yarn lint:css     # Stylelint

# Generate GraphQL types
yarn gqlgen
```

## Critical Constraints

1. **No SSR**: This is a client-side only application (SSR is disabled in nuxt.config.ts)
2. **Legacy Browser Support**: Must support Chrome 65 (CEF 65) - avoid modern JavaScript features without polyfills
3. **Bridge Communication**: All host app interactions must go through the bridge pattern
4. **GraphQL Types**: Run `yarn gqlgen` after modifying GraphQL queries/mutations

## Testing Approach

Currently no automated tests are configured. Manual testing is done through:
1. Running `yarn dev` and accessing http://localhost:8082
2. Testing with actual desktop connectors or using the test harness

## Environment Setup

1. Copy `.env.example` to `.env`
2. Ensure Node.js v22.14.0 is installed
3. Use Yarn 4.9.1 (included via Corepack)

## Common Tasks

### Adding a New Bridge Method
1. Define the method interface in `/lib/bindings/IHostAppService.ts`
2. Implement in `/lib/bridge/Bridge.ts` base class
3. Override in specific bridges if needed (e.g., `SketchUpBridge.ts`)

### Creating a Model Card Feature
1. Add UI components in `/components/model/`
2. Update store actions in `/store/hostApp.ts`
3. Add bridge methods if host app interaction is needed

### Working with GraphQL
1. Add queries/mutations in `/lib/graphql/`
2. Run `yarn gqlgen` to generate types
3. Import generated hooks from `@/lib/common/generated/gql/`