# 儿童天赋测评工具 - 项目规范

## 项目概述

一款面向6-12岁儿童的AI天赋测评工具，结合韦氏智力测评框架和多元智能理论，支持家长和孩子共同完成作答，最终生成科学专业的AI测评报告。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **图表**: Recharts
- **AI**: 火山方舟豆包 (OpenAI 兼容 HTTP，`ARK_API_KEY` / 可选 `ARK_BASE_URL` / `ARK_MODEL`)

## 项目结构

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts    # AI分析API (流式输出)
│   │   │   └── questions/route.ts  # 题目库API
│   │   ├── globals.css             # 全局样式
│   │   ├── layout.tsx             # 根布局
│   │   └── page.tsx               # 主测评页面
│   ├── components/
│   │   ├── dimension-chart.tsx    # 数据可视化组件
│   │   └── ui/                    # shadcn/ui组件库
│   ├── lib/
│   │   ├── llm-config.ts         # AI配置（豆包模型配置）
│   │   └── utils.ts              # 工具函数
│   └── types/
│       └── assessment.ts         # 类型定义
├── questions.json                 # 题目库数据
└── package.json
```

## 核心功能

### 1. 测评流程

- 首页欢迎页（测评介绍、特点展示）
- 孩子信息填写（姓名、年龄）
- 40道测评题目（韦氏智力+多元智能）
- AI分析中页面（流式输出进度）
- 报告展示页面（图表+文字分析）

### 2. AI分析

- **模型**: 豆包-seed-2.0-pro
- **协议**: SSE流式输出
- **分析维度**: 逻辑推理、言语理解、空间感知、记忆力、语言智能、数学逻辑智能、身体动觉智能、音乐智能、人际智能、内省智能、自然观察智能

### 3. 数据可视化

- 雷达图：天赋雷达图
- 柱状图：各维度得分对比
- 进度条：各维度详细得分

## API接口

### GET /api/questions

获取题目库

```json
Response: {
  "success": true,
  "data": {
    "assessmentInfo": {...},
    "questions": [...]
  }
}
```

### POST /api/analyze

AI分析答题结果（流式输出）

```json
Request: {
  "answers": [
    { "questionId": 1, "score": 5, "dimension": "逻辑推理", "assessmentType": "韦氏智力测评" }
  ],
  "childName": "小明",
  "childAge": 8
}
```

## 开发命令

```bash
pnpm install      # 安装依赖
pnpm dev          # 开发环境 (端口5000)
pnpm build        # 构建生产版本
pnpm start        # 生产环境
pnpm lint         # ESLint检查
```

## 配置说明

AI模型配置在 `src/lib/llm-config.ts`：

- `model`: 豆包模型ID
- `temperature`: 温度参数 (0-2)
- `systemPrompt`: 系统提示词
- `reportFormat`: 报告格式配置

## 注意事项

1. 题目库JSON文件位于 `src/questions.json`
2. 所有API请求需使用JSON格式
3. AI分析采用流式输出，需使用 `ReadableStream` 处理
4. 移动端已适配，主要使用场景为家长手机

