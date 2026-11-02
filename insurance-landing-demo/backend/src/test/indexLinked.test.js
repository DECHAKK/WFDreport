const { describe, it } = require('node:test');
const assert = require('node:assert');

// Must run before any module requires config/db.js so the pool never validates
// production credentials while unit testing pure functions.
process.env.NODE_ENV = 'test';

const {
  buildQuote,
  computeIrr,
  getIndexLevel,
  computeNonGuaranteedBenefit,
  resolveMinimumSumAssured,
} = require('../services/indexLinkedService');

// Cash value per 1,000 THB of sum assured — identical to database/004_index_linked_plans.sql
const CASH_VALUE_SS25_7 = [
  33.00, 316.00, 957.00, 1633.00, 2455.00, 3119.00, 3808.00, 3935.00, 4067.00, 4205.00,
  4347.00, 4494.00, 4647.00, 4805.00, 4970.00, 5140.00, 5317.00, 5500.00, 5690.00, 5887.00,
  6092.00, 6304.00, 6524.00, 6753.00, 7000.00,
];

const CASH_VALUE_SS25_15 = [
  69.77, 668.11, 2023.37, 3452.63, 5190.57, 6594.46, 8051.20, 8319.71, 8598.80, 8890.57,
  9190.80, 9501.60, 9825.09, 10159.14, 10508.00, 10867.43, 11241.66, 11628.57, 12030.29, 12446.80,
  12880.23, 13328.46, 13793.60, 14277.77, 14800.00,
];

function buildSchedule(paymentYears, cashValues) {
  return cashValues.map((cashValue, index) => {
    const policyYear = index + 1;
    return {
      policyYear,
      premiumPerThousand: policyYear <= paymentYears ? 1000 : 0,
      cashbackPercent: policyYear <= 24 ? 1 : 0,
      cashValuePerThousand: cashValue,
    };
  });
}

function buildPlan(overrides = {}) {
  return {
    planCode: 'SS25_7',
    planName: 'ประกันสะสมทรัพย์ อินเด็กซ์ลิงก์ 25/7 (แผนทดสอบ)',
    shortLabel: '25/7',
    paymentYears: 7,
    coverageYears: 25,
    minAge: 1,
    maxAge: 75,
    minSumAssured: 20000,
    seniorAgeThreshold: 71,
    seniorMinSumAssured: 150000,
    premiumPerThousand: 1000,
    annualCashbackPercent: 1,
    cashbackYears: 24,
    maturityPercent: 700,
    deathBenefitPremiumPercent: 101,
    participationRate: 100,
    ngSplitYear: 7,
    expenseRatioPercent: 54.82,
    schedule: buildSchedule(7, CASH_VALUE_SS25_7),
    ...overrides,
  };
}

/** Clone a plan with a different premium basis (the brochure used 990 per 1,000). */
function withPremiumBasis(sourcePlan, perThousand) {
  return {
    ...sourcePlan,
    premiumPerThousand: perThousand,
    schedule: sourcePlan.schedule.map((row) => ({
      ...row,
      premiumPerThousand: row.policyYear <= sourcePlan.paymentYears ? perThousand : 0,
    })),
  };
}

const SCENARIOS = [
  { scenarioCode: 'IDX2', annualIndexChangePercent: 2, displayOrder: 1 },
  { scenarioCode: 'IDX4', annualIndexChangePercent: 4, displayOrder: 2 },
  { scenarioCode: 'IDX6', annualIndexChangePercent: 6, displayOrder: 3 },
  { scenarioCode: 'IDX8', annualIndexChangePercent: 8, displayOrder: 4 },
];

function scenarioOf(quote, code) {
  return quote.scenarios.find((item) => item.scenarioCode === code);
}

const plan = buildPlan();
const plan15 = buildPlan({
  planCode: 'SS25_15',
  planName: 'ประกันสะสมทรัพย์ อินเด็กซ์ลิงก์ 25/15 (แผนทดสอบ)',
  shortLabel: '25/15',
  paymentYears: 15,
  maxAge: 70,
  seniorAgeThreshold: null,
  seniorMinSumAssured: null,
  maturityPercent: 1480,
  ngSplitYear: 15,
  schedule: buildSchedule(15, CASH_VALUE_SS25_15),
});

