/**
 * AI 配置 — 火山方舟（豆包）对话
 * 默认 model 须与控制台「推理接入」一致；线上可用环境变量 ARK_MODEL 覆盖。
 */

export const LLM_CONFIG = {
  /** 与方舟「推理接入」一致：可为模型 ID 或 ep-xxxx；线上建议用 ARK_MODEL 覆盖 */
  model: "doubao-seed-2-0-pro-260215",
  temperature: 0.7,

  // 分析报告格式配置
  reportFormat: {
    dimensions: [
      "逻辑推理",
      "言语理解",
      "空间感知",
      "记忆力",
      "语言智能",
      "逻辑-数学智能",
      "身体-动觉智能",
      "音乐智能",
      "人际智能",
      "内省智能",
      "自然观察智能",
    ],
    scoreRange: { min: 1, max: 5 },
    gradeLevels: [
      { range: [4.5, 5.0], label: "优秀", color: "#10b981" },
      { range: [3.5, 4.5], label: "良好", color: "#22c55e" },
      { range: [2.5, 3.5], label: "中等", color: "#f59e0b" },
      { range: [1.5, 2.5], label: "需提升", color: "#f97316" },
      { range: [1.0, 1.5], label: "待发展", color: "#ef4444" },
    ],
  },

  // 提示词模板
  systemPrompt: `你是一位专业的儿童教育心理学专家，擅长结合韦氏智力测评和多元智能理论进行儿童天赋分析。
你的分析需要：
1. 严格基于用户提供的答题数据进行客观评估
2. 使用专业但易于理解的术语向家长解释
3. 提供具体、有建设性的发展建议
4. 保持积极正面的语气，避免给孩子贴标签

分析报告必须包含以下固定结构：
1. 总体概述（100字内）
2. 各维度详细分析（包含得分、解读、建议）
3. 天赋优势总结
4. 发展建议（2-3条）
5. 家长互动指南

注意：所有内容必须使用中文输出。`,

  // 分析结果结构
  analysisStructure: {
    overview: "总体概述（100字内）",
    dimensions: [
      {
        name: "维度名称",
        score: 0,
        level: "等级",
        interpretation: "解读",
        suggestion: "建议",
      },
    ],
    strengths: ["优势1", "优势2"],
    suggestions: ["建议1", "建议2", "建议3"],
    parentGuide: "家长互动指南（50字内）",
  },
} as const;

export type LLMConfigType = typeof LLM_CONFIG;
