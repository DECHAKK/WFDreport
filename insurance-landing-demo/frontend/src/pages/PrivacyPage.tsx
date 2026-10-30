import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ShieldCheck, ArrowLeft, AlertTriangle } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-16 bg-gradient-to-b from-orange-50/40 via-white to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb / Back Link */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับสู่หน้าหลัก</span>
            </Link>
          </div>

          {/* Page Card Frame */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm space-y-8">
            
            {/* Header */}
            <div className="space-y-3 pb-6 border-b border-gray-100">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-brand-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>นโยบายความเป็นส่วนตัวของข้อมูลตัวอย่าง</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                นโยบายความเป็นส่วนตัวของข้อมูลตัวอย่าง
              </h1>
              <p className="text-sm text-gray-500">
                ปรับปรุงล่าสุด: วันที่จัดทำโครงการสาธิต OrangeCare Insurance Demo
              </p>
            </div>

            {/* Warning Callout */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">ข้อควรระวังสำคัญ:</p>
                <p className="leading-relaxed">
                  เนื่องจากระบบนี้เป็นระบบต้นแบบเพื่อการเรียนรู้ (สภาพแวดล้อมจำลอง) กรุณาอย่ากรอกข้อมูลที่มีความละเอียดอ่อนสูง เช่น หมายเลขบัตรประจำตัวประชาชน ข้อมูลบัตรเครดิต หรือรหัสผ่านส่วนบุคคลลงในแบบฟอร์มทดสอบนี้
                </p>
              </div>
            </div>

            {/* Privacy Sections */}
            <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-lg font-bold text-gray-900">1. วัตถุประสงค์ในการเก็บรวบรวมข้อมูล</h2>
                <p>
                  โครงการ OrangeCare Insurance Demo จัดเก็บข้อมูลที่ท่านกรอกผ่านแบบฟอร์มขอรับคำปรึกษาเพื่อวัตถุประสงค์ในการทดสอบและสาธิตการทำงานของระบบแอปพลิเคชัน (การสาธิตทางเทคโนโลยี) ได้แก่:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-600">
                  <li>การทดสอบความถูกต้องของแบบฟอร์ม (การตรวจสอบและจัดการข้อผิดพลาด)</li>
                  <li>การทดสอบการส่งข้อมูลผ่าน REST API เข้าสู่ฐานข้อมูล MariaDB/MySQL</li>
                  <li>การแสดงผลรายการคำขอในหน้าแดชบอร์ดจำลองสำหรับผู้ดูแลระบบ</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-gray-900">2. ข้อมูลที่มีการจัดเก็บในแบบฟอร์มจำลอง</h2>
                <p>
                  ข้อมูลที่ระบบทดสอบเปิดให้กรอกประกอบด้วย:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-600">
                  <li>ชื่อ-นามสกุล (แนะนำให้ใช้ชื่อตัวอย่าง เช่น นายสมมติ ใจดี)</li>
                  <li>หมายเลขโทรศัพท์ติดต่อ (ใช้รูปแบบเบอร์โทรศัพท์ 9-10 หลักสำหรับการตรวจสอบ)</li>
                  <li>ที่อยู่อีเมล (ไม่บังคับ)</li>
                  <li>ประเภทแผนประกันภัยที่สนใจ และช่องทางการติดต่อที่สะดวก</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-gray-900">3. การเก็บรักษาและความปลอดภัยของข้อมูล</h2>
                <p>
                  ข้อมูลตัวอย่างทั้งหมดถูกจัดเก็บบนฐานข้อมูลจำลองภายในเครื่องพัฒนา (Local Database) 
                  ไม่มีการส่งต่อข้อมูลไปยังบุคคลภายนอก ไม่มีการส่งต่อไปยังบริษัทประกันภัยใดๆ 
                  และไม่มีการนำข้อมูลไปใช้ในเชิงพาณิชย์หรือการตลาดจริง
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-gray-900">4. ข้อกำหนดก่อนการนำไปใช้งานจริง (Production Readiness)</h2>
                <p>
                  หากต้องการพัฒนาต่อยอดระบบนี้เป็นระบบให้บริการจริง จะต้องมีการจัดทำมาตรการคุ้มครองข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) อย่างเคร่งครัด ได้แก่:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-gray-600">
                  <li>การจัดทำบันทึกรายการประมวลผลข้อมูลส่วนบุคคล</li>
                  <li>การติดตั้งระบบพิสูจน์และยืนยันตัวตนพร้อมกำหนดสิทธิ์ตามบทบาทผู้ใช้งาน สำหรับเข้าถึงข้อมูลคำขอรับคำปรึกษา</li>
                  <li>การเข้ารหัสข้อมูลขณะส่งผ่านเครือข่าย (TLS/HTTPS) และการเข้ารหัสข้อมูลขณะจัดเก็บ</li>
                  <li>การกำหนดระยะเวลาการเก็บรักษาและการทำลายข้อมูล</li>
                  <li>การแต่งตั้งเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล และการทำข้อตกลงประมวลผลข้อมูลกับพันธมิตร</li>
                </ul>
              </section>
            </div>

            {/* Back CTA */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <Link
                to="/"
                className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                รับทราบและกลับสู่หน้าหลัก
              </Link>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
