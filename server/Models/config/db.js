const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.USERE,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.PORT,
  database: process.env.DATABASE
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};



