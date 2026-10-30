import React from 'react';
import { 
  HeartHandshake, 
  Smartphone, 
  Clock, 
  FileCheck2, 
  Sparkles,
  Headphones
} from 'lucide-react';

interface BenefitItem {
  icon: React.ElementType;
  title: string;
  description: string;
  tag: string;
}

const SAMPLE_BENEFITS: BenefitItem[] = [
  {
    icon: Smartphone,
    title: 'ยื่นคำขอสะดวกผ่านออนไลน์',
    description: 'ส่งคำขอรับคำปรึกษาแผนประกันจำลองได้ทุกที่ ทุกเวลา ภายในเวลาไม่ถึง 1 นาทีผ่านหน้าเว็บที่ออกแบบมาให้ใช้งานง่าย',
    tag: 'สะดวกรวดเร็ว',
  },
  {
    icon: FileCheck2,
    title: 'เงื่อนไขจำลองเข้าใจง่าย',
    description: 'ลดความซับซ้อนของภาษาประกันภัย ด้วยการสรุปผลประโยชน์และข้อยกเว้นแบบตรงไปตรงมา ชัดเจน ไม่คลุมเครือ',
    tag: 'โปร่งใส ชัดเจน',
  },
  {
    icon: Clock,
    title: 'ติดต่อกลับไวในเวลาทำการ',
    description: 'จำลองขั้นตอนการประสานงานติดต่อกลับเพื่อตอบข้อซักถามอย่างรวดเร็ว โดยคำนึงถึงความสะดวกของผู้ใช้งานเป็นหลัก',
    tag: 'บริการใส่ใจ',
  },
  {
    icon: HeartHandshake,
    title: 'ปรับแต่งแผนได้ตามต้องการ',
    description: 'สามารถเลือกประเภทความคุ้มครองจำลองที่เหมาะสมกับช่วงวัย ทั้งสุขภาพ ประกันชีวิต อุบัติเหตุ และการออม',
    tag: 'ตรงโจทย์ชีวิต',
  },
  {
    icon: Headphones,
    title: 'คำแนะนำจากที่ปรึกษา',
    description: 'แนวคิดการให้คำแนะนำอย่างเป็นกลาง ช่วยให้ผู้ใช้สามารถประเมินความต้องการที่แท้จริงก่อนตัดสินใจ',
    tag: 'คำแนะนำจริงใจ',
  },
  {
    icon: Sparkles,
    title: 'มาตรฐานเทคโนโลยีทันสมัย',
    description: 'พัฒนาด้วยสถาปัตยกรรม React, Express, และ REST API มาตรฐานความปลอดภัยสูง ปกป้องข้อมูลส่วนบุคคล',
    tag: 'ปลอดภัยมั่นคง',
  },
];

export const BenefitsSection: React.FC = () => {
  return (
    <section id="benefits" className="py-20 bg-white border-t border-orange-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
            <span>จุดเด่นของบริการจำลอง</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            ทำไมต้องเริ่มต้นวางแผนความคุ้มครองกับเรา
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            สัมผัสประสบการณ์การเลือกดูแผนประกันภัยในรูปแบบใหม่ที่เน้นความเข้าใจง่าย 
            ความโปร่งใส และความสบายใจของผู้รับบริการเป็นอันดับหนึ่ง
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SAMPLE_BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 card-hover-effect flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-13 h-13 rounded-2xl bg-orange-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300 p-3">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
                      {benefit.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {benefit.title}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center text-xs font-semibold text-brand-600 group-hover:text-brand-700">
                  <span>ตัวอย่างคุณสมบัติระบบ</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
