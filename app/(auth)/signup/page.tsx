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

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12 lg:flex-row lg:items-stretch lg:gap-10">
        <section
          className="flex w-full flex-col justify-center animate-fade-in-up lg:w-1/2"
          style={{ animationDelay: '60ms' }}
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60">
            Create Account
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            在这里开始你的灵感之旅
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            使用全新的账号加入对话空间，构建属于你的专属工作流。无需复杂配置，即刻体验细腻的光影与沉浸式交互。
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-white/70 sm:text-sm">
            {[
              { label: '流光背景', value: '多层渐变' },
              { label: '数据安全', value: '本地加密' },
              { label: '智能模型', value: '多供应商' },
              { label: '轻量体验', value: '即时响应' }
            ].map((item) => (
              <div
                key={item.label}
                className="glass-panel flex items-center justify-between rounded-2xl px-4 py-3"
              >
                <span>{item.label}</span>
                <span className="text-white/90">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          className="mt-10 w-full max-w-lg animate-fade-in-up lg:mt-0 lg:w-1/2"
          style={{ animationDelay: '180ms' }}
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
