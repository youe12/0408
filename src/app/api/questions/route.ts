import { NextResponse } from "next/server";
import questionsData from "@/questions.json";

/**
 * GET /api/questions
 * 获取题目库
 */
export async function GET() {
  try {
    const { assessmentInfo, questionBank } = questionsData;

    return NextResponse.json({
      success: true,
      data: {
        assessmentInfo,
        questions: questionBank,
      },
    });
  } catch (error) {
    console.error("获取题目失败:", error);
    return NextResponse.json(
      { success: false, error: "获取题目失败" },
      { status: 500 }
    );
  }
}
