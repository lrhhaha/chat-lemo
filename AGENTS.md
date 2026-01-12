# AI Agent 操作指南 (AGENTS.md)

本文件旨在指导自主 Agent（以及人类开发者）如何在 `chat-lemo` 仓库中进行操作。请严格遵循以下规则，以保持代码质量和架构一致性。

## 1. 环境与命令

- **包管理器**: `pnpm`
- **Node 版本**: LTS (默认)
- **框架**: Next.js 16 (App Router) + React 19 + TypeScript 5

### 常用命令
| 操作 | 命令 | 说明 |
|--------|---------|-------|
| **启动开发环境** | `pnpm dev` | 运行在 `http://localhost:3000` |
| **构建** | `pnpm build` | 生产环境构建 |
| **Lint 检查** | `pnpm lint` | 运行 Next.js ESLint 配置 |
| **类型检查** | `tsc --noEmit` | 验证类型但不输出文件 |
| **测试** | N/A | **当前未配置测试框架。** 请勿尝试运行 `pnpm test`。 |

---

## 2. 代码风格与规范

### 命名规范
- **React 组件**: `PascalCase` (大驼峰命名，例如 `ChatInput.tsx`, `MessageBubble.tsx`)。
- **Hooks**: 以 `use` 开头的 `camelCase` (小驼峰命名，例如 `useChatMessages.ts`)。
- **函数/变量**: `camelCase` (例如 `sendMessage`, `isLoading`)。
- **文件命名**:
  - 组件: `PascalCase.tsx`
  - Hooks/工具/服务: `camelCase.ts`
  - API 路由: `route.ts` (Next.js 约定)

### 导入规范 (Imports)
- **别名**: **必须** 使用 `@/` 从项目根目录进行绝对导入。
  - ✅ `import { chatService } from '@/app/backend/services/chat.service'`
  - ❌ `import { chatService } from '../../backend/services/chat.service'`
- **顺序**:
  1. 外部库 (`react`, `next`, `lucide-react`)
  2. 内部组件 (`@/app/components/...`)
  3. 自定义 Hooks (`@/app/hooks/...`)
  4. 服务/工具/类型 (`@/app/backend/...`, `@/types/...`)

### 类型定义
- **严格模式**: 已启用。除非绝对必要（并需添加注释说明），否则**禁止使用 `any`**。
- **接口**: 使用 `interface` 定义对象/Props。
- **Props**: 在组件文件内部定义 `interface ComponentProps`（如果需要共享则导出）。
- **避免 `FC`**: 避免使用 `React.FC`；直接在参数中定义 props：`export default function MyComp({ prop }: Props) { ... }`。

### 错误处理
- **API**: 将异步逻辑包裹在 `try/catch` 中。返回结构化的 JSON 错误响应。
  ```typescript
  return NextResponse.json({ error: 'Message' }, { status: 500 });
  ```
- **前端**: 通过状态（例如 Hook 中的 `error` 状态）处理错误，并通过 UI（Toast 或错误消息）展示。**不要使用 `alert()`**。

---

## 3. 架构与模式

### 目录结构
- `app/components/`: **仅 UI 组件**。接收 props 的展示型组件 (Dumb Components)。
- `app/hooks/`: **核心逻辑**。状态管理、副作用 (Effects) 和 API 调用均在此处。
- `app/backend/`: **后端逻辑**。
  - `agent/`: LangGraph 定义和 AI 逻辑。
  - `services/`: 与 API 路由分离的业务逻辑。
  - `database/`: 数据库连接和 Schema。
- `app/api/`: **薄层 (Thin Layer)**。仅处理 HTTP 请求/响应，具体逻辑委托给 `app/backend`。

### 组件组合
- **关注点分离**:
  - ❌ **不要** 在 UI 组件中编写复杂的 `useEffect` 或 `fetch` 逻辑。
  - ✅ **要** 创建自定义 Hook (例如 `useChatLogic`) 并将函数/状态返回给组件。
- **客户端组件**: 在使用 Hooks 或交互逻辑的文件顶部添加 `'use client'`。

### 样式
- **Tailwind CSS v4**: 使用 Utility 类。
- **Lucide React**: 用于图标。

### AI 与 LangGraph
- Agent 定义在 `app/backend/agent/` 中。
- 使用 `app/backend/services/` 作为 API 和 Agent 之间的桥梁。

---

## 4. 文档
- 如果添加了重要的新功能，请更新 `README.md`。
- 如果创建了新的 Service 或 Hook，请添加简短的 JSDoc 注释说明其用途。
