import { supabase } from "./supabase";

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