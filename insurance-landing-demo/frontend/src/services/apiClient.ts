import {
  Plan,
  Lead,
  LeadSubmissionRequest,
  ApiResponse,
  LeadStatus,
  InsuranceRates,
  IndexLinkedPlansResponse,
  IndexLinkedQuote,
  IndexLinkedQuoteRequest,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || `คำขอล้มเหลว (รหัสสถานะ ${response.status})`;
        const error = new Error(errorMsg);
        (error as any).errors = data.errors || [errorMsg];
        (error as any).status = response.status;
        throw error;
      }

      return data;
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const networkErr = new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่ (http://localhost:3000)');
        (networkErr as any).errors = ['ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้ กรุณาตรวจสอบว่าได้เปิดเซิร์ฟเวอร์ด้วยคำสั่ง `npm run dev` ในโฟลเดอร์ backend แล้ว'];
        throw networkErr;
      }
      throw err;
    }
  }

  /**
   * Fetch demo insurance plans
   */
  async getPlans(): Promise<Plan[]> {
    const res = await this.request<Plan[]>('/plans');
    return res.data || [];
  }

  /**
   * Fetch single demo plan by ID
   */
  async getPlanById(id: number): Promise<Plan | null> {
    const res = await this.request<Plan>(`/plans/${id}`);
    return res.data || null;
  }

  /**
   * Fetch calculator rates stored in MySQL
   */
  async getInsuranceRates(): Promise<InsuranceRates> {
    const res = await this.request<InsuranceRates>('/rates');
    if (!res.data) {
      throw new Error('ไม่พบข้อมูลอัตราเบี้ยจากฐานข้อมูล');
    }
    return res.data;
  }

  /**
   * Fetch the index linked savings plans (25/7 and 25/15) with their
   * yearly schedule and the index growth scenarios stored in MySQL
   */
  async getIndexLinkedPlans(): Promise<IndexLinkedPlansResponse> {
    const res = await this.request<IndexLinkedPlansResponse>('/index-linked/plans');
    if (!res.data) {
      throw new Error('ไม่พบข้อมูลแผนประกันสะสมทรัพย์อินเด็กซ์ลิงก์จากฐานข้อมูล');
    }
    return res.data;
  }

  /**
   * Calculate the 25-year projection table of an index linked plan
   */
  async calculateIndexLinkedQuote(payload: IndexLinkedQuoteRequest): Promise<IndexLinkedQuote> {
    const res = await this.request<IndexLinkedQuote>('/index-linked/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.data) {
      throw new Error('ไม่พบผลการคำนวณตารางผลประโยชน์จากเซิร์ฟเวอร์');
    }
    return res.data;
  }

  /**
   * Submit lead consultation request
   */
  async submitLead(payload: LeadSubmissionRequest): Promise<ApiResponse<any>> {
    return await this.request<any>('/leads', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Fetch leads for Admin page
   */
  async getLeads(params?: { search?: string; status?: string }): Promise<{ leads: Lead[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status && params.status !== 'all') query.append('status', params.status);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await this.request<Lead[]>(`/leads${queryString}`);

    return {
      leads: res.data || [],
      total: res.pagination?.total ?? (res.data ? res.data.length : 0),
    };
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(id: number, status: LeadStatus): Promise<ApiResponse<any>> {
    return await this.request<any>(`/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Delete lead (with explicit confirmation)
   */
  async deleteLead(id: number): Promise<ApiResponse<any>> {
    return await this.request<any>(`/leads/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Check backend & database health
   */
  async checkHealth(): Promise<any> {
    return await this.request<any>('/health');
  }
}

export const apiClient = new ApiClient();
