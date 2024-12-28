const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
    username: process.env.USERNAME,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    dialect: 'postgres', 
  });
  
  module.exports = sequelize;