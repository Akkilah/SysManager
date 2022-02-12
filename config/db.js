const mysql = require("mysql2");

//initializing mySql connection
const db = mysql.createConnection({
  host: "localhost",
  user: "akkilah",
  password: "adadad",
  database: "EP",
});

module.exports = db;
