const mysql = require('mysql');
module.exports.sqlsend = function (query) {
    
    const {sqlconnect} = require('./sql');
    const connection = sqlconnect();

    connection.query(query, (err, result) => {
        console.log(result);
    });
}