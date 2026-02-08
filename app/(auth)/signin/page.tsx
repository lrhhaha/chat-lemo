'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter} from 'next/navigation'
import { Github } from 'lucide-react'
import { createClient } from '@/app/backend/utils/supabase/client'

export default function SigninPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGitHubSignIn = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
    } catch (error) {
      console.error('GitHub login failed:', error)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })
      const data = await res.json() as any;
      if (data.message === '登录成功') router.push('/')
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#050509] text-slate-100"
      style={{ fontFamily: '"Avenir Next", "Sora", "Helvetica Neue", sans-serif' }}
    >
      <div className="absolute inset-0 tech-grid-bg opacity-70"></div>
      <div className="absolute -left-32 top-12 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.22),transparent_70%)] blur-3xl"></div>
      <div className="absolute -right-40 bottom-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.2),transparent_70%)] blur-3xl"></div>
      <div className="ambient-glow"></div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-12">
        <div
          className="glass-panel w-full max-w-lg animate-fade-in-up rounded-3xl p-8 shadow-[0_30px_80px_rgba(15,23,42,0.45)]"
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">欢迎回来</h1>
              <p className="mt-2 text-sm text-white/60">使用邮箱与密码进入你的对话空间。</p>
            </div>
            <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5"></div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm text-white/70">
              邮箱
              <input
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-cyan-300/60 focus:bg-white/10"
                type="email"
                name="email"
                placeholder="you@domain.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-white/70">
              密码
              <input
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-cyan-300/60 focus:bg-white/10"
                type="password"
                name="password"
                placeholder="输入账号密码"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-110"
            >
              登录
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-xs text-white/40">OR</span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          <button
            type="button"
            onClick={handleGitHubSignIn}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Github className="h-5 w-5" />
            使用 GitHub 登录
          </button>

          <div className="mt-6 flex items-center justify-between text-xs text-white/60">
            <span>还没有账号？</span>
            <Link className="text-cyan-200 hover:text-cyan-100" href="/signup">
              注册新账号
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
