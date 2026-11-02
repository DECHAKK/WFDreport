import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { IndexLinkedCalculator } from '../components/IndexLinkedCalculator';
import { TrendingUp, ShieldCheck, FileText } from 'lucide-react';

export const IndexLinkedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Navbar
        onConsultClick={() => {
          const element = document.getElementById('index-linked-calculator');
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-brand-800 text-[11px] font-semibold">
              <TrendingUp className="w-3 h-3 text-brand-600" />
              <span>ประกันสะสมทรัพย์อ้างอิงดัชนี • แผนตัวอย่างเพื่อการศึกษา</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug text-balance">
              ตารางผลประโยชน์ 25 ปี{' '}
              <span className="text-brand-600">(25/7 และ 25/15)</span>
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              เลือกแบบประกัน ระบุเพศ อายุ และทุนประกันภัย ระบบจะคำนวณตารางผลประโยชน์รายปี
              พร้อมเงินคืน 1% เงินครบกำหนดสัญญา เงินค่าเวนคืน และผลประโยชน์ที่ไม่รับรองการจ่าย
              ตามสมมุติฐานดัชนีอ้างอิง 2%, 4%, 6% และ 8% ต่อปี
            </p>
          </div>

          <div id="index-linked-calculator">
            <IndexLinkedCalculator />
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-orange-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-[18px] h-[18px]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-xs">ผลประโยชน์ที่รับรองการจ่าย</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  เงินคืน 1% ของทุนประกันภัยทุกปี (ปีกรมธรรม์ที่ 1-24) และเงินครบกำหนดสัญญา
                  700% (25/7) หรือ 1,480% (25/15) ของทุนประกันภัย
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-[18px] h-[18px]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-xs">ผลประโยชน์ที่ไม่รับรองการจ่าย</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  ขึ้นอยู่กับระดับดัชนีอ้างอิงและอัตราแลกเปลี่ยน มีค่าไม่ต่ำกว่าศูนย์
                  และในกรณีที่แย่ที่สุดอาจไม่มีการจ่ายผลประโยชน์ส่วนนี้
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-[18px] h-[18px]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-xs">ส่งออกตารางเป็น PDF</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  บันทึกตารางผลประโยชน์หน้าเดียวเป็นไฟล์ PDF หรือรูปภาพ เพื่อนำไปประกอบการปรึกษา
                  กับที่ปรึกษาการเงิน
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-400">
            ข้อมูลทั้งหมดเป็นข้อมูลตัวอย่างสมมติเพื่อการสาธิต (DEMO DATA) ไม่ใช่การชี้ชวนขายผลิตภัณฑ์จริง
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};
