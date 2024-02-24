'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var expect = require('chai').expect;
var cors = require('cors');
const helmet = require('helmet');

var apiRoutes = require('./routes/api.js');
var fccTestingRoutes = require('./routes/fcctesting.js');
var runner = require('./test-runner');

var app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); // For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/** prevent various malicius attacks*/
app.use(
	helmet({
	  referrerPolicy: { policy: "same-origin" },
	})
);
  
  /** customise default helmet contentSecurityPolicy settings*/
app.use(
	helmet.contentSecurityPolicy({
	  useDefaults: false,
	  directives: {
		defaultSrc: ["https://wuwcrv-3000.preview.csb.app/"],
		scriptSrc: ["'self'", "https://wuwcrv-3000.preview.csb.app/"],
		styleSrc: ["'self'", "https://wuwcrv-3000.preview.csb.app/"],
		connectSrc: ["'self'", "https://wuwcrv-3000.preview.csb.app/"],
	  },
	})
);

// Sample front-end
app.route('/b/:board/')
	.get(function (req, res) {
		res.sendFile(process.cwd() + '/views/board.html');
	});
app.route('/b/:board/:threadid')
	.get(function (req, res) {
		res.sendFile(process.cwd() + '/views/thread.html');
	});

// Index page (static HTML)
app.route('/')
	.get(function (req, res) {
		res.sendFile(process.cwd() + '/views/index.html');
	});

// For FCC testing purposes
fccTestingRoutes(app);

// Routing for API
apiRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
	res.status(404)
		.type('text')
		.send('Not Found');
});

// Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
	console.log('Listening on port ' + listener.address().port);
	if (process.env.NODE_ENV === 'test') {
		console.log('Running Tests...');
		setTimeout(function () {
			try {
				runner.run();
			} catch (e) {
				console.log('Tests are not valid:');
				console.log(e);
			}
		}, 1500);
	}
});

module.exports = app; // for testing