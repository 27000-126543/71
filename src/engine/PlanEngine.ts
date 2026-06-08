import type { FinancingPlan, RiskLevel, RepaymentMethod } from "@/src/types";

export interface PlanInput {
  principal: number;
  termDays: number;
  riskLevel: RiskLevel;
  supplierCreditScore: number;
  preferredMethods?: RepaymentMethod[];
}

const BASE_RATES: Record<RiskLevel, number> = {
  low: 0.055,
  medium: 0.072,
  high: 0.095,
  critical: 0.125,
};

const RISK_PREMIUM_STEP = 0.005;
const CREDIT_DISCOUNT_THRESHOLD = 80;
const CREDIT_DISCOUNT_MAX = 0.008;

function calcAnnualRate(base: number, creditScore: number, variant: number): number {
  let rate = base + variant * RISK_PREMIUM_STEP;
  if (creditScore >= CREDIT_DISCOUNT_THRESHOLD) {
    const discount = Math.min(CREDIT_DISCOUNT_MAX, ((creditScore - CREDIT_DISCOUNT_THRESHOLD) / 20) * CREDIT_DISCOUNT_MAX);
    rate -= discount;
  }
  return Math.round(rate * 10000) / 10000;
}

function calcTotalInterest(principal: number, annualRate: number, termDays: number): number {
  return Math.round(principal * annualRate * (termDays / 365));
}

function round(num: number): number {
  return Math.round(num);
}

function buildBulletPlan(input: PlanInput, variant: number): FinancingPlan {
  const annualRate = calcAnnualRate(BASE_RATES[input.riskLevel], input.supplierCreditScore, variant);
  const totalInterest = calcTotalInterest(input.principal, annualRate, input.termDays);
  return {
    id: `plan_bullet_${Date.now()}`,
    name: "到期一次性还本付息",
    principal: input.principal,
    annualRate,
    termDays: input.termDays,
    totalInterest,
    monthlyPayment: 0,
    repaymentMethod: "bullet",
  };
}

function buildEqualInstallmentPlan(input: PlanInput, variant: number): FinancingPlan {
  const annualRate = calcAnnualRate(BASE_RATES[input.riskLevel], input.supplierCreditScore, variant);
  const months = Math.max(1, Math.round(input.termDays / 30));
  const monthlyRate = annualRate / 12;
  const monthlyPayment =
    (input.principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  const totalInterest = round(monthlyPayment * months - input.principal);
  return {
    id: `plan_equal_${Date.now()}`,
    name: "等额本息分期还款",
    principal: input.principal,
    annualRate,
    termDays: input.termDays,
    totalInterest,
    monthlyPayment: round(monthlyPayment),
    repaymentMethod: "equal_installment",
  };
}

function buildInterestOnlyPlan(input: PlanInput, variant: number): FinancingPlan {
  const annualRate = calcAnnualRate(BASE_RATES[input.riskLevel], input.supplierCreditScore, variant);
  const totalInterest = calcTotalInterest(input.principal, annualRate, input.termDays);
  const months = Math.max(1, Math.round(input.termDays / 30));
  const monthlyPayment = round((input.principal * annualRate) / 12);
  return {
    id: `plan_io_${Date.now()}`,
    name: "按月付息到期还本",
    principal: input.principal,
    annualRate,
    termDays: input.termDays,
    totalInterest,
    monthlyPayment,
    repaymentMethod: "interest_only",
  };
}

export function generatePlans(input: PlanInput): FinancingPlan[] {
  const plans: FinancingPlan[] = [];
  const variants = [0, 1, -1];
  const preferred = input.preferredMethods?.length ? input.preferredMethods : (["bullet", "equal_installment", "interest_only"] as RepaymentMethod[]);

  preferred.forEach((method, i) => {
    const variant = variants[i] ?? 0;
    if (method === "bullet") plans.push(buildBulletPlan(input, variant));
    else if (method === "equal_installment") plans.push(buildEqualInstallmentPlan(input, variant));
    else plans.push(buildInterestOnlyPlan(input, variant));
  });

  return plans;
}

export interface RepaymentScheduleItem {
  periodNo: number;
  dueDate: string;
  principal: number;
  interest: number;
  totalAmount: number;
  remainingPrincipal: number;
}

export function generateRepaymentSchedule(plan: FinancingPlan, disbursedAt: string): RepaymentScheduleItem[] {
  const schedule: RepaymentScheduleItem[] = [];
  const months = Math.max(1, Math.round(plan.termDays / 30));
  const start = new Date(disbursedAt);
  let remaining = plan.principal;

  if (plan.repaymentMethod === "bullet") {
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + months);
    schedule.push({
      periodNo: 1,
      dueDate: dueDate.toISOString(),
      principal: plan.principal,
      interest: plan.totalInterest,
      totalAmount: plan.principal + plan.totalInterest,
      remainingPrincipal: 0,
    });
    return schedule;
  }

  if (plan.repaymentMethod === "interest_only") {
    const monthlyInterest = plan.monthlyPayment;
    for (let p = 1; p <= months; p++) {
      const dueDate = new Date(start);
      dueDate.setMonth(dueDate.getMonth() + p);
      const isLast = p === months;
      const principal = isLast ? plan.principal : 0;
      remaining -= principal;
      schedule.push({
        periodNo: p,
        dueDate: dueDate.toISOString(),
        principal,
        interest: monthlyInterest,
        totalAmount: principal + monthlyInterest,
        remainingPrincipal: Math.max(0, remaining),
      });
    }
    return schedule;
  }

  const monthlyRate = plan.annualRate / 12;
  const monthlyPayment = plan.monthlyPayment;
  for (let p = 1; p <= months; p++) {
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + p);
    const interest = round(remaining * monthlyRate);
    const principal = Math.min(remaining, monthlyPayment - interest);
    remaining = Math.max(0, remaining - principal);
    schedule.push({
      periodNo: p,
      dueDate: dueDate.toISOString(),
      principal,
      interest,
      totalAmount: principal + interest,
      remainingPrincipal: remaining,
    });
  }
  return schedule;
}

export const PlanEngine = {
  generate: generatePlans,
  schedule: generateRepaymentSchedule,
};

export default PlanEngine;
