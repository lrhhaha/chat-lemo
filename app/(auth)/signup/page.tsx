'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('signup form:', formData)

    try {
      fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.username,
          email: formData.email,
          password: formData.password
        })
      })
    } catch (err) {
      console.log('signup err:', err)
    }


  }

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#050509] text-slate-100"
      style={{ fontFamily: '"Avenir Next", "Sora", "Helvetica Neue", sans-serif' }}
    >
      <div className="absolute inset-0 tech-grid-bg opacity-70"></div>
      <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.25),transparent_70%)] blur-3xl"></div>
      <div className="absolute -right-32 bottom-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.22),transparent_70%)] blur-3xl"></div>
      <div className="ambient-glow"></div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full items-center justify-center px-6 py-12">
        <section
          className="w-full max-w-md animate-fade-in-up"
          style={{ animationDelay: '60ms' }}
        >
          <div className="glass-panel rounded-3xl p-8 shadow-[0_30px_80px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">注册</h2>
                <p className="mt-1 text-sm text-white/60">填写信息即可创建账号。</p>
              </div>
              <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5"></div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm text-white/70">
                用户名
                <input
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-cyan-300/60 focus:bg-white/10"
                  name="username"
                  placeholder="输入你的昵称"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </label>
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
                  placeholder="至少 8 位字符"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-110"
              >
                创建账号
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs text-white/60">
              <span>已有账号？</span>
              <Link className="text-cyan-200 hover:text-cyan-100" href="/signin">
                立即登录
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
