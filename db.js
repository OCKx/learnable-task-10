const { MongoClient } = require('mongodb');

let dbConnection;

module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect('mongodb://localhost:27017/hotel')
        .then((client) => {
            dbConnection = client.db();
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