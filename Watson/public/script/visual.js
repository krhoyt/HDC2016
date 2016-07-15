// Watson Visual Recognition
// Upload an image file
function recognize() {
    var form = null;
    
    // Debug
    console.log( 'Uploading file ...' );
    
    // Queue to user that something is happening
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
        }
    } );    
    
    // Disable click event until session is over    
    capture.removeEventListener( 'click', doCaptureClick );
    capture.removeEventListener( 'dragover', doCaptureDrag );    
    capture.removeEventListener( 'drop', doCaptureDrop );            
    
    // Build multipart form
    form = new FormData();
    form.append( 'attachment', source );
    
    // Submit form for processing
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doVisualLoad );
    xhr.open( 'POST', '/visual/recognition' );
    xhr.send( form );
}

function doTokenRecognize() {
	// Debug
    // console.log( xhr.responseText );
	console.log( 'Token retrieved.' );    
    
    // Display result
    display( 'This looks like ' + intent + '.' );
    
    TweenMax.to( prompt, 0.50, {
        opacity: 1   
    } );    
    
    // Speak the intent
    WatsonSpeech.TextToSpeech.synthesize( {
        text: 'This looks like ' + intent + '.',
        token: xhr.responseText
    } );
    
    // Clean up
    xhr.removeEventListener( 'load', doTokenRecognize );
    xhr = null;
}

// Response from Visual Recognition
function doVisualLoad() {
    var data = null;
    
    // Parse JSON
    data = JSON.parse( xhr.responseText );
    
    // Debug
    console.log( data );    
    console.log( data.images[0].classifiers[0].classes[0].class );
    
    // Store for speech
    intent = data.images[0].classifiers[0].classes[0].class;
    
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
    
    // Reset
    xhr.removeEventListener( 'load', doVisualLoad );
    xhr = null;
    
    // Debug
	console.log( 'Requesting token ...' );

	// Get token
	xhr = new XMLHttpRequest();
	xhr.addEventListener( 'load', doTokenRecognize );
	xhr.open( 'GET', '/tts/token', true );
	xhr.send( null );    			       
}
