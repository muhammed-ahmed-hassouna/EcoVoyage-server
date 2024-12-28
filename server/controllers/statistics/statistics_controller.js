const db = require("../../Models/config/db");

const statisticsModel = require("../../Models/statistics/statistics_model");
//const getBookingQuery = `SELECT COUNT(*) FROM booking`;

const getBookingCount = async (req, res) => {
  try {
    const result = await statisticsModel.getBookingCount();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getCommentCount = async (req, res) => {
  try {
    const result = await statisticsModel.getCommentCount();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getUserData = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM users WHERE is_deleted = false"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = {
  getBookingCount,

  getCommentCount,

  getUserData,
};
