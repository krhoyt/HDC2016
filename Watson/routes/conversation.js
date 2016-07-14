var express = require( 'express' );
var request = require( 'request' );

var MESSAGE = '/message';
var VERSION = '?version=2016-07-11'
var WORKSPACE = '/v1/workspaces/';

// Router
var router = express.Router();

// Access token
router.post( '/intent', function( req, res ) {
	var hash = null;
    var url = null;
    
    // API endpoint
    // Based on workspace ID
    url =
        req.config.conversation.url +
        WORKSPACE + 
        req.config.conversation.workspace +
        MESSAGE + 
        VERSION;
    
    // Authentication
    // HTTP Basic
	hash = new Buffer( 
		req.config.conversation.username + 
		':' + 
		req.config.conversation.password
	).toString( 'base64' );
	
	request( {
		method: 'POST',
		url: url,	
		headers: {
			'Authorization': 'Basic ' + hash
		},
        json: true,
        body: {
            input: {
                text: req.body.text
            }
        }
	}, function( err, result, body ) {
        var data = null;
        
        // Parse data
        data = JSON.parse( body );
        
        // Physical control (IoT)
        if( data.intents[0].intent == 'turn_on' ) {
            
        } else if( data.intents[0].intent == 'turn_off' ) {
            
        }
        
        // Client gets unparsed body content
		res.send( body );
	} );
} );

// Test
router.get( '/test', function( req, res ) {
	res.json( {watson: 'Conversation'} );
} );
	
// Export
module.exports = router;
