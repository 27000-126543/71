import type { IndustryRiskForecast, RiskLevel } from "@/src/types";

export interface IndustryInput {
  industry: string;
  currentMetrics: {
    avgOrderGrowth: number;
    avgReturnRate: number;
    avgOverdueRate: number;
    financingCount: number;
    totalOutstanding: number;
    nonPerformingRate: number;
  };
  macroFactors: Array<{ factor: string; impact: "positive" | "negative" | "neutral" }>;
}

const INDUSTRY_BASE_SCORES: Record<string, number> = {
  "汽车制造": 78,
  "汽车零部件": 75,
  "电子元器件": 72,
  "半导体": 80,
  "新材料": 74,
  "塑料制品": 68,
  "电线电缆": 70,
};

const INDUSTRY_GROWTH_OUTLOOK: Record<string, number> = {
  "汽车制造": 0.08,
  "汽车零部件": 0.06,
  "电子元器件": 0.12,
  "半导体": 0.18,
  "新材料": 0.15,
  "塑料制品": 0.03,
  "电线电缆": 0.05,
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return "low";
  if (score >= 60) return "medium";
  if (score >= 40) return "high";
  return "critical";
}

function evaluateMetrics(metrics: IndustryInput["currentMetrics"]): number {
  let score = 70;
  if (metrics.avgOrderGrowth > 0.15) score += 10;
  else if (metrics.avgOrderGrowth > 0.05) score += 5;
  else if (metrics.avgOrderGrowth < -0.1) score -= 10;
  else if (metrics.avgOrderGrowth < 0) score -= 5;

  if (metrics.avgReturnRate < 0.02) score += 5;
  else if (metrics.avgReturnRate > 0.08) score -= 8;

  if (metrics.avgOverdueRate < 0.02) score += 8;
  else if (metrics.avgOverdueRate > 0.1) score -= 12;

  if (metrics.nonPerformingRate < 0.01) score += 5;
  else if (metrics.nonPerformingRate > 0.05) score -= 10;

  return clamp(score, 0, 100);
}

function evaluateMacro(factors: IndustryInput["macroFactors"]): number {
  let impact = 0;
  factors.forEach((f) => {
    if (f.impact === "positive") impact += 4;
    else if (f.impact === "negative") impact -= 4;
  });
  return impact;
}

function generateMacroSuggestions(
  industry: string,
  trend: IndustryRiskForecast["trend"],
  score: number
): string {
  const base = `针对${industry}行业，`;
  if (trend === "up" && score >= 75) {
    return (
      base +
      "行业景气度持续向好，建议适度放宽授信额度、简化审批流程、降低融资利率以拓展优质客户。"
    );
  }
  if (trend === "up" && score >= 60) {
    return (
      base +
      "行业呈复苏态势，建议维持现有授信策略，适度增加对头部供应商的支持力度。"
    );
  }
  if (trend === "stable") {
    return (
      base +
      "行业整体平稳，建议维持当前授信标准，加强贷后监控，重点关注异常波动。"
    );
  }
  if (trend === "down" && score >= 50) {
    return (
      base +
      "行业风险上升，建议收紧新增授信，提高保证金比例，缩短融资期限，加强还款跟踪。"
    );
  }
  return (
    base +
    "行业风险显著升高，建议暂停新增授信，对存量业务加强监控，必要时启动风险处置预案。"
  );
}

export function forecastIndustryRisk(input: IndustryInput): IndustryRiskForecast {
  const baseScore = INDUSTRY_BASE_SCORES[input.industry] ?? 70;
  const outlook = INDUSTRY_GROWTH_OUTLOOK[input.industry] ?? 0.05;
  const metricScore = evaluateMetrics(input.currentMetrics);
  const macroImpact = evaluateMacro(input.macroFactors);

  const currentRiskScore = clamp(
    baseScore * 0.5 + metricScore * 0.35 + macroImpact * 3,
    0,
    100
  );

  let trendAdjust = outlook * 100;
  trendAdjust += input.currentMetrics.avgOrderGrowth * 60;
  trendAdjust -= input.currentMetrics.nonPerformingRate * 150;

  const forecastedRiskScore = clamp(currentRiskScore + trendAdjust, 0, 100);

  const trend: IndustryRiskForecast["trend"] =
    forecastedRiskScore - currentRiskScore > 3
      ? "up"
      : forecastedRiskScore - currentRiskScore < -3
      ? "down"
      : "stable";

  const macroFactors: IndustryRiskForecast["macroFactors"] = input.macroFactors.length
    ? input.macroFactors
    : [
        { factor: "宏观经济政策", impact: "neutral" },
        { factor: "下游需求预期", impact: outlook > 0.1 ? "positive" : outlook > 0 ? "neutral" : "negative" },
        { factor: "原材料价格波动", impact: Math.random() > 0.5 ? "negative" : "neutral" },
        { factor: "行业竞争格局", impact: "neutral" },
      ];

  return {
    industry: input.industry,
    currentRiskScore: Math.round(currentRiskScore * 100) / 100,
    forecastedRiskScore: Math.round(forecastedRiskScore * 100) / 100,
    trend,
    suggestion: generateMacroSuggestions(input.industry, trend, forecastedRiskScore),
    macroFactors,
  };
}

export function creditLimitMultiplier(forecast: IndustryRiskForecast): number {
  if (forecast.trend === "up" && forecast.forecastedRiskScore >= 75) return 1.2;
  if (forecast.trend === "up") return 1.05;
  if (forecast.trend === "stable") return 1;
  if (forecast.forecastedRiskScore >= 50) return 0.8;
  return 0.5;
}

export function getIndustryFromName(name: string): string {
  if (name.includes("汽车")) return "汽车制造";
  if (name.includes("零部件") || name.includes("机械")) return "汽车零部件";
  if (name.includes("电子") || name.includes("元件") || name.includes("配件")) return "电子元器件";
  if (name.includes("半导体") || name.includes("芯片")) return "半导体";
  if (name.includes("材料")) return "新材料";
  if (name.includes("塑胶") || name.includes("塑料")) return "塑料制品";
  if (name.includes("线缆") || name.includes("电缆")) return "电线电缆";
  return "电子元器件";
}

export function quickIndustryForecast(industry: string): IndustryRiskForecast {
  return forecastIndustryRisk({
    industry,
    currentMetrics: {
      avgOrderGrowth: 0.05,
      avgReturnRate: 0.03,
      avgOverdueRate: 0.02,
      financingCount: 10,
      totalOutstanding: 10000000,
      nonPerformingRate: 0.01,
    },
    macroFactors: [],
  });
}

export const RiskForecastEngine = {
  forecast: forecastIndustryRisk,
  multiplier: creditLimitMultiplier,
  resolveIndustry: getIndustryFromName,
  baseScores: INDUSTRY_BASE_SCORES,
  quickForecast: quickIndustryForecast,
};

export default RiskForecastEngine;
