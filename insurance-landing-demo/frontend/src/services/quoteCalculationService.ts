/**
 * Quote & Interest Calculation Engine
 * Whole-life 90/10, 90/20, 90/90 and CI50 rates are supplied from MySQL via the API.
 * Other plan categories use illustrative demo formulas.
 */

import type { AgeRateTable, InsuranceRates } from '../types';

export type Gender = 'M' | 'F';

type WholeLifePaymentYears = 10 | 20 | 90;

export type InsuranceCategory =
  | 'life'       // ประกันชีวิตมรดก
  | 'cashback'   // ประกันชีวิตพิเศษแบบมีเงินคืน
  | 'ciFixed'    // ประกันชีวิตคุ้มครองโรคร้ายแรง
  | 'saving'     // ประกันสะสมทรัพย์
  | 'health'     // ประกันสุขภาพเหมาจ่าย
  | 'future';    // ออกแบบแผนเพื่ออนาคต

export interface PlanDefinition {
  id: string;
  name: string;
  category: InsuranceCategory;
  paymentYears: number;
  coverageYears: number; // e.g. 90 or 99
  description: string;
  minAge: number;
  maxAge: number;
  minCover: number;
  hasCashback: boolean;
  cashbackPercent: number; // e.g. 1% every year
}

export const AVAILABLE_PLANS: PlanDefinition[] = [
  // ประกันชีวิตมรดก
  {
    id: 'life10',
    name: 'ประกันชีวิตมรดก 90/10',
    category: 'life',
    paymentYears: 10,
    coverageYears: 90,
    description: 'ชำระเบี้ย 10 ปี คุ้มครองยาวนานถึงอายุ 90 ปี สร้างกองมรดกหลักล้านให้ครอบครัว',
    minAge: 1,
    maxAge: 70,
    minCover: 200000,
    hasCashback: false,
    cashbackPercent: 0,
  },
  {
    id: 'lifeOnly',
    name: 'ประกันชีวิตมรดก 90/20',
    category: 'life',
    paymentYears: 20,
    coverageYears: 90,
    description: 'ชำระเบี้ย 20 ปี คุ้มครองยาวนานถึงอายุ 90 ปี เบี้ยสบายกระเป๋า ความคุ้มครองสูงสุด',
    minAge: 1,
    maxAge: 65,
    minCover: 200000,
    hasCashback: false,
    cashbackPercent: 0,
  },
  {
    id: 'life90',
    name: 'ประกันชีวิตมรดก 90/90',
    category: 'life',
    paymentYears: 90,
    coverageYears: 90,
    description: 'ชำระเบี้ยถึงอายุ 90 ปี คุ้มครองถึงอายุ 90 ปี เบี้ยคงที่ตลอดสัญญา',
    minAge: 20,
    maxAge: 65,
    minCover: 200000,
    hasCashback: false,
    cashbackPercent: 0,
  },

  // ประกันชีวิตพิเศษแบบมีเงินคืน
  {
    id: 'cashback5',
    name: 'ประกันชีวิตพิเศษ 99/5',
    category: 'cashback',
    paymentYears: 5,
    coverageYears: 99,
    description: 'ชำระเบี้ยสั้นเพียง 5 ปี คุ้มครองถึงอายุ 99 ปี รับเงินคืน 1% ทุกปี ณ สิ้นปีกรมธรรม์ 1-99',
    minAge: 1,
    maxAge: 70,
    minCover: 100000,
    hasCashback: true,
    cashbackPercent: 1,
  },
  {
    id: 'cashback10',
    name: 'ประกันชีวิตพิเศษ 99/10',
    category: 'cashback',
    paymentYears: 10,
    coverageYears: 99,
    description: 'ชำระเบี้ย 10 ปี คุ้มครองถึงอายุ 99 ปี รับเงินคืน 1% ทุกปี ณ สิ้นปีกรมธรรม์ 1-99',
    minAge: 1,
    maxAge: 70,
    minCover: 100000,
    hasCashback: true,
    cashbackPercent: 1,
  },
  {
    id: 'cashback15',
    name: 'ประกันชีวิตพิเศษ 99/15',
    category: 'cashback',
    paymentYears: 15,
    coverageYears: 99,
    description: 'ชำระเบี้ย 15 ปี คุ้มครองถึงอายุ 99 ปี รับเงินคืน 1% ทุกปี ณ สิ้นปีกรมธรรม์ 1-99',
    minAge: 1,
    maxAge: 65,
    minCover: 100000,
    hasCashback: true,
    cashbackPercent: 1,
  },
  {
    id: 'cashback20',
    name: 'ประกันชีวิตพิเศษ 99/20',
    category: 'cashback',
    paymentYears: 20,
    coverageYears: 99,
    description: 'ชำระเบี้ย 20 ปี คุ้มครองถึงอายุ 99 ปี รับเงินคืน 1% ทุกปี ณ สิ้นปีกรมธรรม์ 1-99',
    minAge: 1,
    maxAge: 60,
    minCover: 100000,
    hasCashback: true,
    cashbackPercent: 1,
  },

  // ประกันชีวิตคุ้มครองโรคร้ายแรง
  {
    id: 'ciFixed5',
    name: 'ประกันโรคร้ายแรงชำระเบี้ยคงที่ 90/5',
    category: 'ciFixed',
    paymentYears: 5,
    coverageYears: 90,
    description: 'ชำระเบี้ย 5 ปี คุ้มครองชีวิตและโรคร้ายแรงถึงอายุ 90 ปี เบี้ยคงที่ ไม่ปรับเพิ่มตามอายุ',
    minAge: 16,
    maxAge: 65,
    minCover: 200000,
    hasCashback: false,
    cashbackPercent: 0,
  },
  {
    id: 'ciFixed10',
    name: 'ประกันโรคร้ายแรงชำระเบี้ยคงที่ 90/10',
    category: 'ciFixed',
    paymentYears: 10,
    coverageYears: 90,
    description: 'ชำระเบี้ย 10 ปี คุ้มครองชีวิตและโรคร้ายแรงถึงอายุ 90 ปี เบี้ยคงที่ตลอดสัญญา',
    minAge: 16,
    maxAge: 65,
    minCover: 200000,
    hasCashback: false,
    cashbackPercent: 0,
  },
  {
    id: 'ciFixed20',
    name: 'ประกันโรคร้ายแรงชำระเบี้ยคงที่ 90/20',
    category: 'ciFixed',
    paymentYears: 20,
    coverageYears: 90,
    description: 'ชำระเบี้ย 20 ปี คุ้มครองชีวิตและโรคร้ายแรงถึงอายุ 90 ปี เบี้ยสบายๆ จ่ายคงที่',
    minAge: 16,
    maxAge: 60,
    minCover: 200000,
    hasCashback: false,
    cashbackPercent: 0,
  },

  // ประกันสะสมทรัพย์
  {
    id: 'saving10_5',
    name: 'ประกันสะสมทรัพย์ 10/5',
    category: 'saving',
    paymentYears: 5,
    coverageYears: 10,
    description: 'ออมสั้น 5 ปี คุ้มครอง 10 ปี การันตีผลตอบแทนและเงินคืนทุกปี พร้อมสิทธิลดหย่อนภาษี',
    minAge: 1,
    maxAge: 65,
    minCover: 100000,
    hasCashback: true,
    cashbackPercent: 2.5,
  },

  // ประกันสุขภาพเหมาจ่าย
  {
    id: 'healthCare5M',
    name: 'ประกันสุขภาพเหมาจ่าย วงเงิน 5 ล้าน',
    category: 'health',
    paymentYears: 1,
    coverageYears: 85,
    description: 'เหมาจ่ายค่ารักษาพยาบาล 5,000,000 บาท/ปี คลุมทุกโรค ผ่าตัด ไม่ต้องสำรองจ่าย',
    minAge: 11,
    maxAge: 70,
    minCover: 5000000,
    hasCashback: false,
    cashbackPercent: 0,
  },
];

