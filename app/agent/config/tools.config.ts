import { ToolConfig } from '../types/tool.types';
import { calculatorTool } from '../tools/calculator.tool';
import { weatherTool } from '../tools/weather.tool';
import { currentTimeTool } from '../tools/current-time.tool';
import { searchTool } from '../tools/search.tool';
import leetCodeMCP from '../tools/mcp-leetcode.tool';

// 重新导出 ToolConfig 类型，保持向后兼容
export type { ToolConfig };

// 基础工具配置
export const toolsConfig: Record<string, ToolConfig<any>> = {
  calculator: calculatorTool,
  weather: weatherTool,
  current_time: currentTimeTool,
  search: searchTool,
  // leetCode_mcp: leetCodeMCP
};

// 环境配置
export interface EnvironmentConfig {
  development: {
    enabledTools: string[];
    debugMode: boolean;
  };
  production: {
    enabledTools: string[];
    debugMode: boolean;
  };
  test: {
    enabledTools: string[];
    debugMode: boolean;
  };
}

export const environmentConfig: EnvironmentConfig = {
  development: {
    enabledTools: ['calculator', 'weather', 'current_time', 'search'],
    debugMode: true,
  },
  production: {
    enabledTools: ['calculator', 'weather', 'current_time', 'search'],
    debugMode: false,
  },
  test: {
    enabledTools: ['calculator', 'current_time'],
    debugMode: true,
  },
};

// 获取当前环境配置
export function getCurrentEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  return (
    environmentConfig[env as keyof EnvironmentConfig] ||
    environmentConfig.development
  );
}

// 获取启用的工具配置
export function getEnabledToolsConfig(): Record<string, ToolConfig> {
  const envConfig = getCurrentEnvironmentConfig();
  const enabledTools: Record<string, ToolConfig> = {};

  for (const toolName of envConfig.enabledTools) {
    const toolConfig = toolsConfig[toolName];
    if (toolConfig && toolConfig.enabled) {
      enabledTools[toolName] = toolConfig;
    }
  }

  return enabledTools;
}

// 工具配置验证
export function validateToolConfig(config: ToolConfig): boolean {
  return !!(
    config.name &&
    config.description &&
    config.schema &&
    typeof config.handler === 'function' &&
    typeof config.enabled === 'boolean'
  );
}

// 动态添加工具配置
export function addToolConfig<T = Record<string, unknown>>(name: string, config: Omit<ToolConfig<T>, 'name'>) {
  const fullConfig: ToolConfig<T> = {
    name,
    ...config,
  };

  if (!validateToolConfig(fullConfig)) {
    throw new Error(`Invalid tool configuration for ${name}`);
  }

  toolsConfig[name] = fullConfig as ToolConfig;
}

// 禁用工具
export function disableTool(name: string) {
  if (toolsConfig[name]) {
    toolsConfig[name].enabled = false;
  }
}

// 启用工具
export function enableTool(name: string) {
  if (toolsConfig[name]) {
    toolsConfig[name].enabled = true;
  }
}
