const { pool } = require('../config/db');

function toPlan(row) {
  return {
    planCode: row.plan_code,
    planName: row.plan_name,
    shortLabel: row.short_label,
    paymentYears: Number(row.payment_years),
    coverageYears: Number(row.coverage_years),
    minAge: Number(row.min_age),
    maxAge: Number(row.max_age),
    minSumAssured: Number(row.min_sum_assured),
    seniorAgeThreshold: row.senior_age_threshold === null ? null : Number(row.senior_age_threshold),
    seniorMinSumAssured: row.senior_min_sum_assured === null ? null : Number(row.senior_min_sum_assured),
    premiumPerThousand: Number(row.premium_per_thousand),
    annualCashbackPercent: Number(row.annual_cashback_percent),
    cashbackYears: Number(row.cashback_years),
    maturityPercent: Number(row.maturity_percent),
    deathBenefitPremiumPercent: Number(row.death_benefit_premium_percent),
    participationRate: Number(row.participation_rate),
    ngSplitYear: Number(row.ng_split_year),
    expenseRatioPercent: row.expense_ratio_percent === null ? null : Number(row.expense_ratio_percent),
    isDemo: Boolean(row.is_demo),
    schedule: [],
  };
}

class IndexLinkedRepository {
  /**
   * Load every active index-linked plan together with its yearly schedule
   * and the index growth scenarios used as table columns.
   */
  async findAll() {
    const [planResult, scheduleResult, scenarioResult] = await Promise.all([
      pool.query(`
        SELECT plan_code, plan_name, short_label, payment_years, coverage_years,
               min_age, max_age, min_sum_assured, senior_age_threshold, senior_min_sum_assured,
               premium_per_thousand, annual_cashback_percent, cashback_years, maturity_percent,
               death_benefit_premium_percent, participation_rate, ng_split_year,
               expense_ratio_percent, is_demo
        FROM index_linked_plans
        WHERE is_active = 1
        ORDER BY payment_years
      `),
      pool.query(`
        SELECT plan_code, policy_year, premium_per_thousand, cashback_percent, cash_value_per_thousand
        FROM index_linked_plan_schedule
        ORDER BY plan_code, policy_year
      `),
      pool.query(`
        SELECT scenario_code, annual_index_change_percent, display_order
        FROM index_linked_scenarios
        WHERE is_active = 1
        ORDER BY display_order
      `),
    ]);

    const plans = planResult[0].map(toPlan);
    const planByCode = Object.fromEntries(plans.map((plan) => [plan.planCode, plan]));

    for (const row of scheduleResult[0]) {
      const plan = planByCode[row.plan_code];
      if (!plan) continue;
      plan.schedule.push({
        policyYear: Number(row.policy_year),
        premiumPerThousand: Number(row.premium_per_thousand),
        cashbackPercent: Number(row.cashback_percent),
        cashValuePerThousand: Number(row.cash_value_per_thousand),
      });
    }

    const scenarios = scenarioResult[0].map((row) => ({
      scenarioCode: row.scenario_code,
      annualIndexChangePercent: Number(row.annual_index_change_percent),
      displayOrder: Number(row.display_order),
    }));

    return { plans, scenarios };
  }
}

module.exports = new IndexLinkedRepository();
