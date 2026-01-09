# Agent 工具配置系统

这个配置系统允许你通过配置文件来管理 Agent 的工具，而不是在代码中硬编码工具定义。

## 文件结构

```
app/agent/config/
├── tools.config.ts    # 工具配置定义
├── example.ts         # 使用示例
└── README.md          # 本文档
```

## 核心特性

### 1. 配置驱动的工具管理

- 所有工具都在 `tools.config.ts` 中定义
- 支持环境特定的工具启用/禁用
- 运行时动态添加、启用、禁用工具

### 2. 环境配置

支持不同环境的工具配置：

- `development`: 开发环境，启用所有工具，开启调试模式
- `production`: 生产环境，启用核心工具，关闭调试模式
- `test`: 测试环境，只启用基本工具，开启调试模式

### 3. 工具配置接口

每个工具配置包含：

- `name`: 工具名称
- `description`: 工具描述
- `enabled`: 是否启用
- `schema`: Zod 验证模式
- `handler`: 工具处理函数
- `options`: 可选配置项（API 密钥、超时等）

## 使用方法

### 基本使用

```typescript
import { getAllTools, getTool, toolManager } from '../tools';

// 获取所有启用的工具
const tools = getAllTools();

// 获取特定工具
const calculator = getTool('calculator');
const result = await calculator.invoke({ expression: '2 + 3' });

// 检查工具状态
const isEnabled = toolManager.getToolStatus('calculator');
```

### 动态工具管理

```typescript
import { addToolConfig, disableTool, enableTool } from './tools.config';

// 添加新工具
addToolConfig('translator', {
  description: '翻译文本',
  enabled: true,
  schema: z.object({
    text: z.string(),
    targetLanguage: z.string(),
  }),
  handler: async ({ text, targetLanguage }) => {
    return `翻译 "${text}" 到 ${targetLanguage}`;
  },
});

// 禁用工具
disableTool('search');

// 启用工具
enableTool('search');
```

### 在 LangGraph 中使用

```typescript
import { initializeAgentTools, createAgentToolsConfig } from '../tools';

// 初始化工具
const { allTools, debugMode } = await initializeAgentTools();

// 创建 LangGraph 配置
const config = createAgentToolsConfig();

// 在 Agent 中使用
const agent = createReactAgent({
  llm,
  tools: config.tools,
  // ...其他配置
});
```

## 工具配置示例

### 基础工具配置

```typescript
export const toolsConfig: Record<string, ToolConfig> = {
  calculator: {
    name: 'calculator',
    description: '计算数学表达式',
    enabled: true,
    schema: z.object({
      expression: z.string().describe('数学表达式'),
    }),
    handler: async ({ expression }) => {
      const result = Function(`"use strict"; return (${expression})`)();
      return `计算结果: ${expression} = ${result}`;
    },
  },

  weather: {
    name: 'weather',
    description: '查询天气信息',
    enabled: true,
    schema: z.object({
      city: z.string().describe('城市名称'),
    }),
    handler: async ({ city }) => {
      // 天气查询逻辑
      return `${city}的天气信息...`;
    },
    options: {
      apiKey: process.env.WEATHER_API_KEY,
      timeout: 5000,
    },
  },
};
```

### 环境配置

```typescript
export const environmentConfig: EnvironmentConfig = {
  development: {
    enabledTools: ['calculator', 'weather', 'current_time', 'search'],
    debugMode: true,
  },
  production: {
    enabledTools: ['calculator', 'weather', 'current_time'],
    debugMode: false,
  },
  test: {
    enabledTools: ['calculator', 'current_time'],
    debugMode: true,
  },
};
```

## API 参考

### 工具管理函数

- `getAllTools()`: 获取所有启用的工具
- `getTool(name)`: 获取特定工具
- `getToolsMap()`: 获取工具映射对象
- `isToolEnabled(name)`: 检查工具是否启用
- `getToolInfo(name)`: 获取工具信息
- `getAllToolsInfo()`: 获取所有工具信息

### 配置管理函数

- `getCurrentEnvironmentConfig()`: 获取当前环境配置
- `getEnabledToolsConfig()`: 获取启用的工具配置
- `addToolConfig(name, config)`: 添加工具配置
- `disableTool(name)`: 禁用工具
- `enableTool(name)`: 启用工具
- `validateToolConfig(config)`: 验证工具配置

### 工具管理器

```typescript
toolManager.addTool(name, config); // 添加工具
toolManager.disableTool(name); // 禁用工具
toolManager.enableTool(name); // 启用工具
toolManager.getToolStatus(name); // 获取工具状态
toolManager.listTools(); // 列出所有工具
```

## 最佳实践

### 1. 工具配置组织

- 将相关工具分组
- 使用清晰的命名约定
- 添加详细的描述和选项

### 2. 环境管理

- 在不同环境中启用适当的工具
- 生产环境中禁用调试工具
- 测试环境中只启用必要工具

### 3. 安全考虑

- 敏感配置使用环境变量
- 验证工具输入参数
- 限制工具的访问权限

### 4. 性能优化

- 延迟加载重型工具
- 缓存工具实例
- 设置合理的超时时间

## 扩展工具

### 添加新工具类型

```typescript
// 数据库查询工具
addToolConfig('database_query', {
  description: '查询数据库',
  enabled: true,
  schema: z.object({
    query: z.string().describe('SQL 查询'),
    database: z.string().optional(),
  }),
  handler: async ({ query, database = 'default' }) => {
    // 数据库查询逻辑
    return `查询结果...`;
  },
  options: {
    connectionString: process.env.DATABASE_URL,
    timeout: 30000,
  },
});
```

### 集成外部 API

```typescript
// API 调用工具
addToolConfig('api_call', {
  description: '调用外部 API',
  enabled: true,
  schema: z.object({
    endpoint: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    data: z.any().optional(),
  }),
  handler: async ({ endpoint, method, data }) => {
    // API 调用逻辑
    return `API 响应...`;
  },
  options: {
    baseURL: process.env.API_BASE_URL,
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
    },
  },
});
```

## 测试

运行测试脚本验证工具配置：

```bash
# 运行配置演示
esno app/agent/config/example.ts

# 运行工具功能测试
esno test-tools-config.ts
```

## 迁移指南

从硬编码工具迁移到配置系统：

1. 将现有工具定义移动到 `tools.config.ts`
2. 更新导入语句使用新的工具函数
3. 配置环境特定的工具启用列表
4. 测试所有工具功能正常

这个配置系统提供了灵活、可维护的工具管理方式，支持动态配置和环境特定的工具集合。
