AGENT QUICK REF (keep ~20 lines)

1. Install deps: bun install (or npm i). Run dev: bunx expo start (platforms: ios/android/web). Build native: expo run:android | expo run:ios (or scripts/build-android-on-mac.sh).
2. Lint: bun run lint. Auto-fix & format: bun run format. Prettier width 100, singleQuote, trailingComma=es5, tailwind plugin.
3. Tests: (none configured). If adding tests prefer Vitest or Jest; single test pattern: npx vitest run path/to/file.test.ts. Add a test script before relying on tests.
4. TypeScript: strict true. Use explicit return types for exported funcs/components; rely on inference internally. Prefer interfaces for object shapes consumed externally, types for unions.
5. Imports: absolute alias ~/\* (currently unused). Group order: react/react-native, 3rd-party libs, internal (components/, lib/, hooks/, app/), then relative. No unused imports.
6. Components: PascalCase. Hooks: useX prefix camelCase. Files: .tsx for JSX, .ts otherwise. One component per file when exported.
7. State & side effects: keep hooks high in component; derive state instead of duplicating. Avoid anonymous inline functions in large lists.
8. Styling: Tailwind via className (nativewind). Keep semantic spacing; avoid arbitrary values unless needed. Co-locate global styles in global.css only.
9. Error handling: Fail fast on config (e.g. missing SUPABASE keys). For user actions surface Alert / UI feedback; log to console.error for unexpected issues. Never swallow errors silently.
10. Auth: Use AuthProvider context. Do not duplicate supabase client; import from lib/supabase.
11. Env: Secrets in .env (never commit). Mirror keys in .env.example and expose via app.config.ts extra.
12. Routing: expo-router Stack; prefer router.replace for auth redirects to prevent back navigation.
13. Async code: always await supabase auth calls; set loading flags; cancel subscriptions in cleanup.
14. Formatting: run format before commit; no trailing spaces; keep imports sorted logically (not enforced yet—manual discipline).
15. Naming: booleans prefixed is/has/should; functions verbNoun; avoid abbreviations (router ok). Constants UPPER_SNAKE_CASE if module-level.
16. Accessibility: Use Text for readable content; label buttons clearly; avoid relying solely on color.
17. Performance: Avoid unnecessary re-renders; memoize heavy components/hooks only when measured.
18. Adding tests: co-locate **tests** or \*.test.ts(x); ensure tsconfig includes them; update package.json scripts.
19. CI recommendation: add lint + (future) test scripts before build.
20. No Cursor/Copilot rule files present; this doc governs agent behavior.
