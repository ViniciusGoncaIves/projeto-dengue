const { Pool } = require('pg');
const fs = require('fs');
const { logError, sanitizeValue } = require('../utils/logger');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASS,
  port: process.env.POSTGRES_PORT,
  ssl: {
    rejectUnauthorized: true, 
    ca: fs.readFileSync('src/private/prod-ca-2021.crt').toString(),
  },
});

module.exports = {
  query: async (sql, params) => {
    try {
      return await pool.query(sql, params);
    } catch (error) {
      logError('Erro em query PostgreSQL', error);
      console.error(
        '[ERROR] Query PostgreSQL com falha',
        JSON.stringify(
          {
            sql,
            params: sanitizeValue(params),
          },
          null,
          2,
        ),
      );
      throw error;
    }
  }
};
