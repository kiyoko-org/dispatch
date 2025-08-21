# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Commands
```bash
# Install dependencies
bun install  # Preferred (mentioned in AGENTS.md)
# or
npm install

# Start the development server
bunx expo start  # Preferred (mentioned in AGENTS.md)
# or
npm start

# Platform-specific commands
npm run ios      # Run on iOS simulator
npm run android  # Run on Android emulator/device
npm run web      # Run in web browser

# Native builds
bunx expo run:ios     # Build for iOS
bunx expo run:android # Build for Android
# Alternative script for Android
./scripts/build-android-on-mac.sh
```

### Code Quality Commands
```bash
# Run ESLint and Prettier checks
bun run lint  # Preferred (mentioned in AGENTS.md)
# or
npm run lint

# Fix linting issues and format code
bun run format  # Preferred (mentioned in AGENTS.md)
# or
npm run format

# Prebuild (prepare native code for building)
npm run prebuild
```

## Project Architecture

### Application Structure
- **Expo Router (v5)** provides the routing framework with directory-based routing
- **Authentication** handled via Supabase with deep link support
- **Protected Routes** managed through nested routing with `/app/(protected)/` directory
- **Styling** implemented with NativeWind (Tailwind CSS for React Native)

### Key Directories
- `/app/`: Screens and routing structure
  - `/(protected)/`: Authenticated routes (home, emergency, report-incident)
  - `/auth/`: Authentication screens (login, sign-up)
- `/components/`: Reusable UI components
  - `/ui/`: Core UI components (Button, Card, Container, etc.)
  - `/sidebar/`: Navigation sidebar components
- `/lib/`: Utility functions and service configurations
  - `supabase.ts`: Supabase client configuration

### Authentication Flow
- `AuthProvider` component wraps the app and manages authentication state
- Uses Supabase for user authentication
- Handles deep linking for auth redirects
- Redirects authenticated users to protected routes
- Includes support for session management and auth state changes

### Environment Setup
- Environment variables defined in `.env` (copy from `.env.example`)
- Required variables:
  - `SUPABASE_URL`: Supabase project URL
  - `SUPABASE_ANON_KEY`: Supabase anonymous key
- Variables are exposed via `app.config.ts` to the Expo application

### Coding Standards
1. **TypeScript**: Strict mode enabled; use explicit return types for exported functions/components
2. **Components**: PascalCase naming; one component per file for exports
3. **Hooks**: Prefix with `use`; maintain camelCase naming
4. **Styling**: Use Tailwind via className; avoid arbitrary values unless necessary
5. **Auth**: Always import the Supabase client from `lib/supabase`, never duplicate
6. **Routing**: Use router.replace for auth redirects to prevent back navigation
7. **Error handling**: Fail fast on config; provide UI feedback for user actions