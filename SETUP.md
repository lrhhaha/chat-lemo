# LangGraph Chat App - 设置指南

详细的环境配置和部署说明。

## 目录

- [环境要求](#环境要求)
- [本地开发](#本地开发)
- [环境变量](#环境变量)
- [生产部署](#生产部署)
- [故障排除](#故障排除)

---

## 环境要求

| 依赖    | 版本    | 说明                      |
| ------- | ------- | ------------------------- |
| Node.js | >= 18.0 | 推荐 20.x LTS             |
| pnpm    | >= 8.0  | 推荐，也可用 npm/yarn     |
| SQLite  | -       | 自动安装 (better-sqlite3) |

---

## 本地开发

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd langgraphjs-chat-app
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

创建环境变量文件：

```bash
mkdir -p app/utils
touch app/utils/.env
```

编辑 `app/utils/.env`：

```bash
# 必需
OPENAI_API_KEY=sk-xxx

# 可选（有默认值）
OPENAI_MODEL_NAME=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000

# 如使用阿里云通义千问
# OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
# OPENAI_MODEL_NAME=qwen-plus
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

---

## 环境变量

### 必需变量

| 变量名           | 说明            | 示例     |
| ---------------- | --------------- | -------- |
| `OPENAI_API_KEY` | OpenAI API 密钥 | `sk-xxx` |

### 可选变量

| 变量名               | 默认值          | 说明          |
| -------------------- | --------------- | ------------- |
| `OPENAI_MODEL_NAME`  | `gpt-3.5-turbo` | 模型名称      |
| `OPENAI_TEMPERATURE` | `0.7`           | 温度参数      |
| `OPENAI_MAX_TOKENS`  | `1000`          | 最大 token 数 |
| `OPENAI_BASE_URL`    | OpenAI 官方     | API 端点      |

### 获取 OpenAI API 密钥

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 登录或创建账户
3. 进入 API Keys 页面
4. 点击 "Create new secret key"
5. 复制密钥到 `.env` 文件

---

## 生产部署

### 方式一：PM2 部署（推荐）

PM2 是 Node.js 进程管理器，支持自动重启和日志管理。

#### 安装 PM2

```bash
npm install -g pm2
```

#### 构建项目

```bash
pnpm build
```

#### 启动服务

```bash
# 使用 ecosystem.config.js 配置启动
pnpm pm2:start

# 或直接使用 pm2
pm2 start ecosystem.config.js
```

#### 常用命令

```bash
# 查看状态
pnpm pm2:status

# 查看日志
pnpm pm2:logs

# 重启服务
pnpm pm2:restart

# 停止服务
pnpm pm2:stop

# 删除服务
pnpm pm2:delete
```

#### 开机自启

```bash
pm2 startup
pm2 save
```

### 方式二：后台运行

```bash
# 构建
pnpm build

# 后台启动（端口 3001）
pnpm start:bg

# 停止
pnpm stop
```

### 方式三：Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

> ⚠️ **注意**：SQLite 不适合无服务器环境，需要迁移到：
>
> - Vercel Postgres
> - Supabase
> - PlanetScale
> - Cloudflare D1

---

## 故障排除

### 启动失败

**问题**：`Error: Cannot find module 'dotenv'`

**解决**：重新安装依赖

```bash
rm -rf node_modules
pnpm install
```

---

**问题**：环境变量未加载

**解决**：检查 `.env` 文件路径

```bash
ls app/utils/.env
# 确保文件存在且内容正确
cat app/utils/.env
```

---

### API 调用失败

**问题**：`401 Unauthorized`

**解决**：检查 API 密钥是否正确

---

**问题**：`429 Too Many Requests`

**解决**：API 调用频率过高，等待后重试或升级账户

---

**问题**：网络超时

**解决**：

1. 检查网络连接
2. 如在国内，考虑使用代理或国内 API（如通义千问）

---

### 数据库问题

**问题**：SQLite 错误

**解决**：删除数据库文件重建

```bash
rm chat_history.db
pnpm dev
```

---

### 依赖安装问题

**问题**：`better-sqlite3` 编译失败

**解决**：

```bash
# macOS
xcode-select --install

# Linux
sudo apt-get install build-essential python3

# 重新安装
pnpm rebuild better-sqlite3
```

---

## 开发脚本

| 命令             | 说明           |
| ---------------- | -------------- |
| `pnpm dev`       | 启动开发服务器 |
| `pnpm build`     | 构建生产版本   |
| `pnpm start`     | 启动生产服务器 |
| `pnpm lint`      | 代码检查       |
| `pnpm pm2:start` | PM2 启动       |
| `pnpm pm2:stop`  | PM2 停止       |
| `pnpm pm2:logs`  | 查看日志       |

---

## 相关文档

- [README](./README.md) - 项目概述
- [架构文档](./docs/architecture.md) - 详细架构说明
- [Next.js 文档](https://nextjs.org/docs)
- [LangGraphJS 文档](https://langchain-ai.github.io/langgraphjs/)
