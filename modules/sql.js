const mysql = require('mysql');
module.exports.sqlconnect = function () {
    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        database: "users",
        password: ""
    });
    
    connection.connect();

    return connection;
}