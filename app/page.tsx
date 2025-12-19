'use client'

import { useRef, useMemo, useState } from 'react'

// 导入组件
import SessionSidebar from './components/SessionSidebar'
import { ChatHeader } from './components/ChatHeader'
import { MessageList } from './components/MessageList'
import { ChatInput, type ChatInputHandle } from './components/ChatInput'
import { BackgroundEffects } from './components/BackgroundEffects'
import { Tool } from './components/ToolSelector'
import { Model } from './components/ModelSelector'

// 导入自定义 Hooks
import { useChatMessages } from './hooks/useChatMessages'
import { useSessionManager } from './hooks/useSessionManager'
import { useChatHistory } from './hooks/useChatHistory'
import { useSendMessage } from './hooks/useSendMessage'

// 导入工具配置
import { toolsConfig } from './agent/config/tools.config'

/**
 * 聊天页面主组件
 *
 * 该组件是聊天应用的主页面,负责:
 * 1. 整合所有子组件(头部、侧边栏、消息列表、输入框)
 * 2. 管理聊天消息状态
 * 3. 管理会话(session)状态
 * 4. 处理消息发送和历史记录加载
 *
 * 架构说明:
 * - 使用自定义 hooks 分离业务逻辑
 * - 组件只负责 UI 渲染和状态组合
 * - 所有复杂逻辑都封装在 hooks 中
 */
