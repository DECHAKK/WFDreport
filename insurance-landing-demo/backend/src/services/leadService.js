const leadRepository = require('../repositories/leadRepository');

class LeadService {
  /**
   * Submit a new demo consultation request
   */
  async submitLead(leadData) {
    // Check for duplicate submission within 2 minutes to prevent spam/double-click
    const recent = await leadRepository.findRecentByPhone(leadData.phone, 2);
    if (recent) {
      const err = new Error('ท่านได้ส่งคำขอคำปรึกษาด้วยเบอร์โทรนี้ไปแล้ว กรุณารอสักครู่ก่อนทำรายการใหม่อีกครั้ง');
      err.statusCode = 409;
      err.isOperational = true;
      throw err;
    }

    const created = await leadRepository.create(leadData);
    return {
      id: created.id,
      status: 'pending',
      isDemo: true,
      fullName: leadData.fullName,
      phone: leadData.phone,
    };
  }

  /**
   * Get all leads with filtering & pagination
   */
  async getLeads(filters) {
    return await leadRepository.findAll(filters);
  }

  /**
   * Get single lead by ID
   */
  async getLeadById(id) {
    const lead = await leadRepository.findById(id);
    if (!lead) {
      const err = new Error(`ไม่พบรายการคำขอ #${id}`);
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
    return lead;
  }

  /**
   * Update status of a demo lead
   */
  async updateStatus(id, newStatus) {
    const existing = await leadRepository.findById(id);
    if (!existing) {
      const err = new Error(`ไม่พบรายการคำขอ #${id}`);
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    const updated = await leadRepository.updateStatus(id, newStatus);
    if (!updated) {
      const err = new Error(`ไม่สามารถอัปเดตสถานะรายการคำขอ #${id} ได้`);
      err.statusCode = 500;
      err.isOperational = true;
      throw err;
    }

    return {
      id: Number(id),
      previousStatus: existing.status,
      currentStatus: newStatus,
    };
  }

  /**
   * Delete demo lead
   */
  async deleteLead(id) {
    const existing = await leadRepository.findById(id);
    if (!existing) {
      const err = new Error(`ไม่พบรายการคำขอ #${id}`);
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    await leadRepository.delete(id);
    return { id: Number(id), deleted: true };
  }
}

module.exports = new LeadService();
