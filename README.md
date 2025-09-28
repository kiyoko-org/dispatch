# Dispatch

Dispatch is a community safety and communication app built with Expo, Bun, and TypeScript. It provides features for incident reporting, messaging, lost-and-found, and emergency contacts.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/) (JavaScript runtime and package manager)
  - Install via: `npm install -g bun`
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Install via: `bun add -g expo-cli` or follow the [Expo CLI installation guide](https://docs.expo.dev/get-started/installation/) for the latest method.
- Node.js (recommended for compatibility)
- Git
- Windows PowerShell (for build scripts)

## Development Workflow

Follow these steps for development and building:

1. **Install dependencies**
   - Run `bun install` after every code change or when a new module is added.
2. **Prebuild the Expo project**
   - Run `bunx expo prebuild --clean` (only needed once, unless you need to regenerate native code).
3. **Build for Android (Windows)**
   - Run `./scripts/build-android-on-windows.ps1` every time you build the project.