//SERVER DEPENDENCIES
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

//REQUIRE SCHEMA
var History = require('./models/History.js');

//EXPRESS INSTANCE
var app = express();
var PORT = process.env.PORT || 3000;

//MORGAN LOGGING
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));

app.use(express.static('./public'));

//MONGODB CONFIGURATION
mongoose.connect('mongodb://heroku_t7qxgkht:do9lm8a9m72k5pe5762fgk578u@ds019886.mlab.com:19886/heroku_t7qxgkht');
var db = mongoose.connection;

db.on('error', function(err) {
	console.log('Mongoose Error: ', err);
});

db.once('open', function() {
	console.log('Mongoose connection successful.');
});

//ROUTES
app.get('/', function(req, res) {
	res.sendFile('./public/index.html');
})
//Loads single HTML page (with ReactJS) in public/index.html

// This route sends GET requests to retrieve our most recent search data.
// We will call this route the moment our page gets rendered
app.get('/api/saved', function(req, res) {
	History.find({}).sort([['date', 'descending']]).limit(5)
	.exec(function(err, doc) {
		if(err) {
			console.log(err);
		} else {
			res.send(doc);
		}
	})
});
//Components will use this to query MongoDB for all saved articles

app.post('/api/saved', function(req, res) {
	var newHistory = new History({
		title: req.body.title,
		date: req.body.date,
		url: req.body.url
	});

	History.create({'location': req.body.location, 'date': Date.now()}, function(err) {
		if(err) {
			console.log(err);
		} else {
			res.send('Saved Search');
		}
	})
});
//Components will use this to save an article to the database

app.delete('/api/saved/:id', function(req, res) {
	History.find({'_id': req.params.id}).remove()
	.exec(function(err, doc) {
		res.send(doc);
	});
})
//Components will use this to delete a saved article in the database

//LISTENER
app.listen(PORT, function() {
	console.log('App listening on PORT: ' + PORT);
});
