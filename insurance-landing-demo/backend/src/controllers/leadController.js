const leadService = require('../services/leadService');

class LeadController {
  /**
   * POST /api/v1/leads
   */
  async submitLead(req, res, next) {
    try {
      const result = await leadService.submitLead(req.body);
      return res.status(201).json({
        success: true,
        message: 'บันทึกคำขอรับคำปรึกษาตัวอย่างสำเร็จ',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/leads
   */
  async getLeads(req, res, next) {
    try {
      const { search, status, limit, offset } = req.query;
      const result = await leadService.getLeads({
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      });

      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรายการคำขอสำเร็จ',
        data: result.leads,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/leads/:id
   */
  async getLeadById(req, res, next) {
    try {
      const { id } = req.params;
      const lead = await leadService.getLeadById(Number(id));
      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลรายการคำขอสำเร็จ',
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/leads/:id/status
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await leadService.updateStatus(Number(id), status);
      return res.status(200).json({
        success: true,
        message: `อัปเดตสถานะคำขอเป็น ${status} สำเร็จ`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/leads/:id
   */
  async deleteLead(req, res, next) {
    try {
      const { id } = req.params;
      const result = await leadService.deleteLead(Number(id));
      return res.status(200).json({
        success: true,
        message: `ลบรายการคำขอตัวอย่าง #${id} สำเร็จ`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LeadController();
