# Learnings

## Authentication
- The project uses Supabase for authentication.
- `app/backend/database/auth.ts` handles direct Supabase calls.
- `app/backend/services/auth.service.ts` wraps these calls.
- `app/api/auth/callback/route.ts` handles the OAuth callback and code exchange.
- `app/(auth)/signin/page.tsx` is the login page.

## Current State
- `app/backend/database/auth.ts` has been updated to include `signInWithOAuth`.
- Need to update `app/backend/services/auth.service.ts` to expose this function.
- Need to update `app/(auth)/signin/page.tsx` to use this function.

## Implementation Details
- `app/backend/services/auth.service.ts` is safe to use in client components because it relies on `app/backend/database/supabase.ts` which uses public environment variables.
- `next.config.ts` is configured to ignore TypeScript build errors (`ignoreBuildErrors: true`).
- `AuthService` acts as a facade for `database/auth.ts` functions.

## Supabase SSR
- **Default Cookie Name**: `sb-<project-id>-auth-token` (standard Supabase default).
- **Customization**: Use `cookieOptions: { name: 'custom-name' }` in `createServerClient` and `createBrowserClient`.
