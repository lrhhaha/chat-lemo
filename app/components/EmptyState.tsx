'use client'

import { Network, Atom, Bot, Sparkles } from 'lucide-react'

interface EmptyStateProps {
    onAction?: (text: string) => void;
}

export function EmptyState({ onAction }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in-up w-full max-w-5xl mx-auto px-4 py-12">
      
      <div className="mb-8 relative group">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
        <div className="relative w-24 h-24 bg-bg-component rounded-full shadow-elevated flex items-center justify-center border border-border-secondary">
           <Bot className="w-12 h-12 text-primary" strokeWidth={1.5} />
        </div>
        <div className="absolute -top-2 -right-2 bg-bg-component p-1.5 rounded-full shadow-sm border border-border-secondary animate-bounce delay-100">
            <Sparkles className="w-5 h-5 text-warning" fill="currentColor" fillOpacity={0.2} />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-semibold mb-4 tracking-tight text-text-main">
        欢迎使用 <span className="text-primary">chat-lemo</span> 智能助手
      </h1>
      <p className="text-text-secondary max-w-lg text-lg mb-12 leading-relaxed">
        基于下一代 AI 模型，为您提供
        <span className="text-text-main font-medium mx-1">智能问答</span>、
        <span className="text-text-main font-medium mx-1">代码生成</span>
        服务。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl w-full px-4 text-left">
        <button 
           onClick={() => onAction?.('如何学习LangGraph JS')}
           className="group bg-bg-component border border-border-secondary hover:border-primary p-6 rounded-lg flex items-start text-left gap-4 transition-all hover:shadow-card cursor-pointer"
        >
          <div className="w-12 h-12 rounded-lg bg-primary-bg flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="text-text-main font-medium text-base mb-1 group-hover:text-primary transition-colors">LangGraph 学习路径</div>
            <div className="text-text-secondary text-sm leading-relaxed">掌握 StateGraph、Nodes 与 Edges 的核心概念，构建强大的 Agent 应用。</div>
          </div>
        </button>

        <button 
           onClick={() => onAction?.('如何对一个React组件进行性能优化')}
           className="group bg-bg-component border border-border-secondary hover:border-primary p-6 rounded-lg flex items-start text-left gap-4 transition-all hover:shadow-card cursor-pointer"
        >
          <div className="w-12 h-12 rounded-lg bg-primary-bg flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
            <Atom className="w-6 h-6" />
          </div>
          <div>
            <div className="text-text-main font-medium text-base mb-1 group-hover:text-primary transition-colors">React 性能优化</div>
            <div className="text-text-secondary text-sm leading-relaxed">理解React组件渲染逻辑，提供可落地的优化建议。</div>
          </div>
        </button>
      </div>
    </div>
  )
}
