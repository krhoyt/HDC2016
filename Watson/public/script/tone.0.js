var Tone = ( function() {

    // Private
    var subscribers = null;
    var threshold = null;
    var xhr = null;
    
    // Fire an event
    var emit = function( name, data ) {
        // Debug
        // console.log( 'Visiting: ' + name );
        
        // Notify subscribers
        for( var s = 0; s < subscribers.length; s++ ) {
            if( subscribers[s].name == name ) {
                subscribers[s].callback( data );
            }
        }
    };
        
    // Observer pattern
    // Register event handlers
    var on = function( name, callback ) {
        // Debug
        console.log( 'Register: ' + name );
        
        // Initialize if needed
        if( subscribers == null ) {
            subscribers = [];
        }
        
        // Track listener
        subscribers.push( {
            callback: callback,
            name: name
        } );
    };    
    
    // Use Visual Recognition on an image file
    var analyze = function( content ) {
        // Debug
        console.log( 'Analyzing tone ...' );
        
        /*
         * Send content to Tone Analysis
         */
        // Send content to Watson
        xhr = new XMLHttpRequest();
        xhr.addEventListener( 'load', doAnalyzeLoad );
        xhr.open( 'POST', '/tone/analyze' );
        xhr.setRequestHeader( 'Content-Type', 'application/json' );
        xhr.send( JSON.stringify( {
            content: content    
        } ) );        
    };
    
    // Response from Tone Analysis
    var doAnalyzeLoad = function() {
        var data = null;
        var tones = null;
        
        // Parse JSON
        data = JSON.parse( xhr.responseText );
        
        /*
         * TODO: Explore resulting data
         */
        // Debug
        console.log( data );
        
        // Prepare result
        tones = [];            
        
        /*
         * TODO: Aggregate tones
         */        
        // Aggregate tones
        for( var t = 0; t < data.document_tone.tone_categories[0].tones.length; t++ ) {
            if( data.document_tone.tone_categories[0].tones[t].score >= getThreshold() ) {
                tones.push( data.document_tone.tone_categories[0].tones[t].tone_name );
            }
        }        
        
        /*
         * TODO: Emit discovered tones
         */
        // Emit event with results
        emit( Tone.COMPLETE, {
            tones
        } );
        
        // Clean up
        xhr.removeEventListener( 'load', doAnalyzeLoad );
        xhr = null;
    };        
    
    var getThreshold = function() {
        return threshold;
    };
    
    var setThreshold = function( value ) {
        threshold = value;    
    };    
    
    // Debug
    console.log( 'Tone Analyzer' );
    
    // Default threshold
    setThreshold( 0.50 );    
    
    // Pointers
    return {
        COMPLETE: 'tone_complete',
        
        getThreshold: getThreshold,
        setThreshold: setThreshold,        
        
        on: on,
        analyze: analyze
    };

} )();
