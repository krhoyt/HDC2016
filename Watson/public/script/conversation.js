// Intent has been found
function doIntentLoad() {
    var data = null;
    
    // Parse JSON response
    data = JSON.parse( xhr.responseText );
    
    // Debug
    console.log( 'Intent retrieved.' );
    console.log( data );
    console.log( data.intents[0].intent );
    console.log( data.output.text[0] );
    
    // Clean up
    // Needs to happen before text-to-speech call
    xhr.removeEventListener( 'load', doIntentLoad );
    xhr = null;    
    
    // ADD: For text-to-speech
    intent = data.output.text[0];
    reply();
    
    // Display dialog response
    TweenMax.to( prompt, 0.50,  {
        opacity: 0,
        onComplete: function() {
            display( data.output.text[0] );
            
            TweenMax.to( prompt, 0.50, {
                opacity: 1    
            } );
        }
    } );
}
