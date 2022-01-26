const FIFO = require('fifo-js')
const fifo = new FIFO('/tmp/dialer')
const mysql = require('mysql');
const fs = require('fs');
require('dotenv').config()

const connection = mysql.createConnection({
  host     : process.env.host,
  user     : process.env.user,
  password : process.env.password,
  database : process.env.database
});

fifo.setReader(sql => {
    sql = sql.trim();
    console.log( `Receive: ${sql}` )

    process( sql ) 
})

const process = async ( sql ) => {
    return new Promise((resolve, reject) => {
        try {
            console.log( `xx`, sql)
            if( sql === "" ) {
                throw `Void`;
            }
            connection.query(`${sql}`, function (error, results, fields) {
                if (error) throw error;
                fs.appendFileSync('/tmp/fifo.log', `Processed: ${sql}\r\n`);
                resolve(true);
            });
        } catch (error) {
            console.log(error);
            console.log( `Error: ${sql}` )
            fs.appendFileSync('/tmp/fifo.err', `Error: ${sql}\r\n`);
            console.log( `Msg:`, error )
            resolve(false);
        }
    })
}

