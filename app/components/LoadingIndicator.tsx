'use client'

import { Bot } from 'lucide-react'

/**
 * 加载指示器组件
 *
 * 在 AI 回复时显示的加载动画,包括:
 * - AI 机器人头像（带脉冲动画）
 * - 三个跳动的彩色圆点
 * - "AI 正在思考..." 文本提示（带闪烁效果）
 *
 * 特性:
 * - 渐入动画效果
 * - 圆点依次跳动(错开延迟)
 * - 头像脉冲动画
 * - 与消息气泡风格一致
 */
export function LoadingIndicator() {
  return (
    <div className="flex gap-4 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
          <Bot className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl rounded-bl-md p-4 shadow-lg shadow-blue-500/10">
        <div className="flex items-center gap-3">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce shadow-lg shadow-blue-400/50"></div>
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce shadow-lg shadow-indigo-400/50" style={{ animationDelay: '0.3s' }}></div>
          </div>
          <span className="text-blue-200 text-sm ml-1 animate-pulse">AI 正在思考...</span>
        </div>
      </div>
    </div>
  )
}
