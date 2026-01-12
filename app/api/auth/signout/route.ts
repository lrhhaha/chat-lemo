import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/app/backend/services/auth.service';

/**
 * 用户登出 API
 * POST /api/auth/signout
 *
 * 优先从 cookie 获取 token，如果没有则从 Authorization header 获取
 *
 * 成功响应：
 * {
 *   "message": "登出成功"
 * }
 */

const COOKIE_NAME = 'sb-access-token';

export async function POST(request: NextRequest) {
  try {
    // 从 cookie 获取 access_token
    let token = request.cookies.get(COOKIE_NAME)?.value;

    // 如果有 token，执行登出
    if (token) {
      const { error } = await authService.signOut(token);
      if (error) {
        console.error('登出错误:', error.message);
        return NextResponse.json(
          { error: '登出失败' },
          { status: 400 }
        );
      }
    }

    // 创建响应并清除 cookie
    const response = NextResponse.json({
      message: '登出成功',
    });

    response.cookies.delete(COOKIE_NAME);

    return response;

  } catch (error) {
    console.error('登出 API 错误:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}
