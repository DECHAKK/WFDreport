const { pool } = require('../config/db');

/**
 * Parses coverage_summary if stored as JSON string
 */
function formatPlan(row) {
  if (!row) return null;
  let parsedSummary = row.coverage_summary;
  if (typeof parsedSummary === 'string') {
    try {
      parsedSummary = JSON.parse(parsedSummary);
    } catch {
      // Keep as string if parsing fails
    }
  }
  return {
    id: row.id,
    planName: row.plan_name,
    description: row.description,
    demoPremium: row.demo_premium,
    coverageSummary: parsedSummary,
    isDemo: Boolean(row.is_demo),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class PlanRepository {
  async findAllActive() {
    const query = `
      SELECT id, plan_name, description, demo_premium, coverage_summary, is_demo, is_active, created_at, updated_at
      FROM demo_plans
      WHERE is_active = 1
      ORDER BY id ASC
    `;
    const [rows] = await pool.query(query);
    return rows.map(formatPlan);
  }

  async findById(id) {
    const query = `
      SELECT id, plan_name, description, demo_premium, coverage_summary, is_demo, is_active, created_at, updated_at
      FROM demo_plans
      WHERE id = ? AND is_active = 1
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [id]);
    if (!rows.length) return null;
    return formatPlan(rows[0]);
  }
}

module.exports = new PlanRepository();
