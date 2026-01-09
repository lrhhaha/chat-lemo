import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/app/services/auth.service';

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

export async function GET(request: NextRequest) {
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

  // 如果有验证码，交换 session
  if (code) {
    try {
      const { data, error: exchangeError } = await authService.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('交换 session 失败:', exchangeError.message);
        return NextResponse.redirect(
          new URL(`/?authError=${encodeURIComponent('验证失败，请重试')}`, request.url)
        );
      }

      // 验证成功，设置 cookie 并重定向到首页
      const redirectUrl = new URL('/', request.url);
      const response = NextResponse.redirect(redirectUrl);

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

  // 没有 code 也没有 error，直接重定向到首页
  return NextResponse.redirect(new URL('/', request.url));
}
