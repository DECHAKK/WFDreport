import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { LeadSubmissionRequest, InsuranceInterest, ContactMethod, Plan } from '../types';
import { apiClient } from '../services/apiClient';

interface LeadFormProps {
  selectedPlan?: Plan | null;
  onClearSelectedPlan?: () => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({
  selectedPlan,
  onClearSelectedPlan,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [insuranceInterest, setInsuranceInterest] = useState<InsuranceInterest>('health');
  const [preferredContactMethod, setPreferredContactMethod] = useState<ContactMethod>('phone');
  const [consentGiven, setConsentGiven] = useState(false);

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: number; message: string } | null>(null);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // When a plan is selected from the Plans section, auto-fill the interest
  useEffect(() => {
    if (selectedPlan) {
      const planNameLower = selectedPlan.planName.toLowerCase();
      if (planNameLower.includes('สุขภาพ')) {
        setInsuranceInterest('health');
      } else if (planNameLower.includes('มรดก') || planNameLower.includes('ชีวิต')) {
        setInsuranceInterest('life');
      } else if (planNameLower.includes('อุบัติเหตุ')) {
        setInsuranceInterest('accident');
      } else {
        setInsuranceInterest('other');
      }
    }
  }, [selectedPlan]);

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'กรุณาระบุชื่อ-นามสกุลให้ครบถ้วน (อย่างน้อย 2 ตัวอักษร)';
    }

