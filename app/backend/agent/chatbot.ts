import '../../utils/loadEnv';
import {
  StateGraph,
  MessagesAnnotation,
  START,
  END
} from '@langchain/langgraph';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { SupabaseSaver } from '@skroyc/langgraph-supabase-checkpointer';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import path from 'path';
import { createModel } from './utils/models';
import { createLangChainTools } from './utils/tools';
import { supabase } from '../database/supabase';

// 全局缓存：存储不同配置的 workflow
const workflowCache = new Map<string, ReturnType<typeof createWorkflow>>();

/**
 * 创建聊天机器人 workflow
 * @param modelId 模型 ID
 * @param toolIds 工具 ID 列表
 */
async function createWorkflow(modelId?: string, toolIds?: string[]) {
  console.log('创建 workflow - 模型:', modelId, '工具:', toolIds);

  // 处理 artifact_preview 这个虚拟工具
  const isArtifactMode = toolIds?.includes('artifact_preview');
  // 从真正传给 LLM 的工具列表中剔除 artifact_preview
  const actualToolIds = toolIds?.filter(id => id !== 'artifact_preview');

  // 创建模型实例
  const model = createModel(modelId);

  // 创建工具实例（toolIds为工具名称）
  const tools = await createLangChainTools(actualToolIds);
  // console.log('tools!!!!!!1', tools.map(it => it.name))
  // 绑定工具到模型
  const modelWithTools = tools.length > 0 ? model.bindTools(tools) : model;

  // 聊天节点：处理用户输入并生成回复
  async function chatbotNode(state: typeof MessagesAnnotation.State) {

    try {
      let messagesToInvoke = [...state.messages];
      
      // 如果启用了 Artifact 模式，动态注入 System Prompt 到消息历史开头
      if (isArtifactMode) {
        // 检查是否已经包含了这个 system prompt 避免重复注入
        const hasArtifactSystemPrompt = messagesToInvoke.some(
          msg => msg._getType() === 'system' && typeof msg.content === 'string' && msg.content.includes('Artifact 模式')
        );
        
        if (!hasArtifactSystemPrompt) {
          const artifactSystemPrompt = new SystemMessage(
            `你现在处于 Artifact 模式。当用户要求你创建、编写、修改 UI 组件或代码时，你必须使用特定的 Markdown 代码块格式包裹你的代码，这样系统才能渲染预览。\n\n` +
            `【极其重要的技术限制，必须严格遵守】：\n` +
            `1. **可用库限制**：你只能使用 React (通过 import React, { useState... } from 'react') 和 Tailwind CSS。\n` +
            `2. **严禁第三方库**：绝对不能使用、不能导入任何其他的第三方 npm 包（例如 lucide-react, framer-motion, recharts, @radix-ui 等）。系统环境中没有安装这些库，一旦导入会导致代码直接崩溃报错！\n` +
            `3. **图标处理**：如果你需要使用图标，请直接在代码中手写内联的 SVG 代码，绝对不要尝试从类似 'lucide-react' 或 '@heroicons/react' 中导入。\n` +
            `4. **样式处理**：只能使用 Tailwind CSS 的 className 进行样式控制，不要使用 styled-components 或 CSS modules。\n\n` +
            `【格式要求】：\n` +
            `\`\`\`tsx artifact title="组件名称"\n` +
            `import React, { useState } from 'react';\n\n` +
            `export default function MyComponent() {\n` +
            `  // 你的 React 代码写在这里\n` +
            `  return <div className="p-4 bg-white text-black">Hello</div>;\n` +
            `}\n` +
            `\`\`\`\n` +
            `注意：只有针对完整的 UI 组件代码使用此格式。如果是解释性文字或零散代码片段，继续使用正常的 markdown。`
          );
          // 将 SystemMessage 插入到消息数组的最前面
          messagesToInvoke = [artifactSystemPrompt, ...messagesToInvoke];
        }
      }

      // 此处会进行流式输出，即整个await期间会一直进行流式输出
      const response = await modelWithTools.invoke(messagesToInvoke);
      console.log('模型响应成功，类型:', response);
      return { messages: [response] };
    } catch (error) {
      console.error('chatbotNode 错误详情:', error);
      console.error('错误栈:', error instanceof Error ? error.stack : '无栈信息');
      throw error;
    }
  }

  // 判断是否需要调用工具
  function shouldContinue(state: typeof MessagesAnnotation.State) {
    const lastMessage = state.messages[state.messages.length - 1];

    // 检查最后一条消息是否包含 tool_calls
    if (lastMessage && lastMessage._getType() === 'ai') {
      const aiMessage = lastMessage as AIMessage;
      // console.log('???', aiMessage)
      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        console.log('检测到工具调用:', aiMessage.tool_calls.length, '个工具');
        return 'tools';
      }
    }

    console.log('无工具调用，结束对话');
    return END;
  }

  // 构建 workflow
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode('chatbot', chatbotNode);

  // 如果有工具，添加工具节点和条件路由
  if (tools.length > 0) {
    const toolNode = new ToolNode(tools);
    workflow
      .addNode('tools', toolNode)
      .addEdge(START, 'chatbot')
      .addConditionalEdges('chatbot', shouldContinue, {
        tools: 'tools',
        [END]: END,
      })
      .addEdge('tools', 'chatbot');
  } else {
    // 无工具，直接连接
    workflow.addEdge(START, 'chatbot').addEdge('chatbot', END);
  }

  return workflow;
}

// 异步初始化检查点保存器
let checkpointer: SupabaseSaver;

const getCheckpointer = (client?: SupabaseClient, userId?: string) => {
  if (client) {
    return new SupabaseSaver(client, undefined, userId);
  }

  if (!checkpointer) {
    // 创建 Supabase 检查点保存器
    console.log('初始化 SupabaseSaver');
    try {
      checkpointer = new SupabaseSaver(supabase);
      console.log('SupabaseSaver 初始化成功');
    } catch (error) {
      console.error('SupabaseSaver 初始化失败:', error);
      throw error;
    }
  }
  return checkpointer;
};

/**
 * 获取应用实例
 * @param modelId 模型 ID（可选）
 * @param toolIds 工具 ID 列表（可选）
 * @returns 编译后的 LangGraph 应用
 */
export const getApp = async (
  modelId?: string, 
  toolIds?: string[],
  client?: SupabaseClient,
  userId?: string
) => {
  // 初始化 checkpointer
  if (!checkpointer) {
    getCheckpointer();
  }

  const checkpointerInstance = getCheckpointer(client, userId);

  // 生成缓存 key
  const cacheKey = `${modelId || 'default'}-${(toolIds || []).sort().join(',')}`;

  // 检查缓存
  if (workflowCache.has(cacheKey)) {
    console.log('使用缓存的 workflow:', cacheKey);
    return workflowCache.get(cacheKey)!;
  }

  // 创建新的 workflow
  console.log('创建新的 workflow:', cacheKey);
  const workflow = await createWorkflow(modelId, toolIds);
  const app = workflow.compile({ checkpointer: checkpointerInstance });

  // 缓存 workflow（限制缓存大小）
  if (workflowCache.size > 10) {
    const firstKey = workflowCache.keys().next().value;
    workflowCache.delete(firstKey);
    console.log('清理缓存:', firstKey);
  }

  workflowCache.set(cacheKey, app);

  return app;
};

export {
  checkpointer,
};
