var transcription;
var watson;
var xhr;

// Token retrieved
function doTokenLoad() {
	// Debug
    // console.log( xhr.responseText );
	console.log( 'Token retrieved.' );
    
	// Start stream to Watson
	watson = WatsonSpeech.SpeechToText.recognizeMicrophone( {
		continuous: false,
		token: xhr.responseText
	} );
	watson.setEncoding( 'utf8' );
	watson.on( 'data', doWatsonData );
	watson.on( 'error', doWatsonError );
	watson.on( 'end', doWatsonEnd );

	// Clean up
    xhr.removeEventListener( 'load', doTokenLoad );
    xhr = null;
}    

// Start the process of transcription
function doButtonClick() {
	// Debug
	console.log( 'Button clicked.' );
	
	// Debug
	console.log( 'Requesting token ...' );
		
	// Get token
	xhr = new XMLHttpRequest();
	xhr.addEventListener( 'load', doTokenLoad );
	xhr.open( 'GET', 'http://0.0.0.0:6006/stt/token', true );
	xhr.send( null );    			
}

// Transcription from Watson
function doWatsonData( data ) {
	// Debug
	console.log( data );
	
	// Store globally for reuse
	transcription = data;
}	

// Stream ended
// Good place for follow-up actions
function doWatsonEnd() {
	// Debug
	console.log( 'Stream ended.' );
}

// Fail
function doWatsonError( err ) {
	// Debug
	console.log( 'Error.' );
	console.log( err );
}
	
// Window loaded
function doWindowLoad() {
	var button = null;
	
	// Event to start transcribing
	button = document.querySelector( 'button' );
	button.addEventListener( 'click', doButtonClick );
}    
    
// Go
window.addEventListener( 'load', doWindowLoad );    
