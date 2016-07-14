function reply() {
    // Debug
	console.log( 'Requesting token ...' );

	// Get token
	xhr = new XMLHttpRequest();
	xhr.addEventListener( 'load', doTokenReply );
	xhr.open( 'GET', '/tts/token', true );
	xhr.send( null );    			   
}

function doTokenReply() {
	// Debug
    // console.log( xhr.responseText );
	console.log( 'Token retrieved.' );    
    
    // Speak the intent
    WatsonSpeech.TextToSpeech.synthesize( {
        text: intent,
        token: xhr.responseText
    } );
    
    // Clean up
    xhr.removeEventListener( 'load', doTokenReply );
    xhr = null;
}
