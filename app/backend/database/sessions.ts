import { supabase } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Session 数据类型
 */
export interface SessionRow {
  id: string;
  name: string;
  created_at: string;
  user_id?: string; // 用户ID
}

export async function createSession(
  id: string,
  name: string,
  userId: string,
  client?: SupabaseClient
): Promise<void> {
  const db = client || supabase;
  const { error } = await db
    .from('sessions')
    .insert({
      id,
      name,
      user_id: userId,
    });

  if (error) {
    throw new Error(`创建会话失败: ${error.message}`);
  }
}

export async function getAllSessions(client?: SupabaseClient): Promise<SessionRow[]> {
  // 传入supabase客户端是为了使用携带auth认证的客户端，以便通过RLS策略
  const db = client || supabase;
  const { data, error } = await db
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`获取会话列表失败: ${error.message}`);
  }

  return data || [];
}