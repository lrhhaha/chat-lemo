import { z } from 'zod';
import {
  toolManager,
  getAllTools,
  getToolInfo,
  getAllToolsInfo,
  isToolEnabled,
  initializeAgentTools,
  createAgentToolsConfig,
} from '../tools';
import {
  addToolConfig,
  disableTool,
  enableTool,
  getCurrentEnvironmentConfig,
} from './tools.config';

// 示例：如何使用新的工具配置系统

async function demonstrateToolConfiguration() {
  console.log('=== 工具配置系统演示 ===\n');

  // 1. 查看当前环境配置
  console.log('1. 当前环境配置:');
  const envConfig = getCurrentEnvironmentConfig();
  console.log(JSON.stringify(envConfig, null, 2));
  console.log();

  // 2. 获取所有启用的工具信息
  console.log('2. 所有启用的工具:');
  const toolsInfo = getAllToolsInfo();
  toolsInfo.forEach((tool) => {
    console.log(`- ${tool.name}: ${tool.description}`);
  });
  console.log();

  // 3. 检查特定工具是否启用
  console.log('3. 工具状态检查:');
  console.log(`计算器工具启用: ${isToolEnabled('calculator')}`);
  console.log(`天气工具启用: ${isToolEnabled('weather')}`);
  console.log(`不存在的工具启用: ${isToolEnabled('nonexistent')}`);
  console.log();

  // 4. 获取特定工具的详细信息
  console.log('4. 工具详细信息:');
  const calculatorInfo = getToolInfo('calculator');
  console.log('计算器工具信息:', JSON.stringify(calculatorInfo, null, 2));
  console.log();

  // 5. 动态添加新工具
  console.log('5. 动态添加新工具:');
  addToolConfig<{ text: string; targetLanguage: string }>('translator', {
    description: '翻译文本到不同语言',
    enabled: true,
    schema: z.object({
      text: z.string().describe('要翻译的文本'),
      targetLanguage: z.string().describe('目标语言'),
    }),
    handler: async (params?: { text: string; targetLanguage: string }) => {
      if (!params) return '';
      const { text, targetLanguage } = params;
      // 模拟翻译功能
      return `将 "${text}" 翻译为 ${targetLanguage}: [翻译结果]`;
    },
    options: {
      supportedLanguages: ['en', 'zh', 'ja', 'ko', 'fr', 'de'],
      apiKey: process.env.TRANSLATOR_API_KEY,
    },
  });

  console.log('新工具已添加');
  console.log(`翻译工具启用: ${isToolEnabled('translator')}`);
  console.log();

  // 6. 使用工具管理器
  console.log('6. 使用工具管理器:');
  const translatorStatus = toolManager.getToolStatus('translator');
  console.log('翻译工具状态:', JSON.stringify(translatorStatus, null, 2));

  const allToolsList = toolManager.listTools();
  console.log(`总共有 ${allToolsList.length} 个工具`);
  console.log();

  // 7. 禁用和启用工具
  console.log('7. 动态禁用/启用工具:');
  console.log(`搜索工具启用 (禁用前): ${isToolEnabled('search')}`);

  disableTool('search');
  console.log(`搜索工具启用 (禁用后): ${isToolEnabled('search')}`);

  enableTool('search');
  console.log(`搜索工具启用 (重新启用后): ${isToolEnabled('search')}`);
  console.log();

  // 8. 初始化工具
  console.log('8. 初始化工具:');
  const toolsResult = await initializeAgentTools();
  console.log(`初始化了 ${toolsResult.allTools.length} 个工具`);
  console.log(`启用的工具: ${toolsResult.enabledTools.join(', ')}`);
  console.log(`调试模式: ${toolsResult.debugMode}`);
  console.log();

  // 9. 创建工具配置（用于 LangGraph）
  console.log('9. 创建 LangGraph 工具配置:');
  const graphConfig = createAgentToolsConfig();
  console.log('LangGraph 配置:', {
    enabledTools: graphConfig.enabledTools,
    debugMode: graphConfig.debugMode,
    toolsCount: graphConfig.tools.length,
  });
  console.log();

  // 10. 获取实际的 LangChain 工具实例
  console.log('10. LangChain 工具实例:');
  const tools = getAllTools();
  tools.forEach((tool) => {
    console.log(`- ${tool.name}: ${tool.description}`);
  });
}

// 示例：如何在不同环境中配置工具
export function configureToolsForEnvironment(
  environment: 'development' | 'production' | 'test'
) {
  console.log(`=== 为 ${environment} 环境配置工具 ===`);

  // 注意：在实际应用中，环境变量通常在启动时设置
  // 这里只是演示如何根据不同环境获取配置
  console.log(`当前环境: ${environment}`);

  // 获取环境配置
  const envConfig = getCurrentEnvironmentConfig();
  console.log('环境配置:', envConfig);

  // 根据环境调整工具配置
  if (environment === 'production') {
    // 生产环境可能需要禁用某些调试工具
    console.log('生产环境：禁用调试相关工具');
  } else if (environment === 'test') {
    // 测试环境只启用基本工具
    console.log('测试环境：只启用基本工具');
  } else {
    // 开发环境启用所有工具
    console.log('开发环境：启用所有工具');
  }
}

// 示例：如何扩展工具配置
export function extendToolConfiguration() {
  console.log('=== 扩展工具配置示例 ===');

  // 添加数据库查询工具
  addToolConfig<{ query: string; database?: string }>('database_query', {
    description: '查询数据库',
    enabled: true,
    schema: z.object({
      query: z.string().describe('SQL 查询语句'),
      database: z.string().optional().describe('数据库名称'),
    }),
    handler: async (params?: { query: string; database?: string }) => {
      if (!params) return '';
      const { query, database = 'default' } = params;
      // 模拟数据库查询
      return `在数据库 ${database} 中执行查询: ${query}\n结果: [模拟查询结果]`;
    },
    options: {
      connectionString: process.env.DATABASE_URL,
      timeout: 30000,
      maxRows: 1000,
    },
  });

  // 添加文件操作工具
  addToolConfig<{ operation: string; path: string; content?: string }>('file_operations', {
    description: '文件操作工具',
    enabled: true,
    schema: z.object({
      operation: z
        .enum(['read', 'write', 'delete', 'list'])
        .describe('操作类型'),
      path: z.string().describe('文件路径'),
      content: z.string().optional().describe('文件内容（写入时使用）'),
    }),
    handler: async (params?: { operation: string; path: string; content?: string }) => {
      if (!params) return '';
      const { operation, path, content } = params;
      switch (operation) {
        case 'read':
          return `读取文件 ${path}: [文件内容]`;
        case 'write':
          return `写入文件 ${path}: ${content}`;
        case 'delete':
          return `删除文件 ${path}: 成功`;
        case 'list':
          return `列出目录 ${path}: [文件列表]`;
        default:
          return `未知操作: ${operation}`;
      }
    },
    options: {
      allowedPaths: ['/tmp', '/uploads'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  console.log('已添加扩展工具配置');
}

// 如果直接运行此文件，执行演示
if (require.main === module) {
  demonstrateToolConfiguration().catch(console.error);
}

export { demonstrateToolConfiguration };
