'use client'

import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'
import { ArtifactCard } from './ArtifactCard'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // 解析 Artifact 的正则
  const parsedContent = useMemo(() => {
    // 匹配 ```tsx artifact title="xxx" 
    // 以及未闭合的代码块 (实时流式输出时的处理)
    const regex = /```(?:tsx|jsx|typescript|javascript)\s+artifact(?:[\s]+title="([^"]+)")?\s*\n([\s\S]*?)(?:```|$)/g;
    const blocks = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        blocks.push({ type: 'text', content: content.slice(lastIndex, match.index) });
      }
      blocks.push({
        type: 'artifact',
        title: match[1] || 'React Component',
        code: match[2],
        isComplete: match[0].endsWith('```')
      });
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < content.length) {
      blocks.push({ type: 'text', content: content.slice(lastIndex) });
    }
    
    return blocks.length > 0 ? blocks : [{ type: 'text', content }];
  }, [content]);

  return (
    <div className={`markdown-body ${className} max-w-full overflow-hidden`}>
      {parsedContent.map((block, index) => {
        if (block.type === 'artifact') {
          return (
            <div key={index} className="my-4">
              <ArtifactCard 
                title={block.title} 
                code={block.code} 
              />
              {/* 如果还没闭合，下面可以给个“正在生成”的提示，或者直接把半成品放进编辑器预览 */}
              {!block.isComplete && (
                <div className="text-xs text-primary animate-pulse mt-2 italic">
                  正在生成 Artifact 代码...
                </div>
              )}
            </div>
          );
        }

        // 普通文本使用 ReactMarkdown 渲染
        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={{
              // 代码块强制不超出容器宽度
              code({ node, inline, className, children, ...props }: any) {
                if (!inline) {
                  return (
                    <div className="rounded-md overflow-hidden">
                      <code
                        className={`${className} block break-words whitespace-pre-wrap`}
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        {...props}
                      >
                        {children}
                      </code>
                    </div>
                  )
                }
                return (
                  <code
                    className={`${className} break-all`}
                    style={{ wordBreak: 'break-all' }}
                    {...props}
                  >
                    {children}
                  </code>
                )
              },
              // 表格使用固定布局，防止溢出
              table({ node, children, ...props }: any) {
                return (
                  <div className="overflow-hidden">
                    <table
                      className="table-fixed w-full"
                      style={{ tableLayout: 'fixed', wordBreak: 'break-word' }}
                      {...props}
                    >
                      {children}
                    </table>
                  </div>
                )
              },
              // 表格单元格强制换行
              th({ node, children, ...props }: any) {
                return (
                  <th
                    style={{ wordBreak: 'break-word', maxWidth: '200px' }}
                    {...props}
                  >
                    {children}
                  </th>
                )
              },
              td({ node, children, ...props }: any) {
                return (
                  <td
                    style={{ wordBreak: 'break-word', maxWidth: '200px' }}
                    {...props}
                  >
                    {children}
                  </td>
                )
              },
              // 其他文本元素也强制换行
              p({ node, children, ...props }: any) {
                return (
                  <p
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    {...props}
                  >
                    {children}
                  </p>
                )
              },
              h1({ node, children, ...props }: any) {
                return (
                  <h1
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    {...props}
                  >
                    {children}
                  </h1>
                )
              },
              h2({ node, children, ...props }: any) {
                return (
                  <h2
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    {...props}
                  >
                    {children}
                  </h2>
                )
              },
              h3({ node, children, ...props }: any) {
                return (
                  <h3
                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    {...props}
                  >
                    {children}
                  </h3>
                )
              },
            }}
          >
            {block.content}
          </ReactMarkdown>
        );
      })}
    </div>
  )
}
