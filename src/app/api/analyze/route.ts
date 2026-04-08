import { NextRequest, NextResponse } from "next/server";
import { LLM_CONFIG } from "@/lib/llm-config";
import { getArkEnvOrError } from "@/lib/ark-config";
import { streamArkChatCompletions } from "@/lib/ark-stream";

interface Answer {
  questionId: number;
  score: number;
  dimension: string;
  assessmentType: string;
}

interface AnalysisRequest {
  answers: Answer[];
  childName?: string;
  childAge?: number;
}

/**
 * 构建分析提示词
 */
function buildAnalysisPrompt(data: AnalysisRequest): string {
  const dimensionScores: Record<string, { total: number; count: number }> = {};

  data.answers.forEach((answer) => {
    if (!dimensionScores[answer.dimension]) {
      dimensionScores[answer.dimension] = { total: 0, count: 0 };
    }
    dimensionScores[answer.dimension].total += answer.score;
    dimensionScores[answer.dimension].count += 1;
  });

  const dimensionAverages = Object.entries(dimensionScores).map(([name, { total, count }]) => ({
    name,
    average: (total / count).toFixed(2),
    questionsCount: count,
  }));

  const childInfo = data.childName
    ? `孩子姓名：${data.childName}${data.childAge ? `，年龄：${data.childAge}岁` : ""}`
    : "";

  return `请分析以下儿童天赋测评结果：

${childInfo}

【各维度得分情况】（1-5分制）
${dimensionAverages.map((d) => `- ${d.name}：平均 ${d.average} 分（共 ${d.questionsCount} 题）`).join("\n")}

【作答详情】
${data.answers.map((a) => `题目${a.questionId}（${a.assessmentType}-${a.dimension}）：得分 ${a.score}`).join("\n")}

请按照以下固定格式输出分析报告，严格遵守结构要求：

## 一、总体概述
（100字以内，概括孩子的整体天赋特点）

## 二、各维度详细分析
请对每个维度进行分析，格式如下：
### [维度名称]
- 得分：X分
- 等级：[优秀/良好/中等/需提升/待发展]
- 解读：（2-3句话专业解读）
- 建议：（1句具体可操作的建议）

## 三、天赋优势总结
（列出2-3个最突出的优势领域，简述原因）

## 四、发展建议
1. [建议1]
2. [建议2]
3. [建议3]

## 五、家长互动指南
（50字以内的温馨建议，指导家长如何与孩子互动）`;
}

/**
 * POST /api/analyze
 * AI 分析答题结果（火山方舟豆包流式输出）
 */
export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();

    if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
      return NextResponse.json({ error: "请提供有效的答题数据" }, { status: 400 });
    }

    const ark = getArkEnvOrError();
    if (!ark.ok) {
      console.error("火山方舟配置检查失败:", ark.message);
      return NextResponse.json({ error: ark.message }, { status: 503 });
    }

    const model = process.env.ARK_MODEL?.trim() || LLM_CONFIG.model;
    const prompt = buildAnalysisPrompt(body);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messages = [
            { role: "system" as const, content: LLM_CONFIG.systemPrompt },
            { role: "user" as const, content: prompt },
          ];

          for await (const chunk of streamArkChatCompletions({
            apiKey: ark.apiKey,
            baseUrl: ark.baseUrl,
            model,
            messages,
            temperature: LLM_CONFIG.temperature,
          })) {
            if (chunk) controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          console.error("流式分析错误:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("分析请求错误:", error);
    return NextResponse.json({ error: "分析服务暂时不可用，请稍后重试" }, { status: 500 });
  }
}
