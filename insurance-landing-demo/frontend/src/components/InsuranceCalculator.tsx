import React, { useState, useEffect } from 'react';
import {
  Shield,
  Gift,
  HeartPulse,
  PiggyBank,
  Stethoscope,
  Target,
  Calculator,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  Gender,
  InsuranceCategory,
  AVAILABLE_PLANS,
  calculateQuote,
  QuoteCalculationResult,
  calculateFuturePlan,
  FuturePlanResult,
} from '../services/quoteCalculationService';
import { apiClient } from '../services/apiClient';
import type { InsuranceRates } from '../types';

import { QuoteResultCard } from './QuoteResultCard';

interface InsuranceCalculatorProps {
  onQuoteCalculated?: (quote: QuoteCalculationResult) => void;
  onContactRequest?: (quote: QuoteCalculationResult) => void;
  initialPlanId?: string;
}

export const InsuranceCalculator: React.FC<InsuranceCalculatorProps> = ({
  onQuoteCalculated,
  onContactRequest,
  initialPlanId,
}) => {
  // Category & Plan Selection
  const [category, setCategory] = useState<InsuranceCategory>('life');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId || 'life10');

  // Insured Person Form
  const [gender, setGender] = useState<Gender>('F');
  const [age, setAge] = useState<number>(30);
  const [lifeCover, setLifeCover] = useState<number>(500000);
  const [enableCI50, setEnableCI50] = useState<boolean>(true);
  const [ciCover, setCiCover] = useState<number>(1500000);

  // Future Planner Form
  const [fpIncome, setFpIncome] = useState<number>(45000);
  const [fpExpenses, setFpExpenses] = useState<number>(20000);
  const [fpDebt, setFpDebt] = useState<number>(8000);
  const [fpBudget, setFpBudget] = useState<number>(5000);
  const [fpResult, setFpResult] = useState<FuturePlanResult | null>(null);

  // Quote Result State
  const [quoteResult, setQuoteResult] = useState<QuoteCalculationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [insuranceRates, setInsuranceRates] = useState<InsuranceRates | null>(null);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [isRatesLoading, setIsRatesLoading] = useState<boolean>(true);

  // Filter plans by selected category
  const categoryPlans = AVAILABLE_PLANS.filter((p) => p.category === category);

  // When category changes, select the first plan of that category
  useEffect(() => {
    if (category !== 'future') {
      const firstPlan = AVAILABLE_PLANS.find((p) => p.category === category);
      if (firstPlan) {
        setSelectedPlanId(firstPlan.id);
      }
    }
  }, [category]);

  const currentPlan = AVAILABLE_PLANS.find((p) => p.id === selectedPlanId) || categoryPlans[0];

  const loadInsuranceRates = async (): Promise<void> => {
    setIsRatesLoading(true);
    setRatesError(null);
    try {
      const rates = await apiClient.getInsuranceRates();
      setInsuranceRates(rates);
    } catch (error) {
      setInsuranceRates(null);
      setRatesError(error instanceof Error
        ? error.message
        : 'ไม่สามารถโหลดอัตราเบี้ยจากฐานข้อมูล MySQL ได้');
    } finally {
      setIsRatesLoading(false);
    }
  };

  // Perform Calculation
  const handleCalculate = () => {
    setValidationError(null);

    if (category === 'future') {
      if (fpIncome <= 0) {
        setValidationError('กรุณาระบุรายได้ต่อเดือนเป็นจำนวนที่มากกว่า 0');
        return;
      }
      const res = calculateFuturePlan({
        income: fpIncome,
        expenses: fpExpenses,
        debt: fpDebt,
        budget: fpBudget,
      });
      setFpResult(res);
      return;
    }

    // Validation rules matching Thai insurance and GAS app
    if (!Number.isInteger(age) || age < 1 || age > 70) {
      setValidationError('กรุณาระบุอายุเป็นจำนวนเต็ม ระหว่าง 1 - 70 ปี');
      return;
    }

    if (currentPlan) {
      if (age < currentPlan.minAge || age > currentPlan.maxAge) {
        setValidationError(`แผน ${currentPlan.name} รับประกันภัยสำหรับผู้มีอายุระหว่าง ${currentPlan.minAge} - ${currentPlan.maxAge} ปี`);
        return;
      }
    }

    if (age < 6 && lifeCover < 300000) {
      setValidationError('ผู้ขอเอาประกันอายุต่ำกว่า 6 ปี ต้องมีทุนประกันชีวิตหลักขั้นต่ำ 300,000 บาท');
      return;
    }

    if (age >= 6 && lifeCover < 200000 && category !== 'cashback') {
      setValidationError('ทุนประกันชีวิตหลักขั้นต่ำ 200,000 บาท');
      return;
    }

    if (enableCI50) {
      if (age < 16 || age > 65) {
        setValidationError('สัญญาเพิ่มเติมโรคร้ายแรง CI50 รับประกันภัยเฉพาะช่วงอายุ 16 - 65 ปี');
        return;
      }
      if (ciCover < 100000) {
        setValidationError('ทุนประกันโรคร้ายแรง CI50 ขั้นต่ำ 100,000 บาท');
        return;
      }
    }

    if (!insuranceRates) {
      setValidationError('ยังไม่สามารถคำนวณได้ กรุณาโหลดอัตราเบี้ยจาก MySQL ให้สำเร็จก่อน');
      return;
    }

    const ratesData = insuranceRates;
    setIsCalculating(true);
    setTimeout(() => {
      try {
        const res = calculateQuote({
          gender,
          age,
          planId: selectedPlanId,
          lifeCover,
          enableCI50,
          ciCover,
        }, ratesData);
        setQuoteResult(res);
        if (onQuoteCalculated) {
          onQuoteCalculated(res);
        }

        // Smooth scroll to result
        const resultElem = document.getElementById('quote-result-section');
        if (resultElem) {
          resultElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (error) {
        setQuoteResult(null);
        setValidationError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการคำนวณเบี้ย');
      } finally {
        setIsCalculating(false);
      }
    }, 250);
  };

  // Load the current rate tables from MySQL when the calculator mounts.
  useEffect(() => {
    void loadInsuranceRates();
  }, []);

  // Calculate the initial quote only after the database rates are available.
  useEffect(() => {
    if (!insuranceRates || quoteResult) return;

    try {
      const res = calculateQuote({
        gender: 'F',
        age: 30,
        planId: initialPlanId || 'life10',
        lifeCover: 500000,
        enableCI50: true,
        ciCover: 1500000,
      }, insuranceRates);
      setQuoteResult(res);
      if (onQuoteCalculated) onQuoteCalculated(res);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการคำนวณเบี้ย');
    }
  }, [insuranceRates]);

  const quickSumOptions = [
    { label: '300,000', value: 300000 },
    { label: '500,000', value: 500000 },
    { label: '1,000,000', value: 1000000 },
    { label: '2,000,000', value: 2000000 },
    { label: '5,000,000', value: 5000000 },
  ];

  return (
    <div id="calculator" className="max-w-6xl mx-auto space-y-8">
      {/* Main Calculator Card */}
      <div className="bg-white rounded-3xl border border-orange-100/80 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-50 via-white to-amber-50/50 p-6 sm:p-8 border-b border-orange-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-brand-800 text-xs font-semibold mb-2">
                <Calculator className="w-3.5 h-3.5 text-brand-600" />
                <span>ระบบคำนวณเบี้ยประกันและความคุ้มครอง (คำนวณออนไลน์)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                คำนวณเบี้ยประกันภัยรายบุคคล
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                เลือกแผนประกันและกรอกข้อมูลเพื่อเปรียบเทียบเบี้ยรายงวด และตรวจสอบผลประโยชน์สะสม
              </p>
            </div>
            <div className="text-xs text-gray-500 bg-white px-4 py-2 rounded-xl border border-orange-200/60 shadow-sm flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${ratesError ? 'bg-red-500' : isRatesLoading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
              <span>
                {ratesError
                  ? 'เชื่อมต่อฐานข้อมูล MySQL ไม่สำเร็จ'
                  : isRatesLoading
                    ? 'กำลังโหลดอัตราเบี้ยจาก MySQL...'
                    : 'เชื่อมต่อฐานข้อมูล MySQL แล้ว'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-3">
            แผนตลอดชีพและ CI50 ใช้อัตราเบี้ยจากฐานข้อมูล MySQL/XAMPP ส่วนแผนอื่นใช้สูตรจำลอง
          </p>
          {ratesError && category !== 'future' && (
            <div role="alert" className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col sm:flex-row sm:items-center gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">ไม่สามารถโหลดอัตราเบี้ยได้: {ratesError}</span>
              <button
                type="button"
                onClick={() => void loadInsuranceRates()}
                disabled={isRatesLoading}
                className="px-3 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-60"
              >
                ลองโหลดอีกครั้ง
              </button>
            </div>
          )}
        </div>

        {/* Category Menu Selector */}
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/40">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
            1. เลือกหมวดหมู่ความคุ้มครอง
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <button
              type="button"
              onClick={() => setCategory('life')}
              className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col items-start gap-1.5 ${
                category === 'life'
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
              }`}
            >
              <Shield className={`w-5 h-5 ${category === 'life' ? 'text-white' : 'text-brand-500'}`} />
              <span>ประกันชีวิตมรดก</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('cashback')}
              className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col items-start gap-1.5 ${
                category === 'cashback'
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
              }`}
            >
              <Gift className={`w-5 h-5 ${category === 'cashback' ? 'text-white' : 'text-amber-500'}`} />
              <span>ประกันมีเงินคืน 1%</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('ciFixed')}
              className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col items-start gap-1.5 ${
                category === 'ciFixed'
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
              }`}
            >
              <HeartPulse className={`w-5 h-5 ${category === 'ciFixed' ? 'text-white' : 'text-red-500'}`} />
              <span>คุ้มครองโรคร้ายแรง</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('saving')}
              className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col items-start gap-1.5 ${
                category === 'saving'
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
              }`}
            >
              <PiggyBank className={`w-5 h-5 ${category === 'saving' ? 'text-white' : 'text-emerald-500'}`} />
              <span>ประกันสะสมทรัพย์</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('health')}
              className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col items-start gap-1.5 ${
                category === 'health'
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
              }`}
            >
              <Stethoscope className={`w-5 h-5 ${category === 'health' ? 'text-white' : 'text-cyan-500'}`} />
              <span>สุขภาพเหมาจ่าย</span>
            </button>

            <button
              type="button"
              onClick={() => setCategory('future')}
              className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col items-start gap-1.5 ${
                category === 'future'
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
              }`}
            >
              <Target className={`w-5 h-5 ${category === 'future' ? 'text-white' : 'text-purple-500'}`} />
              <span>วางแผนเพื่ออนาคต</span>
            </button>
          </div>
        </div>

        {/* Standard Calculator Form */}
        {category !== 'future' ? (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Step 2: Plan Dropdown or Option Cards */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                2. เลือกแบบประกันในหมวดนี้
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {categoryPlans.map((p) => {
                  const isSelected = p.id === selectedPlanId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-orange-50/60 ring-2 ring-brand-500/20'
                          : 'border-gray-200 bg-white hover:border-orange-200 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900 text-sm">{p.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{p.description}</p>
                      <div className="mt-2.5 text-[11px] font-semibold text-brand-700">
                        ชำระ {p.paymentYears === 90 ? 'ถึงอายุ 90' : `${p.paymentYears} ปี`} • คุ้มครองถึงอายุ {p.coverageYears} ปี
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Gender and Age */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              {/* Gender */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  3. เพศผู้ขอเอาประกันภัย
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('M')}
                    className={`py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      gender === 'M'
                        ? 'border-brand-500 bg-orange-50 text-brand-600 ring-2 ring-brand-500/20'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>👨 เพศชาย</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('F')}
                    className={`py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      gender === 'F'
                        ? 'border-brand-500 bg-orange-50 text-brand-600 ring-2 ring-brand-500/20'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>👩 เพศหญิง</span>
                  </button>
                </div>
              </div>

              {/* Age */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    4. อายุผู้ขอเอาประกัน (ปี)
                  </label>
                  <span className="text-sm font-extrabold text-brand-600">{age} ปี</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={currentPlan?.minAge || 1}
                    max={currentPlan?.maxAge || 70}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <input
                    type="number"
                    min={1}
                    max={70}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-center font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Sum Assured (ทุนประกันชีวิต) */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  5. ทุนประกันชีวิตหลัก (บาท)
                </label>
                <span className="text-sm font-extrabold text-gray-900">{lifeCover.toLocaleString('th-TH')} บาท</span>
              </div>
              <input
                type="number"
                step={50000}
                min={100000}
                max={20000000}
                value={lifeCover}
                onChange={(e) => setLifeCover(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                placeholder="ระบุทุนประกัน เช่น 500,000"
              />
              {/* Quick Sum Chips */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                <span className="text-xs text-gray-400 self-center mr-1">เลือกด่วน:</span>
                {quickSumOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLifeCover(opt.value)}
                    className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                      lifeCover === opt.value
                        ? 'bg-brand-500 text-white border-brand-500 font-bold'
                        : 'bg-gray-50 hover:bg-orange-50 text-gray-700 border-gray-200 font-medium'
                    }`}
                  >
                    {opt.label} บ.
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Rider CI50 */}
            <div className="pt-4 border-t border-gray-100 bg-orange-50/40 -mx-6 -mb-6 p-6 sm:-mx-8 sm:-mb-8 sm:p-8 rounded-b-3xl">
              <div className="flex items-start justify-between gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableCI50}
                    onChange={(e) => setEnableCI50(e.target.checked)}
                    className="w-5 h-5 rounded text-brand-500 focus:ring-brand-400 border-gray-300"
                  />
                  <div>
                    <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <span>เพิ่มสัญญาเพิ่มเติมคุ้มครอง 50 โรคร้ายแรง (CI50)</span>
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        แนะนำ
                      </span>
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ครอบคลุมโรคมะเร็ง หัวใจ ไตวาย อัมพฤกษ์ และอีกกว่า 50 โรคสำคัญ
                    </p>
                  </div>
                </label>
              </div>

              {enableCI50 && (
                <div className="mt-4 pl-8 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">ทุนประกันโรคร้ายแรง CI50:</span>
                    <span className="font-bold text-red-600">{ciCover.toLocaleString('th-TH')} บาท</span>
                  </div>
                  <input
                    type="number"
                    step={100000}
                    min={100000}
                    max={5000000}
                    value={ciCover}
                    onChange={(e) => setCiCover(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-red-200 text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                  />
                  <div className="flex gap-2">
                    {[500000, 1000000, 1500000, 2000000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setCiCover(v)}
                        className={`text-[11px] px-2.5 py-1 rounded-md border ${
                          ciCover === v
                            ? 'bg-red-500 text-white border-red-500 font-bold'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                      >
                        {(v / 1000000).toFixed(1)}M
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Error Banner */}
              {validationError && (
                <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Calculate Button */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleCalculate}
                  disabled={isCalculating || isRatesLoading || !insuranceRates}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-extrabold text-base shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Calculator className="w-5 h-5" />
                  <span>
                    {isRatesLoading
                      ? 'กำลังโหลดอัตราเบี้ยจาก MySQL...'
                      : isCalculating
                        ? 'กำลังคำนวณเบี้ย...'
                        : 'คำนวณเบี้ยประกันและผลประโยชน์'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Future Planner Form */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="text-center space-y-1 mb-6">
                <h3 className="text-xl font-bold text-gray-900">วางแผนสุขภาพทางการเงินเพื่ออนาคต</h3>
                <p className="text-xs text-gray-500">
                  วิเคราะห์รายรับ รายจ่าย เงินสำรองฉุกเฉิน และสัดส่วนงบออมที่เหมาะสมกับเป้าหมายของคุณ
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">รายได้ต่อเดือน (บาท)</label>
                  <input
                    type="number"
                    min={0}
                    value={fpIncome}
                    onChange={(e) => setFpIncome(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-bold"
                    placeholder="เช่น 45000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">ค่าใช้จ่ายต่อเดือน (บาท)</label>
                  <input
                    type="number"
                    min={0}
                    value={fpExpenses}
                    onChange={(e) => setFpExpenses(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-bold"
                    placeholder="เช่น 20000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">ภาระผ่อนหนี้ต่อเดือน (บาท)</label>
                  <input
                    type="number"
                    min={0}
                    value={fpDebt}
                    onChange={(e) => setFpDebt(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-bold"
                    placeholder="เช่น 8000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">งบที่ต้องการออมต่อเดือน (บาท)</label>
                  <input
                    type="number"
                    min={0}
                    value={fpBudget}
                    onChange={(e) => setFpBudget(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-brand-600"
                    placeholder="เช่น 5000"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCalculate}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Target className="w-4 h-4" />
                <span>วิเคราะห์สุขภาพทางการเงิน</span>
              </button>

              {/* Future Planner Results */}
              {fpResult && (
                <div className="mt-6 p-6 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4 animate-fadeIn">
                  <h4 className="font-bold text-purple-900 text-sm">ผลการวิเคราะห์แผนการเงินเบื้องต้น:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                    <div className="p-3 bg-white rounded-xl border border-purple-100">
                      <span className="text-gray-500 block">เงินคงเหลือ/เดือน</span>
                      <span className="font-extrabold text-gray-900 text-sm mt-0.5 block">
                        {fpResult.remaining.toLocaleString('th-TH')} บ.
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-purple-100">
                      <span className="text-gray-500 block">สัดส่วนเงินออม</span>
                      <span className="font-extrabold text-purple-700 text-sm mt-0.5 block">
                        {fpResult.savingPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-purple-100">
                      <span className="text-gray-500 block">สำรองฉุกเฉิน 3 เดือน</span>
                      <span className="font-extrabold text-gray-900 text-sm mt-0.5 block">
                        {fpResult.emergencyFund3.toLocaleString('th-TH')} บ.
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-purple-100">
                      <span className="text-gray-500 block">สำรองฉุกเฉิน 6 เดือน</span>
                      <span className="font-extrabold text-gray-900 text-sm mt-0.5 block">
                        {fpResult.emergencyFund6.toLocaleString('th-TH')} บ.
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-purple-100 text-xs text-purple-950 font-medium">
                    💡 <strong>คำแนะนำจากที่ปรึกษา:</strong> {fpResult.advice}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quote Calculation Result Display Section */}
      {category !== 'future' && quoteResult && (
        <div id="quote-result-section">
          <QuoteResultCard
            quote={quoteResult}
            onContactClick={(q) => {
              if (onContactRequest) {
                onContactRequest(q);
              } else {
                const formElem = document.getElementById('lead-form');
                if (formElem) {
                  formElem.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
};
