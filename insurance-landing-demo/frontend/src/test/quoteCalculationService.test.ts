import { describe, expect, it } from 'vitest';
import type { AgeRateTable, InsuranceRates, WholeLifeRateSet } from '../types';
import {
  calculateQuote,
  getBaseRatePerThousand,
  getCI50RatePerThousand,
} from '../services/quoteCalculationService';

function ageTable(female: Record<number, number> = {}, male: Record<number, number> = {}): AgeRateTable {
  return {
    F: Array.from({ length: 100 }, (_, age) => female[age] ?? 1),
    M: Array.from({ length: 100 }, (_, age) => male[age] ?? 1),
  };
}

function wholeLifeRateSet(
  female: Record<number, number> = {},
  male: Record<number, number> = {},
): WholeLifeRateSet {
  return { 10: ageTable(female, male), 20: ageTable(female, male), 90: ageTable(female, male) };
}

const rates: InsuranceRates = {
  highCoverageThreshold: 500000,
  paymentFactors: { annual: 1, semiAnnual: 0.52, quarterly: 0.27, monthly: 0.09 },
  wholeLife: {
    standard: {
      10: ageTable({}, { 30: 42.2 }),
      20: ageTable({ 1: 9.4, 16: 13.3, 30: 19.4, 45: 30, 65: 60 }),
      90: ageTable({ 30: 13.2 }),
    },
    highCoverage: {
      ...wholeLifeRateSet(),
      20: ageTable({ 30: 18.4 }),
    },
  },
  ci50: ageTable({ 1: 0, 16: 1.2, 30: 1.85, 45: 6.44, 65: 27.69 }),
};

const quotationCases = [
  { age: 1, lifeAnnualPremium: 1880, ciAnnualPremium: 0, annual: 1880, semiAnnual: 977.6, quarterly: 507.6, monthly: 169.2 },
  { age: 16, lifeAnnualPremium: 2660, ciAnnualPremium: 960, annual: 3620, semiAnnual: 1882.4, quarterly: 977.4, monthly: 325.8 },
  { age: 30, lifeAnnualPremium: 3880, ciAnnualPremium: 1480, annual: 5360, semiAnnual: 2787.2, quarterly: 1447.2, monthly: 482.4 },
  { age: 45, lifeAnnualPremium: 6000, ciAnnualPremium: 5152, annual: 11152, semiAnnual: 5799.04, quarterly: 3011.04, monthly: 1003.68 },
  { age: 65, lifeAnnualPremium: 12000, ciAnnualPremium: 22152, annual: 34152, semiAnnual: 17759.04, quarterly: 9221.04, monthly: 3073.68 },
];

describe('MySQL rate-based insurance calculations', () => {
  it.each(quotationCases)('matches the 90/20 quotation at age $age', ({ age, ...expected }) => {
    const quote = calculateQuote({
      gender: 'F',
      age,
      planId: 'lifeOnly',
      lifeCover: 200000,
      enableCI50: true,
      ciCover: 800000,
    }, rates);

    expect({
      lifeAnnualPremium: quote.lifeAnnualPremium,
      ciAnnualPremium: quote.ciAnnualPremium,
      annual: quote.annual,
      semiAnnual: quote.semiAnnual,
      quarterly: quote.quarterly,
      monthly: quote.monthly,
    }).toEqual(expected);
  });

  it('switches to the high-coverage whole-life table at 500,000 THB', () => {
    expect(getBaseRatePerThousand(rates, 'lifeOnly', 'F', 30, 499999)).toBe(19.4);
    expect(getBaseRatePerThousand(rates, 'lifeOnly', 'F', 30, 500000)).toBe(18.4);

    const quote = calculateQuote({
      gender: 'F',
      age: 30,
      planId: 'lifeOnly',
      lifeCover: 500000,
      enableCI50: false,
      ciCover: 0,
    }, rates);
    expect(quote.lifeAnnualPremium).toBe(9200);
  });

  it('uses database rates for every whole-life payment term and CI50', () => {
    expect(getBaseRatePerThousand(rates, 'life10', 'M', 30, 200000)).toBe(42.2);
    expect(getBaseRatePerThousand(rates, 'lifeOnly', 'F', 30, 200000)).toBe(19.4);
    expect(getBaseRatePerThousand(rates, 'life90', 'F', 30, 200000)).toBe(13.2);
    expect(getCI50RatePerThousand(rates, 'F', 30)).toBe(1.85);
  });

  it('rejects ages outside the database rate tables', () => {
    expect(() => getCI50RatePerThousand(rates, 'F', 100)).toThrow('ไม่พบอัตราเบี้ยในฐานข้อมูล');
    expect(() => getBaseRatePerThousand(rates, 'life90', 'F', -1, 200000)).toThrow('ไม่พบอัตราเบี้ยในฐานข้อมูล');
  });
});
