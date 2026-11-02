const indexLinkedService = require('../services/indexLinkedService');

class IndexLinkedController {
  async getPlans(req, res, next) {
    try {
      const data = await indexLinkedService.getPlans();
      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลแผนประกันสะสมทรัพย์อินเด็กซ์ลิงก์สำเร็จ',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async calculateQuote(req, res, next) {
    try {
      const data = await indexLinkedService.calculateQuote(req.body);
      return res.status(200).json({
        success: true,
        message: 'คำนวณตารางผลประโยชน์สำเร็จ',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IndexLinkedController();
