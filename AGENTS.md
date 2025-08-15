AGENT QUICK REFERENCE (keep ~20 lines concise)

1. Install deps: pnpm i (preferred) or npm i or bun i. Node 18+/Expo 53.
2. Run app: pnpm start (alias of expo start). Platforms: pnpm android / pnpm ios / pnpm web.
3. Build native prebuild: pnpm prebuild. Android release: scripts/build-android-on-mac.sh.
4. Lint check: pnpm lint. Auto-fix & format: pnpm format (eslint --fix + prettier write).
5. Testing: Jest libs present but no test script; add "test":"jest" before using. Single test: pnpm test path/to/file.test.ts -- -t "name" (after adding script + config). Avoid creating tests unless requested.
6. TypeScript: strict true. Use explicit types; rely on inference locally; never use any (prefer unknown / generics). React 19 JSX runtime.
7. Imports: absolute alias ~/_ (maps to src/_). Group order: (react/expo) -> libs -> components -> hooks -> util -> types -> styles. No relative parent hops if alias fits. Side-effect imports first.
8. Styling: Tailwind via nativewind. Keep className tokens sorted (prettier-plugin-tailwind enforces). 100 char print width, single quotes, trailingComma=es5, bracketSameLine=true.
9. Components: PascalCase files exporting a single default component and named helpers as needed. Hooks: useCamelCase in hooks/ or colocated.
10. State/auth: See components/AuthProvider.tsx and hooks/useAuth.ts; keep auth logic centralized—do not duplicate Supabase client setup (reuse lib/supabase.ts).
11. Error handling: Throw Error objects; catch at boundary (screens/providers) and surface user-safe message. Never swallow errors; log with console.error plus contextual tag.
12. Async: Always await supabase calls; handle rejected promises; no floating promises (enable eslint rule if adding tests).
13. Null/undefined: Narrow early; prefer optional chaining + nullish coalescing over || when 0/'' are valid.
14. Naming: booleans prefixed is/has/can/should; functions verbNoun; constants SCREAMING_SNAKE only if truly invariant config; otherwise camelCase.
15. Files: Avoid creating global utils; colocate near usage unless shared broadly.
16. Do not commit secrets. Use .env (example in .env.example). If adding needed vars, update .env.example.
17. Navigation: expo-router; put protected routes under app/(protected). Keep layout changes minimal.
18. Performance: Memoize expensive React computations; avoid inline functions in hot lists unless negligible.
19. PR etiquette: Run lint & format before commit; keep commits focused; reference issue if present.
20. If adding Jest: init config minimally; respect existing lint/prettier; update this file if test conventions change.
