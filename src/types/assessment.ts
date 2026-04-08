// 题目相关类型定义

export interface QuestionOption {
  option: string;
  content: string;
  score: number;
}

export interface Question {
  questionId: number;
  assessmentType: "韦氏智力测评" | "多元智能测试" | "补充题";
  dimension: string;
  questionContent: string;
  options: QuestionOption[];
  prompt: string;
  isScore: boolean;
}

export interface AssessmentInfo {
  title: string;
  theoreticalBasis: string;
  targetGroup: string;
  totalQuestions: number;
  scoringRule: {
    type: string;
    scoreRange: number[];
    scoreDescription: Record<string, string>;
  };
  avoidanceRules: string[];
  usageInstructions: string[];
}

export interface QuestionsResponse {
  success: boolean;
  data: {
    assessmentInfo: AssessmentInfo;
    questions: Question[];
  };
}

// 用户答题记录
export interface UserAnswer {
  questionId: number;
  selectedOption: string;
  score: number;
  dimension: string;
  assessmentType: string;
}

// 答题结果（提交给AI分析）
export interface AnalysisAnswer {
  questionId: number;
  score: number;
  dimension: string;
  assessmentType: string;
}

// 孩子信息
export interface ChildInfo {
  name: string;
  age: number;
}

// 测评状态
export type AssessmentStatus = "idle" | "intro" | "in_progress" | "completed" | "analyzing" | "report";
