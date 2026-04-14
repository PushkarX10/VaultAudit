/**
 * VaultAudit AI — Database Schema & Migrations
 *
 * Idempotent schema initialisation.  Call `initSchema(db)` on app
 * boot — it creates the tables only if they don't exist yet.
 *
 * PRIVACY: The `raw_text` column stores text that has ALREADY been
 * through the PII masking pipeline.  Original PII is permanently
 * destroyed before it reaches this layer.
 */

/**
 * Initialise the database schema (idempotent).
 *
 * @param {import('@electric-sql/pglite').PGlite} db
 */
export async function initSchema(db) {
  await db.exec(`
    --
    -- transactions: core table for receipt / expense data
    --
    CREATE TABLE IF NOT EXISTS transactions (
      id              SERIAL       PRIMARY KEY,
      date            DATE         NOT NULL DEFAULT CURRENT_DATE,
      amount          NUMERIC(12,2),
      currency        VARCHAR(16),
      raw_text        TEXT,                  -- sanitised OCR output (post-PII mask)
      parsed_category VARCHAR(128),
      ai_audit_flag   VARCHAR(64),           -- e.g. 'impulse_buy', 'subscription', 'normal'
      ai_audit_note   TEXT,                  -- free-form LLM explanation
      source_file     VARCHAR(256),          -- original filename for reference
      created_at      TIMESTAMPTZ  DEFAULT NOW()
    );

    --
    -- Index for common queries: recent transactions sorted by date
    --
    CREATE INDEX IF NOT EXISTS idx_transactions_date
      ON transactions (date DESC);

    --
    -- Index for filtering by audit flag
    --
    CREATE INDEX IF NOT EXISTS idx_transactions_flag
      ON transactions (ai_audit_flag);

    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(16);
  `);

  console.log('[VaultAudit] Schema initialised ✓');
}

/**
 * Insert a fully-processed transaction into the database.
 *
 * @param {import('@electric-sql/pglite').PGlite} db
 * @param {{
 *   date?:           string,
 *   amount:          number | null,
 *   currency?:       string,
 *   rawText:         string,
 *   parsedCategory?: string,
 *   aiAuditFlag?:    string,
 *   aiAuditNote?:    string,
 *   sourceFile?:     string,
 * }} txn
 * @returns {Promise<number>} The inserted row ID
 */
export async function insertTransaction(db, txn) {
  const result = await db.query(
    `INSERT INTO transactions
       (date, amount, currency, raw_text, parsed_category, ai_audit_flag, ai_audit_note, source_file)
     VALUES
       ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      txn.date || new Date().toISOString().slice(0, 10),
      txn.amount,
      txn.currency || null,
      txn.rawText,
      txn.parsedCategory || null,
      txn.aiAuditFlag || null,
      txn.aiAuditNote || null,
      txn.sourceFile || null,
    ],
  );

  return result.rows[0].id;
}

/**
 * Update the AI audit fields on an existing transaction.
 *
 * @param {import('@electric-sql/pglite').PGlite} db
 * @param {number} id
 * @param {{ category: string, flag: string, reason: string }} audit
 */
export async function updateTransactionAudit(db, id, audit) {
  await db.query(
    `UPDATE transactions
        SET parsed_category = $1,
            ai_audit_flag   = $2,
            ai_audit_note   = $3
      WHERE id = $4`,
    [audit.category, audit.flag, audit.reason, id],
  );
}

/**
 * Update the category of an existing transaction manually.
 *
 * @param {import('@electric-sql/pglite').PGlite} db
 * @param {number} id
 * @param {string} category
 */
export async function updateTransactionCategory(db, id, category) {
  await db.query(
    `UPDATE transactions
        SET parsed_category = $1
      WHERE id = $2`,
    [category, id],
  );
}

/**
 * Fetch all transactions ordered by date descending.
 *
 * @param {import('@electric-sql/pglite').PGlite} db
 * @returns {Promise<Array>}
 */
export async function getAllTransactions(db) {
  const result = await db.query(
    `SELECT * FROM transactions ORDER BY date DESC, id DESC`,
  );
  return result.rows;
}

// ── Dashboard Aggregate Queries ─────────────────────────────

/**
 * Get aggregate stats for the dashboard hero cards.
 * Returns: totalAmount, transactionCount, alertCount
 */
export async function getTransactionStats(db) {
  const result = await db.query(`
    WITH DominantCurrency AS (
      SELECT currency FROM transactions WHERE currency IS NOT NULL GROUP BY currency ORDER BY COUNT(*) DESC LIMIT 1
    )
    SELECT
      COALESCE(SUM(amount), 0)::numeric AS total_amount,
      COUNT(*)::int AS transaction_count,
      COUNT(*) FILTER (
        WHERE ai_audit_flag IN ('impulse_buy', 'hidden_subscription', 'suspicious')
      )::int AS alert_count,
      (SELECT currency FROM DominantCurrency) AS dominant_currency
    FROM transactions
    WHERE currency = (SELECT currency FROM DominantCurrency) OR (SELECT currency FROM DominantCurrency) IS NULL OR currency IS NULL
  `);
  return result.rows[0] || { total_amount: 0, transaction_count: 0, alert_count: 0, dominant_currency: null };
}

/**
 * Get spending breakdown by category for the donut chart.
 */
export async function getCategoryBreakdown(db) {
  const result = await db.query(`
    WITH DominantCurrency AS (
      SELECT currency FROM transactions WHERE currency IS NOT NULL GROUP BY currency ORDER BY COUNT(*) DESC LIMIT 1
    )
    SELECT
      COALESCE(parsed_category, 'Uncategorized') AS name,
      COALESCE(SUM(amount), 0)::numeric AS amount
    FROM transactions
    WHERE amount IS NOT NULL AND amount > 0
      AND (currency = (SELECT currency FROM DominantCurrency) OR (SELECT currency FROM DominantCurrency) IS NULL OR currency IS NULL)
    GROUP BY parsed_category
    ORDER BY amount DESC
  `);
  return result.rows;
}

/**
 * Get monthly spending totals for the bar chart.
 */
export async function getMonthlySpend(db) {
  const result = await db.query(`
    WITH DominantCurrency AS (
      SELECT currency FROM transactions WHERE currency IS NOT NULL GROUP BY currency ORDER BY COUNT(*) DESC LIMIT 1
    )
    SELECT
      TO_CHAR(date, 'Mon YY') AS month,
      COALESCE(SUM(amount), 0)::numeric AS spend
    FROM transactions
    WHERE amount IS NOT NULL
      AND (currency = (SELECT currency FROM DominantCurrency) OR (SELECT currency FROM DominantCurrency) IS NULL OR currency IS NULL)
    GROUP BY TO_CHAR(date, 'Mon YY'), DATE_TRUNC('month', date)
    ORDER BY DATE_TRUNC('month', date) ASC
    LIMIT 12
  `);
  return result.rows;
}

/**
 * Get the N most-recent transactions for the insights feed.
 */
export async function getRecentTransactions(db, limit = 3) {
  const result = await db.query(
    `SELECT * FROM transactions ORDER BY created_at DESC LIMIT $1`,
    [limit],
  );
  return result.rows;
}

/**
 * Delete all transaction data (vault purge).
 */
export async function purgeAllData(db) {
  await db.exec('DELETE FROM transactions');
}

