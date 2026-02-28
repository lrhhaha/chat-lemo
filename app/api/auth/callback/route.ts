import { NextResponse } from 'next/server'
import { createClient } from '@/app/backend/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      let response: NextResponse

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host

        response = NextResponse.redirect(`${origin}${next}`)

      } else if (forwardedHost) {
        response = NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        response = NextResponse.redirect(`${origin}${next}`)
      }

      // Explicitly set the cookie
      if (data.session) {
        response.cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        })
      }

      return response
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
