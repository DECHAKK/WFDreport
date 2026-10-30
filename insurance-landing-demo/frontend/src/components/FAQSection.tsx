import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'เว็บไซต์นี้เป็นเว็บไซต์ของบริษัทประกันภัยทางการหรือไม่?',
    answer: 'ไม่ใช่ครับ เว็บไซต์นี้เป็นโครงการต้นแบบและสาธิตทางเทคโนโลยี ภายใต้ชื่อสมมติ "OrangeCare Insurance Demo" เพื่อการเรียนรู้ การออกแบบสถาปัตยกรรมซอฟต์แวร์ และทดสอบการทำงานของระบบเว็บแอปพลิเคชัน ไม่เกี่ยวข้องและไม่ได้แอบอ้างบริษัทประกันภัยใดๆ ในประเทศไทย',
  },
  {
    question: 'ข้อมูลแผนประกันภัยและเบี้ยประกันที่แสดงเป็นของจริงหรือไม่?',
    answer: 'ข้อมูลทั้งหมดเป็นข้อมูลสมมติ (ข้อมูลตัวอย่าง) สำหรับทดสอบระบบเท่านั้น อัตราเบี้ยประกันภัย วงเงินคุ้มครอง และเงื่อนไขต่างๆ ไม่สามารถนำไปใช้อ้างอิงทางกฎหมายหรือซื้อขายจริงได้',
  },
  {
    question: 'หากส่งแบบฟอร์มขอคำปรึกษา จะมีผลผูกพันหรือมีค่าใช้จ่ายหรือไม่?',
    answer: 'ไม่มีผลผูกพันและไม่มีค่าใช้จ่ายใดๆ ทั้งสิ้น ข้อมูลที่ท่านกรอกจะถูกบันทึกเข้าสู่ฐานข้อมูลทดสอบ (MariaDB/MySQL) ในเครื่องพัฒนาเพื่อทดสอบระบบจัดการข้อมูลผู้สนใจ (Leads) เท่านั้น ไม่มีการเรียกเก็บเงินหรือออกกรมธรรม์จริง',
  },
  {
    question: 'ระบบจัดเก็บข้อมูลส่วนบุคคลอย่างไร และปลอดภัยหรือไม่?',
    answer: 'ระบบถูกออกแบบตามหลักการความปลอดภัยพื้นฐาน โดยใช้คำสั่ง SQL แบบพารามิเตอร์ (Parameterized Query) เพื่อป้องกันการโจมตีฐานข้อมูล (SQL Injection) ติดตั้งส่วนหัวความปลอดภัยสำหรับเว็บ (Security Headers) จำกัดจำนวนครั้งในการส่งข้อมูล (Rate Limiting) และเข้ารหัสการเชื่อมต่อ ทั้งนี้สำหรับระบบทดสอบ แนะนำให้ผู้ใช้งานกรอกข้อมูลตัวอย่างเท่านั้น หลีกเลี่ยงการกรอกข้อมูลที่มีความละเอียดอ่อนสูง',
  },
  {
    question: 'หากต้องการนำระบบนี้ไปใช้งานจริง ต้องดำเนินการอย่างไรเพิ่มเติม?',
    answer: 'ในการใช้งานจริงระดับการผลิต (Production) จะต้องดำเนินการเพิ่มเติมหลายส่วน ได้แก่: การขอใบอนุญาตนายหน้าหรือความร่วมมือกับบริษัทประกันภัยที่ถูกต้องตามกฎหมาย, การติดตั้งระบบยืนยันและตรวจสอบสิทธิ์ผู้ใช้งาน, การเข้ารหัสข้อมูลตามมาตรฐาน PDPA, การเชื่อมต่อกับระบบหลักของบริษัทประกันภัย และระบบชำระเงินที่ผ่านการรับรอง',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Default open first question

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-orange-50/30 border-t border-orange-100/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-brand-800 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
            <span>คำถามที่พบบ่อย</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            มีข้อสงสัยเกี่ยวกับระบบตัวอย่าง?
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            รวมคำตอบเกี่ยวกับวัตถุประสงค์โครงการ ความปลอดภัยของข้อมูล และแนวคิดการทำงาน
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm transition-colors hover:border-brand-200"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-gray-900 text-base sm:text-lg">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-orange-50 text-brand-600 flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-brand-500 text-white' : ''
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-50 animate-fadeIn">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
