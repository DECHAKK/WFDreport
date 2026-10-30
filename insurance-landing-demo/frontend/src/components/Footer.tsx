import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-900 text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-gray-800">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-md">
                <Shield className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Orange<span className="text-brand-500">Care</span>
              </span>
              <span className="bg-gray-800 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-700">
                ต้นแบบ
              </span>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              โครงการสาธิตการออกแบบและพัฒนาระบบแนะนำแผนประกันภัยสมัยใหม่ เพื่อเป็นตัวอย่างสถาปัตยกรรม
              ที่ทำงานร่วมกันทั้งส่วนหน้าบ้านและหลังบ้าน (React, TypeScript, Express, MariaDB/MySQL)
            </p>

            <div className="pt-2 text-xs text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>สภาพแวดล้อม: สาธิตและทดสอบ (โหมดพัฒนาและสาธิต)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              เมนูหลัก
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/#hero" className="hover:text-brand-400 transition-colors">
                  หน้าแรก
                </a>
              </li>
              <li>
                <a href="/#benefits" className="hover:text-brand-400 transition-colors">
                  จุดเด่นการบริการ
                </a>
              </li>
              <li>
                <a href="/#plans" className="hover:text-brand-400 transition-colors">
                  แผนตัวอย่าง
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-brand-400 transition-colors">
                  คำถามที่พบบ่อย
                </a>
              </li>
            </ul>
          </div>

          {/* Admin & Privacy Links */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              ข้อมูลทางเทคนิคและการจัดการ
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/admin" className="hover:text-brand-400 transition-colors flex items-center gap-1.5 text-brand-400">
                  <span>แดชบอร์ดจัดการคำขอ (ระบบจัดการตัวอย่าง)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-brand-400 transition-colors">
                  นโยบายข้อมูลตัวอย่าง
                </Link>
              </li>
              <li>
                <a 
                  href="http://localhost:3000/api/v1/health" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-brand-400 transition-colors flex items-center gap-1"
                >
                  <span>ตรวจสอบสถานะระบบและฐานข้อมูล</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-8 p-4 rounded-2xl bg-gray-800/80 border border-gray-700 text-gray-400 text-xs leading-relaxed flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-gray-200">ข้อความปฏิเสธความรับผิดชอบ:</span>
            <p>
              เว็บไซต์นี้ถูกสร้างขึ้นเพื่อวัตถุประสงค์ในการสาธิตและทดสอบทักษะทางวิศวกรรมซอฟต์แวร์เท่านั้น (เพื่อการศึกษาและการสาธิต) ไม่มีส่วนเกี่ยวข้อง ไม่ได้เป็นตัวแทน และไม่ได้รับอนุญาตให้ใช้ชื่อทางการค้าหรือโลโก้ของบริษัท เอฟดับบลิวดี หรือบริษัทประกันภัยใดๆ ข้อมูลแผนประกันภัย อัตราเบี้ยประกันภัย และวงเงินคุ้มครองทั้งหมดเป็นข้อมูลสมมติ ไม่มีการเสนอขายหรือเก็บเบี้ยประกันจริง ห้ามใช้เพื่อการค้าหรือการทำธุรกรรมจริง
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} OrangeCare Insurance Demo • ต้นแบบเพื่อการศึกษาแบบเปิด</p>
        </div>

      </div>
    </footer>
  );
};
