const planRepository = require('../repositories/planRepository');

class PlanController {
  async getPlans(req, res, next) {
    try {
      const plans = await planRepository.findAllActive();
      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลแผนประกันตัวอย่างสำเร็จ',
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPlanById(req, res, next) {
    try {
      const { id } = req.params;
      const plan = await planRepository.findById(Number(id));
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: `ไม่พบแผนประกันตัวอย่างรหัส #${id}`,
        });
      }
      return res.status(200).json({
        success: true,
        message: 'ดึงข้อมูลแผนประกันตัวอย่างสำเร็จ',
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PlanController();
