const mysql = require("mysql");

const host = "localhost"
const database = "fyp"
const user = "root"
const password = "root"
const port = "3306"

var connection = mysql.createConnection({
    host,
    user,
    password,
    port,
    database
})

connection.connect()

module.exports = connection