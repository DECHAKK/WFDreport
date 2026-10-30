const rateRepository = require('../repositories/rateRepository');

const GENDERS = ['M', 'F'];
const PAYMENT_YEARS = [10, 20, 90];
const COVERAGE_TIERS = ['standard', 'highCoverage'];
const PAYMENT_FREQUENCIES = ['annual', 'semiAnnual', 'quarterly', 'monthly'];

function assertCompleteAgeTable(table, label) {
  for (const gender of GENDERS) {
    for (let age = 0; age <= 99; age += 1) {
      if (!Number.isFinite(table?.[gender]?.[age]) || table[gender][age] < 0) {
        throw new Error(`ข้อมูลอัตราเบี้ยในฐานข้อมูลไม่ครบถ้วน: ${label}/${gender}/อายุ ${age}`);
      }
    }
  }
}

class RateService {
  async getInsuranceRates() {
    const rates = await rateRepository.findAll();

    if (!Number.isFinite(rates.highCoverageThreshold) || rates.highCoverageThreshold <= 0) {
      throw new Error('ค่าเกณฑ์ทุนประกันขั้นสูงในตารางตั้งค่าเครื่องคำนวณไม่ถูกต้อง');
    }

    for (const frequency of PAYMENT_FREQUENCIES) {
      if (!Number.isFinite(rates.paymentFactors[frequency]) || rates.paymentFactors[frequency] <= 0) {
        throw new Error(`ค่าตัวคูณการชำระเบี้ยไม่ถูกต้อง: ${frequency}`);
      }
    }

    for (const tier of COVERAGE_TIERS) {
      for (const years of PAYMENT_YEARS) {
        assertCompleteAgeTable(rates.wholeLife[tier][years], `${tier}/${years}`);
      }
    }
    assertCompleteAgeTable(rates.ci50, 'CI50');

    return rates;
  }
}

module.exports = new RateService();
