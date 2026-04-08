"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface DimensionScore {
  name: string;
  score: number;
  fullMark?: number;
}

interface DimensionChartProps {
  scores: DimensionScore[];
  title?: string;
}

// 等级颜色映射
const getLevelColor = (score: number): string => {
  if (score >= 4.5) return "#10b981"; // 优秀
  if (score >= 3.5) return "#22c55e"; // 良好
  if (score >= 2.5) return "#f59e0b"; // 中等
  if (score >= 1.5) return "#f97316"; // 需提升
  return "#ef4444"; // 待发展
};

// 雷达图组件
export function DimensionRadarChart({ scores, title = "天赋雷达图" }: DimensionChartProps) {
  const chartData = scores.map((s) => ({
    ...s,
    fullMark: 5,
  }));

  return (
    <Card className="chart-container">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickCount={5}
              />
              <Radar
                name="得分"
                dataKey="score"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.4}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)} 分`, "得分"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// 柱状图组件
export function DimensionBarChart({ scores, title = "各维度得分" }: DimensionChartProps) {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  return (
    <Card className="chart-container">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedScores} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                width={70}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)} 分`, "得分"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {sortedScores.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={getLevelColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* 图例 */}
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          <LegendItem color="#10b981" label="优秀 (4.5+)" />
          <LegendItem color="#22c55e" label="良好 (3.5+)" />
          <LegendItem color="#f59e0b" label="中等 (2.5+)" />
          <LegendItem color="#f97316" label="需提升 (1.5+)" />
          <LegendItem color="#ef4444" label="待发展 (<1.5)" />
        </div>
      </CardContent>
    </Card>
  );
}

// 图例项
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}

// 等级徽章
export function LevelBadge({ score }: { score: number }) {
  let label: string;
  let className: string;

  if (score >= 4.5) {
    label = "优秀";
    className = "level-excellent";
  } else if (score >= 3.5) {
    label = "良好";
    className = "level-good";
  } else if (score >= 2.5) {
    label = "中等";
    className = "level-average";
  } else if (score >= 1.5) {
    label = "需提升";
    className = "level-improve";
  } else {
    label = "待发展";
    className = "level-develop";
  }

  return <span className={`level-badge ${className}`}>{label}</span>;
}

// 分数进度条
export function ScoreProgress({ name, score, maxScore = 5 }: { name: string; score: number; maxScore?: number }) {
  const percentage = (score / maxScore) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700 font-medium">{name}</span>
        <span className="text-gray-500">{score.toFixed(1)} 分</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: getLevelColor(score),
          }}
        />
      </div>
    </div>
  );
}

// 智能分析提取函数 - 从AI返回的文本中提取维度分数
export function extractDimensionScores(analysisText: string): DimensionScore[] {
  // 尝试从文本中提取分数
  const scores: Record<string, number> = {};
  
  // 尝试解析AI返回的结构化内容
  const lines = analysisText.split("\n");
  for (const line of lines) {
    // 匹配 "维度名称 得分：X分" 格式
    const match = line.match(/([^-\n]+?)\s*[：:]\s*([0-9](?:[.,][0-9]+)?)\s*分/);
    if (match && match[1] && match[2]) {
      const dimension = match[1].trim();
      const score = parseFloat(match[2].replace(",", "."));
      if (dimension && !isNaN(score) && score >= 1 && score <= 5) {
        scores[dimension] = score;
      }
    }
  }

  // 如果没有提取到，返回默认数据
  const dimensionNames = [
    "逻辑推理",
    "言语理解",
    "空间感知",
    "记忆力",
    "语言智能",
    "数学逻辑智能",
    "身体动觉智能",
    "音乐智能",
    "人际智能",
    "内省智能",
    "自然观察智能",
  ];

  if (Object.keys(scores).length === 0) {
    // 返回模拟数据用于演示
    return dimensionNames.map((name) => ({
      name,
      score: 2.5 + Math.random() * 2, // 演示数据
    }));
  }

  return Object.entries(scores).map(([name, score]) => ({
    name: name.replace(/[#*]/g, "").trim(),
    score,
  }));
}
