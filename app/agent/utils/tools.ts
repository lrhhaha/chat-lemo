import { DynamicStructuredTool } from '@langchain/core/tools';
import { toolsConfig } from '../config/tools.config';
import type { ToolConfig } from '../types/tool.types';
import type { MultiServerMCPClient } from "@langchain/mcp-adapters";


/**
 * 将自定义工具配置转换为 LangChain Tool 格式
 * @param toolConfig 自定义工具配置
 * @returns LangChain DynamicStructuredTool 实例
 */
export function convertToLangChainTool(
  toolConfig: ToolConfig
): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: toolConfig.name,
    description: toolConfig.description,
    schema: toolConfig.schema,
    func: async (input: any) => {
      try {
        console.log(`调用工具: ${toolConfig.name}，参数:`, input);
        const result = await toolConfig.handler(input);
        console.log(`工具 ${toolConfig.name} 返回结果:`, result);
        return result;
      } catch (error) {
        console.error(`工具 ${toolConfig.name} 执行失败:`, error);
        return `工具执行失败: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}

/**
 * 根据工具 ID 列表创建 LangChain 工具数组
 * @param toolIds 工具 ID 列表
 * @returns LangChain Tool 数组
 */
export async function createLangChainTools(
  toolIds?: string[]
): Promise<DynamicStructuredTool[]> {
  if (!toolIds || toolIds.length === 0) {
    console.log('未选择任何工具');
    return [];
  }

  // 工具数组
  const tools: DynamicStructuredTool[] = [];

  for (const toolId of toolIds) {
    // 取出每个工具配置项
    const toolConfig = toolsConfig[toolId];

    if (!toolConfig) {
      console.warn(`工具不存在: ${toolId}`);
      continue;
    }

    if (toolId.endsWith('_mcp')) {
      // mcp
      // const mcpTools = await (toolConfig as MultiServerMCPClient).getTools()
      // tools.push(...mcpTools)
      console.log(`已添加mcp工具：${toolId}`)
    } else {
      // 自定义工具
      if (!(toolConfig as ToolConfig).enabled) {
        console.warn(`工具未启用: ${toolId}`);
        continue;
      }

      // 通过配置项创建工具
      tools.push(convertToLangChainTool(toolConfig as ToolConfig));
      console.log(`已添加工具: ${(toolConfig as ToolConfig).name}`);
    }




  }

  console.log(`总共创建了 ${tools.length} 个工具`);
  return tools;
}
