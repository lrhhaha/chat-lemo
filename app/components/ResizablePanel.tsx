'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

interface ResizablePanelProps {
  children: React.ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  width?: number
  onWidthChange?: (width: number) => void
  resizeDirection?: 'right' | 'left'
  className?: string
  showResizeHandle?: boolean
}

export function ResizablePanel({
  children,
  defaultWidth = 320,
  minWidth = 200,
  maxWidth = 800,
  width: controlledWidth,
  onWidthChange,
  resizeDirection = 'right',
  className = '',
  showResizeHandle = true,
}: ResizablePanelProps) {
  const [internalWidth, setInternalWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const width = controlledWidth ?? internalWidth

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    startX.current = e.clientX
    startWidth.current = width

    // 添加全局鼠标事件监听器
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    // 防止文本选择
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
  }, [width])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return

    const deltaX = resizeDirection === 'right'
      ? e.clientX - startX.current
      : startX.current - e.clientX

    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth.current + deltaX))

    if (controlledWidth === undefined) {
      setInternalWidth(newWidth)
    }

    onWidthChange?.(newWidth)
  }, [isResizing, resizeDirection, minWidth, maxWidth, controlledWidth, onWidthChange])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)

    // 移除全局鼠标事件监听器
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    // 恢复默认样式
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [handleMouseMove, handleMouseUp])

  // 清理事件监听器
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      if (isResizing) {
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={panelRef}
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: `${width}px` }}
    >
      {children}

      {showResizeHandle && (
        <div
          className={`
            absolute top-0 bottom-0 w-1 bg-transparent hover:bg-blue-500/50
            transition-colors cursor-col-resize z-10 group
            ${resizeDirection === 'right' ? 'right-0' : 'left-0'}
            ${isResizing ? 'bg-blue-500/50' : ''}
          `}
          onMouseDown={handleMouseDown}
          title="拖拽调整大小"
        >
          <div className={`
            absolute top-1/2 transform -translate-y-1/2
            w-1 h-8 bg-gray-300/50 rounded-full
            group-hover:bg-blue-400/70
            transition-colors
            ${resizeDirection === 'right' ? '-left-0.5' : '-right-0.5'}
            ${isResizing ? 'bg-blue-400/70' : ''}
          `} />
        </div>
      )}
    </div>
  )
}