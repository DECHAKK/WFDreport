#!/usr/bin/env node
/**
 * Cross-check every index linked calculation against the source documents.
 *
 * Sources of truth:
 *   A. Quotation table (page 6) — sums assured 100,000 / age 30 / premium 100,000 x 7
 *   B. Brochure page 6 example — sums assured 300,000 / premium 297,000 x 7
 *   C. Brochure page 7 example — sums assured 300,000 / premium 297,000 x 15
 *
 * Run from the backend folder so dotenv and mysql2 resolve:
 *   cd insurance-landing-demo/backend && node ../scripts/crosscheck-calculations.js
 */
const path = require('path');

const BACKEND_DIR = path.join(__dirname, '..', 'backend');
require(path.join(BACKEND_DIR, 'node_modules', 'dotenv'))
  .config({ path: path.join(BACKEND_DIR, '.env') });

const repository = require(path.join(BACKEND_DIR, 'src', 'repositories', 'indexLinkedRepository'));
const service = require(path.join(BACKEND_DIR, 'src', 'services', 'indexLinkedService'));
const { pool } = require(path.join(BACKEND_DIR, 'src', 'config', 'db'));

const { buildQuote, computeIrr, computeNonGuaranteedBenefit, getIndexLevel } = service;

let passed = 0;
let failed = 0;

