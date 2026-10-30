import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { InsuranceCalculator } from '../components/InsuranceCalculator';
import { LeadForm } from '../components/LeadForm';
import { QuoteCalculationResult } from '../services/quoteCalculationService';
import { ShieldCheck, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { Plan } from '../types';

export const CalculatorPage: React.FC = () => {
  const [selectedQuote, setSelectedQuote] = useState<QuoteCalculationResult | null>(null);

  // Convert calculated quote to Plan interface for LeadForm compatibility
  const selectedPlanForLead: Plan | null = selectedQuote
    ? {
        id: 99,
        planName: selectedQuote.plan.name,
        description: `เบี้ยรายปี ${selectedQuote.annual.toLocaleString('th-TH')} บาท • ทุน ${selectedQuote.lifeCover.toLocaleString('th-TH')} บาท`,
        demoPremium: `${selectedQuote.annual.toLocaleString('th-TH')} บาท/ปี`,
        coverageSummary: [
          `ทุนประกันชีวิต: ${selectedQuote.lifeCover.toLocaleString('th-TH')} บาท`,
          selectedQuote.ciCover > 0 ? `ทุนคุ้มครอง CI50: ${selectedQuote.ciCover.toLocaleString('th-TH')} บาท` : '',
          `ชำระ ${selectedQuote.paymentYears} ปี คุ้มครองถึงอายุ ${selectedQuote.coverageYears} ปี`,
        ].filter(Boolean),
        isDemo: true,
        isActive: true,
      }
    : null;

  const handleContactRequest = (quote: QuoteCalculationResult) => {
    setSelectedQuote(quote);
    const formElem = document.getElementById('lead-form');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Navbar onConsultClick={() => {
        const el = document.getElementById('lead-form');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }} />

      <main className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Page Hero */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-brand-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>ระบบคำนวณเบี้ยประกันภัย & สรุปผลประโยชน์ (เครื่องมือเสนอราคา)</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              คำนวณเบี้ยประกันและเปรียบเทียบแผน
            </h1>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              ระบุเพศ อายุ และทุนประกันที่ต้องการ เพื่อคำนวณเบี้ยประกันชีวิตมรดก สัญญาเงินคืน 1% 
              ความคุ้มครองโรคร้ายแรง และส่งออกใบเสนอราคาเป็นไฟล์ PDF ได้ทันที
            </p>
          </div>

          {/* Calculator Component */}
          <InsuranceCalculator
            onContactRequest={handleContactRequest}
            onQuoteCalculated={(q) => setSelectedQuote(q)}
          />

          {/* Why Plan Ahead Section */}
          <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-brand-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">เบี้ยคงที่ตลอดสัญญา</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  สำหรับประกันชีวิตมรดกและประกันเงินคืน เบี้ยประกันภัยคงที่ตลอดอายุสัญญา ไม่ปรับเพิ่มตามอายุ
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">สิทธิลดหย่อนภาษี</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  เบี้ยประกันชีวิตสามารถนำไปลดหย่อนภาษีเงินได้บุคคลธรรมดาสูงสุด 100,000 บาท/ปี ตามเกณฑ์สรรพากร
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">ดาวน์โหลด PDF สะดวก</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  บันทึกใบเสนอราคาในรูปแบบ PDF หรือรูปภาพ เพื่อนำไปปรึกษาครอบครัวหรือตัวแทนประกันได้ทันที
                </p>
              </div>
            </div>
          </div>

          {/* Lead Consultation Form */}
          <div className="pt-8">
            <LeadForm
              selectedPlan={selectedPlanForLead}
              onClearSelectedPlan={() => setSelectedQuote(null)}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
