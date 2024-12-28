const knex = require("../../Models/config/knexConfig");

const getUserByIdQuery = `
    SELECT * FROM users 
    WHERE 
        is_deleted = false
        AND user_id = $1`;

const deleteUserQuery = `
    UPDATE users 
    SET 
        is_deleted = true 
    WHERE 
        user_id = $1`;

const updateUserData = async (user_id, userData) => {
  try {
    const result = await knex("users")
      .where("user_id", user_id)
      .update(userData)
      .returning("*");

    return result[0];
  } catch (error) {
    throw error;
  }
};

const getBookingOfUser = async (user_id) => {
  try {
    const result = await knex("booking")
      .where("user_id", user_id)
      .where("is_shown", true)
      .select(
        "book_id",
        "phone",
        "cost",
        "adults",
        "children",
        "user_id",
        "activities_id",
        "packages_id"
      );
    return result;
  } catch (error) {
    throw error;
  }
};

const getFlightsOfUser = async (user_id) => {
  try {
    const result = await knex("ticketbooking")
      .where("ticketbooking.user_id", user_id)
      .where("ticketbooking.is_shown", true)
      .select(
        "ticketbooking.ticket_id",
        "ticketbooking.ticket_type",
        "ticketbooking.cost",
        "ticketbooking.user_id",
        "ticketbooking.flights_id",
        "flights.depart_date",
        "flights.return_date"
      )
      .join("flights", "ticketbooking.flights_id", "flights.flights_id");

    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getUserByIdQuery,

  deleteUserQuery,

  updateUserData,

  getBookingOfUser,

  getFlightsOfUser,
};
