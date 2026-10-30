import React, { useState } from 'react';
import {
  Image,
  Copy,
  Check,
  Shield,
  HeartPulse,
  TrendingUp,
  CreditCard,
  User,
  PhoneCall,
  Download,
  Sparkles,
} from 'lucide-react';
import {
  QuoteCalculationResult,
  AGENT_CONTACT_INFO,
  CREDIT_CARD_PROMOTIONS,
} from '../services/quoteCalculationService';

import {
  exportQuoteToPdf,
  exportQuoteToPng,
  copyQuoteTextToClipboard,
} from '../services/pdfExportService';

interface QuoteResultCardProps {
  quote: QuoteCalculationResult;
  onContactClick?: (quote: QuoteCalculationResult) => void;
}

export const QuoteResultCard: React.FC<QuoteResultCardProps> = ({
  quote,
  onContactClick,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'cashvalue' | 'advisory'>('summary');
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingPng, setExportingPng] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const formatMoney = (amount: number) => amount.toLocaleString('th-TH');

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      setExportStatus('กำลังจัดเตรียมไฟล์ PDF...');
      await exportQuoteToPdf('printable-quote-document', quote);
      setExportStatus('ดาวน์โหลด PDF สำเร็จแล้ว!');
      setTimeout(() => setExportStatus(null), 3500);
    } catch (err: any) {
      setExportStatus('เกิดข้อผิดพลาดในการสร้าง PDF: ' + (err.message || ''));
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportPng = async () => {
    try {
      setExportingPng(true);
      setExportStatus('กำลังสร้างภาพ PNG...');
      await exportQuoteToPng('printable-quote-document', quote);
      setExportStatus('บันทึกรูปภาพ PNG สำเร็จแล้ว!');
      setTimeout(() => setExportStatus(null), 3500);
    } catch (err: any) {
      setExportStatus('เกิดข้อผิดพลาดในการบันทึกภาพ: ' + (err.message || ''));
    } finally {
      setExportingPng(false);
    }
  };

  const handleCopy = async () => {
    try {
      await copyQuoteTextToClipboard(quote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      alert('ไม่สามารถคัดลอกได้ กรุณาอนุญาตสิทธิ์คลิปบอร์ด');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-orange-100 shadow-xl overflow-hidden transition-all animate-fadeIn">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ผลการคำนวณเบี้ยประกัน • {quote.quoteRef}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {quote.plan.name}
            </h3>
            <p className="text-orange-100 text-sm mt-1">
              ผู้เอาประกัน: เพศ{quote.gender === 'F' ? 'หญิง' : 'ชาย'} • อายุ {quote.age} ปี • คุ้มครองถึงอายุ {quote.coverageYears} ปี
            </p>
          </div>

          {/* Big Annual Price Box */}
          <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl p-4 text-center sm:text-right flex-shrink-0 min-w-[200px]">
            <span className="text-xs uppercase tracking-wider text-orange-100 block font-medium">
              เบี้ยประกันรายปี
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
              {formatMoney(quote.annual)}
              <span className="text-base font-normal text-orange-200 ml-1.5">บาท/ปี</span>
            </div>
            <span className="text-[11px] text-orange-100 mt-1 block">
              ชำระ {quote.paymentYears === 90 ? 'ถึงอายุ 90 ปี' : `${quote.paymentYears} ปี`}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Frequency Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-orange-100/60 bg-brand-50/50 border-b border-orange-100 text-center">
        <div className="p-4">
          <span className="text-xs font-medium text-gray-500 block">รายปี</span>
          <span className="text-lg font-bold text-gray-900 block mt-1">
            {formatMoney(quote.annual)} บ.
          </span>
          <span className="text-[10px] text-green-600 font-medium">คุ้มค่าที่สุด</span>
        </div>
        <div className="p-4">
          <span className="text-xs font-medium text-gray-500 block">ราย 6 เดือน</span>
          <span className={`text-lg font-bold block mt-1 ${quote.semiAnnualAvailable ? 'text-gray-900' : 'text-gray-400'}`}>
            {quote.semiAnnualAvailable ? `${formatMoney(quote.semiAnnual)} บ.` : '-'}
          </span>
          <span className="text-[10px] text-gray-400">
            {quote.semiAnnualAvailable ? 'ชำระปีละ 2 งวด' : 'ต่ำกว่าเกณฑ์ 2,000 บ.'}
          </span>
        </div>
        <div className="p-4">
          <span className="text-xs font-medium text-gray-500 block">ราย 3 เดือน</span>
          <span className={`text-lg font-bold block mt-1 ${quote.quarterlyAvailable ? 'text-gray-900' : 'text-gray-400'}`}>
            {quote.quarterlyAvailable ? `${formatMoney(quote.quarterly)} บ.` : '-'}
          </span>
          <span className="text-[10px] text-gray-400">
            {quote.quarterlyAvailable ? 'ชำระปีละ 4 งวด' : 'ต่ำกว่าเกณฑ์ 2,000 บ.'}
          </span>
        </div>
        <div className="p-4">
          <span className="text-xs font-medium text-gray-500 block">รายเดือน</span>
          <span className={`text-lg font-bold block mt-1 ${quote.monthlyAvailable ? 'text-brand-600' : 'text-gray-400'}`}>
            {quote.monthlyAvailable ? `${formatMoney(quote.monthly)} บ.` : '-'}
          </span>
          <span className="text-[10px] text-gray-400">
            {quote.monthlyAvailable ? 'หักบัญชี/บัตรรายเดือน' : 'ต่ำกว่าเกณฑ์ 500 บ.'}
          </span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-gray-100 px-6 pt-4 flex gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'summary'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>ผลประโยชน์และความคุ้มครอง</span>
        </button>
        <button
          onClick={() => setActiveTab('cashvalue')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'cashvalue'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>ตารางเงินคืน & มูลค่าเงินสด 20 ปี</span>
        </button>
        <button
          onClick={() => setActiveTab('advisory')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'advisory'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>โปรโมชั่นผ่อน 0% & ตัวแทน</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 sm:p-8">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Primary Death Coverage Highlight */}
            <div className="p-5 rounded-2xl bg-orange-50/80 border border-orange-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-brand-800 uppercase tracking-wide block">
                  ความคุ้มครองชีวิตกรณีเสียชีวิตทุกกรณี
                </span>
                <p className="text-gray-600 text-xs mt-0.5">
                  คุ้มครองกรณีเสียชีวิตทั้งจากอุบัติเหตุและการเจ็บป่วย ครอบคลุม 24 ชม. ทั่วโลก
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-2xl sm:text-3xl font-black text-brand-600">
                  {formatMoney(quote.totalDeathBenefit)}
                </span>
                <span className="text-xs text-gray-600 ml-1">บาท</span>
              </div>
            </div>

            {/* Coverage List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Life */}
              <div className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-orange-200 transition-colors shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">สัญญาประกันชีวิตหลัก</h4>
                    <span className="text-xs text-gray-500">
                      ชำระ {quote.paymentYears === 90 ? 'ถึงอายุ 90' : `${quote.paymentYears} ปี`} • คุ้มครองถึงอายุ {quote.coverageYears} ปี
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">ทุนประกันชีวิตหลัก:</span>
                    <span className="font-bold text-gray-900">{formatMoney(quote.lifeCover)} บาท</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">เงินครบสัญญา (อายุ {quote.coverageYears} ปี):</span>
                    <span className="font-bold text-brand-600">{formatMoney(quote.maturityBenefit)} บาท</span>
                  </div>
                  {quote.plan.hasCashback && (
                    <div className="flex justify-between py-1 border-b border-gray-100 bg-amber-50/60 px-2 rounded">
                      <span className="text-amber-900 font-medium">เงินคืนรายปี (1% ทุกปี):</span>
                      <span className="font-bold text-amber-700">
                        {formatMoney(quote.annualCashbackAmount)} บาท/ปี
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">สิทธิลดหย่อนภาษี:</span>
                    <span className="text-green-600 font-semibold">สูงสุด 100,000 บาท/ปี</span>
                  </div>
                </div>
              </div>

              {/* Rider CI50 */}
              <div className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-orange-200 transition-colors shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">สัญญาเพิ่มเติม 50 โรคร้ายแรง (CI50)</h4>
                    <span className="text-xs text-gray-500">
                      {quote.ciCover > 0 ? `ทุนคุ้มครอง ${formatMoney(quote.ciCover)} บาท` : 'ไม่ได้เลือกสัญญาเพิ่มเติม'}
                    </span>
                  </div>
                </div>

                {quote.ciCover > 0 ? (
                  <div className="space-y-2 text-xs text-gray-700">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-500">ตรวจพบ 5 โรคร้ายระยะเริ่มต้น (20%):</span>
                      <span className="font-bold text-gray-900">{formatMoney(quote.ciCover * 0.20)} บาท</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-500">โรคร้ายลุกลามระยะรุนแรง (80%):</span>
                      <span className="font-bold text-gray-900">{formatMoney(quote.ciCover * 0.80)} บาท</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-500">ตรวจพบ 45 โรคร้ายแรงครั้งแรก (100%):</span>
                      <span className="font-bold text-red-600">{formatMoney(quote.ciCover)} บาท</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">การชำระเบี้ยสัญญาเพิ่มเติม:</span>
                      <span className="text-gray-600">ชำระปีต่อปี เบี้ยปรับตามช่วงอายุ</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gray-50 text-center text-xs text-gray-500">
                    ยังไม่มีการเพิ่มสัญญาเพิ่มเติมโรคร้ายแรง สามารถเปิดใช้ได้ในแบบฟอร์มด้านบน
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cashvalue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">ตารางผลประโยชน์สะสมและมูลค่าเงินสด 20 ปีแรก</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  จำลองการเติบโตของมูลค่าเวนคืนกรมธรรม์ และเงินคืนสะสมตามเงื่อนไขสัญญา
                </p>
              </div>
              <span className="text-xs bg-orange-100 text-brand-800 px-2.5 py-1 rounded-full font-medium">
                หน่วย: บาท
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-orange-50/70 text-gray-700 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-3.5 py-3">สิ้นปีที่</th>
                    <th className="px-3.5 py-3">อายุผู้เอาประกัน</th>
                    <th className="px-3.5 py-3">เบี้ยสะสมที่ชำระ</th>
                    {quote.plan.hasCashback && <th className="px-3.5 py-3">เงินคืนประจำปี (1%)</th>}
                    {quote.plan.hasCashback && <th className="px-3.5 py-3">เงินคืนสะสม</th>}
                    <th className="px-3.5 py-3">มูลค่าเวนคืนเงินสด</th>
                    <th className="px-3.5 py-3">ความคุ้มครองชีวิต</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quote.cashValueSchedule
                    .filter((row) => [1, 2, 3, 5, 7, 10, 15, 20].includes(row.policyYear))
                    .map((row) => (
                      <tr key={row.policyYear} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-3.5 py-2.5 font-bold text-gray-900">ปีที่ {row.policyYear}</td>
                        <td className="px-3.5 py-2.5 text-gray-600">{row.insuredAge} ปี</td>
                        <td className="px-3.5 py-2.5 text-gray-800">{formatMoney(row.totalPremiumPaid)}</td>
                        {quote.plan.hasCashback && (
                          <td className="px-3.5 py-2.5 text-amber-600 font-semibold">
                            {formatMoney(row.guaranteedCashback)}
                          </td>
                        )}
                        {quote.plan.hasCashback && (
                          <td className="px-3.5 py-2.5 text-amber-700 font-bold">
                            {formatMoney(row.accumulatedCashback)}
                          </td>
                        )}
                        <td className="px-3.5 py-2.5 text-brand-600 font-bold">
                          {formatMoney(row.surrenderValue)}
                        </td>
                        <td className="px-3.5 py-2.5 text-gray-800">{formatMoney(row.deathBenefit)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-gray-500">
              * มูลค่าเวนคืนกรมธรรม์เป็นตัวเลขประมาณการตามตารางมูลค่ามาตรฐาน ข้อมูลจริงขึ้นอยู่กับตารางแนบท้ายกรมธรรม์
            </p>
          </div>
        )}

        {activeTab === 'advisory' && (
          <div className="space-y-6">
            {/* Credit card installment */}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-500" />
                <span>โปรโมชั่นผ่อนชำระ 0% สำหรับเบี้ยประกันปีแรก</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CREDIT_CARD_PROMOTIONS.map((promo, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-orange-50/50 transition-colors"
                  >
                    <span className="font-bold text-gray-900 text-xs block">{promo.bank}</span>
                    <span className="text-brand-600 text-xs font-semibold block mt-1">{promo.offer}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent License Directory */}
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-500" />
                <span>ตัวแทนและที่ปรึกษาการเงินผู้ได้รับอนุญาต</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AGENT_CONTACT_INFO.map((agent, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm space-y-1">
                    <span className="font-bold text-gray-900 text-xs block">{agent.name}</span>
                    <span className="text-gray-500 text-[11px] block">{agent.role}</span>
                    <span className="text-brand-600 text-[11px] font-mono block">
                      ใบอนุญาต: {agent.license}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-brand-500" />
                <span>สายด่วนปรึกษาแผนประกันภัย: 087-561-5690 (ทุกวัน 08:30 - 20:00 น.)</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button Bar */}
        <div className="pt-6 mt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* PDF Export Button */}
            <button
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exportingPdf ? 'กำลังสร้าง PDF...' : '📄 ดาวน์โหลดใบเสนอราคา (PDF)'}</span>
            </button>

            {/* PNG Export Button */}
            <button
              onClick={handleExportPng}
              disabled={exportingPng}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-brand-800 font-bold text-xs transition-colors"
            >
              <Image className="w-4 h-4" />
              <span>{exportingPng ? 'กำลังสร้างภาพ...' : '🖼️ บันทึกเป็นรูปภาพ PNG'}</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'คัดลอกเรียบร้อยแล้ว!' : '📋 คัดลอกข้อความสรุป'}</span>
            </button>
          </div>

          {/* Contact Advisor CTA */}
          {onContactClick && (
            <button
              onClick={() => onContactClick(quote)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-900 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PhoneCall className="w-4 h-4 text-orange-400" />
              <span>สนใจแผนนี้ ให้ตัวแทนติดต่อกลับ</span>
            </button>
          )}
        </div>

        {exportStatus && (
          <div className="mt-3 p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-brand-900 text-xs font-medium animate-fadeIn">
            {exportStatus}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* Hidden Render Target for High-DPI PDF & PNG Document     */}
      {/* ======================================================== */}
      <div className="overflow-hidden h-0 w-0 pointer-events-none opacity-0">
        <div
          id="printable-quote-document"
          style={{
            width: '800px',
            padding: '36px',
            backgroundColor: '#ffffff',
            color: '#1f2937',
            fontFamily: "'Prompt', sans-serif, -apple-system",
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #f97316', paddingBottom: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c' }}>
                Orange<span style={{ color: '#1f2937' }}>Care</span> • ใบเสนอราคาประกันภัย
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                แผนความคุ้มครองชีวิต มรดก และสุขภาพ (ข้อเสนอเบื้องต้น)
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#4b5563' }}>
              <div><strong>เลขที่เอกสาร:</strong> {quote.quoteRef}</div>
              <div><strong>วันที่จัดทำ:</strong> {quote.quoteDate}</div>
              <div><strong>ตัวแทน:</strong> {AGENT_CONTACT_INFO[0].name} (โทร. 087-561-5690)</div>
            </div>
          </div>

          {/* Insured Profile */}
          <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#9a3412', marginBottom: '8px' }}>
              ข้อมูลผู้ขอเอาประกันภัย
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '12px' }}>
              <div><span style={{ color: '#6b7280' }}>เพศ:</span> <strong>{quote.gender === 'F' ? 'หญิง' : 'ชาย'}</strong></div>
              <div><span style={{ color: '#6b7280' }}>อายุ:</span> <strong>{quote.age} ปี</strong></div>
              <div><span style={{ color: '#6b7280' }}>แผนประกัน:</span> <strong>{quote.plan.name}</strong></div>
              <div><span style={{ color: '#6b7280' }}>ระยะเวลาชำระเบี้ย:</span> <strong>{quote.paymentYears === 90 ? 'ถึงอายุ 90 ปี' : `${quote.paymentYears} ปี`}</strong></div>
            </div>
          </div>

          {/* Premium Highlight */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1, backgroundColor: '#f97316', color: '#ffffff', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.9 }}>เบี้ยประกันภัยรายปี</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '6px 0' }}>{formatMoney(quote.annual)} บาท</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>คุ้มครองยาวนานถึงอายุ {quote.coverageYears} ปี</div>
            </div>
            <div style={{ flex: 1, border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid #f3f4f6' }}>
                <span>ราย 6 เดือน:</span> <strong>{quote.semiAnnualAvailable ? `${formatMoney(quote.semiAnnual)} บ.` : '-'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid #f3f4f6' }}>
                <span>ราย 3 เดือน:</span> <strong>{quote.quarterlyAvailable ? `${formatMoney(quote.quarterly)} บ.` : '-'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>รายเดือน:</span> <strong>{quote.monthlyAvailable ? `${formatMoney(quote.monthly)} บ.` : '-'}</strong>
              </div>
            </div>
          </div>

          {/* Coverage Summary Details */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
              🎯 รายละเอียดผลประโยชน์และความคุ้มครอง
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
              <div>• <strong>ความคุ้มครองชีวิตกรณีเสียชีวิตทุกกรณี:</strong> <span style={{ color: '#ea580c', fontWeight: 'bold', fontSize: '14px' }}>{formatMoney(quote.totalDeathBenefit)} บาท</span></div>
              <div>• <strong>ทุนประกันชีวิตหลัก:</strong> {formatMoney(quote.lifeCover)} บาท (คุ้มครองถึงอายุ {quote.coverageYears} ปี)</div>
              <div>• <strong>ผลประโยชน์เงินครบกำหนดสัญญา:</strong> {formatMoney(quote.maturityBenefit)} บาท</div>
              {quote.plan.hasCashback && (
                <div>• <strong>เงินคืนประจำปี (1% ของทุน):</strong> {formatMoney(quote.annualCashbackAmount)} บาท/ปี (จ่ายสิ้นปีกรมธรรม์ 1-{quote.coverageYears})</div>
              )}
              {quote.ciCover > 0 && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #e5e7eb' }}>
                  <strong>สัญญาเพิ่มเติม 50 โรคร้ายแรง (CI50) ทุน {formatMoney(quote.ciCover)} บาท:</strong>
                  <div style={{ paddingLeft: '14px', color: '#4b5563' }}>
                    - ตรวจพบ 5 โรคร้ายระยะเริ่มต้น: {formatMoney(quote.ciCover * 0.20)} บาท (20%)<br />
                    - โรคร้ายลุกลามระยะรุนแรง: {formatMoney(quote.ciCover * 0.80)} บาท (80%)<br />
                    - ตรวจพบ 45 โรคร้ายแรงครั้งแรก: {formatMoney(quote.ciCover)} บาท (100%)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cash Value Summary Table */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
              📈 ตารางจำลองมูลค่าเวนคืนและเงินคืนสะสม
            </div>
            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#fff7ed', borderBottom: '1px solid #fed7aa' }}>
                  <th style={{ padding: '6px' }}>สิ้นปีที่</th>
                  <th style={{ padding: '6px' }}>อายุ</th>
                  <th style={{ padding: '6px' }}>เบี้ยสะสม</th>
                  {quote.plan.hasCashback && <th style={{ padding: '6px' }}>เงินคืนสะสม</th>}
                  <th style={{ padding: '6px' }}>มูลค่าเวนคืน</th>
                  <th style={{ padding: '6px' }}>ความคุ้มครอง</th>
                </tr>
              </thead>
              <tbody>
                {quote.cashValueSchedule.filter(r => [1, 3, 5, 10, 15, 20].includes(r.policyYear)).map(r => (
                  <tr key={r.policyYear} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px' }}>ปีที่ {r.policyYear}</td>
                    <td style={{ padding: '6px' }}>{r.insuredAge} ปี</td>
                    <td style={{ padding: '6px' }}>{formatMoney(r.totalPremiumPaid)}</td>
                    {quote.plan.hasCashback && <td style={{ padding: '6px', color: '#b45309' }}>{formatMoney(r.accumulatedCashback)}</td>}
                    <td style={{ padding: '6px', fontWeight: 'bold', color: '#ea580c' }}>{formatMoney(r.surrenderValue)}</td>
                    <td style={{ padding: '6px' }}>{formatMoney(r.deathBenefit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer & Notice */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', fontSize: '10px', color: '#6b7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              * เอกสารนี้เป็นเพียงตัวอย่างข้อเสนอเบื้องต้น อัตราเบี้ยและความคุ้มครองเป็นไปตามเงื่อนไขของกรมธรรม์<br />
              โปรโมชั่นผ่อน 0% นาน 3-4 เดือน (SCB, ttb, Krungsri First Choice)
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong>ฝ่ายบริการลูกค้า OrangeCare</strong><br />
              โทรศัพท์: 087-561-5690
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
