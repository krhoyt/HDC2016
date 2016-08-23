var TTS = ( function() {

    // Private
    var content = null;
    var current = null;
    var voices = null;
    var xhr = null;
    
    // Have Watson say something
    var say = function( dialog ) {
        // Debug
        console.log( 'Requesting token ...' );        
        
        // Store for reference
        content = dialog;
        
        // Get token
        xhr = new XMLHttpRequest();
        xhr.addEventListener( 'load', doTokenLoad );
        xhr.open( 'GET', '/tts/token', true );
        xhr.send( null );    			           
    };
    
    // Got TTS token for playback
    var doTokenLoad = function() {
        // Debug
        // console.log( xhr.responseText );
        console.log( 'Token retrieved.' );  
        console.log( 'Synthesizing: ' + content );

        /*
         * TODO: Synthesize speech
         */

        // Clean up
        xhr.removeEventListener( 'load', doTokenLoad );
        xhr = null;        
    };    
    
    // Available voices load
    // Store for reference
    var doVoicesLoad = function() {
        // Parse JSON
        // Store voices for reference
        voices = JSON.parse( xhr.responseText );
        
        // Debug
        console.log( voices );
        
        // Clean up
        xhr.removeEventListener( 'load', doVoicesLoad );
        xhr = null;
    };
    
    // Get list of available voices
    var getVoices = function() {
        return voices;    
    };

    // Get the current voice
    var getCurrent = function() {
        return current;    
    };    
    
    // Set the current voice
    var setCurrent = function( name ) {
        current = name;    
    };
    
    /*
     * TODO: Get voices
     */
    // Initial load of various voices
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doVoicesLoad );
    xhr.open( 'GET', '/tts/voices', true );
    xhr.send( null );
    
    // Debug
    console.log( 'Text-To-Speech' );
    
    // Default voice
    current = 'en-US_MichaelVoice';
        
    // Pointers
    return {
        getCurrent: getCurrent,        
        setCurrent: setCurrent,
        
        getVoices: getVoices,
        say: say
    };
    
} )();
