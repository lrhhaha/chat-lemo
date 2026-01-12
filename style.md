# 设计系统：Ant Design 重构

本文档定义了将应用程序重构为 Ant Design (AntD) v5 美学的设计 Token 和标准。

## 1. 调色板 (Color Palette)

我们采用 Ant Design 默认调色板（蓝色基调）和中性灰阶。

### 主色 (Primary Colors - AntD Blue)
用于主按钮、激活状态和链接。
- **Primary Base**: `#1677ff` (Ant Design Blue-6)
- **Primary Hover**: `#4096ff` (Ant Design Blue-5)
- **Primary Active**: `#0958d9` (Ant Design Blue-7)
- **Primary Background**: `#e6f4ff` (Ant Design Blue-1)

### 功能色 (Functional Colors)
- **Success**: `#52c41a`
- **Warning**: `#faad14`
- **Error**: `#ff4d4f`
- **Info**: `#1677ff`

### 中性色 (Neutral Colors - 文本与背景)
基于 Ant Design 的中性调色板。

| Token | 亮色模式 (Light Mode) | 暗色模式 (Dark Mode) | 用途 (Usage) |
|-------|------------|-----------|-------|
| `bg-body` | `#f5f5f5` | `#000000` | 页面背景 |
| `bg-component` | `#ffffff` | `#141414` | 组件背景 (卡片, 侧边栏) |
| `bg-elevated` | `#ffffff` | `#1f1f1f` | 下拉菜单, 模态框 |
| `text-primary` | `rgba(0, 0, 0, 0.88)` | `rgba(255, 255, 255, 0.85)` | 主要文本 |
| `text-secondary` | `rgba(0, 0, 0, 0.65)` | `rgba(255, 255, 255, 0.65)` | 次要文本, 标签 |
| `text-tertiary` | `rgba(0, 0, 0, 0.45)` | `rgba(255, 255, 255, 0.45)` | 禁用文本, 占位符 |
| `border-color` | `#d9d9d9` | `#424242` | 默认边框 |
| `border-split` | `#f0f0f0` | `#303030` | 分割线 |

## 2. 排版 (Typography)

字体族 (Font Family): `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`

| 尺寸 (Size) | 行高 (Height) | Tailwind 类 | 用途 (Usage) |
|------|--------|----------------|-------|
| 14px | 22px | `text-sm` | 默认文本 |
| 12px | 20px | `text-xs` | 说明文字, 辅助文本 |
| 16px | 24px | `text-base` | 标题, 大号文本 |
| 20px | 28px | `text-lg` | 章节标题 |
| 24px | 32px | `text-xl` | 页面标题 |

## 3. 间距与圆角 (Spacing & Radius)

### 圆角 (Border Radius)
- `rounded-sm`: `4px` (小型组件, 标签)
- `rounded`: `6px` (按钮, 输入框 - *AntD 默认*)
- `rounded-lg`: `8px` (卡片, 容器)

### 阴影 (Shadows / Elevation)
- `shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)`
- `shadow`: `0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)` (下拉菜单)

## 4. Tailwind 实现 (Implementation in Tailwind)

重构 `app/globals.css` 以使用 CSS 变量进行动态主题设置（支持亮色/暗色）。

```css
@theme {
  --color-primary: #1677ff;
  --color-primary-hover: #4096ff;
  
  /* 语义化颜色 (Semantic Colors) */
  --color-bg-body: var(--bg-body);
  --color-bg-component: var(--bg-component);
  --color-text-main: var(--text-main);
  --color-text-secondary: var(--text-secondary);
  --color-border: var(--border-color);
}

:root {
  --bg-body: #f5f5f5;
  --bg-component: #ffffff;
  --text-main: rgba(0, 0, 0, 0.88);
  --text-secondary: rgba(0, 0, 0, 0.65);
  --border-color: #d9d9d9;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-body: #000000;
    --bg-component: #141414;
    --text-main: rgba(255, 255, 255, 0.85);
    --text-secondary: rgba(255, 255, 255, 0.65);
    --border-color: #424242;
  }
}
```
