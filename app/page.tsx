'use client'

import { useRef, useMemo, useState, useEffect } from 'react'

import SessionSidebar from './components/SessionSidebar'
import { ChatHeader } from './components/ChatHeader'
import { MessageList } from './components/MessageList'
import { ChatInput, type ChatInputHandle } from './components/ChatInput'
import { BackgroundEffects } from './components/BackgroundEffects'
import { Tool } from './components/ToolSelector'
import { Model } from './components/ModelSelector'

import { useChatMessages } from './hooks/useChatMessages'
import { useSessionManager } from './hooks/useSessionManager'
import { useChatHistory } from './hooks/useChatHistory'
import { useSendMessage } from './hooks/useSendMessage'

import { toolsConfig } from './backend/agent/config/tools.config'

export default function ChatPage() {
  const chatInputRef = useRef<ChatInputHandle>(null)

  const [currentModel, setCurrentModel] = useState('google:gemini-3-pro-preview')

  const availableModels = useMemo<Model[]>(() => [
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
    {
      id: 'openai:deepseek-v3.2',
      name: 'DeepSeek V3.2',
      description: 'DeepSeek 最新模型，强大的推理能力'
    },
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

  const availableTools = useMemo<Tool[]>(() => {
    return Object.entries(toolsConfig)
      .filter(([_, config]) => config.enabled)
      .map(([id, config]) => ({
        id,
        name: config.name,
        description: config.description,
        icon: getToolIcon(id),
      }))
  }, [])

  const {
    messages,
    isLoading,
    setIsLoading,
    addUserMessage,
    addAssistantMessage,
    updateMessageContent,
    finishStreaming,
    addErrorMessage,
    loadMessages,
    updateToolCalls,
    updateToolResult,
    updateToolError,
    addToolCall
  } = useChatMessages()

  const {
    sessionId,
    sidebarRef,
    createNewSession,
    selectSession,
    setHasUserMessage
  } = useSessionManager()

  useChatHistory(sessionId, loadMessages, setHasUserMessage)

  const { sendMessage } = useSendMessage({
    sessionId,
    setIsLoading,
    addUserMessage,
    addAssistantMessage,
    updateMessageContent,
    finishStreaming,
    addErrorMessage,
    createNewSession,
    updateToolCalls,
    updateToolResult,
    updateToolError,
    addToolCall
  })

  const handleSuggestionClick = (text: string) => {
    if (chatInputRef.current) {
      chatInputRef.current.setInput(text)
    }
  }

  useEffect(() => {
    console.log('page', sessionId)
  }, [sessionId])

  return (
    <main className="flex-1 flex flex-row relative h-full overflow-hidden bg-bg-body">
      <BackgroundEffects />

      <SessionSidebar
        ref={sidebarRef}
        currentSessionId={sessionId}
        onSelect={selectSession}
        onNew={createNewSession}
      />

      <div className="flex-1 flex flex-col z-10 overflow-hidden relative h-full">
        <ChatHeader />

        <div className="flex-1 flex flex-col relative overflow-hidden">
             <div className="flex-1 overflow-y-auto scrollbar-hide scroll-smooth flex flex-col z-10 pb-32" id="chat-container">
                <MessageList 
                  messages={messages} 
                  isLoading={isLoading} 
                  onSuggestionClick={handleSuggestionClick}
                />
             </div>

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

function getToolIcon(toolId: string): string {
  const iconMap: Record<string, string> = {
    calculator: '🔢',
    weather: '🌤️',
    current_time: '🕐',
    search: '🔍',
  }
  return iconMap[toolId] || '🛠️'
}
