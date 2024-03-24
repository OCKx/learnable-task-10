const { MongoClient } = require('mongodb');

let dbConnection;

module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect(process.env.MONGOURL)
        .then((client) => {
            dbConnection = client.db();
            console.log("connected successfully");
            return cb()
        })
        .catch((err) => {
            console.log(err);
            console.log('cannot connect.....');
            return cb(err)
        })
    },
    getDb: () => dbConnection
}