import { supabase } from "./supabase";
import { SupabaseClient } from '@supabase/supabase-js';

export function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  redirectTo: string
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      // 邮件完成校验后，会重定向回以下地址
      emailRedirectTo: redirectTo,
    },
  });
}

// 邮箱验证回调，交换 session
export async function exchangeCodeForSession(code: string) {
  return supabase.auth.exchangeCodeForSession(code);
}

// 邮箱 + 密码登录
export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

// 通过 access_token 执行登出
export async function signOutWithToken(token: string,  client?: SupabaseClient) {
  const db = client || supabase;

  return db.auth.signOut();
}

// 通过 access_token 获取用户信息
export async function getUserByToken(token: string) {
  return supabase.auth.getUser(token);
}

// OAuth 登录 (GitHub)
export async function signInWithOAuth(provider: 'github') {
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });
}