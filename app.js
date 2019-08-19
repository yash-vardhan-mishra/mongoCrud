const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const path = require('path');
const db = require('./db');
const collection = 'todo';
const Joi = require('joi');

const schema = Joi.object().keys({
	//basically a blueprint that an object has to follow, basically validation of user input
	todo: Joi.string().required(), //makes sure that the todo which user enters is of type string, and it is required
});
app.get('/', (req, res) => {
	//this get route sends the static HTML file to the user
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/getTodos', (req, res) => {
	// queries the database for todos within our todos collection and it will return it to the user
	db.getDB()
		.collection(collection)
		.find({}) //to find all the documents in our todo collection
		.toArray((err, documents) => {
			if (err) console.log(err);
			else {
				console.log(documents);
				res.json(documents);
			}
		});
});
//update
app.put('/:id', (req, res) => {
	// here the :id is the primary key of the document that we would like to update
	const todoID = req.params.id; //extracting the id from the param in the url, from api request
	const userInput = req.body; //sending the body api data

	db.getDB()
		.collection(collection)
		.findOneAndUpdate(
			{ _id: db.getPrimaryKey(todoID) }, //db.getPrimaryKey ensures that the _id string that we receive from the api request gets treated as a database id object, in this case it is the objectID object
			{ $set: { todo: userInput.todo } },
			{ returnOriginal: false },
			(err, result) => {
				if (err) console.log(err);
				else res.json(result);
			}
		);
});
// create
app.post('/', (req, res, next) => {
	//next is the middleware param
	// takes care of create portion of our crud app
	const userInput = req.body;
	Joi.validate(userInput, schema, (err, result) => {
		if (err) {
			const error = new Error('Invalid Input');
			error.status = 400;
			next(error); //let middleware handle our error
		} else {
			db.getDB()
				.collection(collection)
				.insertOne(userInput, (err, result) => {
					//create a new doc
					if (err) {
						const error = new Error('Failed to insert Todo Document');
						error.status = 400;
						next(error); //let middleware handle our error
					} else
						res.json({
							result: result,
							document: result.ops[0],
							msg: 'successfully inserted todo',
							error: null,
						});
				});
		}
	});
});
//delete
app.delete('/:id', (req, res) => {
	const todoID = req.params.id;

	db.getDB()
		.collection(collection)
		.findOneAndDelete({ _id: db.getPrimaryKey(todoID) }, (err, result) => {
			if (err) console.log(err);
			else res.json(result);
		});
});

//error milddleware

app.use((err, req, res, next) => {
	res.status(err.status).json({
		error: { message: err.message },
	});
});

db.connect(err => {
	if (err) {
		console.log('console unable to connect to database');
		process.exit(1);
	} else {
		app.listen(3000, () => {
			console.log('connected to database, app listening on port 3000');
		});
	}
});