export interface CalculationInput {
  gender: Gender;
  age: number;
  planId: string;
  lifeCover: number;
  enableCI50: boolean;
  ciCover: number;
}

export interface CashValueRow {
  policyYear: number;
  insuredAge: number;
  totalPremiumPaid: number;
  guaranteedCashback: number;
  accumulatedCashback: number;
  surrenderValue: number; // มูลค่าเวนคืนเงินสด
  deathBenefit: number;   // ความคุ้มครองชีวิต
}

export interface QuoteCalculationResult {
  plan: PlanDefinition;
  gender: Gender;
  age: number;
  lifeCover: number;
  ciCover: number;
  paymentYears: number;
  coverageYears: number;

  // Premium breakdown
  lifeAnnualPremium: number;
  ciAnnualPremium: number;
  annual: number;
  semiAnnual: number;
  quarterly: number;
  monthly: number;

  // Flags for minimum premium
  semiAnnualAvailable: boolean;
  quarterlyAvailable: boolean;
  monthlyAvailable: boolean;

  // Total benefits
  totalDeathBenefit: number;
  maturityBenefit: number;
  annualCashbackAmount: number;
  totalPaidPremiumLifetime: number;
  estimatedTotalReturns: number;

  // Table of 20-year cash values
  cashValueSchedule: CashValueRow[];

