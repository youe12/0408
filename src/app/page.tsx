"use client";

import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Brain, Users, FileText, Star, CheckCircle2, Clock, BookOpen, BarChart3, Radar } from "lucide-react";
import { DimensionRadarChart, DimensionBarChart, ScoreProgress } from "@/components/dimension-chart";
import type { Question, AssessmentInfo, UserAnswer, ChildInfo, AnalysisAnswer } from "@/types/assessment";

// 静态导入题目数据
import questionsData from "@/questions.json";

const { assessmentInfo: staticInfo, questionBank: staticQuestions } = questionsData;
const typedStaticQuestions = staticQuestions as Question[];

export default function AssessmentPage() {
  // 状态管理
  const [status, setStatus] = useState<"intro" | "child_info" | "in_progress" | "analyzing" | "report">("intro");
  const [childInfo, setChildInfo] = useState<ChildInfo>({ name: "", age: 8 });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [analysisResult, setAnalysisResult] = useState("");
  const [assessmentInfo, setAssessmentInfo] = useState<AssessmentInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);

  // 加载题目数据
  useEffect(() => {
    // 使用静态数据
    setAssessmentInfo(staticInfo);
    setQuestions(typedStaticQuestions);
    setLoading(false);
  }, []);

  // 处理选项选择
  const handleOptionSelect = (option: string, score: number, question: Question) => {
    const existingIndex = answers.findIndex(a => a.questionId === question.questionId);
    const newAnswer: UserAnswer = {
      questionId: question.questionId,
      selectedOption: option,
      score,
      dimension: question.dimension,
      assessmentType: question.assessmentType,
    };

    if (existingIndex >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingIndex] = newAnswer;
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, newAnswer]);
    }
  };

  // 下一题
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // 上一题
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // 计算各维度分数
  const calculateDimensionScores = () => {
    const dimensionScores: Record<string, { total: number; count: number }> = {};
    
    answers.forEach((answer) => {
      if (!dimensionScores[answer.dimension]) {
        dimensionScores[answer.dimension] = { total: 0, count: 0 };
      }
      dimensionScores[answer.dimension].total += answer.score;
      dimensionScores[answer.dimension].count += 1;
    });

    return Object.entries(dimensionScores)
      .map(([name, { total, count }]) => ({
        name,
        score: total / count,
      }))
      .sort((a, b) => b.score - a.score);
  };

  // 提交测评
  const handleSubmit = async () => {
    if (answers.length < questions.length) {
      alert(`请完成所有题目后再提交，当前已答 ${answers.length}/${questions.length} 题`);
      return;
    }

    setStatus("analyzing");
    setAnalyzingProgress(0);

    // 准备分析数据
    const analysisData: AnalysisAnswer[] = answers.map(a => ({
      questionId: a.questionId,
      score: a.score,
      dimension: a.dimension,
      assessmentType: a.assessmentType,
    }));

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: analysisData,
          childName: childInfo.name || "小朋友",
          childAge: childInfo.age,
        }),
      });

      if (!response.ok) throw new Error("分析请求失败");

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          result += chunk;
          setAnalysisResult(result);
          
          // 更新进度
          setAnalyzingProgress(Math.min((result.length / 500) * 100, 95));
        }
      }

      setAnalyzingProgress(100);
      setStatus("report");
    } catch (error) {
      console.error("分析失败:", error);
      alert("分析失败，请稍后重试");
      setStatus("in_progress");
    }
  };

  // 重新开始
  const handleRestart = () => {
    setStatus("intro");
    setChildInfo({ name: "", age: 8 });
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setAnalysisResult("");
    setAnalyzingProgress(0);
  };

  // 计算当前题目答案
  const currentAnswer = answers.find(
    a => a.questionId === questions[currentQuestionIndex]?.questionId
  );

  // 计算进度
  const progressPercent = questions.length > 0 
    ? Math.round((answers.length / questions.length) * 100) 
    : 0;

  // 当前题目
  const currentQuestion = questions[currentQuestionIndex];

  // 如果加载中
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载题目...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-800">儿童天赋测评</span>
          </div>
          {status === "in_progress" && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{answers.length}/{questions.length} 题</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* 欢迎页面 */}
        {status === "intro" && (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4" />
                专业儿童天赋测评
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {assessmentInfo?.title}
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                {assessmentInfo?.theoreticalBasis}，帮助家长科学了解孩子的天赋特点
              </p>
            </div>

            {/* 特点展示 */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">韦氏智力框架</h3>
                  <p className="text-sm text-gray-600">科学评估逻辑推理与言语理解能力</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">多元智能理论</h3>
                  <p className="text-sm text-gray-600">全面发现孩子在八大智能领域的天赋</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI专业报告</h3>
                  <p className="text-sm text-gray-600">智能生成个性化发展建议</p>
                </CardContent>
              </Card>
            </div>

            {/* 测评说明 */}
            <Card className="bg-white border-0 shadow-lg mb-8">
              <CardContent className="p-6">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  测评须知
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <Clock className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span>测评时长约 {Math.ceil(questions.length * 1.5)} 分钟，共 {questions.length} 道题目</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <Users className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span>建议家长陪同孩子共同完成，家长可辅助理解题意，但不提示答案</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700">
                    <BookOpen className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span>每题按孩子实际情况选择，1-5分对应能力等级</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 开始按钮 */}
            <div className="text-center">
              <Button
                onClick={() => setStatus("child_info")}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-12 py-6 text-lg font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                开始测评
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* 孩子信息页面 */}
        {status === "child_info" && (
          <div className="animate-fade-in">
            <Card className="bg-white border-0 shadow-lg max-w-md mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  请填写孩子信息
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  帮助我们提供更准确的分析
                </p>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      孩子姓名（选填）
                    </Label>
                    <Input
                      id="name"
                      placeholder="请输入姓名"
                      value={childInfo.name}
                      onChange={(e) => setChildInfo({ ...childInfo, name: e.target.value })}
                      className="mt-2 h-12"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium">
                      孩子年龄 <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-3 mt-2">
                      {[6, 7, 8, 9, 10, 11, 12].map((age) => (
                        <button
                          key={age}
                          onClick={() => setChildInfo({ ...childInfo, age })}
                          className={`w-12 h-12 rounded-xl font-medium transition-all ${
                            childInfo.age === age
                              ? "bg-indigo-500 text-white shadow-lg"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => setStatus("in_progress")}
                    className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl"
                  >
                    开始答题
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 答题页面 */}
        {status === "in_progress" && currentQuestion && (
          <div className="animate-fade-in">
            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>题目 {currentQuestionIndex + 1} / {questions.length}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="progress-track h-2">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* 题目卡片 */}
            <Card className="question-card mb-6">
              <CardContent className="p-6 md:p-8">
                {/* 题目类型标签 */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    currentQuestion.assessmentType === "韦氏智力测评" 
                      ? "bg-blue-100 text-blue-700"
                      : currentQuestion.assessmentType === "多元智能测试"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {currentQuestion.assessmentType}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    {currentQuestion.dimension}
                  </span>
                </div>

                {/* 题目内容 */}
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-8 leading-relaxed">
                  {currentQuestion.questionContent}
                </h2>

                {/* 选项 */}
                <RadioGroup 
                  value={currentAnswer?.selectedOption || ""}
                  onValueChange={(value) => {
                    const option = currentQuestion.options.find(o => o.option === value);
                    if (option) {
                      handleOptionSelect(value, option.score, currentQuestion);
                    }
                  }}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((opt) => (
                    <div key={opt.option} className="relative">
                      <RadioGroupItem
                        value={opt.option}
                        id={`option-${opt.option}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`option-${opt.option}`}
                        className={`option-btn flex items-center p-4 rounded-xl cursor-pointer ${
                          currentAnswer?.selectedOption === opt.option ? "selected" : ""
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-4 ${
                          currentAnswer?.selectedOption === opt.option
                            ? "bg-white/20 text-white"
                            : "bg-indigo-100 text-indigo-700"
                        }`}>
                          {opt.option}
                        </span>
                        <span className={currentAnswer?.selectedOption === opt.option ? "text-white" : ""}>
                          {opt.content}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* 维度提示 */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-indigo-600">考察维度：</span>
                    {currentQuestion.prompt}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 导航按钮 */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-6"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                上一题
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={answers.length < questions.length}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8"
                >
                  提交测评
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6"
                >
                  下一题
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* 答题进度指示器 */}
            <div className="mt-8 flex justify-center gap-1 flex-wrap">
              {questions.map((q, idx) => {
                const isAnswered = answers.some(a => a.questionId === q.questionId);
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <div
                    key={q.questionId}
                    className={`w-3 h-3 rounded-full transition-all ${
                      isCurrent ? "bg-indigo-500 scale-125" : isAnswered ? "bg-indigo-300" : "bg-gray-200"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* 分析中页面 */}
        {status === "analyzing" && (
          <div className="animate-fade-in text-center py-12">
            <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">正在生成分析报告</h2>
            <p className="text-gray-600 mb-8">AI正在根据答题结果进行专业分析...</p>
            <div className="max-w-md mx-auto">
              <Progress value={analyzingProgress} className="h-2" />
              <p className="text-sm text-gray-500 mt-2">{Math.round(analyzingProgress)}%</p>
            </div>
          </div>
        )}

        {/* 报告页面 */}
        {status === "report" && (
          <div className="animate-fade-in">
            {/* 报告头部 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <CheckCircle2 className="w-4 h-4" />
                测评完成
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {childInfo.name || "小朋友"}的天赋测评报告
              </h1>
              <p className="text-gray-600">
                基于韦氏智力测评框架 + 多元智能理论 | 共 {questions.length} 题
              </p>
            </div>

            {/* 数据可视化图表 */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Radar className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-semibold text-gray-900">天赋雷达图</h3>
                </div>
                <DimensionRadarChart scores={calculateDimensionScores()} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-semibold text-gray-900">各维度得分</h3>
                </div>
                <DimensionBarChart scores={calculateDimensionScores()} />
              </div>
            </div>

            {/* 维度得分列表 */}
            <Card className="bg-white border-0 shadow-lg mb-8">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">各维度详细得分</h3>
                <div className="space-y-4">
                  {calculateDimensionScores()
                    .sort((a, b) => b.score - a.score)
                    .map((dim) => (
                      <ScoreProgress key={dim.name} name={dim.name} score={dim.score} />
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* 报告内容 */}
            <Card className="bg-white border-0 shadow-lg mb-8">
              <CardContent className="p-6 md:p-8">
                {/* 渲染Markdown风格的报告 */}
                <div className="prose prose-gray max-w-none">
                  <ReportRenderer content={analysisResult} />
                </div>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="px-8"
              >
                打印报告
              </Button>
              <Button
                onClick={handleRestart}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8"
              >
                重新测评
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="mt-16 py-8 text-center text-sm text-gray-500 border-t">
        <p>本测评仅供参考，不作为临床诊断依据</p>
        <p className="mt-1">如有专业需求，请咨询儿童教育专家</p>
      </footer>
    </div>
  );
}

// 报告渲染组件
function ReportRenderer({ content }: { content: string }) {
  // 解析内容为可渲染的sections
  const lines = content.split("\n");
  const elements: ReactElement[] = [];
  let currentSection: string[] = [];
  let sectionKey = 0;

  const flushSection = () => {
    if (currentSection.length > 0) {
      const text = currentSection.join("\n").trim();
      if (text) {
        elements.push(
          <div key={sectionKey++} className="mb-4 whitespace-pre-wrap text-gray-700 leading-relaxed">
            {text}
          </div>
        );
      }
      currentSection = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith("## ")) {
      flushSection();
      elements.push(
        <h2 key={sectionKey++} className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
          {trimmed.replace("## ", "")}
        </h2>
      );
    } else if (trimmed.startsWith("### ")) {
      flushSection();
      elements.push(
        <h3 key={sectionKey++} className="text-lg font-semibold text-indigo-700 mt-6 mb-3">
          {trimmed.replace("### ", "")}
        </h3>
      );
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      flushSection();
      elements.push(
        <p key={sectionKey++} className="font-bold text-gray-900 mt-4 mb-2">
          {trimmed.replace(/\*\*/g, "")}
        </p>
      );
    } else if (/^\d+\./.test(trimmed)) {
      flushSection();
      elements.push(
        <div key={sectionKey++} className="flex gap-3 mb-2">
          <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
            {trimmed.charAt(0)}
          </span>
          <span className="text-gray-700">{trimmed.replace(/^\d+\.\s*/, "")}</span>
        </div>
      );
    } else if (trimmed.startsWith("- ")) {
      flushSection();
      elements.push(
        <div key={sectionKey++} className="flex gap-3 mb-2">
          <span className="text-indigo-500 mt-1">•</span>
          <span className="text-gray-700">{trimmed.replace("- ", "")}</span>
        </div>
      );
    } else if (trimmed) {
      currentSection.push(line);
    } else {
      flushSection();
    }
  });

  flushSection();
  return <>{elements}</>;
}
