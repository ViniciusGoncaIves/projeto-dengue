const { Pool } = require('pg');
const fs = require('fs');

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
  query: (sql, params) => pool.query(sql, params)
};
