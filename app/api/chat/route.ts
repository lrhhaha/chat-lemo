import '../../utils/loadEnv';
import { NextRequest, NextResponse } from 'next/server';
import { HumanMessage, mapStoredMessageToChatMessage, mapStoredMessagesToChatMessages } from '@langchain/core/messages';
import { getApp } from '@/app/agent/chatbot';
import { createSession, updateSessionName } from '@/app/agent/db';

// 引入uuid生成器
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // 解析 JSON 请求体
    const body = await request.json();
    const { message, thread_id, tools, model } = body;

    if (!message) {
      return NextResponse.json({ error: '无效的消息格式' }, { status: 400 });
    }

    console.log('收到请求 - 模型:', model, '工具:', tools);

    // 创建 LangChain 消息对象
    let userMessage;
    if (typeof message === 'string') {
      // 字符串格式：创建 HumanMessage
      userMessage = new HumanMessage(message);
    } else if (Array.isArray(message)) {
      // 数组格式：多模态内容（文本 + 图片）
      userMessage = new HumanMessage({
        content: message
      });
    } else if (typeof message === 'object' && message !== null) {
      // 对象格式：尝试重建 LangChain 消息
      try {
        userMessage = mapStoredMessageToChatMessage(message);
      } catch (error) {
        console.error('重建消息对象失败:', error);
        // 如果重建失败，尝试提取 content
        const content = message.content || message.kwargs?.content;
        if (content) {
          userMessage = new HumanMessage(content);
        } else {
          return NextResponse.json({
            error: '无效的消息格式',
            detail: '消息对象缺少 content 字段'
          }, { status: 400 });
        }
      }
    } else {
      return NextResponse.json({ error: '无效的消息格式' }, { status: 400 });
    }

    const isNewSession = !thread_id
    // 优先使用前端传入的thread_id，否则自动生成
    const threadId =
      typeof thread_id === 'string' && thread_id ? thread_id : randomUUID();
    const threadConfig = { configurable: { thread_id: threadId } };

    // 如果是新会话，在数据库中创建会话记录
    if (isNewSession) {
      // 提取用户消息的文本内容作为会话名称
      let sessionName = '新会话';
      if (typeof message === 'string') {
        sessionName = message || '新会话';
      } else if (Array.isArray(message)) {
        // 从多模态内容中提取文本
        const textContent = message.find(item => item.type === 'text');
        sessionName = textContent?.text || '新会话';
      } else if (typeof message === 'object' && message !== null) {
        // 从消息对象中提取文本
        const content = message.content || message.kwargs?.content;
        if (typeof content === 'string') {
          sessionName = content || '新会话';
        } else if (Array.isArray(content)) {
          const textContent = content.find(item => item.type === 'text');
          sessionName = textContent?.text || '新会话';
        }
      }

      // 创建会话，使用用户消息作为名称（默认为"新会话"）
      createSession(threadId, sessionName);
    }


    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 获取应用实例，传入模型和工具配置
          const app = await getApp(model, tools);

          let completeMessage = null;

          // 使用 streamEvents 获取流式响应
          for await (const event of app.streamEvents(
            { messages: [userMessage] },
            { version: 'v2', ...threadConfig }
          )) {
            if (event.event === 'on_chat_model_stream') {
              const chunk = event.data?.chunk;
              if (chunk?.content) {
                // 发送内容片段（保持现有的流式体验）
                const data =
                  JSON.stringify({
                    type: 'chunk',
                    content: chunk.content,
                  }) + '\n';
                controller.enqueue(new TextEncoder().encode(data));
              }
              // 保存完整的消息对象（用于最后发送）
              completeMessage = chunk;
            }
            // 捕获工具调用开始事件
            else if (event.event === 'on_chat_model_end') {
              const output = event.data?.output;
              if (output?.tool_calls && output.tool_calls.length > 0) {
                // 透传原始 tool_calls 数据，避免字段丢失
                const toolCallData = JSON.stringify({
                  type: 'tool_calls',
                  tool_calls: output.tool_calls
                }) + '\n';
                controller.enqueue(new TextEncoder().encode(toolCallData));
              }
            }
            // 捕获工具执行结果
            else if (event.event === 'on_tool_end') {
              // 透传完整的工具执行信息
              const toolCallData = JSON.stringify({
                type: 'tool_result',
                name: event.name,
                data: event.data  // 透传完整的 data 对象
              }) + '\n';
              controller.enqueue(new TextEncoder().encode(toolCallData));
            }
            // 捕获工具执行错误
            else if (event.event === 'on_tool_error') {
              // 透传完整的错误信息
              const toolErrorData = JSON.stringify({
                type: 'tool_error',
                name: event.name,
                data: event.data  // 透传完整的 data 对象，包含错误堆栈等
              }) + '\n';
              controller.enqueue(new TextEncoder().encode(toolErrorData));
            }
          }

          // 获取最终状态，包含完整的消息历史
          const finalState = await app.getState(threadConfig);
          const allMessages = finalState?.values?.messages || [];

          // 序列化消息对象（用于传输）
          const serializedMessage = completeMessage ? JSON.parse(JSON.stringify(completeMessage)) : null;
          const serializedMessages = allMessages.map((msg: any) => JSON.parse(JSON.stringify(msg)));

          // 发送结束标记，包含序列化的消息对象
          const endData =
            JSON.stringify({
              type: 'end',
              status: 'success',
              thread_id: threadId,
              message: serializedMessage, // 发送序列化的消息对象
              messages: serializedMessages, // 发送所有序列化的消息历史
            }) + '\n';
          controller.enqueue(new TextEncoder().encode(endData));
          controller.close();
        } catch (error) {
          console.error('流式聊天错误:', error);
          const errorData =
            JSON.stringify({
              type: 'error',
              error: '服务器内部错误',
              message: '抱歉，处理你的请求时出现了问题。请稍后重试。',
            }) + '\n';
          controller.enqueue(new TextEncoder().encode(errorData));
          controller.close();
        }
      },
    });

    // 返回流式响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('聊天 API 错误:', error);
    return NextResponse.json(
      {
        error: '服务器内部错误',
        response: '抱歉，处理你的请求时出现了问题。请稍后重试。',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // 判断是否为历史记录请求
  const { searchParams } = new URL(request.url);
  const thread_id = searchParams.get('thread_id');
  if (thread_id) {
    try {
      // 获取应用实例
      const app = await getApp();

      // 通过graph.getState获取历史
      const state = await app.getState({
        configurable: { thread_id },
      });

      // 序列化消息对象（用于传输）
      const messages = state?.values?.messages || [];
      const serializedMessages = messages.map((msg: any) => JSON.parse(JSON.stringify(msg)));

      return NextResponse.json({
        thread_id,
        history: serializedMessages,
      });
    } catch (e) {
      return NextResponse.json(
        { error: '获取历史记录失败', detail: String(e) },
        { status: 500 }
      );
    }
  }
  // 默认返回API信息
  return NextResponse.json({
    message: 'LangGraph 聊天 API 正在运行',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chat (流式响应)',
      history: 'GET /api/chat?thread_id=xxx (获取历史记录)',
    },
  });
}
