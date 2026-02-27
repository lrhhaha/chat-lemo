import { z } from 'zod';
import type { ToolConfig } from '../types/tool.types';

export const artifactPreviewTool: ToolConfig<{}> = {
  name: 'artifact_preview',
  description: 'Artifact代码生成及预览功能',
  schema: z.object({}),
  handler: async () => {
    // 虚拟工具，实际不会被大模型调用。因为在 chatbot 中会被拦截并转换成 SystemPrompt
    return "Artifact 模式已启用";
  },
  enabled: true,
};
