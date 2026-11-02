import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IndexLinkedResultTable } from '../components/IndexLinkedResultTable';
import type { IndexLinkedQuote, IndexLinkedQuoteRow } from '../types';

const SCENARIO_PAYOUTS: Record<string, { split: number; maturity: number }> = {
  IDX2: { split: 52045, maturity: 224210 },
  IDX8: { split: 249830, maturity: 2046975 },
};

const SCENARIO_CODES = Object.keys(SCENARIO_PAYOUTS);

function buildRows(): IndexLinkedQuoteRow[] {
  return Array.from({ length: 25 }, (_, index) => {
    const policyYear = index + 1;
    const isMaturityYear = policyYear === 25;
    const isSplitYear = policyYear === 7;
    return {
      policyYear,
      insuredAge: 30 + policyYear,
      annualPremium: policyYear <= 7 ? 100000 : 0,
      cumulativePremium: Math.min(policyYear, 7) * 100000,
      cashbackPercent: isMaturityYear ? 0 : 1,
      cashbackAmount: isMaturityYear ? 0 : 1000,
      guaranteedPercent: isMaturityYear ? 700 : 1,
      guaranteedAmount: isMaturityYear ? 700000 : 1000,
      deathBenefit: Math.min(policyYear, 7) * 101000,
      cashValue: isMaturityYear ? 700000 : 3300 + index * 1000,
      nonGuaranteed: SCENARIO_CODES.reduce<Record<string, number>>((accumulator, code) => {
        const payout = SCENARIO_PAYOUTS[code];
        accumulator[code] = isSplitYear ? payout.split : isMaturityYear ? payout.maturity : 0;
        return accumulator;
      }, {}),
    };
  });
}

const quote: IndexLinkedQuote = {
  plan: {
    planCode: 'SS25_7',
    planName: 'ประกันสะสมทรัพย์ อินเด็กซ์ลิงก์ 25/7 (แผนตัวอย่าง)',
    shortLabel: '25/7',
    paymentYears: 7,
    coverageYears: 25,
    minAge: 1,
    maxAge: 75,
    premiumPerThousand: 1000,
    annualCashbackPercent: 1,
    cashbackYears: 24,
    maturityPercent: 700,
    deathBenefitPremiumPercent: 101,
    participationRate: 100,
    ngSplitYear: 7,
    expenseRatioPercent: 54.82,
  },
  gender: 'F',
  age: 30,
  sumAssured: 100000,
  annualPremium: 100000,
  totalPremium: 700000,
  totalCashback: 24000,
  maturityBenefit: 700000,
  totalGuaranteedBenefit: 724000,
  rows: buildRows(),
  scenarios: [
    {
      scenarioCode: 'IDX2',
      annualIndexChangePercent: 2,
      indexLevelAtSplitYear: 114.87,
      indexLevelAtMaturity: 164.06,
      ngAtSplitYear: 52045,
      ngAtMaturity: 224210,
      totalNonGuaranteed: 276255,
      totalBenefit: 1000255,
      benefitMultiple: 1.43,
      irrPercent: 1.75,
    },
    {
      scenarioCode: 'IDX8',
      annualIndexChangePercent: 8,
      indexLevelAtSplitYear: 171.38,
      indexLevelAtMaturity: 684.85,
      ngAtSplitYear: 249830,
      ngAtMaturity: 2046975,
      totalNonGuaranteed: 2296805,
      totalBenefit: 3020805,
      benefitMultiple: 4.32,
      irrPercent: 7.95,
    },
  ],
  assumptions: {
    participationRate: 100,
    indexBaseLevel: 100,
    nonGuaranteedPayoutRatio: 0.5,
    exchangeRateAssumption: 'อัตราแลกเปลี่ยนคงที่',
    premiumTiming: 'เบี้ยประกันภัยชำระต้นปีกรมธรรม์',
  },
};

describe('IndexLinkedResultTable', () => {
  it('renders the plan header with the insured profile', () => {
    render(<IndexLinkedResultTable quote={quote} />);
    expect(screen.getByText(/อินเด็กซ์ลิงก์ 25\/7/)).toBeInTheDocument();
    expect(screen.getByText(/อายุ 30 ปี/)).toBeInTheDocument();
  });

  it('renders the 2% and 8% scenario columns', () => {
    render(<IndexLinkedResultTable quote={quote} />);
    expect(screen.getAllByRole('columnheader', { name: '2%' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('columnheader', { name: '8%' }).length).toBeGreaterThan(0);
  });

  it('renders the non-guaranteed payout of the 8% column', () => {
    render(<IndexLinkedResultTable quote={quote} />);
    expect(screen.getAllByText('249,830.00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2,046,975.00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2,296,805.00').length).toBeGreaterThan(0);
  });

  it('renders the guaranteed totals and the IRR row', () => {
    render(<IndexLinkedResultTable quote={quote} />);
    expect(screen.getAllByText('724,000.00').length).toBeGreaterThan(0);
    expect(screen.getByText('7.95%')).toBeInTheDocument();
    expect(screen.getByText(/รวมรับผลประโยชน์ตลอดสัญญา/)).toBeInTheDocument();
  });
});