    const cleanPhone = phone.replace(/[-\s]/g, '');
    const thaiPhoneRegex = /^0\d{8,9}$/;
    if (!cleanPhone || !thaiPhoneRegex.test(cleanPhone)) {
      errors.phone = 'กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง เช่น 0812345678 (9-10 หลัก)';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
      }
    }

    if (!consentGiven) {
      errors.consent = 'กรุณากดยินยอมการประมวลผลข้อมูลจำลองก่อนส่งคำขอ';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors([]);

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    const payload: LeadSubmissionRequest = {
      fullName: fullName.trim(),
      phone: phone.replace(/[-\s]/g, ''),
      email: email.trim() ? email.trim() : null,
      insuranceInterest,
      preferredContactMethod,
      consentGiven,
    };

    try {
      const response = await apiClient.submitLead(payload);
      setSuccessData({
        id: response.data?.id || 1,
        message: response.message || 'ส่งคำขอรับคำปรึกษาจำลองสำเร็จแล้ว!',
      });
      // Reset form
      setFullName('');
      setPhone('');
      setEmail('');
      setConsentGiven(false);
      setFieldErrors({});
      if (onClearSelectedPlan) onClearSelectedPlan();
    } catch (err: any) {
      const messages = err.errors || [err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล'];
      setServerErrors(messages);
    } finally {
      setSubmitting(false);
    }
  };

  const resetFormState = () => {
    setSuccessData(null);
    setServerErrors([]);
  };

  return (
    <section id="lead-form" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-brand-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>แบบฟอร์มขอรับคำปรึกษา (แบบฟอร์มตัวอย่าง)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            เริ่มต้นวางแผนความคุ้มครองวันนี้
          </h2>
          <p className="text-gray-600 text-base leading-relaxed max-w-2xl mx-auto">
            กรอกข้อมูลสั้นๆ เพื่อจำลองขั้นตอนการยื่นคำขอรับคำปรึกษาแผนประกันภัย 
            ระบบจะบันทึกข้อมูลเข้าสู่ฐานข้อมูล MariaDB และแสดงผลทันที
          </p>
        </div>

        {/* Selected Plan Banner if passed from Plans Section */}
        {selectedPlan && (
          <div className="mb-8 p-4 rounded-2xl bg-orange-50 border border-brand-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
                #{selectedPlan.id}
              </div>
              <div>
                <p className="text-xs text-brand-700 font-semibold">คุณกำลังเลือกขอคำปรึกษาสำหรับแผน:</p>
                <p className="text-sm font-bold text-gray-900">{selectedPlan.planName}</p>
              </div>
            </div>
            {onClearSelectedPlan && (
              <button
                type="button"
                onClick={onClearSelectedPlan}
                className="text-xs text-gray-500 hover:text-brand-600 underline"
              >
                เปลี่ยนแผน
              </button>
            )}
          </div>
        )}

        {/* Card Frame */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl shadow-brand-500/5 relative">
          
          {/* Success State Overlay / Banner */}
          {successData ? (
            <div className="py-8 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                ส่งคำขอคำปรึกษาจำลองสำเร็จ!
              </h3>
              <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
                รหัสคำขออ้างอิงจำลองของคุณคือ <span className="font-bold text-brand-600">#{successData.id}</span> ข้อมูลได้ถูกจัดเก็บเข้าสู่ตาราง <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">leads</code> ในฐานข้อมูลเรียบร้อยแล้ว
              </p>
              <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-100 max-w-md mx-auto text-xs text-brand-800">
                💡 คุณสามารถตรวจสอบรายการที่บันทึกนี้ได้ทันทีที่หน้า <a href="/admin" className="font-bold underline hover:text-brand-900">จัดการข้อมูลตัวอย่าง (สำหรับผู้ดูแลระบบ)</a>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={resetFormState}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
                >
                  ส่งคำขอตัวอย่างรายการอื่น
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              
              {/* Server Errors Notice */}
              {serverErrors.length > 0 && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">เกิดข้อผิดพลาดจากเซิร์ฟเวอร์:</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-xs text-red-700">
                      {serverErrors.map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: '' });
                      }}
                      placeholder="เช่น สมชาย ใจดี (ตัวอย่าง)"
                      disabled={submitting}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none ${
                        fieldErrors.fullName
                          ? 'border-red-300 focus:border-red-500 bg-red-50/20'
                          : 'border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                      }`}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="text-xs text-red-600 font-medium">{fieldErrors.fullName}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                      }}
                      placeholder="0812345678"
                      disabled={submitting}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none ${
                        fieldErrors.phone
                          ? 'border-red-300 focus:border-red-500 bg-red-50/20'
                          : 'border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                      }`}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-600 font-medium">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* Email (Optional) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      อีเมล
                    </label>
                    <span className="text-[11px] text-gray-400 font-normal">ไม่บังคับ</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                      }}
                      placeholder="ระบุอีเมลของท่าน (ถ้ามี)"
                      disabled={submitting}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none ${
                        fieldErrors.email
                          ? 'border-red-300 focus:border-red-500 bg-red-50/20'
                          : 'border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-red-600 font-medium">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Insurance Interest Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="insuranceInterest" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ประเภทประกันที่สนใจ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <select
                      id="insuranceInterest"
                      value={insuranceInterest}
                      onChange={(e) => setInsuranceInterest(e.target.value as InsuranceInterest)}
                      disabled={submitting}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
                    >
                      <option value="health">ประกันสุขภาพเหมาจ่าย</option>
                      <option value="life">ประกันชีวิตและมรดก</option>
                      <option value="accident">ประกันอุบัติเหตุส่วนบุคคล</option>
                      <option value="savings">ประกันสะสมทรัพย์และการออม</option>
                      <option value="car">ประกันรถยนต์</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Preferred Contact Method */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  ช่องทางการติดต่อที่สะดวก <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'phone', label: 'โทรศัพท์' },
                    { key: 'line', label: 'ไลน์ (LINE)' },
                    { key: 'email', label: 'อีเมล' },
                  ].map((method) => (
                    <label
                      key={method.key}
                      className={`flex items-center justify-center p-3 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                        preferredContactMethod === method.key
                          ? 'border-brand-500 bg-orange-50/60 text-brand-800 font-bold shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="contactMethod"
                        value={method.key}
                        checked={preferredContactMethod === method.key}
                        onChange={() => setPreferredContactMethod(method.key as ContactMethod)}
                        disabled={submitting}
                        className="sr-only"
                      />
                      <span>{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => {
                      setConsentGiven(e.target.checked);
                      if (fieldErrors.consent) setFieldErrors({ ...fieldErrors, consent: '' });
                    }}
                    disabled={submitting}
                    className="mt-1 w-4 h-4 rounded text-brand-600 border-gray-300 focus:ring-brand-500"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    ข้าพเจ้ายินยอมให้ประมวลผลข้อมูลตัวอย่างนี้เพื่อวัตถุประสงค์ในการสาธิตและทดสอบระบบ OrangeCare Insurance Demo เท่านั้น และรับทราบว่านี่มิใช่การทำสัญญาประกันภัยจริง (<a href="/privacy" target="_blank" rel="noreferrer" className="text-brand-600 underline font-medium">อ่านนโยบายข้อมูลตัวอย่าง</a>) <span className="text-red-500">*</span>
                  </span>
                </label>
                {fieldErrors.consent && (
                  <p className="text-xs text-red-600 font-medium mt-1.5 pl-7">{fieldErrors.consent}</p>
                )}
              </div>

              {/* Submit CTA Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>กำลังบันทึกข้อมูลตัวอย่าง...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>ส่งคำขอรับคำปรึกษาฟรี (ตัวอย่าง)</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>ระบบจำลองการทำงาน ข้อมูลจะถูกบันทึกสู่ฐานข้อมูลภายในเครื่องสำหรับการทดสอบเท่านั้น</span>
                </p>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
