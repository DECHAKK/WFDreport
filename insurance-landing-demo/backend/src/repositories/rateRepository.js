const { pool } = require('../config/db');

function createAgeRateTable() {
  return { M: [], F: [] };
}

function createWholeLifeRateSet() {
  return {
    10: createAgeRateTable(),
    20: createAgeRateTable(),
    90: createAgeRateTable(),
  };
}

class RateRepository {
  async findAll() {
    const [settingsResult, factorsResult, wholeLifeResult, ci50Result] = await Promise.all([
      pool.query('SELECT setting_key, setting_value FROM calculator_settings'),
      pool.query('SELECT payment_frequency, factor FROM payment_factors'),
      pool.query(`
        SELECT coverage_tier, payment_years, gender, age, rate_per_thousand
        FROM whole_life_rates
        ORDER BY coverage_tier, payment_years, gender, age
      `),
      pool.query(`
        SELECT gender, age, rate_per_thousand
        FROM ci50_rates
        ORDER BY gender, age
      `),
    ]);

    const settingsRows = settingsResult[0];
    const factorRows = factorsResult[0];
    const wholeLifeRows = wholeLifeResult[0];
    const ci50Rows = ci50Result[0];

    const settings = Object.fromEntries(
      settingsRows.map((row) => [row.setting_key, Number(row.setting_value)]),
    );
    const paymentFactors = Object.fromEntries(
      factorRows.map((row) => [row.payment_frequency, Number(row.factor)]),
    );
    const wholeLife = {
      standard: createWholeLifeRateSet(),
      highCoverage: createWholeLifeRateSet(),
    };
    const ci50 = createAgeRateTable();

    for (const row of wholeLifeRows) {
      const table = wholeLife[row.coverage_tier]?.[row.payment_years];
      if (table && (row.gender === 'M' || row.gender === 'F')) {
        table[row.gender][row.age] = Number(row.rate_per_thousand);
      }
    }

    for (const row of ci50Rows) {
      if (row.gender === 'M' || row.gender === 'F') {
        ci50[row.gender][row.age] = Number(row.rate_per_thousand);
      }
    }

    return {
      highCoverageThreshold: settings.high_coverage_threshold,
      paymentFactors,
      wholeLife,
      ci50,
    };
  }
}

module.exports = new RateRepository();
