import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/app/backend/services/auth.service';

/**
 * 邮箱验证回调 API
 *
 * 当用户点击邮件中的验证链接时，Supabase 会重定向到这个路由
 * 路由参数包含验证码，我们需要用它交换 session
 *
 * GET /api/auth/callback?code=...
 */

const COOKIE_NAME = 'sb-access-token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 天
};

// http://localhost:3000/#access_token=eyJhbGciOiJFUzI1NiIsImtpZCI6IjUxOTg1MDBiLTEzN2MtNDdiOC1hNGFhLTQ4MGM4NGUxYjIxOSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL25td2drZ2N6cHpiYW9rbGpkeGFoLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIxZWFhNTJjYi0wYzI2LTQ2OTctOGQzZi02OWJlODRkNWRhMTgiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY3OTYwMzE4LCJpYXQiOjE3Njc5NTY3MTgsImVtYWlsIjoiOTEwNTg0Mzk5QHFxLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiI5MTA1ODQzOTlAcXEuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJscmgiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjFlYWE1MmNiLTBjMjYtNDY5Ny04ZDNmLTY5YmU4NGQ1ZGExOCJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im90cCIsInRpbWVzdGFtcCI6MTc2Nzk1NjcxOH1dLCJzZXNzaW9uX2lkIjoiMmI1ZTUyMjMtMTUxMS00MTZlLTg4YzMtNjA4NDdjNTFmNTk5IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.QiANFgTDg9rCRbpNFMffsfpGEawRqSYn9vF3egWFIaE6ZVdwA0jaH5RnLFHaeHQPxb3HyDRxRTlfWn4Wi3cKyQ&expires_at=1767960318&expires_in=3600&refresh_token=zhzjtaukittf&token_type=bearer&type=signup

export async function GET(request: NextRequest) {
  console.log('???', request.url)
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // 处理错误情况
  if (error) {
    console.error('邮箱验证错误:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/?authError=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

// https://nmwgkgczpzbaokljdxah.supabase.co/auth/v1/verify?token=4680be997f57553500c8ae337d39d0cf5e145e402f8f41e3e0925fde&type=signup&redirect_to=http://localhost:3000/api/auth/callback

  // 如果有验证码，交换 session
  if (code) {
    try {
      const { data, error: exchangeError } = await authService.exchangeCodeForSession(code);
      console.log('11111???', data, exchangeError)

      if (exchangeError) {
        console.error('交换 session 失败:', exchangeError.message);
        return NextResponse.redirect(
          new URL(`/?authError=${encodeURIComponent('验证失败，请重试')}`, request.url)
        );
      }

      // 验证成功，设置 cookie 并重定向到首页
      const redirectUrl = new URL('/', request.url);
      console.log('1111', redirectUrl)
      const response = NextResponse.redirect(redirectUrl);
      // const response = NextResponse.json({test: '1111111'})

      if (data.session?.access_token) {
        response.cookies.set(COOKIE_NAME, data.session.access_token, COOKIE_OPTIONS);
      }

      return response;
    } catch (err) {
      console.error('验证回调错误:', err instanceof Error ? err.message : String(err));
      return NextResponse.redirect(
        new URL(`/?authError=${encodeURIComponent('验证过程中发生错误')}`, request.url)
      );
    }
  }
  // console.log('2222', request.url)
  // return NextResponse.json({test: '222222'})
  // 没有 code 也没有 error，直接重定向到首页
  return NextResponse.redirect(new URL('/', request.url));
}
// https://nmwgkgczpzbaokljdxah.supabase.co/auth/v1/verify?token=96b203a982ca4e72d6066ecfff30fb499a4d6fbd605f7c3a042f36e6&type=signup&redirect_to=http://localhost:3000/api/auth/callback

// https://nmwgkgczpzbaokljdxah.supabase.co/auth/v1/verify?token=pkce_b8d000b48c61d974b8ea5d69821e775cdb56dfbdb45a236f570855ff&type=signup&redirect_to=http://localhost:3000/api/auth/callback

// https://nmwgkgczpzbaokljdxah.supabase.co/auth/v1/verify?token=pkce_6c696d27d885d94d570967776aa2f78b973fd0fc46c85041937cd729&type=signup&redirect_to=http://localhost:3000/api/auth/callback