import React from 'react';
import { ClipboardList, CheckCircle2, UserCheck, ArrowRight } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: ClipboardList,
      title: 'กรอกข้อมูลขอคำปรึกษาจำลอง',
      description: 'ระบุข้อมูลติดต่อพื้นฐานและเลือกประเภทประกันที่คุณสนใจผ่านแบบฟอร์มบนเว็บไซต์ สะดวกรวดเร็วใน 1 นาที',
      tip: 'ใช้ข้อมูลจำลองได้ ปลอดภัย 100%',
    },
    {
      step: '02',
      icon: CheckCircle2,
      title: 'รับการยืนยันบันทึกข้อมูล',
      description: 'ระบบ Express & MariaDB บันทึกข้อมูลคำขอของคุณเข้าสู่ฐานข้อมูลทดสอบ พร้อมออกรหัสอ้างอิงคำขอจำลองทันที',
      tip: 'ประมวลผลทันทีผ่าน REST API',
    },
    {
      step: '03',
      icon: UserCheck,
      title: 'จำลองขั้นตอนการประสานงาน',
      description: 'ในระบบจริงจะมีตัวแทนผู้ได้รับใบอนุญาตติดต่อกลับเพื่อชี้แจงรายละเอียดและข้อเสนอตามความต้องการที่ระบุไว้',
      tip: 'แนวคิดการทำงานในโลกจริง',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
            <span>ขั้นตอนการทำงานจำลอง</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            ขั้นตอนการขอคำปรึกษาที่ง่ายและสะดวก
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            เรียนรู้สถาปัตยกรรมและขั้นตอนการทำงานตั้งแต่การส่งข้อมูล จนถึงการจัดเก็บลงฐานข้อมูล
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative bg-orange-50/40 rounded-3xl p-8 border border-orange-100 flex flex-col justify-between hover:bg-orange-50/80 transition-all card-hover-effect"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-brand-400 font-mono">
                      {item.step}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-orange-200/80 text-brand-600 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-orange-200/50 flex items-center gap-2 text-xs font-medium text-brand-700">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  <span>{item.tip}</span>
                </div>

                {/* Connecting arrow indicator for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-brand-300">
                    <ArrowRight className="w-6 h-6" />
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
