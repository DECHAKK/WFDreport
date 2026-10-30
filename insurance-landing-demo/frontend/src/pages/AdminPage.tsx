import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Lead, LeadStatus } from '../types';
import { apiClient } from '../services/apiClient';
import { 
  Search, 
  Filter, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  ShieldAlert, 
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Ban,
  Archive
} from 'lucide-react';

const STATUS_LABELS: Record<LeadStatus, string> = {
  pending: 'รอดำเนินการ',
  contacted: 'ติดต่อแล้ว',
  closed: 'ปิดการให้คำปรึกษา',
  cancelled: 'ยกเลิก',
};

const CONTACT_METHOD_LABELS: Record<string, string> = {
  phone: 'โทรศัพท์',
  email: 'อีเมล',
  line: 'ไลน์ (LINE)',
};

export const AdminPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Updating status indicator
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getLeads({
        search: searchTerm,
        status: statusFilter,
      });
      setLeads(res.leads);
      setTotalLeads(res.total);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลคำขอคำปรึกษาได้');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchLeads();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusChange = async (leadId: number, newStatus: LeadStatus) => {
    setUpdatingId(leadId);
    try {
      await apiClient.updateLeadStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
      );
      showToast(`อัปเดตสถานะคำขอ #${leadId} เป็น ${STATUS_LABELS[newStatus] ?? newStatus} สำเร็จ`);
    } catch (err: any) {
      alert(`ไม่สามารถอัปเดตสถานะได้: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.deleteLead(deleteTarget.id);
      setLeads((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      setTotalLeads((prev) => Math.max(0, prev - 1));
      showToast(`ลบรายการคำขอ #${deleteTarget.id} เรียบร้อยแล้ว`);
      setDeleteTarget(null);
    } catch (err: any) {
      alert(`ไม่สามารถลบข้อมูลได้: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>{STATUS_LABELS.pending}</span>
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Phone className="w-3.5 h-3.5" />
            <span>{STATUS_LABELS.contacted}</span>
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{STATUS_LABELS.closed}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            <Ban className="w-3.5 h-3.5" />
            <span>{STATUS_LABELS.cancelled}</span>
          </span>
        );
      default:
        return <span>{STATUS_LABELS[status] ?? status}</span>;
    }
  };

  const getInterestLabel = (interest: string) => {
    const map: { [key: string]: string } = {
      health: 'ประกันสุขภาพ',
      life: 'ประกันชีวิต',
      accident: 'ประกันอุบัติเหตุ',
      savings: 'ประกันสะสมทรัพย์',
      car: 'ประกันรถยนต์',
      other: 'อื่นๆ',
    };
    return map[interest] || interest;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/60">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับสู่หน้าหลัก</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                แดชบอร์ดจัดการคำขอคำปรึกษา (ระบบจัดการตัวอย่าง)
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                ระบบจัดการข้อมูลผู้สนใจ (Leads) สำหรับตรวจสอบและปรับปรุงสถานะการติดต่อ
              </p>
            </div>

            <button
              onClick={fetchLeads}
              className="inline-flex items-center gap-2 bg-white hover:bg-orange-50/50 text-gray-700 font-medium px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm transition-colors shadow-sm self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-500' : ''}`} />
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-4 rounded-xl bg-emerald-500 text-white text-xs sm:text-sm font-medium shadow-lg animate-fadeIn flex items-center justify-between">
              <span>{toastMessage}</span>
              <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">✕</button>
            </div>
          )}

          {/* Admin Security Disclaimer Box */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">คำเตือนด้านความปลอดภัย (สำหรับระบบตัวอย่าง):</p>
              <p className="text-amber-800 leading-relaxed font-normal">
                หน้านี้ถูกจัดทำขึ้นเพื่อการสาธิตระบบเท่านั้น โดยยังไม่ได้เชื่อมต่อกับระบบพิสูจน์และยืนยันตัวตน (เช่น การเข้าสู่ระบบหรือการจัดการสิทธิ์ผู้ใช้งาน) สำหรับการนำไปใช้งานจริงจะต้องติดตั้งสิทธิ์การเข้าถึงอย่างเข้มงวดเพื่อความปลอดภัยของข้อมูล
              </p>
            </div>
          </div>

          {/* Filter and Search Controls */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาด้วยชื่อ หรือ เบอร์โทร..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 flex-shrink-0">
                <Filter className="w-4 h-4" />
                <span>สถานะ:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-48 py-2.5 px-3 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white"
              >
                <option value="all">ทั้งหมด</option>
                <option value="pending">รอดำเนินการ</option>
                <option value="contacted">ติดต่อแล้ว</option>
                <option value="closed">ปิดการให้คำปรึกษา</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-sm font-semibold text-red-800">{error}</p>
              <button
                onClick={fetchLeads}
                className="bg-red-600 text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-red-700"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          )}

          {/* Leads Table Card */}
          {!error && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:px-6 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>
                  รายการคำขอทั้งหมด: <strong className="text-gray-900 font-bold">{totalLeads}</strong> รายการ
                </span>
                <span className="text-gray-400">เรียงตามวันที่ล่าสุด</span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-sm text-gray-500 space-y-3">
                  <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
                  <p>กำลังโหลดข้อมูลคำขอจาก MariaDB/MySQL...</p>
                </div>
              ) : leads.length === 0 ? (
                <div className="p-12 text-center text-gray-500 space-y-3">
                  <Archive className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-base font-semibold text-gray-700">ไม่พบข้อมูลคำขอคำปรึกษา</p>
                  <p className="text-xs text-gray-400">
                    ลองปรับเปลี่ยนคำค้นหา หรือทดลองส่งแบบฟอร์มใหม่จากหน้าแรก
                  </p>
                  <Link
                    to="/#lead-form"
                    className="inline-block mt-2 bg-brand-500 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-brand-600"
                  >
                    ไปที่แบบฟอร์มหน้าแรก
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="py-3.5 px-4">รหัส</th>
                        <th className="py-3.5 px-4">วันที่บันทึก</th>
                        <th className="py-3.5 px-4">ชื่อ-นามสกุล</th>
                        <th className="py-3.5 px-4">ข้อมูลติดต่อ</th>
                        <th className="py-3.5 px-4">แผนที่สนใจ</th>
                        <th className="py-3.5 px-4">สถานะคำขอ</th>
                        <th className="py-3.5 px-4 text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {leads.map((lead) => {
                        const dateFormatted = lead.createdAt
                          ? new Date(lead.createdAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-';

                        return (
                          <tr key={lead.id} className="hover:bg-orange-50/30 transition-colors">
                            {/* ID */}
                            <td className="py-4 px-4 font-mono font-bold text-gray-500">
                              #{lead.id}
                            </td>

                            {/* Date */}
                            <td className="py-4 px-4 text-xs text-gray-500 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <span>{dateFormatted}</span>
                              </div>
                            </td>

                            {/* Name */}
                            <td className="py-4 px-4 font-bold text-gray-900">
                              <div>{lead.fullName}</div>
                              <span className="text-[10px] text-brand-600 bg-orange-50 px-1.5 py-0.5 rounded font-normal">
                                ข้อมูลตัวอย่าง
                              </span>
                            </td>

                            {/* Contact Details */}
                            <td className="py-4 px-4 space-y-1">
                              <div className="flex items-center gap-1.5 font-medium text-gray-900">
                                <Phone className="w-3.5 h-3.5 text-brand-500" />
                                <span>{lead.phone}</span>
                              </div>
                              {lead.email && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{lead.email}</span>
                                </div>
                              )}
                              <span className="text-[11px] text-gray-500 block">
                                ช่องทางสะดวก: <strong className="text-gray-700">{CONTACT_METHOD_LABELS[lead.preferredContactMethod] ?? lead.preferredContactMethod}</strong>
                              </span>
                            </td>

                            {/* Insurance Interest */}
                            <td className="py-4 px-4">
                              <span className="font-medium text-gray-900">
                                {getInterestLabel(lead.insuranceInterest)}
                              </span>
                            </td>

                            {/* Status and Status Dropdown */}
                            <td className="py-4 px-4 space-y-2">
                              <div>{getStatusBadge(lead.status)}</div>
                              <select
                                value={lead.status}
                                disabled={updatingId === lead.id}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                                className="block w-full text-xs py-1 px-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-brand-500 text-gray-700"
                              >
                                <option value="pending">เปลี่ยนเป็น: รอดำเนินการ</option>
                                <option value="contacted">เปลี่ยนเป็น: ติดต่อแล้ว</option>
                                <option value="closed">เปลี่ยนเป็น: ปิดการให้คำปรึกษา</option>
                                <option value="cancelled">เปลี่ยนเป็น: ยกเลิก</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => setDeleteTarget(lead)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                title="ลบรายการคำขอจำลองนี้"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900">ยืนยันการลบข้อมูลคำขอ?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                คุณแน่ใจหรือไม่ว่าต้องการลบคำขอจำลองของ <strong className="text-gray-900">{deleteTarget.fullName}</strong> (รหัส #{deleteTarget.id})? ข้อมูลนี้จะถูกลบออกจากตาราง leads ในฐานข้อมูลอย่างถาวร
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm transition-colors"
              >
                {deleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