  // Formatted date & ref
  quoteDate: string;
  quoteRef: string;
}

export interface FuturePlanInput {
  income: number;
  expenses: number;
  debt: number;
  budget: number;
}

export interface FuturePlanResult {
  income: number;
  expenses: number;
  debt: number;
  budget: number;
  remaining: number;
  afterSaving: number;
  essentialMonthly: number;
  emergencyFund3: number;
  emergencyFund6: number;
  savingPercent: number;
  annualSaving: number;
  advice: string;
  status: 'good' | 'warning' | 'danger';
}

/**
 * Premium base rate per 1,000 THB sum assured.
 * Whole-life plans use MySQL rate lookups; other plans use demo formulas.
 */
function getDatabaseRate(table: AgeRateTable, gender: Gender, age: number): number {
  const rate = Number.isInteger(age) && age >= 0 ? table[gender][age] : undefined;
  if (rate === undefined || !Number.isFinite(rate)) {
    throw new Error(`ไม่พบอัตราเบี้ยในฐานข้อมูลสำหรับ${gender === 'F' ? 'เพศหญิง' : 'เพศชาย'} อายุ ${age} ปี`);
  }
  return rate;
}

export function getBaseRatePerThousand(
  ratesData: InsuranceRates,
  planId: string,
  gender: Gender,
  age: number,
  lifeCover = 0,
): number {
  const isMale = gender === 'M';

  switch (planId) {
    case 'life10':
    case 'lifeOnly':
    case 'life90': {
      const paymentYears: WholeLifePaymentYears = planId === 'life10' ? 10 : planId === 'lifeOnly' ? 20 : 90;
      const rates = lifeCover >= ratesData.highCoverageThreshold
        ? ratesData.wholeLife.highCoverage
        : ratesData.wholeLife.standard;
      return getDatabaseRate(rates[paymentYears], gender, age);
    }
    case 'cashback5': {
      // 99/5: 5-year pay with 1% annual cashback
      const base = isMale ? 185 : 180;
      const ageFactor = age * 0.45;
      return Math.round((base + ageFactor) * 100) / 100;
    }
    case 'cashback10': {
      // 99/10: 10-year pay with 1% annual cashback
      const base = isMale ? 98 : 94;
      const ageFactor = age * 0.55;
      return Math.round((base + ageFactor) * 100) / 100;
    }
    case 'cashback15': {
      // 99/15: 15-year pay with 1% annual cashback
      const base = isMale ? 68 : 64;
      const ageFactor = age * 0.65;
      return Math.round((base + ageFactor) * 100) / 100;
    }
    case 'cashback20': {
      // 99/20: 20-year pay with 1% annual cashback
      const base = isMale ? 54 : 50;
      const ageFactor = age * 0.75;
      return Math.round((base + ageFactor) * 100) / 100;
    }
    case 'ciFixed5': {
      // CI Fixed Pay 90/5
      const base = isMale ? 115 : 98;
      const ageFactor = (age - 16) * 1.6;
      return Math.round((base + ageFactor) * 100) / 100;
    }
    case 'ciFixed10': {
      // CI Fixed Pay 90/10
      const base = isMale ? 65 : 55;
      const ageFactor = (age - 16) * 1.1;
      return Math.round((base + ageFactor) * 100) / 100;
    }
    case 'ciFixed20': {
      // CI Fixed Pay 90/20
      const base = isMale ? 38 : 32;
      const ageFactor = (age - 16) * 0.85;
      return Math.round((base + ageFactor) * 100) / 100;
    }
    case 'saving10_5': {
      // Savings 10/5
      return 195;
    }
    case 'healthCare5M': {
      // Health 5M lump sum
      const base = isMale ? 18000 : 19500;
      const ageFactor = age < 30 ? age * 120 : age * 380;
      return (base + ageFactor) / 1000;
    }
    default:
      return 30;
  }
}