function check(label, actual, expected, tolerance = 0) {
  const ok = typeof actual === 'number' && Math.abs(actual - expected) <= tolerance;
  if (ok) passed += 1;
  else failed += 1;
  const shown = typeof actual === 'number' ? actual.toLocaleString('en-US') : String(actual);
  const wanted = typeof expected === 'number' ? expected.toLocaleString('en-US') : String(expected);
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(52)} ${shown.padStart(16)}  ${ok ? '' : `(เอกสาร: ${wanted})`}`);
  return ok;
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

/** Cash value of the quotation table (page 6), sum assured 100,000. */
const QUOTATION_CASH_VALUES = [
  3300, 31600, 95700, 163300, 245500, 311900, 380800, 393500, 406700, 420500,
  434700, 449400, 464700, 480500, 497000, 514000, 531700, 550000, 569000, 588700,
  609200, 630400, 652400, 675300, 700000,
];

/** Clone a plan but with a different premium basis (brochure used 990 per 1,000). */
function withPremiumBasis(plan, perThousand) {
  return {
    ...plan,
    premiumPerThousand: perThousand,
    schedule: plan.schedule.map((row) => ({
      ...row,
      premiumPerThousand: row.policyYear <= plan.paymentYears ? perThousand : 0,
    })),
  };
}

function npv(cashFlows, rate) {
  return cashFlows.reduce((sum, amount, year) => sum + amount / Math.pow(1 + rate, year), 0);
}

/** IRR without rounding, used to verify the value reported to the UI. */
function solveIrr(cashFlows) {
  let low = -0.9;
  let high = 1;
  if (npv(cashFlows, low) * npv(cashFlows, high) > 0) return NaN;
  for (let i = 0; i < 300; i += 1) {
    const mid = (low + high) / 2;
    if (npv(cashFlows, low) * npv(cashFlows, mid) <= 0) high = mid;
    else low = mid;
  }
  return (low + high) / 2;
}

function cashFlowsOf(quote, scenario) {
  const flows = new Array(quote.plan.coverageYears + 1).fill(0);
  for (let year = 1; year <= quote.plan.paymentYears; year += 1) flows[year - 1] -= quote.annualPremium;
  for (let year = 1; year <= quote.plan.cashbackYears; year += 1) flows[year] += quote.rows[year - 1].cashbackAmount;
  flows[quote.plan.ngSplitYear] += scenario.ngAtSplitYear;
  flows[quote.plan.coverageYears] += quote.maturityBenefit + scenario.ngAtMaturity;
  return flows;
}


async function main() {
  const { plans, scenarios } = await repository.findAll();
  const plan7 = plans.find((plan) => plan.planCode === 'SS25_7');
  const plan15 = plans.find((plan) => plan.planCode === 'SS25_15');

  if (!plan7 || !plan15) {
    throw new Error('ไม่พบแผน SS25_7 / SS25_15 ในฐานข้อมูล — import database/004_index_linked_plans.sql ก่อน');
  }

  /* ---------------------------------------------------------------- *
   * A. Quotation table page 6 — 25/7, SA 100,000, age 30
   * ---------------------------------------------------------------- */
  const quote = buildQuote(plan7, scenarios, { gender: 'F', age: 30, sumAssured: 100000 });
  section('A. ตาราง quotation หน้า 6 (25/7 · ทุน 100,000 · อายุ 30)');

  check('เบี้ยประกันภัยต่อปี', quote.annualPremium, 100000);
  check('เบี้ยประกันภัยสะสมตลอดสัญญา', quote.totalPremium, 700000);
  check('เงินคืนการันตีรวม (1% x 24 ปี)', quote.totalCashback, 24000);
  check('เงินครบกำหนดสัญญา (700% ของทุน)', quote.maturityBenefit, 700000);
  check('ผลประโยชน์รับรองการจ่ายรวม (724%)', quote.totalGuaranteedBenefit, 724000);

  let cashValueMismatch = 0;
  let deathBenefitMismatch = 0;
  QUOTATION_CASH_VALUES.forEach((expected, index) => {
    if (quote.rows[index].cashValue !== expected) cashValueMismatch += 1;
    const cumulative = Math.min(index + 1, 7) * 100000;
    if (quote.rows[index].deathBenefit !== Math.round(cumulative * 1.01)) deathBenefitMismatch += 1;
  });
  check('เงินค่าเวนคืน 25 ปี ตรงตาราง (จำนวนแถวที่ผิด)', cashValueMismatch, 0);
  check('ผลประโยชน์กรณีเสียชีวิต 101% ทุกปี (แถวที่ผิด)', deathBenefitMismatch, 0);
  check('เงินคืนปีที่ 1', quote.rows[0].guaranteedAmount, 1000);
  check('เงินคืนปีที่ 24', quote.rows[23].guaranteedAmount, 1000);
  check('เงินครบสัญญาปีที่ 25', quote.rows[24].guaranteedAmount, 700000);
  check('เบี้ยปีที่ 25 ต้องเป็น 0', quote.rows[24].annualPremium, 0);

  const idx2 = quote.scenarios.find((item) => item.scenarioCode === 'IDX2');
  const idx4 = quote.scenarios.find((item) => item.scenarioCode === 'IDX4');
  const idx6 = quote.scenarios.find((item) => item.scenarioCode === 'IDX6');
  const idx8 = quote.scenarios.find((item) => item.scenarioCode === 'IDX8');

  check('NG 2% · ปีที่ 7', idx2.ngAtSplitYear, 52045);
  check('NG 2% · ปีที่ 25', idx2.ngAtMaturity, 224210);
  check('NG 4% · ปีที่ 7', idx4.ngAtSplitYear, 110565);
  check('NG 4% · ปีที่ 25', idx4.ngAtMaturity, 583030);
  check('NG 6% · ปีที่ 7', idx6.ngAtSplitYear, 176260);
  check('NG 6% · ปีที่ 25', idx6.ngAtMaturity, 1152165);
  check('รวม NG 6%', idx6.totalNonGuaranteed, 1328425);
  check('IRR 2%', idx2.irrPercent, 1.75);
  check('IRR 4%', idx4.irrPercent, 3.61);
  check('IRR 6%', idx6.irrPercent, 5.69);

  section('A2. คอลัมน์ 8% ที่เพิ่มใหม่ (คำนวณเอง ไม่มีในเอกสาร)');
  check('ระดับดัชนีปีที่ 7 (8%)', getIndexLevel(8, 7), 171.38);
  check('ระดับดัชนีปีที่ 25 (8%)', getIndexLevel(8, 25), 684.85);
  check('NG 8% · ปีที่ 7', idx8.ngAtSplitYear, 249830);
  check('NG 8% · ปีที่ 25', idx8.ngAtMaturity, 2046975);
  check('รวม NG 8%', idx8.totalNonGuaranteed, 2296805);
  check('IRR 8%', idx8.irrPercent, 7.95);

  section('A3. IRR ต้องทำให้ NPV = 0 (ตรวจด้วยวิธีอิสระ)');
  for (const scenario of quote.scenarios) {
    const flows = cashFlowsOf(quote, scenario);
    // Solve the IRR without rounding, then confirm the reported 2-decimal value
    // is within half a basis point of it and that NPV at the exact rate is zero.
    const exact = solveIrr(flows);
    check(`NPV ที่ IRR จริง = 0 · ${scenario.annualIndexChangePercent}%`, Math.round(Math.abs(npv(flows, exact)) * 1e6), 0, 1);
    check(`IRR ที่แสดงคลาดเคลื่อน <= 0.005pp · ${scenario.annualIndexChangePercent}%`, Math.abs(exact * 100 - scenario.irrPercent) <= 0.005 ? 1 : 0, 1);
  }
  const guaranteedOnly = new Array(26).fill(0);
  for (let year = 0; year < 7; year += 1) guaranteedOnly[year] -= 100000;
  for (let year = 1; year <= 24; year += 1) guaranteedOnly[year] += 1000;
  guaranteedOnly[25] += 700000;
  check('IRR กรณีไม่ได้รับ NG เลย (เอกสาร: 0.16%)', computeIrr(guaranteedOnly), 0.16);

  /* ---------------------------------------------------------------- *
   * B. Brochure page 6 example — 25/7, SA 300,000, premium 297,000 x 7
   *    (the brochure used a 990 per 1,000 premium basis)
   * ---------------------------------------------------------------- */
  section('B. ตัวอย่างโบรชัวร์หน้า 6 (25/7 · ทุน 300,000 · เบี้ย 297,000 x 7)');
  const brochure7 = buildQuote(withPremiumBasis(plan7, 990), scenarios, {
    gender: 'M', age: 50, sumAssured: 300000,
  });
  const b7idx6 = brochure7.scenarios.find((item) => item.scenarioCode === 'IDX6');

  check('เบี้ยประกันภัยต่อปี', brochure7.annualPremium, 297000);
  check('เบี้ยรวม 7 ปี', brochure7.totalPremium, 2079000);
  check('เงินคืนรวม 24 ปี', brochure7.totalCashback, 72000);
  check('เงินครบกำหนดสัญญา', brochure7.maturityBenefit, 2100000);
  check('ผลประโยชน์รับรองการจ่ายรวม', brochure7.totalGuaranteedBenefit, 2172000);
  check('NG 6% · ปีที่ 7 (โบรชัวร์)', b7idx6.ngAtSplitYear, 523492);
  check('NG 6% · ปีที่ 25 (โบรชัวร์)', b7idx6.ngAtMaturity, 3421930);
  check('IRR 6% (โบรชัวร์)', b7idx6.irrPercent, 5.71);

  /* ---------------------------------------------------------------- *
   * C. Brochure page 7 example — 25/15, SA 300,000, premium 297,000 x 15
   * ---------------------------------------------------------------- */
  section('C. ตัวอย่างโบรชัวร์หน้า 7 (25/15 · ทุน 300,000 · เบี้ย 297,000 x 15)');
  const brochure15 = buildQuote(withPremiumBasis(plan15, 990), scenarios, {
    gender: 'F', age: 40, sumAssured: 300000,
  });
  const b15idx6 = brochure15.scenarios.find((item) => item.scenarioCode === 'IDX6');

  check('เบี้ยประกันภัยต่อปี', brochure15.annualPremium, 297000);
  check('เบี้ยรวม 15 ปี', brochure15.totalPremium, 4455000);
  check('เงินครบกำหนดสัญญา (1,480%)', brochure15.maturityBenefit, 4440000);
  check('ผลประโยชน์รับรองการจ่ายรวม', brochure15.totalGuaranteedBenefit, 4512000);
  check('NG 6% · ปีที่ 15 (โบรชัวร์)', b15idx6.ngAtSplitYear, 3110927);
  check('NG 6% · ปีที่ 25 (โบรชัวร์)', b15idx6.ngAtMaturity, 7332707);
  check('IRR 6% (โบรชัวร์)', b15idx6.irrPercent, 7.96);

  /* ---------------------------------------------------------------- *
   * D. เงื่อนไขเชิงตรรกะ (invariants) ที่ต้องเป็นจริงทุกกรณี
   * ---------------------------------------------------------------- */
  section('D. ตรวจเงื่อนไขเชิงตรรกะของสูตร');
  check('NG กรณีดัชนีติดลบ ต้องเป็น 0', computeNonGuaranteedBenefit(700000, 100, -5, 7), 0);
  check('NG กรณีดัชนีไม่เปลี่ยน ต้องเป็น 0', computeNonGuaranteedBenefit(700000, 100, 0, 25), 0);

  let payoutYearsOk = true;
  let cashValueMonotonic = true;
  let negativeNg = 0;
  for (const row of quote.rows) {
    const pays = row.policyYear === plan7.ngSplitYear || row.policyYear === plan7.coverageYears;
    const hasAmount = Object.values(row.nonGuaranteed).some((amount) => amount > 0);
    if (pays !== hasAmount) payoutYearsOk = false;
    if (Object.values(row.nonGuaranteed).some((amount) => amount < 0)) negativeNg += 1;
    const previous = quote.rows[row.policyYear - 2];
    if (previous && row.cashValue < previous.cashValue) cashValueMonotonic = false;
  }
  check('NG จ่ายเฉพาะปีที่ 7 และปีที่ 25 (1=ถูก)', payoutYearsOk ? 1 : 0, 1);
  check('ไม่มี NG ติดลบ (จำนวนปีที่ผิด)', negativeNg, 0);
  check('เงินค่าเวนคืนไม่ลดลงตลอดสัญญา (1=ถูก)', cashValueMonotonic ? 1 : 0, 1);

  const premiumEqualsSumAssured = quote.rows.slice(0, 7).every((row) => row.annualPremium === 100000);
  check('เบี้ย = 100% ของทุน (1,000 ต่อ 1,000) (1=ถูก)', premiumEqualsSumAssured ? 1 : 0, 1);

  const quote15 = buildQuote(plan15, scenarios, { gender: 'F', age: 40, sumAssured: 100000 });
  check('25/15 ครบสัญญา = 1,480% ของทุน', quote15.maturityBenefit, 1480000);
  check('25/15 เบี้ยรวม = 15 ปี', quote15.totalPremium, 1500000);
  const q15PayoutYears = quote15.rows
    .filter((row) => row.nonGuaranteed.IDX6 > 0)
    .map((row) => row.policyYear);
  check('25/15 จำนวนปีที่จ่าย NG', q15PayoutYears.length, 2);
  check('25/15 ปีแรกที่จ่าย NG', q15PayoutYears[0], 15);

  await pool.end();
  console.log(`\nสรุป: PASS ${passed} · FAIL ${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(`\nตรวจสอบไม่สำเร็จ: ${error.message}`);
  try {
    await pool.end();
  } catch (closeError) {
    /* ignore */
  }
  process.exit(1);
});
