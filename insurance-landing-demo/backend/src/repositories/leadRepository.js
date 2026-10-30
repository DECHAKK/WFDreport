const { pool } = require('../config/db');

function formatLead(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    insuranceInterest: row.insurance_interest,
    preferredContactMethod: row.preferred_contact_method,
    consentGiven: Boolean(row.consent_given),
    status: row.status,
    isDemo: Boolean(row.is_demo),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class LeadRepository {
  /**
   * Insert a new lead using parameterized SQL
   */
  async create(data) {
    const query = `
      INSERT INTO leads (
        full_name,
        phone,
        email,
        insurance_interest,
        preferred_contact_method,
        consent_given,
        status,
        is_demo
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', 1)
    `;
    const values = [
      data.fullName,
      data.phone,
      data.email || null,
      data.insuranceInterest,
      data.preferredContactMethod,
      data.consentGiven ? 1 : 0,
    ];

    const [result] = await pool.query(query, values);
    return {
      id: result.insertId,
      status: 'pending',
      isDemo: true,
    };
  }

  /**
   * Checks for duplicate submission with the same phone in the past N minutes
   */
  async findRecentByPhone(phone, minutes = 2) {
    const query = `
      SELECT id, full_name, phone, created_at
      FROM leads
      WHERE phone = ?
        AND created_at >= NOW() - INTERVAL ? MINUTE
      ORDER BY id DESC
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [phone, minutes]);
    if (!rows.length) return null;
    return formatLead(rows[0]);
  }

  /**
   * Find leads with optional search (name/phone) and status filter
   */
  async findAll({ search, status, limit = 50, offset = 0 } = {}) {
    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      conditions.push('(full_name LIKE ? OR phone LIKE ?)');
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern);
    }

    if (status && status.trim() !== '' && status !== 'all') {
      conditions.push('status = ?');
      params.push(status.trim());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM leads ${whereClause}`;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const dataQuery = `
      SELECT id, full_name, phone, email, insurance_interest, preferred_contact_method, consent_given, status, is_demo, created_at, updated_at
      FROM leads
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataQuery, [...params, Number(limit), Number(offset)]);

    return {
      leads: rows.map(formatLead),
      total,
      limit: Number(limit),
      offset: Number(offset),
    };
  }

  /**
   * Find lead by ID
   */
  async findById(id) {
    const query = `
      SELECT id, full_name, phone, email, insurance_interest, preferred_contact_method, consent_given, status, is_demo, created_at, updated_at
      FROM leads
      WHERE id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [id]);
    if (!rows.length) return null;
    return formatLead(rows[0]);
  }

  /**
   * Update lead status
   */
  async updateStatus(id, newStatus) {
    const query = `
      UPDATE leads
      SET status = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(query, [newStatus, id]);
    return result.affectedRows > 0;
  }

  /**
   * Delete lead by ID
   */
  async delete(id) {
    const query = `
      DELETE FROM leads
      WHERE id = ?
    `;
    const [result] = await pool.query(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new LeadRepository();
