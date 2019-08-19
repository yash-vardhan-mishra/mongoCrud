const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const dbname = 'crud_mongodb';
const url = 'mongodb://localhost:27017'; //default location where mongodb will be located on our machine
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const state = {
	db: null, //signifies that we do not have a database yet
};

const connect = cb => {
	//create a function to create connection b/w node.js and mongodb server
	if (state.db) cb();
	// if there is a database connection callback cb() is called
	else {
		//if there isn't a connection we'll be using a mongoClient to connect to database
		MongoClient.connect(url, mongoOptions, (err, client) => {
			if (err) cb(err);
			//error passed to the callback
			else {
				state.db = client.db(dbname); //if no error we set the state and call our callback cb()
				cb();
			}
		});
	}
};
const getPrimaryKey = _id => {
	return ObjectID(_id); //id of the document is passed to the method which will return objectID object which will be used to query the database by primary key
};

const getDB = () => {
	// method to get the database
	return state.db;
};

module.exports = { getDB, connect, getPrimaryKey };
