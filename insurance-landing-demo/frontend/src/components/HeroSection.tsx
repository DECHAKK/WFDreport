import React from 'react';
import { ShieldCheck, Sparkles, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onConsultClick: () => void;
  onExplorePlansClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onConsultClick,
  onExplorePlansClick,
}) => {
  return (
    <section id="hero" className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-orange-50/70 via-white to-white">
      {/* Decorative background blurs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-200/30 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-orange-100/50 blur-[80px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline and Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Demo Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
              <span>โครงการจำลองระบบประกันภัย (ข้อมูลตัวอย่างและต้นแบบ)</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
              เลือกประกันอย่างมั่นใจ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-brand-600 to-amber-600">
                อุ่นใจทุกก้าวของชีวิต
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              ค้นหาแผนความคุ้มครองจำลองที่ออกแบบให้เข้าใจง่าย ชัดเจน ตรงความต้องการ
              พร้อมบริการให้คำปรึกษาจากทีมงานจำลอง ไม่มีค่าใช้จ่าย และไม่มีข้อผูกมัดใดๆ
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onConsultClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 transition-all text-base transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>รับคำปรึกษา</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onExplorePlansClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-orange-50/50 text-gray-800 font-medium px-7 py-4 rounded-xl border border-gray-200 hover:border-brand-300 transition-all text-base"
              >
                <span>ดูแผนตัวอย่าง</span>
              </button>
            </div>

            {/* Key Trust Signals */}
            <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>จำลองแผนตัวอย่างเข้าใจง่าย</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>ปรึกษาฟรี ไม่มีค่าใช้จ่าย</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>ไม่เก็บข้อมูลทางการเงิน</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Card Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative card frame */}
              <div className="relative bg-gradient-to-tr from-brand-500 to-amber-500 rounded-3xl p-1 shadow-2xl shadow-brand-500/20">
                <div className="bg-white rounded-[22px] p-6 sm:p-7 space-y-6">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-gray-900 leading-none">ความคุ้มครองของ OrangeCare</h2>
                        <span className="text-[11px] text-gray-400">ภาพรวมบัตรจำลอง</span>
                      </div>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      บัตรตัวอย่าง
                    </span>
                  </div>

                  {/* Highlights Visual Box */}
                  <div className="bg-gradient-to-br from-brand-50 to-orange-100/50 rounded-2xl p-5 border border-brand-100/80 space-y-3">
                    <div className="text-xs font-semibold text-brand-800 uppercase tracking-wider flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-brand-600" />
                      ตัวอย่างสิทธิประโยชน์จำลอง
                    </div>
                    <div className="space-y-2 text-xs text-gray-700">
                      <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-lg border border-orange-100/60">
                        <span>วงเงินคุ้มครองค่ารักษาพยาบาลจำลอง</span>
                        <span className="font-bold text-brand-600">สูงสุด 5 ลบ.*</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-lg border border-orange-100/60">
                        <span>ค่าชดเชยรายวันกรณีพักรักษาตัว</span>
                        <span className="font-bold text-brand-600">2,000 บ./วัน*</span>
                      </div>
                      <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-lg border border-orange-100/60">
                        <span>เบี้ยประกันจำลองเริ่มต้น</span>
                        <span className="font-bold text-brand-700">350 บ./ด.*</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 italic text-center pt-1">
                      * ข้อมูลทั้งหมดเป็นตัวเลขสมมติเพื่อการสาธิตระบบเท่านั้น
                    </p>
                  </div>

                  {/* Trust Footer inside card */}
                  <div className="pt-1 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      ระบบเปิดรับคำขอจำลองตลอด 24 ชม.
                    </span>
                    <span className="font-semibold text-brand-600">ตัวอย่าง OrangeCare</span>
                  </div>

                </div>
              </div>

              {/* Floating Mini Badge 1 */}
              <div className="absolute -top-4 -left-4 bg-white rounded-2xl p-3.5 shadow-xl border border-orange-100 flex items-center gap-3 animate-pulse-subtle">
                <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                  100%
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-none">ทดลองใช้งานฟรี</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">ไม่มีค่าใช้จ่ายแอบแฝง</p>
                </div>
              </div>

              {/* Floating Mini Badge 2 */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-3.5 shadow-xl border border-orange-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-none">ความปลอดภัยข้อมูล</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">ระบบจัดการข้อมูลตัวอย่าง</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
