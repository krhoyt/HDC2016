var cfenv = require( 'cfenv' );
var express = require( 'express' );
var jsonfile = require( 'jsonfile' );
var parser = require( 'body-parser' );

// Read individual settings
var config = jsonfile.readFileSync( __dirname + '/config.json' );

// Application
var app = express();

// Middleware
app.use( parser.json() );
app.use( parser.urlencoded( { 
	extended: false 
} ) );

// Per-request actions
app.use( function( req, res, next ) {
	// Cross domain support
	res.header( 'Access-Control-Allow-Origin', '*' );
	res.header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept' );	
	
	// Configuration
	req.config = config;
	
	// Just keep swimming
	next();
} );

// Static for main files
app.use( '/', express.static( 'public' ) );

// Routes
app.use( '/stt', require( './routes/stt' ) );
app.use( '/conversation', require( './routes/conversation' ) );
app.use( '/tts', require( './routes/tts' ) );
app.use( '/visual', require( './routes/visual' ) );
app.use( '/translate', require( './routes/translate' ) );
app.use( '/alchemy', require( './routes/alchemy' ) );

// Cloud Foundry support
// Bluemix
var env = cfenv.getAppEnv();

// Start server
app.listen( env.port, '0.0.0.0', function() {
	// Debug
	console.log( 'Started on: ' + env.port );
} );
