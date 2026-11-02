import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Calculator, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { exportElementToPdf, exportElementToPng } from '../services/pdfExportService';
import { IndexLinkedResultTable } from './IndexLinkedResultTable';
import type {
  IndexLinkedPlan,
  IndexLinkedPlansResponse,
  IndexLinkedQuote,
  RateGender,
} from '../types';

const QUICK_SUM_OPTIONS = [20000, 100000, 300000, 500000, 1000000];

function effectiveMinimumSumAssured(plan: IndexLinkedPlan | null, age: number): number {
  if (!plan) return 20000;
  const hasSeniorRule = plan.seniorAgeThreshold !== null && plan.seniorMinSumAssured !== null;
  if (hasSeniorRule && age >= (plan.seniorAgeThreshold as number)) {
    return plan.seniorMinSumAssured as number;
  }
  return plan.minSumAssured;
}

/**
 * Calculator for the index linked savings plans (25/7 and 25/15).
 * The user picks a plan, gender, age and sum assured, then the backend returns
 * the 25-year projection table which is rendered as a single page document.
 */
export const IndexLinkedCalculator: React.FC = () => {
  const [plansData, setPlansData] = useState<IndexLinkedPlansResponse | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  const [selectedPlanCode, setSelectedPlanCode] = useState<string>('');
  const [gender, setGender] = useState<RateGender>('F');
  const [age, setAge] = useState<number>(30);
  const [sumAssured, setSumAssured] = useState<number>(100000);

  const [quote, setQuote] = useState<IndexLinkedQuote | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const plans = plansData?.plans ?? [];
  const currentPlan = useMemo(
    () => plans.find((plan) => plan.planCode === selectedPlanCode) ?? plans[0] ?? null,
    [plans, selectedPlanCode],
  );
  const minimumSumAssured = effectiveMinimumSumAssured(currentPlan, age);

  const loadPlans = async (): Promise<void> => {
    setIsLoadingPlans(true);
    setPlansError(null);
    try {
      const data = await apiClient.getIndexLinkedPlans();
      setPlansData(data);
      setSelectedPlanCode((current) => current || data.plans[0]?.planCode || '');
    } catch (error) {
      setPlansData(null);
      setPlansError(
        error instanceof Error ? error.message : 'ไม่สามารถโหลดแผนจากฐานข้อมูล MySQL ได้',
      );
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const calculate = async (
    planCode: string,
    inputAge: number,
    inputSumAssured: number,
  ): Promise<void> => {
    setCalcError(null);

    const plan = plans.find((item) => item.planCode === planCode);
    if (!plan) {
      setCalcError('กรุณาเลือกแบบประกันก่อนคำนวณ');
      return;
    }
    if (!Number.isInteger(inputAge) || inputAge < plan.minAge || inputAge > plan.maxAge) {
      setCalcError(`แผนนี้รับประกันภัยสำหรับผู้มีอายุระหว่าง ${plan.minAge} - ${plan.maxAge} ปี`);
      return;
    }
    const minSum = effectiveMinimumSumAssured(plan, inputAge);
    if (!Number.isInteger(inputSumAssured) || inputSumAssured < minSum) {
      setCalcError(`ทุนประกันภัยขั้นต่ำของแผนนี้คือ ${minSum.toLocaleString('th-TH')} บาท`);
      return;
    }

    setIsCalculating(true);
    try {
      const result = await apiClient.calculateIndexLinkedQuote({
        planCode,
        gender,
        age: inputAge,
        sumAssured: inputSumAssured,
      });
      setQuote(result);
    } catch (error) {
      setQuote(null);
      setCalcError(
        error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการคำนวณตารางผลประโยชน์',
      );
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    void loadPlans();
  }, []);

  // First automatic calculation once the plans are available.
  useEffect(() => {
    if (!currentPlan || quote) return;
    void calculate(currentPlan.planCode, age, sumAssured);
  }, [currentPlan]);

  // Keep the age inside the limits of the selected plan.
  useEffect(() => {
    if (!currentPlan) return;
    if (age > currentPlan.maxAge) setAge(currentPlan.maxAge);
    if (age < currentPlan.minAge) setAge(currentPlan.minAge);
  }, [currentPlan]);

  const handlePlanChange = (plan: IndexLinkedPlan): void => {
    setSelectedPlanCode(plan.planCode);
    setQuote(null);
    void calculate(plan.planCode, Math.min(age, plan.maxAge), sumAssured);
  };

  const handleExport = async (type: 'pdf' | 'png'): Promise<void> => {
    if (!quote) return;
    const filename = `ตารางผลประโยชน์_${quote.plan.shortLabel.replace('/', '-')}_อายุ${quote.age}_ทุน${quote.sumAssured}`;
    try {
      setExportStatus(type === 'pdf' ? 'กำลังจัดเตรียมไฟล์ PDF...' : 'กำลังสร้างภาพ PNG...');
      if (type === 'pdf') await exportElementToPdf('printable-index-linked-document', filename);
      else await exportElementToPng('printable-index-linked-document', filename);
      setExportStatus(type === 'pdf' ? 'ดาวน์โหลด PDF สำเร็จแล้ว!' : 'บันทึกภาพ PNG สำเร็จแล้ว!');
      setTimeout(() => setExportStatus(null), 3500);
    } catch (error) {
      setExportStatus(
        `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ'}`,
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Form card */}
      <div className="bg-white rounded-3xl border border-orange-100 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 via-white to-amber-50/50 px-5 py-4 sm:px-6 border-b border-orange-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-brand-800 text-[11px] font-semibold mb-1.5">
                <Calculator className="w-3 h-3 text-brand-600" />
                <span>ประกันสะสมทรัพย์อ้างอิงดัชนี (Index Linked)</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                คำนวณตารางผลประโยชน์ 25 ปี
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                เลือกแบบ 25/7 หรือ 25/15 แล้วระบบจะคำนวณตารางผลประโยชน์รายปี พร้อมผลประโยชน์ที่ไม่รับรองการจ่าย
                ตามสมมุติฐานดัชนีอ้างอิง 2%, 4%, 6% และ 8% ต่อปี
              </p>
            </div>
            <div className="text-[11px] text-gray-500 bg-white px-3 py-1.5 rounded-xl border border-orange-200/60 shadow-sm flex items-center gap-2 whitespace-nowrap">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  plansError ? 'bg-red-500' : isLoadingPlans ? 'bg-amber-500 animate-pulse' : 'bg-green-500'
                }`}
              />
              <span>
                {plansError
                  ? 'เชื่อมต่อฐานข้อมูล MySQL ไม่สำเร็จ'
                  : isLoadingPlans
                    ? 'กำลังโหลดตารางแผนจาก MySQL...'
                    : 'เชื่อมต่อฐานข้อมูล MySQL แล้ว'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6 sm:py-6 space-y-5">
          {plansError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">ไม่สามารถโหลดตารางแผนได้: {plansError}</span>
              <button
                type="button"
                onClick={() => void loadPlans()}
                disabled={isLoadingPlans}
                className="px-3 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-60"
              >
                ลองโหลดอีกครั้ง
              </button>
            </div>
          )}

          {/* Step 1: plan selection */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              1. เลือกแบบประกัน
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plans.map((plan) => {
                const isSelected = plan.planCode === currentPlan?.planCode;
                return (
                  <button
                    key={plan.planCode}
                    type="button"
                    onClick={() => handlePlanChange(plan)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-orange-50/60 ring-2 ring-brand-500/20'
                        : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900 text-sm">
                        {plan.shortLabel} • ชำระเบี้ย {plan.paymentYears} ปี
                      </span>
                      {isSelected && <span className="text-[10px] font-bold text-brand-600">เลือกแล้ว</span>}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{plan.planName}</p>
                    <div className="mt-2 text-[11px] font-semibold text-brand-700 space-y-0.5">
                      <p>คุ้มครอง {plan.coverageYears} ปี • เงินครบสัญญา {plan.maturityPercent}% ของทุน</p>
                      <p>
                        เบี้ย {plan.premiumPerThousand.toLocaleString('th-TH')} บาท ต่อทุน 1,000 บาท/ปี
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: gender, age and sum assured */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                2. เพศผู้ขอเอาประกันภัย
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setGender('M'); setQuote(null); }}
                  className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all ${
                    gender === 'M'
                      ? 'border-brand-500 bg-orange-50 text-brand-600 ring-2 ring-brand-500/20'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  👨 เพศชาย
                </button>
                <button
                  type="button"
                  onClick={() => { setGender('F'); setQuote(null); }}
                  className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all ${
                    gender === 'F'
                      ? 'border-brand-500 bg-orange-50 text-brand-600 ring-2 ring-brand-500/20'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  👩 เพศหญิง
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  3. อายุผู้ขอเอาประกัน (ปี)
                </label>
                <span className="text-sm font-extrabold text-brand-600">{age} ปี</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={currentPlan?.minAge ?? 1}
                  max={currentPlan?.maxAge ?? 75}
                  value={age}
                  onChange={(event) => { setAge(Number(event.target.value)); setQuote(null); }}
                  className="w-full h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <input
                  type="number"
                  min={currentPlan?.minAge ?? 1}
                  max={currentPlan?.maxAge ?? 75}
                  value={age}
                  onChange={(event) => { setAge(Number(event.target.value)); setQuote(null); }}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-center font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Step 3: sum assured */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                4. ทุนประกันภัย (บาท)
              </label>
              <span className="text-sm font-extrabold text-gray-900">
                {sumAssured.toLocaleString('th-TH')} บาท
              </span>
            </div>
            <input
              type="number"
              step={1000}
              min={minimumSumAssured}
              max={100000000}
              value={sumAssured}
              onChange={(event) => { setSumAssured(Number(event.target.value)); setQuote(null); }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              placeholder={`ระบุทุนประกัน เช่น ${minimumSumAssured.toLocaleString('th-TH')}`}
            />
            <div className="flex flex-wrap gap-2 mt-2.5">
              <span className="text-xs text-gray-400 self-center mr-1">เลือกด่วน:</span>
              {QUICK_SUM_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setSumAssured(value); setQuote(null); }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                    sumAssured === value
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600'
                  }`}
                >
                  {value.toLocaleString('th-TH')}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-2">
              ทุนประกันภัยขั้นต่ำของแผนนี้ {minimumSumAssured.toLocaleString('th-TH')} บาท
              {currentPlan?.seniorAgeThreshold !== null && currentPlan?.seniorAgeThreshold !== undefined
                ? ` (อายุ ${currentPlan.seniorAgeThreshold} ปีขึ้นไป ขั้นต่ำ ${(currentPlan.seniorMinSumAssured ?? 0).toLocaleString('th-TH')} บาท)`
                : ''}
            </p>
          </div>

          {calcError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{calcError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => currentPlan && void calculate(currentPlan.planCode, age, sumAssured)}
            disabled={isCalculating || !currentPlan || Boolean(plansError)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-extrabold text-sm shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 disabled:opacity-60 transition-all"
          >
            {isCalculating ? 'กำลังคำนวณตารางผลประโยชน์...' : 'คำนวณตารางผลประโยชน์ 25 ปี'}
          </button>
        </div>
      </div>

      {/* Result section */}
      {quote && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-gray-600">
              <p className="font-bold text-gray-900">{quote.plan.planName}</p>
              <p>
                เบี้ยประกันภัยรายปี {quote.annualPremium.toLocaleString('th-TH')} บาท • รวมเบี้ยตลอดสัญญา{' '}
                {quote.totalPremium.toLocaleString('th-TH')} บาท • เงินครบกำหนดสัญญา{' '}
                {quote.maturityBenefit.toLocaleString('th-TH')} บาท
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleExport('pdf')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition-colors"
              >
                <FileText className="w-4 h-4" />
                ดาวน์โหลด PDF
              </button>
              <button
                type="button"
                onClick={() => void handleExport('png')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-brand-200 bg-white text-brand-700 text-xs font-bold hover:bg-orange-50 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                บันทึก PNG
              </button>
            </div>
          </div>

          <IndexLinkedResultTable quote={quote} />

          {exportStatus && (
            <p className="text-xs font-semibold text-brand-700 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              {exportStatus}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
