const rateService = require('../services/rateService');

class RateController {
  async getRates(req, res, next) {
    try {
      const rates = await rateService.getInsuranceRates();
      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลอัตราเบี้ยสำหรับเครื่องคำนวณสำเร็จ',
        data: rates,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RateController();