describe('Index linked reference index helpers', () => {
  it('rounds the index level to 2 decimals exactly like the quotation table', () => {
    assert.strictEqual(getIndexLevel(6, 7), 150.36);
    assert.strictEqual(getIndexLevel(6, 25), 429.19);
    assert.strictEqual(getIndexLevel(8, 25), 684.85);
    assert.strictEqual(getIndexLevel(2, 7), 114.87);
    assert.strictEqual(getIndexLevel(6, 0), 100);
  });

  it('never returns a negative non-guaranteed benefit', () => {
    assert.strictEqual(computeNonGuaranteedBenefit(700000, 100, -1, 7), 0);
    assert.strictEqual(computeNonGuaranteedBenefit(700000, 100, 0, 7), 0);
    assert.strictEqual(computeNonGuaranteedBenefit(700000, 100, 6, 7), 176260);
  });

  it('solves the IRR of the guaranteed-only cash flow series', () => {
    const cashFlows = new Array(26).fill(0);
    for (let year = 1; year <= 7; year += 1) cashFlows[year - 1] -= 100000;
    for (let year = 1; year <= 24; year += 1) cashFlows[year] += 1000;
    cashFlows[25] += 700000;
    assert.strictEqual(computeIrr(cashFlows), 0.16);
  });
});

describe('Index linked quote — plan 25/7 reproduces the quotation table', () => {
  const quote = buildQuote(plan, SCENARIOS, { gender: 'F', age: 30, sumAssured: 100000 });

  it('builds 25 policy years with the guaranteed columns of the table', () => {
    assert.strictEqual(quote.rows.length, 25);
    assert.strictEqual(quote.annualPremium, 100000);
    assert.strictEqual(quote.totalPremium, 700000);
    assert.strictEqual(quote.maturityBenefit, 700000);
    assert.strictEqual(quote.totalCashback, 24000);
    assert.strictEqual(quote.totalGuaranteedBenefit, 724000);

    assert.deepStrictEqual(
      { year: quote.rows[0].policyYear, pct: quote.rows[0].guaranteedPercent, amount: quote.rows[0].guaranteedAmount },
      { year: 1, pct: 1, amount: 1000 },
    );
    assert.deepStrictEqual(
      { pct: quote.rows[24].guaranteedPercent, amount: quote.rows[24].guaranteedAmount },
      { pct: 700, amount: 700000 },
    );
    assert.strictEqual(quote.rows[24].annualPremium, 0);
    assert.strictEqual(quote.rows[24].cumulativePremium, 700000);
  });

  it('matches the death benefit and cash value columns', () => {
    assert.strictEqual(quote.rows[0].deathBenefit, 101000);
    assert.strictEqual(quote.rows[6].deathBenefit, 707000);
    assert.strictEqual(quote.rows[24].deathBenefit, 707000);

    assert.strictEqual(quote.rows[0].cashValue, 3300);
    assert.strictEqual(quote.rows[6].cashValue, 380800);
    assert.strictEqual(quote.rows[7].cashValue, 393500);
    assert.strictEqual(quote.rows[24].cashValue, 700000);
  });

  it('matches the 2%, 4% and 6% non-guaranteed columns of page 6', () => {
    const idx2 = scenarioOf(quote, 'IDX2');
    const idx4 = scenarioOf(quote, 'IDX4');
    const idx6 = scenarioOf(quote, 'IDX6');

    assert.deepStrictEqual([idx2.ngAtSplitYear, idx2.ngAtMaturity], [52045, 224210]);
    assert.deepStrictEqual([idx4.ngAtSplitYear, idx4.ngAtMaturity], [110565, 583030]);
    assert.deepStrictEqual([idx6.ngAtSplitYear, idx6.ngAtMaturity], [176260, 1152165]);

    assert.deepStrictEqual(
      [idx2.totalNonGuaranteed, idx4.totalNonGuaranteed, idx6.totalNonGuaranteed],
      [276255, 693595, 1328425],
    );
    assert.deepStrictEqual([idx2.irrPercent, idx4.irrPercent, idx6.irrPercent], [1.75, 3.61, 5.69]);
  });

  it('adds the new 8% column', () => {
    const idx8 = scenarioOf(quote, 'IDX8');

    assert.strictEqual(idx8.annualIndexChangePercent, 8);
    assert.strictEqual(idx8.indexLevelAtSplitYear, 171.38);
    assert.strictEqual(idx8.indexLevelAtMaturity, 684.85);
    assert.strictEqual(idx8.ngAtSplitYear, 249830);
    assert.strictEqual(idx8.ngAtMaturity, 2046975);
    assert.strictEqual(idx8.totalNonGuaranteed, 2296805);
    assert.strictEqual(idx8.totalBenefit, 3020805);
    assert.strictEqual(idx8.benefitMultiple, 4.32);
    assert.strictEqual(idx8.irrPercent, 7.95);
  });

  it('only pays the non-guaranteed benefit in the split year and the maturity year', () => {
    const payoutYears = quote.rows
      .filter((row) => row.nonGuaranteed.IDX6 > 0)
      .map((row) => row.policyYear);
    assert.deepStrictEqual(payoutYears, [7, 25]);
  });
});

