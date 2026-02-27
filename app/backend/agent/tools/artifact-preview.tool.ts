import { z } from 'zod';
import type { ToolConfig } from '../types/tool.types';

export const artifactPreviewTool: ToolConfig<{}> = {
  name: 'artifact_preview',
  description: '此工具为前端虚拟工具。当被选中时，开启大模型的 Artifact UI 组件代码预览生成模式，要求其按照指定 markdown 格式返回 React 代码。',
  schema: z.object({}),
  handler: async () => {
    // 虚拟工具，实际不会被大模型调用。因为在 chatbot 中会被拦截并转换成 SystemPrompt
    return "Artifact 模式已启用";
  },
  enabled: true,
};
