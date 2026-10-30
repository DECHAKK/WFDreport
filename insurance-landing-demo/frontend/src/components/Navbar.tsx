import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Calculator,
  Menu,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';

interface NavbarProps {
  onConsultClick?: () => void;
}

const NAV_ITEMS = [
  { label: 'หน้าแรก', anchor: 'hero' },
  { label: 'จุดเด่น', anchor: 'benefits' },
  { label: 'แผนประกัน', mobileLabel: 'แผนตัวอย่าง', anchor: 'plans' },
  { label: 'ขั้นตอน', anchor: 'how-it-works' },
  { label: 'คำถาม', mobileLabel: 'คำถามที่พบบ่อย', anchor: 'faq' },
];

export const Navbar: React.FC<NavbarProps> = ({ onConsultClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);

  const handleNavClick = (anchor: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(anchor);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToLeadForm = () => {
    setMobileMenuOpen(false);
    if (onConsultClick) {
      onConsultClick();
      return;
    }

    const element = document.getElementById('lead-form');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderSectionLinks = (mobile = false) => NAV_ITEMS.map((item) => {
    const isCurrentHome = !mobile && isHome && item.anchor === 'hero';
    const className = mobile
      ? 'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-orange-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
      : `rounded-xl px-2.5 xl:px-3 py-2 text-[13px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
          isCurrentHome
            ? 'bg-white text-brand-700 shadow-sm'
            : 'text-gray-600 hover:bg-white hover:text-brand-700 hover:shadow-sm'
        }`;
    const label = mobile && item.mobileLabel ? item.mobileLabel : item.label;
    const content = mobile ? (
      <>
        <span>{label}</span>
        <ArrowRight className="h-4 w-4 text-gray-300" />
      </>
    ) : label;

    if (isHome) {
      return (
        <button
          key={item.anchor}
          type="button"
          onClick={() => handleNavClick(item.anchor)}
          className={className}
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        key={item.anchor}
        to={`/#${item.anchor}`}
        onClick={() => setMobileMenuOpen(false)}
        className={className}
      >
        {content}
      </Link>
    );
  });

  const renderConsultationAction = (mobile = false) => {
    const className = mobile
      ? 'group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:from-brand-600 hover:to-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2'
      : 'group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-brand-500/25 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';
    const content = (
      <>
        <span>ขอคำปรึกษาฟรี</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </>
    );

    if (!onConsultClick && !isHome) {
      return <Link to="/#lead-form" className={className}>{content}</Link>;
    }

    return <button type="button" onClick={scrollToLeadForm} className={className}>{content}</button>;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100/70 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-amber-500 text-white">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-center gap-2 px-4 text-[11px] sm:px-6 lg:px-8">
          <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-orange-100" />
          <span className="rounded-full border border-white/20 bg-white/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.14em]">
            โครงการตัวอย่าง
          </span>
          <span className="hidden font-medium text-orange-50 sm:inline">
            โครงการสาธิตเพื่อการศึกษา • ข้อมูลและผลการคำนวณเป็นตัวอย่างเท่านั้น
          </span>
          <span className="font-medium text-orange-50 sm:hidden">ข้อมูลจำลองเท่านั้น</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between gap-3">
          <Link
            to="/"
            aria-label="OrangeCare กลับหน้าแรก"
            onClick={() => setMobileMenuOpen(false)}
            className="group flex flex-shrink-0 items-center gap-2.5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-4"
          >
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/25 ring-1 ring-white/40 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
                <ShieldCheck className="h-6 w-6 stroke-[2.4]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
            </div>
            <div>
              <div className="text-[22px] font-extrabold leading-none tracking-[-0.04em] text-gray-900">
                <span>Orange</span><span className="text-brand-500">Care</span>
              </div>
              <p className="mt-1.5 text-[9px] font-semibold tracking-[0.08em] text-gray-400">
                ตัวอย่างระบบประกันภัย
              </p>
            </div>
          </Link>

          <nav
            aria-label="เมนูหลัก"
            className="hidden items-center gap-0.5 rounded-2xl border border-gray-200/70 bg-gray-50/90 p-1 shadow-inner lg:flex"
          >
            {renderSectionLinks()}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/calculator"
              aria-current={location.pathname === '/calculator' ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-[13px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                location.pathname === '/calculator'
                  ? 'border-brand-200 bg-orange-100 text-brand-800'
                  : 'border-orange-200/80 bg-orange-50 text-brand-700 hover:border-brand-300 hover:bg-orange-100'
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>คำนวณเบี้ย</span>
            </Link>
            <Link
              to="/admin"
              aria-label="จัดการข้อมูลตัวอย่าง"
              title="จัดการข้อมูลตัวอย่าง"
              aria-current={location.pathname === '/admin' ? 'page' : undefined}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                location.pathname === '/admin'
                  ? 'border-brand-200 bg-orange-100 text-brand-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-brand-200 hover:bg-orange-50 hover:text-brand-600'
              }`}
            >
              <UserCheck className="h-[18px] w-[18px]" />
            </Link>
            {renderConsultationAction()}
          </div>

          <div className="flex items-center gap-1.5 lg:hidden">
            <Link
              to="/calculator"
              aria-label="เปิดเครื่องคำนวณเบี้ย"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-brand-600 transition-colors hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Calculator className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'ปิดเมนูนำทาง' : 'เปิดเมนูนำทาง'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:border-brand-200 hover:bg-orange-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-orange-100/80 bg-white/95 px-4 pb-5 pt-3 shadow-2xl backdrop-blur-xl lg:hidden">
          <nav id="mobile-navigation" aria-label="เมนูมือถือ" className="mx-auto max-w-7xl">
            <div className="grid gap-1">
              {renderSectionLinks(true)}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
              <Link
                to="/calculator"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={location.pathname === '/calculator' ? 'page' : undefined}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition-colors ${
                  location.pathname === '/calculator'
                    ? 'border-brand-300 bg-orange-100 text-brand-800'
                    : 'border-orange-200 bg-orange-50 text-brand-700 hover:bg-orange-100'
                }`}
              >
                <Calculator className="h-4 w-4" />
                <span>คำนวณเบี้ยประกัน</span>
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                aria-current={location.pathname === '/admin' ? 'page' : undefined}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition-colors ${
                  location.pathname === '/admin'
                    ? 'border-brand-300 bg-orange-100 text-brand-800'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-brand-200 hover:bg-orange-50 hover:text-brand-700'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>จัดการข้อมูลตัวอย่าง</span>
              </Link>
            </div>

            <div className="mt-3">
              {renderConsultationAction(true)}
            </div>
            <p className="mt-3 text-center text-[10px] text-gray-400">
              ต้นแบบเพื่อการศึกษา • ไม่มีการขายหรือเก็บเบี้ยจริง
            </p>
          </nav>
        </div>
      )}
    </header>
  );
};
