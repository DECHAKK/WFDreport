import React from 'react';
import { Plan } from '../types';
import { Check, AlertCircle, RefreshCw, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';

interface PlansSectionProps {
  plans: Plan[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectPlan: (plan: Plan) => void;
}

export const PlansSection: React.FC<PlansSectionProps> = ({
  plans,
  loading,
  error,
  onRetry,
  onSelectPlan,
}) => {
  return (
    <section id="plans" className="py-20 bg-gradient-to-b from-white via-orange-50/40 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-brand-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>แผนความคุ้มครองตัวอย่าง (แผนสมมติเพื่อการสาธิต)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            สำรวจตัวอย่างแผนประกันภัยที่ตอบโจทย์คุณ
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            เลือกดูตัวอย่างความคุ้มครองจำลองด้านล่าง ข้อมูลทั้งหมดเป็นตัวอย่างประกอบการเรียนรู้และพัฒนา 
            ไม่มีการผูกมัดหรือเรียกเก็บค่าธรรมเนียมจริง
          </p>
        </div>

        {/* Prominent Demo Notice Box */}
        <div className="max-w-4xl mx-auto mb-12 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">ข้อความชี้แจงข้อมูลตัวอย่าง:</p>
            <p className="text-amber-800 leading-relaxed font-normal">
              อัตราเบี้ยประกันภัย วงเงินความคุ้มครอง และเงื่อนไขที่ปรากฏด้านล่างนี้ เป็นข้อมูลสมมติที่สร้างขึ้นเพื่อทดสอบส่วนต่อประสานผู้ใช้งาน (UI/UX) และระบบจัดการข้อมูลผู้สนใจ (Lead Management) เท่านั้น มิใช่การเสนอขายผลิตภัณฑ์ประกันภัยจริงของบริษัทประกันภัยใดๆ
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-pulse space-y-5">
                <div className="h-6 bg-gray-200 rounded-md w-3/4" />
                <div className="h-4 bg-gray-100 rounded-md w-full" />
                <div className="h-10 bg-orange-100 rounded-xl w-1/2" />
                <div className="space-y-3 pt-4">
                  <div className="h-3 bg-gray-100 rounded-md w-full" />
                  <div className="h-3 bg-gray-100 rounded-md w-5/6" />
                  <div className="h-3 bg-gray-100 rounded-md w-4/6" />
                </div>
                <div className="h-12 bg-gray-200 rounded-xl w-full pt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 border border-red-100 shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">ไม่สามารถโหลดข้อมูลแผนประกันได้</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{error}</p>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ลองใหม่อีกครั้ง</span>
            </button>
          </div>
        )}

        {/* Plans Display Grid */}
        {!loading && !error && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, index) => {
              const isPopular = index === 0; // Highlight the first plan as sample popular
              const summaryItems: string[] = Array.isArray(plan.coverageSummary)
                ? plan.coverageSummary
                : typeof plan.coverageSummary === 'string'
                ? [plan.coverageSummary]
                : [];

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 card-hover-effect ${
                    isPopular
                      ? 'bg-white border-2 border-brand-500 shadow-xl shadow-brand-500/10'
                      : 'bg-white border border-gray-200 hover:border-brand-300 shadow-sm'
                  }`}
                >
                  {/* Popular Tag */}
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-500 to-brand-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                      แนะนำสำหรับเริ่มต้น (แผนตัวอย่าง)
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                        ตัวอย่างแผน #{plan.id}
                      </span>
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">
                        ข้อมูลตัวอย่าง
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug">
                      {plan.planName}
                    </h3>

                    <p className="text-sm text-gray-600 mb-6 leading-relaxed min-h-[42px]">
                      {plan.description}
                    </p>

                    {/* Demo Premium Display */}
                    <div className="bg-orange-50/70 rounded-2xl p-4 border border-orange-100/70 mb-6">
                      <span className="text-[11px] text-gray-500 block uppercase font-medium">
                        อัตราเบี้ยจำลอง (ตัวเลขสมมติ)
                      </span>
                      <div className="text-2xl font-extrabold text-brand-700 mt-1">
                        {plan.demoPremium}
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        * ไม่มีการเก็บเงินจริง ข้อมูลเพื่อการจำลองระบบ
                      </span>
                    </div>

                    {/* Coverage Points */}
                    <div className="space-y-3 mb-8">
                      <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        สรุปความคุ้มครองตัวอย่าง:
                      </p>
                      <ul className="space-y-2.5">
                        {summaryItems.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                            <div className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      isPopular
                        ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 active:scale-98'
                        : 'bg-orange-50 hover:bg-brand-500 text-brand-700 hover:text-white border border-brand-200 hover:border-transparent active:scale-98'
                    }`}
                  >
                    <span>เลือกแผนนี้เพื่อขอคำปรึกษา</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