describe('Index linked quote — plan 25/15', () => {
  const quote = buildQuote(plan15, SCENARIOS, { gender: 'M', age: 40, sumAssured: 100000 });

  it('uses the 1,480% maturity benefit and the 15-year split', () => {
    assert.strictEqual(quote.annualPremium, 100000);
    assert.strictEqual(quote.totalPremium, 1500000);
    assert.strictEqual(quote.maturityBenefit, 1480000);
    assert.strictEqual(quote.totalGuaranteedBenefit, 1504000);
    assert.strictEqual(quote.rows[24].cashValue, 1480000);
  });

  it('calculates the non-guaranteed columns at policy years 15 and 25', () => {
    const idx6 = scenarioOf(quote, 'IDX6');

    assert.strictEqual(idx6.indexLevelAtSplitYear, 239.66);
    assert.deepStrictEqual([idx6.ngAtSplitYear, idx6.ngAtMaturity], [1047450, 2468925]);
    assert.strictEqual(idx6.totalNonGuaranteed, 3516375);
    assert.strictEqual(idx6.irrPercent, 7.95);

    assert.deepStrictEqual(
      quote.scenarios.map((item) => item.irrPercent),
      [2.43, 5.11, 7.95, 10.84],
    );
  });
});

describe('Index linked brochure cross-checks (990 per 1,000 premium basis)', () => {
  const brochurePlan7 = withPremiumBasis(plan, 990);
  const brochurePlan15 = withPremiumBasis(plan15, 990);

  it('reproduces the 25/7 brochure example (page 6)', () => {
    const quote = buildQuote(brochurePlan7, SCENARIOS, { gender: 'M', age: 50, sumAssured: 300000 });
    const idx6 = scenarioOf(quote, 'IDX6');

    assert.strictEqual(quote.annualPremium, 297000);
    assert.strictEqual(quote.totalPremium, 2079000);
    assert.strictEqual(quote.maturityBenefit, 2100000);
    assert.strictEqual(quote.totalGuaranteedBenefit, 2172000);
    assert.strictEqual(idx6.ngAtSplitYear, 523492);
    assert.strictEqual(idx6.ngAtMaturity, 3421930);
    assert.strictEqual(idx6.irrPercent, 5.71);
  });

  it('reproduces the 25/15 brochure example (page 7) including the .5 THB rounding', () => {
    const quote = buildQuote(brochurePlan15, SCENARIOS, { gender: 'F', age: 40, sumAssured: 300000 });
    const idx6 = scenarioOf(quote, 'IDX6');

    assert.strictEqual(quote.annualPremium, 297000);
    assert.strictEqual(quote.totalPremium, 4455000);
    assert.strictEqual(quote.maturityBenefit, 4440000);
    assert.strictEqual(quote.totalGuaranteedBenefit, 4512000);
    assert.strictEqual(idx6.ngAtSplitYear, 3110927);
    assert.strictEqual(idx6.ngAtMaturity, 7332707);
    assert.strictEqual(idx6.irrPercent, 7.96);
  });

  it('rounds a benefit of exactly .5 THB up, matching the insurer calculator', () => {
    // 0.5 x 4,455,000 x 1.3966 = 3,110,926.5 -> 3,110,927
    assert.strictEqual(computeNonGuaranteedBenefit(4455000, 100, 6, 15), 3110927);
  });
});

describe('Index linked minimum sum assured by age band', () => {
  it('applies the senior minimum from age 71 for the 7-year payment plan', () => {
    assert.strictEqual(resolveMinimumSumAssured(plan, 70), 20000);
    assert.strictEqual(resolveMinimumSumAssured(plan, 71), 150000);
    assert.strictEqual(resolveMinimumSumAssured(plan, 75), 150000);
  });

  it('keeps a flat minimum for the 15-year payment plan', () => {
    assert.strictEqual(resolveMinimumSumAssured(plan15, 40), 20000);
    assert.strictEqual(resolveMinimumSumAssured(plan15, 70), 20000);
  });
});