export default function ChatPage() {
  const chatInputRef = useRef<ChatInputHandle>(null)

  // ==================== 模型配置 ====================
  const [currentModel, setCurrentModel] = useState('openai:qwen3-max')

  // 可用的模型列表（支持多个提供商）
  // 模型 ID 格式：provider:modelName
  // - Google Gemini: https://ai.google.dev/gemini-api/docs/models?hl=zh-cn
  // - 通义千问: https://help.aliyun.com/zh/dashscope/developer-reference/model-square
  const availableModels = useMemo<Model[]>(() => [
    // 通义千问模型（OpenAI 兼容模式）
    {
      id: 'openai:qwen3-max',
      name: '通义千问 3 Max',
      description: '最新 Qwen3 旗舰模型，超强推理能力'
    },
    {
      id: 'openai:qwen-plus',
      name: '通义千问 Plus',
      description: '平衡性能与成本的高性能模型'
    },
    {
      id: 'openai:qwen-flash',
      name: '通义千问 Flash',
      description: '快速响应，高性价比'
    },
    {
      id: 'openai:qwen3-vl-plus',
      name: '通义千问 3 VL Plus',
      description: '多模态视觉语言模型，支持图文理解'
    },
    // DeepSeek 模型（OpenAI 兼容模式）
    {
      id: 'openai:deepseek-v3.2',
      name: 'DeepSeek V3.2',
      description: 'DeepSeek 最新模型，强大的推理能力'
    },
    // Google Gemini 模型
    {
      id: 'google:gemini-3-pro-preview',
      name: 'Gemini 3 Pro Preview',
      description: '最强大的 Gemini 3 预览版，顶级性能和推理能力'
    },
    {
      id: 'google:gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      description: '强大的多模态模型，平衡性能与速度'
    },
    {
      id: 'google:gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      description: '快速响应，适合日常对话'
    },
    {
      id: 'google:gemini-2.5-flash-lite',
      name: 'Gemini 2.5 Flash Lite',
      description: '超快速的轻量级模型'
    },
  ], [])

  // ==================== 工具配置 ====================
  // 将后端工具配置转换为前端 Tool 格式
  const availableTools = useMemo<Tool[]>(() => {
    return Object.entries(toolsConfig)
      .filter(([_, config]) => config.enabled)
      .map(([id, config]) => ({
        id,
        name: config.name,
        description: config.description,
        icon: getToolIcon(id), // 根据工具 ID 获取对应图标
      }))
  }, [])

  // ==================== 消息管理 ====================
  // 使用 useChatMessages hook 管理所有消息相关的状态和方法
  const {
    messages,              // 当前会话的所有消息
    isLoading,             // 是否正在加载(发送消息中)
    setIsLoading,          // 设置加载状态
    addUserMessage,        // 添加用户消息
    addAssistantMessage,   // 添加 AI 助手消息
    updateMessageContent,  // 更新消息内容(用于流式响应)
    finishStreaming,       // 完成流式传输
    addErrorMessage,       // 添加错误消息
    loadMessages,          // 加载历史消息（传入消息列表，展现在页面上）
    updateToolCalls,       // 更新工具调用
    updateToolResult,      // 更新工具执行结果
    updateToolError        // 更新工具执行错误
  } = useChatMessages()

  // ==================== 会话管理 ====================
  // 使用 useSessionManager hook 管理会话(session)相关状态
  const {
    sessionId,             // 当前会话 ID
    sidebarRef,            // 侧边栏组件引用
    createNewSession,      // 创建新会话
    selectSession,         // 切换会话
    updateSessionName,     // 更新会话名称（会话名称为历史对话的用户的第一句）
    setHasUserMessage      // 设置是否有用户消息(用于判断是否需要更新会话名)
  } = useSessionManager()

  // ==================== 历史记录加载 ====================
  // 使用 useChatHistory hook 自动加载会话历史
  // 当 sessionId 变化时,会自动触发历史记录加载
  useChatHistory(sessionId, loadMessages, setHasUserMessage)

  // ==================== 消息发送 ====================
  // 使用 useSendMessage hook 处理消息发送逻辑
  const { sendMessage } = useSendMessage({
    sessionId,
    setIsLoading,
    addUserMessage,
    addAssistantMessage,
    updateMessageContent,
    finishStreaming,
    addErrorMessage,
    updateSessionName,
    updateToolCalls,
    updateToolResult,
    updateToolError
  })

  // 处理建议点击
  const handleSuggestionClick = (text: string) => {
    if (chatInputRef.current) {
      chatInputRef.current.setInput(text)
    }
  }

  // ==================== 渲染 UI ====================
  return (
    <main className="flex-1 flex flex-row relative h-full overflow-hidden">
      {/* 动态背景 */}
      <div className="absolute inset-0 tech-grid-bg z-0 pointer-events-none"></div>
      <div className="ambient-glow"></div>

      {/* 左侧会话历史侧边栏 - Full Height */}
      <SessionSidebar
        ref={sidebarRef}
        currentSessionId={sessionId}
        onSelect={selectSession}
        onNew={createNewSession}
      />

      {/* 右侧主体内容区域 */}
      <div className="flex-1 flex flex-col z-10 overflow-hidden relative h-full">
        {/* 顶部导航栏 - Moved inside right column */}
        <ChatHeader />

        <div className="flex-1 flex flex-col relative overflow-hidden">
             <div className="flex-1 overflow-y-auto scrollbar-hide scroll-smooth flex flex-col z-10 pb-32" id="chat-container">
                {/* 消息列表 */}
                <MessageList 
                  messages={messages} 
                  isLoading={isLoading} 
                  onSuggestionClick={handleSuggestionClick}
                />
             </div>

             {/* 消息输入框 */}
             <div className="absolute bottom-8 left-0 right-0 px-4 md:px-8 flex justify-center z-30">
                <ChatInput
                  ref={chatInputRef}
                  onSend={sendMessage}
                  disabled={isLoading}
                  availableTools={availableTools}
                  availableModels={availableModels}
                  currentModel={currentModel}
                  onModelChange={setCurrentModel}
                />
             </div>
        </div>
      </div>
    </main>
  )
}

/**
 * 根据工具 ID 返回对应的图标
 */
function getToolIcon(toolId: string): string {
  const iconMap: Record<string, string> = {
    calculator: '🔢',
    weather: '🌤️',
    current_time: '🕐',
    search: '🔍',
  }
  return iconMap[toolId] || '🛠️'
}
