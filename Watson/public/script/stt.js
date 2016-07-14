var capture;
var intent;
var prompt;
var source;
var transcript;
var watson;
var xhr;

// Display content for user
function display( message ) {
    prompt.innerHTML = message;
}

// Start communicating to Watson
// First step in a chain
// Get authentication token
function speech() {
    // Debug
	console.log( 'Requesting token ...' );

    // Queue to user that something is happening
    // Disable click event until session is over
    TweenMax.to( capture, 0.50, {
        opacity: 0.30    
    } );
    capture.removeEventListener( 'click', doCaptureClick );
    capture.removeEventListener( 'dragover', doCaptureDrag );    
    capture.removeEventListener( 'drop', doCaptureDrop );        
    
	// Get token
	xhr = new XMLHttpRequest();
	xhr.addEventListener( 'load', doTokenSpeech );
	xhr.open( 'GET', '/stt/token', true );
	xhr.send( null );    			    
}

// Start the process of transcription
function doCaptureClick() {
	// Debug
	console.log( 'Button clicked.' );

    // Watson process
    // Get token
    // Transcribe
    speech();
}

// File dragged onto drop zone
function doCaptureDrag( evt ) {
    // Stop default browser behavior    
    evt.stopPropagation();
    evt.preventDefault();
    
    // Prepare to drop
    evt.dataTransfer.dropEffect = 'copy';
    
    // Show user that we are ready
    capture.classList.remove( 'microphone' );
    capture.classList.add( 'file' );
}

// File dropped
// Send to Watson for transcription
function doCaptureDrop( evt ) {
    // Debug
    console.log( 'File(s) dropped.' );
    
    // Stop default browser behavior
    // Which will try to display the content
    evt.stopPropagation();
    evt.preventDefault();
    
    // Store for after we have a token
    source = evt.dataTransfer.files[0];

    // Watson process
    // Get token
    // Transcribe
    speech();
}

// Token retrieved
function doTokenSpeech() {
	// Debug
    // console.log( xhr.responseText );
	console.log( 'Token retrieved.' );
    
    // Hide button until after session
    TweenMax.to( capture, 0.50, {
        opacity: 0
    } );
    
    // Hide message before changing
    TweenMax.to( prompt, 0.50, {
        opacity: 0,
        onComplete: function() {
            // Clear
            prompt.innerHTML = '';
            
            // Change style
            prompt.classList.remove( 'help' );
            prompt.classList.add( 'transcribe' );
            
            // Show
            prompt.style.opacity = 1;
        }
    } );
    
	// Start stream to Watson
    // Either microphone or local file
    if( source == null ) {
        watson = WatsonSpeech.SpeechToText.recognizeMicrophone( {
            continuous: false,
            objectMode: true,
            token: xhr.responseText
        } );
    } else {
        watson = WatsonSpeech.SpeechToText.recognizeFile( {
            data: source,
            token: xhr.responseText
        } );
    }

    // Transcription events
    watson.setEncoding( 'utf8' );
	watson.on( 'data', doWatsonData );
	watson.on( 'error', doWatsonError );
	watson.on( 'end', doWatsonEnd );            

	// Clean up
    xhr.removeEventListener( 'load', doTokenSpeech );
    xhr = null;
}    

// Transcription from Watson
function doWatsonData( data ) {
	// Debug
	console.log( data );
	
	// Store globally for reuse
    if( source == null ) {
        // Copy full object
        transcript = Object.assign( {}, data );
        
        // Display current
        display( transcript.alternatives[transcript.index].transcript );
    } else {
        // Just a string
        transcript = data;
    }
}	

// Stream ended
// Good place for follow-up actions
function doWatsonEnd() {
	// Debug
	console.log( 'Stream ended.' );   
    
    // Isolate result by source
    // Just want raw text at this point
    if( source == null ) {
        transcript = transcript.alternatives[transcript.index].transcript;
    }
    
    // ADD: For conversation intent
    // Determine intent
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doIntentLoad );
    xhr.open( 'POST', '/conversation/intent', true );
    xhr.setRequestHeader( 'Content-Type', 'application/json' );    
    xhr.send( JSON.stringify( {
        text: transcript
    } ) );    
    
    // Debug
    console.log( transcript );
    
    // Show content
    display( transcript );
    
    // Reset to microphone if needed
    if( source != null ) {
        capture.classList.remove( 'file' );
        capture.classList.add( 'microphone' );
    }
    
    // Move button into view
    TweenMax.to( capture, 0.50, {
        opacity: 1
    } );    
    
    // Allow next session
    capture.addEventListener( 'click', doCaptureClick );
    capture.addEventListener( 'dragover', doCaptureDrag );    
    capture.addEventListener( 'drop', doCaptureDrop );        
    
    // Clean up
    source = null;
}

// Fail
function doWatsonError( err ) {
	// Debug
	console.log( 'Error.' );
	console.log( err );
}
	
// Window loaded
function doWindowLoad() {
	// Event to start transcribing
	capture = document.querySelector( 'button.capture' );
	capture.addEventListener( 'click', doCaptureClick );
    
    // Support local file drag-drop    
    capture.addEventListener( 'dragover', doCaptureDrag );
    capture.addEventListener( 'drop', doCaptureDrop );    
    
    // Display messages
    prompt = document.querySelector( '.prompt' );
}    
    
// Go
window.addEventListener( 'load', doWindowLoad );    
