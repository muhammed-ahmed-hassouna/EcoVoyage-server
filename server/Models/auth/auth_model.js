const db = require("../../Models/config/db");


const getUserByEmail = async (email) => {
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const user = await db.query(userQuery, [email]);
    return user.rows[0];
  };
  
  const createUser = async ({ first_name, last_name, email, picture }) => {
    const role_id = 1;
    // const created_at = new Date();
    const password = "No Access";
    // const phone = "00000000";
    const country = "No Access";
    const query = `
      INSERT INTO users (first_name,last_name, email, password, country, role_id, profileimage) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`;
  
    const values = [
      first_name,
  
      last_name,
  
      email,
  
      password,
  
      country,
      // phone,
      role_id,
      // created_at,
      picture,
    ];
    const user = await db.query(query, values);
    return user.rows[0];
  };

module.exports = {
    getUserByEmail,
    createUser,
}