/**
 * CI50 Rider Rate per 1,000 THB sum insured
 */
export function getCI50RatePerThousand(ratesData: InsuranceRates, gender: Gender, age: number): number {
  return getDatabaseRate(ratesData.ci50, gender, age);
}

/**
 * Main calculation function
 */
export function calculateQuote(input: CalculationInput, ratesData: InsuranceRates): QuoteCalculationResult {
  const { gender, age, planId, lifeCover, enableCI50, ciCover } = input;

  const plan = AVAILABLE_PLANS.find(p => p.id === planId) || AVAILABLE_PLANS[0];

  const lifeRate = getBaseRatePerThousand(ratesData, plan.id, gender, age, lifeCover);
  const lifeAnnualPremium = Math.round((lifeCover / 1000) * lifeRate);

  let ciAnnualPremium = 0;
  const effectiveCiCover = enableCI50 ? ciCover : 0;
  if (enableCI50 && effectiveCiCover > 0) {
    const ciRate = getCI50RatePerThousand(ratesData, gender, age);
    ciAnnualPremium = Math.round((effectiveCiCover / 1000) * ciRate);
  }

  const annual = lifeAnnualPremium + ciAnnualPremium;

  // Payment installment multipliers matching Thai insurance standards:
  // Semi-annual: 52% of annual
  // Quarterly: 27% of annual
  // Monthly: 9% of annual
  const semiAnnual = Math.round(annual * ratesData.paymentFactors.semiAnnual * 100) / 100;
  const quarterly = Math.round(annual * ratesData.paymentFactors.quarterly * 100) / 100;
  const monthly = Math.round(annual * ratesData.paymentFactors.monthly * 100) / 100;

  // Minimum payment thresholds:
  // Semi-annual >= 2,000 THB
  // Quarterly >= 2,000 THB
  // Monthly >= 500 THB
  const semiAnnualAvailable = semiAnnual >= 2000;
  const quarterlyAvailable = quarterly >= 2000;
  const monthlyAvailable = monthly >= 500;

  // Cashback calculations
  const annualCashbackAmount = plan.hasCashback
    ? Math.round((lifeCover * plan.cashbackPercent) / 100)
    : 0;

  const totalDeathBenefit = lifeCover + effectiveCiCover;
  const maturityBenefit = lifeCover;
  const totalPaidPremiumLifetime = annual * (plan.paymentYears === 90 ? (90 - age) : plan.paymentYears);

  // Estimated cash value schedule (20 years demonstration)
  const cashValueSchedule: CashValueRow[] = [];
  let cumCashback = 0;

  for (let year = 1; year <= 20; year++) {
    const currentAge = age + year;
    const isPaying = year <= plan.paymentYears;
    const totalPaid = annual * (isPaying ? year : plan.paymentYears);

    if (plan.hasCashback) {
      cumCashback += annualCashbackAmount;
    }

    // Cash surrender value curve: starts low in years 1-3, grows toward and exceeds premiums
    let cashValueRate = 0;
    if (year === 1) cashValueRate = 0.05;
    else if (year === 2) cashValueRate = 0.20;
    else if (year === 3) cashValueRate = 0.45;
    else if (year <= 5) cashValueRate = 0.65 + (year - 3) * 0.10;
    else if (year <= 10) cashValueRate = 0.85 + (year - 5) * 0.04;
    else if (year <= plan.paymentYears) cashValueRate = 1.05 + (year - 10) * 0.03;
    else cashValueRate = 1.25 + (year - plan.paymentYears) * 0.025;

    const surrenderValue = Math.round(lifeAnnualPremium * Math.min(year, plan.paymentYears) * cashValueRate);

    cashValueSchedule.push({
      policyYear: year,
      insuredAge: currentAge,
      totalPremiumPaid: totalPaid,
      guaranteedCashback: annualCashbackAmount,
      accumulatedCashback: cumCashback,
      surrenderValue: surrenderValue,
      deathBenefit: totalDeathBenefit,
    });
  }

  const estimatedTotalReturns = maturityBenefit + (annualCashbackAmount * (plan.coverageYears - age));

  const quoteRef = `OC-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const quoteDate = new Date().toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    plan,
    gender,
    age,
    lifeCover,
    ciCover: effectiveCiCover,
    paymentYears: plan.paymentYears,
    coverageYears: plan.coverageYears,

    lifeAnnualPremium,
    ciAnnualPremium,
    annual,
    semiAnnual,
    quarterly,
    monthly,

    semiAnnualAvailable,
    quarterlyAvailable,
    monthlyAvailable,

    totalDeathBenefit,
    maturityBenefit,
    annualCashbackAmount,
    totalPaidPremiumLifetime,
    estimatedTotalReturns,

    cashValueSchedule,
    quoteDate,
    quoteRef,
  };
}

/**
 * Future Financial Planner calculation
 */
export function calculateFuturePlan(input: FuturePlanInput): FuturePlanResult {
  const { income, expenses, debt, budget } = input;

  const essentialMonthly = expenses + debt;
  const remaining = income - essentialMonthly;
  const afterSaving = remaining - budget;

  const emergencyFund3 = essentialMonthly * 3;
  const emergencyFund6 = essentialMonthly * 6;

  const savingPercent = income > 0 ? (budget / income) * 100 : 0;
  const annualSaving = budget * 12;

  let advice = '';
  let status: 'good' | 'warning' | 'danger' = 'good';

  if (remaining < 0) {
    advice = 'รายจ่ายและภาระหนี้สินสูงกว่ารายได้รวม ควรทบทวนการลดภาระค่าใช้จ่ายที่ไม่จำเป็นโดยด่วน';
    status = 'danger';
  } else if (afterSaving < 0) {
    advice = 'งบออมที่ตั้งไว้สูงกว่าเงินคงเหลือสุทธิ ควรปรับลดงบออมต่อเดือนลงเพื่อไม่ให้กระทบสภาพคล่องในชีวิตประจำวัน';
    status = 'warning';
  } else if (savingPercent < 10) {
    advice = 'คุณมีสภาพคล่องคงเหลือที่ดี แต่สัดส่วนเงินออมยังต่ำกว่า 10% ของรายได้ แนะนำเพิ่มการออมเพื่อความมั่นคงในอนาคต';
    status = 'warning';
  } else if (savingPercent >= 10 && savingPercent <= 30) {
    advice = 'สัดส่วนเงินออมอยู่ในเกณฑ์มาตรฐานที่ดีเยี่ยม (10-30%) ควรแบ่งเงินออมเป็นกองทุนฉุกเฉินและประกันเพื่อคุ้มครองความเสี่ยง';
    status = 'good';
  } else {
    advice = 'คุณมีความสามารถในการออมสูงมาก (เกิน 30% ของรายได้) ควรวางแผนต่อยอดด้วยประกันชีวิตมรดกและประกันสุขภาพเหมาจ่าย';
    status = 'good';
  }

  return {
    income,
    expenses,
    debt,
    budget,
    remaining,
    afterSaving,
    essentialMonthly,
    emergencyFund3,
    emergencyFund6,
    savingPercent,
    annualSaving,
    advice,
    status,
  };
}

export const AGENT_CONTACT_INFO = [
  {
    name: 'นายสุนทร รุ่งสว่าง',
    license: '6701048018',
    role: 'ที่ปรึกษาการเงินและประกันชีวิตอาวุโส',
  },
  {
    name: 'นางสาววรรณิภา ตระการจันทร์',
    license: '6801013560',
    role: 'ผู้เชี่ยวชาญการวางแผนมรดกและสุขภาพ',
  },
  {
    name: 'นางสาววนัชชานาภรณ์ รุ่งสว่าง',
    license: '6801060266',
    role: 'ที่ปรึกษาการวางแผนความคุ้มครอง',
  },
];

export const CREDIT_CARD_PROMOTIONS = [
  { bank: 'SCB Card', offer: 'ผ่อน 0% นานสูงสุด 4 เดือน', icon: 'scb' },
  { bank: 'ttb bank', offer: 'ผ่อน 0% นานสูงสุด 3 เดือน', icon: 'ttb' },
  { bank: 'Krungsri First Choice', offer: 'ผ่อน 0% นาน 3 เดือน หรือรับเครดิตเงินคืน', icon: 'firstchoice' },
];
