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
