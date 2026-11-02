const indexLinkedRepository = require('../repositories/indexLinkedRepository');

/** Share of the non-guaranteed benefit paid at each payout year (50% + 50%). */
const NON_GUARANTEED_PAYOUT_RATIO = 0.5;

/** Level of the reference index on the first valuation day (USD). */
const BASE_INDEX_LEVEL = 100;

const MAX_SUM_ASSURED = 100000000;

const GENDERS = ['M', 'F'];

function roundMoney(value) {
  return Math.round(value);
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

/** Client-safe validation error following the project error convention. */
function validationError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

/**
 * Reference index level at the end of a policy year when the index grows by
 * `growthPercent` every year. Rounded to 2 decimals because the quotation
 * tables of the source document use the rounded level inside the formula.
 */
function getIndexLevel(growthPercent, policyYear) {
  if (policyYear <= 0) return BASE_INDEX_LEVEL;
  return Math.round(BASE_INDEX_LEVEL * Math.pow(1 + growthPercent / 100, policyYear) * 100) / 100;
}

/**
 * Non-guaranteed (index linked) benefit of one payout year:
 * 50% x premiums paid x PR x max(indexLevel(t) / indexLevel(0) - 100%, 0)
 * The result can never be negative.
 *
 * The growth is applied in integer "hundredths of a percent" units. A benefit
 * that lands exactly on .5 THB (brochure page 7: 0.5 x 4,455,000 x 1.3966 =
 * 3,110,926.5) must round up like the insurer's calculator, but floating point
 * dust (239.66 / 100 - 1 === 1.3965999999999998) would round it down to
 * 3,110,926.
 */
function computeNonGuaranteedBenefit(premiumsPaid, participationRate, growthPercent, policyYear) {
  const levelHundredths = Math.round(getIndexLevel(growthPercent, policyYear) * 100);
  const growthHundredths = Math.max(levelHundredths - BASE_INDEX_LEVEL * 100, 0);

  return Math.round(
    (premiumsPaid * NON_GUARANTEED_PAYOUT_RATIO * (participationRate / 100) * growthHundredths) / 10000,
  );
}

/**
 * Internal rate of return of a yearly cash flow series (index 0 = policy start).
 * Returns a percentage rounded to 2 decimals, or 0 when no root is found.
 */
function computeIrr(cashFlows) {
  const npv = (rate) => cashFlows.reduce(
    (sum, amount, year) => sum + amount / Math.pow(1 + rate, year),
    0,
  );

  let low = -0.9;
  let high = 1;
  if (npv(low) * npv(high) > 0) return 0;

  for (let i = 0; i < 200; i += 1) {
    const mid = (low + high) / 2;
    if (npv(low) * npv(mid) <= 0) high = mid;
    else low = mid;
  }

  return round2(((low + high) / 2) * 100);
}

/** Minimum sum assured of a plan, taking the senior age band into account. */
function resolveMinimumSumAssured(plan, age) {
  const hasSeniorRule = plan.seniorAgeThreshold !== null
    && plan.seniorAgeThreshold !== undefined
    && plan.seniorMinSumAssured !== null
    && plan.seniorMinSumAssured !== undefined;

  if (hasSeniorRule && age >= plan.seniorAgeThreshold) {
    return plan.seniorMinSumAssured;
  }
  return plan.minSumAssured;
}

/**
 * Build the full 25-year projection table of one quotation.
 * Pure function (no database access) so it can be unit tested directly.
 */
function buildQuote(plan, scenarios, input) {
  const { gender, age, sumAssured } = input;
  const scale = sumAssured / 1000;

  const annualPremium = roundMoney(plan.premiumPerThousand * scale);
  const maturityBenefit = roundMoney((sumAssured * plan.maturityPercent) / 100);

  const rows = [];
  let cumulativePremium = 0;

  for (let policyYear = 1; policyYear <= plan.coverageYears; policyYear += 1) {
    const scheduleRow = plan.schedule.find((row) => row.policyYear === policyYear);
    if (!scheduleRow) {
      throw new Error(
        `ข้อมูลตารางผลประโยชน์ของแผน ${plan.planCode} ไม่ครบถ้วน: ปีกรมธรรม์ที่ ${policyYear}`,
      );
    }

    const premiumThisYear = roundMoney(scheduleRow.premiumPerThousand * scale);
    cumulativePremium += premiumThisYear;

    const cashbackAmount = roundMoney((sumAssured * scheduleRow.cashbackPercent) / 100);
    const isMaturityYear = policyYear === plan.coverageYears;

    const nonGuaranteed = {};
    for (const scenario of scenarios) {
      const isPayoutYear = policyYear === plan.ngSplitYear || isMaturityYear;
      nonGuaranteed[scenario.scenarioCode] = isPayoutYear
        ? computeNonGuaranteedBenefit(
          cumulativePremium,
          plan.participationRate,
          scenario.annualIndexChangePercent,
          policyYear,
        )
        : 0;
    }

    rows.push({
      policyYear,
      insuredAge: age + policyYear,
      annualPremium: premiumThisYear,
      cumulativePremium,
      cashbackPercent: scheduleRow.cashbackPercent,
      cashbackAmount,
      guaranteedPercent: isMaturityYear ? plan.maturityPercent : scheduleRow.cashbackPercent,
      guaranteedAmount: isMaturityYear ? maturityBenefit : cashbackAmount,
      deathBenefit: roundMoney((cumulativePremium * plan.deathBenefitPremiumPercent) / 100),
      cashValue: roundMoney(scheduleRow.cashValuePerThousand * scale),
      nonGuaranteed,
    });
  }

  const totalPremium = cumulativePremium;
  const totalCashback = roundMoney(
    (sumAssured * plan.annualCashbackPercent * plan.cashbackYears) / 100,
  );
  const totalGuaranteedBenefit = totalCashback + maturityBenefit;

  const scenarioSummaries = scenarios.map((scenario) => {
    const splitRow = rows.find((row) => row.policyYear === plan.ngSplitYear);
    const maturityRow = rows[rows.length - 1];

    const ngAtSplitYear = splitRow ? splitRow.nonGuaranteed[scenario.scenarioCode] : 0;
    const ngAtMaturity = maturityRow.nonGuaranteed[scenario.scenarioCode];
    const totalNonGuaranteed = ngAtSplitYear + ngAtMaturity;
    const totalBenefit = totalGuaranteedBenefit + totalNonGuaranteed;

    // IRR: premiums at the start of each payment year, payouts at year end.
    const cashFlows = new Array(plan.coverageYears + 1).fill(0);
    for (let year = 1; year <= plan.paymentYears; year += 1) {
      cashFlows[year - 1] -= annualPremium;
    }
    for (let year = 1; year <= plan.cashbackYears; year += 1) {
      cashFlows[year] += roundMoney((sumAssured * plan.annualCashbackPercent) / 100);
    }
    cashFlows[plan.ngSplitYear] += ngAtSplitYear;
    cashFlows[plan.coverageYears] += maturityBenefit + ngAtMaturity;

    return {
      scenarioCode: scenario.scenarioCode,
      annualIndexChangePercent: scenario.annualIndexChangePercent,
      indexLevelAtSplitYear: getIndexLevel(scenario.annualIndexChangePercent, plan.ngSplitYear),
      indexLevelAtMaturity: getIndexLevel(scenario.annualIndexChangePercent, plan.coverageYears),
      ngAtSplitYear,
      ngAtMaturity,
      totalNonGuaranteed,
      totalBenefit,
      benefitMultiple: totalPremium > 0 ? round2(totalBenefit / totalPremium) : 0,
      irrPercent: computeIrr(cashFlows),
    };
  });

  return {
    plan: {
      planCode: plan.planCode,
      planName: plan.planName,
      shortLabel: plan.shortLabel,
      paymentYears: plan.paymentYears,
      coverageYears: plan.coverageYears,
      minAge: plan.minAge,
      maxAge: plan.maxAge,
      premiumPerThousand: plan.premiumPerThousand,
      annualCashbackPercent: plan.annualCashbackPercent,
      cashbackYears: plan.cashbackYears,
      maturityPercent: plan.maturityPercent,
      deathBenefitPremiumPercent: plan.deathBenefitPremiumPercent,
      participationRate: plan.participationRate,
      ngSplitYear: plan.ngSplitYear,
      expenseRatioPercent: plan.expenseRatioPercent,
    },
    gender,
    age,
    sumAssured,
    annualPremium,
    totalPremium,
    totalCashback,
    maturityBenefit,
    totalGuaranteedBenefit,
    rows,
    scenarios: scenarioSummaries,
    assumptions: {
      participationRate: plan.participationRate,
      indexBaseLevel: BASE_INDEX_LEVEL,
      nonGuaranteedPayoutRatio: NON_GUARANTEED_PAYOUT_RATIO,
      exchangeRateAssumption: 'อัตราแลกเปลี่ยนคงที่ (ไม่เปลี่ยนแปลงจากวันคำนวณมูลค่าวันแรก)',
      premiumTiming: 'เบี้ยประกันภัยชำระต้นปีกรมธรรม์',
    },
  };
}

function assertPlanComplete(plan) {
  if (!Number.isFinite(plan.premiumPerThousand) || plan.premiumPerThousand <= 0) {
    throw new Error(`อัตราเบี้ยต่อทุนประกัน 1,000 บาท ของแผน ${plan.planCode} ไม่ถูกต้อง`);
  }
  if (plan.schedule.length !== plan.coverageYears) {
    throw new Error(
      `ตารางผลประโยชน์ของแผน ${plan.planCode} มี ${plan.schedule.length} ปี แต่ต้องมี ${plan.coverageYears} ปี`,
    );
  }
  for (let year = 1; year <= plan.coverageYears; year += 1) {
    if (!plan.schedule.some((row) => row.policyYear === year)) {
      throw new Error(`ตารางผลประโยชน์ของแผน ${plan.planCode} ไม่ครบถ้วน: ปีกรมธรรม์ที่ ${year}`);
    }
  }
}

class IndexLinkedService {
  async getPlans() {
    const { plans, scenarios } = await indexLinkedRepository.findAll();

    if (plans.length === 0) {
      throw new Error('ไม่พบแผนประกันสะสมทรัพย์อินเด็กซ์ลิงก์ในฐานข้อมูล');
    }
    if (scenarios.length === 0) {
      throw new Error('ไม่พบสมมุติฐานผลตอบแทนดัชนีอ้างอิงในฐานข้อมูล');
    }
    for (const plan of plans) {
      assertPlanComplete(plan);
    }

    return { plans, scenarios };
  }

  async calculateQuote(input) {
    const planCode = String(input?.planCode || '').trim();
    const age = Number(input?.age);
    const sumAssured = Number(input?.sumAssured);
    const gender = GENDERS.includes(input?.gender) ? input.gender : 'F';

    if (!planCode) {
      throw validationError('กรุณาระบุรหัสแผนประกันที่ต้องการคำนวณ');
    }

    const { plans, scenarios } = await indexLinkedRepository.findAll();
    const plan = plans.find((item) => item.planCode === planCode);
    if (!plan) {
      throw validationError('ไม่พบแผนประกันที่ระบุในฐานข้อมูล', 404);
    }
    if (scenarios.length === 0) {
      throw new Error('ไม่พบสมมุติฐานผลตอบแทนดัชนีอ้างอิงในฐานข้อมูล');
    }
    assertPlanComplete(plan);

    if (!Number.isInteger(age) || age < plan.minAge || age > plan.maxAge) {
      throw validationError(
        `แผน ${plan.planName} รับประกันภัยสำหรับผู้มีอายุระหว่าง ${plan.minAge} - ${plan.maxAge} ปี`,
      );
    }

    const minimumSumAssured = resolveMinimumSumAssured(plan, age);
    if (!Number.isInteger(sumAssured) || sumAssured < minimumSumAssured) {
      throw validationError(
        `ทุนประกันภัยขั้นต่ำของแผนนี้คือ ${minimumSumAssured.toLocaleString('th-TH')} บาท`,
      );
    }
    if (sumAssured > MAX_SUM_ASSURED) {
      throw validationError(
        `ทุนประกันภัยต้องไม่เกิน ${MAX_SUM_ASSURED.toLocaleString('th-TH')} บาท`,
      );
    }

    return buildQuote(plan, scenarios, { gender, age, sumAssured });
  }
}

const indexLinkedService = new IndexLinkedService();

module.exports = indexLinkedService;
module.exports.buildQuote = buildQuote;
module.exports.computeIrr = computeIrr;
module.exports.getIndexLevel = getIndexLevel;
module.exports.computeNonGuaranteedBenefit = computeNonGuaranteedBenefit;
module.exports.resolveMinimumSumAssured = resolveMinimumSumAssured;

