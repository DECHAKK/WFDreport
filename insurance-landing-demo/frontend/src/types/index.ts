export type RateGender = 'M' | 'F';
export type AgeRateTable = Record<RateGender, number[]>;
export type WholeLifeRateSet = Record<10 | 20 | 90, AgeRateTable>;
export type PaymentFrequency = 'annual' | 'semiAnnual' | 'quarterly' | 'monthly';

export interface InsuranceRates {
  highCoverageThreshold: number;
  paymentFactors: Record<PaymentFrequency, number>;
  wholeLife: {
    standard: WholeLifeRateSet;
    highCoverage: WholeLifeRateSet;
  };
  ci50: AgeRateTable;
}

export interface Plan {
  id: number;
  planName: string;
  description: string;
  demoPremium: string;
  coverageSummary: string[] | string;
  isDemo: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type InsuranceInterest = 'health' | 'life' | 'accident' | 'savings' | 'car' | 'other';
export type ContactMethod = 'phone' | 'email' | 'line';
export type LeadStatus = 'pending' | 'contacted' | 'closed' | 'cancelled';

export interface LeadSubmissionRequest {
  fullName: string;
  phone: string;
  email?: string | null;
  insuranceInterest: InsuranceInterest;
  preferredContactMethod: ContactMethod;
  consentGiven: boolean;
}

export interface Lead {
  id: number;
  fullName: string;
  phone: string;
  email?: string | null;
  insuranceInterest: InsuranceInterest;
  preferredContactMethod: ContactMethod;
  consentGiven: boolean;
  status: LeadStatus;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

/* ------------------------------------------------------------------ */
/* Index linked savings plans (25/7 and 25/15)                        */
/* ------------------------------------------------------------------ */

export interface IndexLinkedScheduleRow {
  policyYear: number;
  premiumPerThousand: number;
  cashbackPercent: number;
  cashValuePerThousand: number;
}

export interface IndexLinkedPlan {
  planCode: string;
  planName: string;
  shortLabel: string;
  paymentYears: number;
  coverageYears: number;
  minAge: number;
  maxAge: number;
  minSumAssured: number;
  seniorAgeThreshold: number | null;
  seniorMinSumAssured: number | null;
  premiumPerThousand: number;
  annualCashbackPercent: number;
  cashbackYears: number;
  maturityPercent: number;
  deathBenefitPremiumPercent: number;
  participationRate: number;
  ngSplitYear: number;
  expenseRatioPercent: number | null;
  isDemo: boolean;
  schedule: IndexLinkedScheduleRow[];
}

export interface IndexLinkedScenarioDefinition {
  scenarioCode: string;
  annualIndexChangePercent: number;
  displayOrder: number;
}

export interface IndexLinkedPlansResponse {
  plans: IndexLinkedPlan[];
  scenarios: IndexLinkedScenarioDefinition[];
}

export interface IndexLinkedQuoteRequest {
  planCode: string;
  gender: RateGender;
  age: number;
  sumAssured: number;
}

export interface IndexLinkedQuoteRow {
  policyYear: number;
  insuredAge: number;
  annualPremium: number;
  cumulativePremium: number;
  cashbackPercent: number;
  cashbackAmount: number;
  guaranteedPercent: number;
  guaranteedAmount: number;
  deathBenefit: number;
  cashValue: number;
  nonGuaranteed: Record<string, number>;
}

export interface IndexLinkedScenarioResult {
  scenarioCode: string;
  annualIndexChangePercent: number;
  indexLevelAtSplitYear: number;
  indexLevelAtMaturity: number;
  ngAtSplitYear: number;
  ngAtMaturity: number;
  totalNonGuaranteed: number;
  totalBenefit: number;
  benefitMultiple: number;
  irrPercent: number;
}

export interface IndexLinkedQuote {
  plan: Omit<
    IndexLinkedPlan,
    'schedule' | 'isDemo' | 'minSumAssured' | 'seniorAgeThreshold' | 'seniorMinSumAssured'
  >;
  gender: RateGender;
  age: number;
  sumAssured: number;
  annualPremium: number;
  totalPremium: number;
  totalCashback: number;
  maturityBenefit: number;
  totalGuaranteedBenefit: number;
  rows: IndexLinkedQuoteRow[];
  scenarios: IndexLinkedScenarioResult[];
  assumptions: {
    participationRate: number;
    indexBaseLevel: number;
    nonGuaranteedPayoutRatio: number;
    exchangeRateAssumption: string;
    premiumTiming: string;
  };
}
