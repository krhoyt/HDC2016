var express = require( 'express' );
var request = require( 'request' );

var WATSON_STREAM = 'https://stream.watsonplatform.net/authorization/api/v1/token';

// Router
var router = express.Router();

// Access token
router.get( '/token', function( req, res ) {
	var hash = null;
	
    // Authentication
    // HTTP Basic
	hash = new Buffer( 
		req.config.tts.username + 
		':' + 
		req.config.tts.password
	).toString( 'base64' );
	
    // Request token
	request( {
		method: 'GET',
		url: WATSON_STREAM + '?url=' + req.config.tts.url,	
		headers: {
			'Authorization': 'Basic ' + hash
		}
	}, function( err, result, body ) {
		res.send( body );
	} );
} );

// Test
router.get( '/test', function( req, res ) {
	res.json( {watson: 'Text-to-Speech'} );
} );
	
// Export
module.exports = router;
