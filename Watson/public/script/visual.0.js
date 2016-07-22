var Visual = ( function() {

    // Private
    var subscribers = null;
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
    var recognize = function( object ) {
        var form = null;
        
        // Debug
        console.log( 'Uploading file ...' );
        
        /*
         * TODO: Form data for upload
         */
        // Build multipart form
        form = new FormData();
        form.append( 'attachment', object );
        
        /*
         * Upload file
         */
        // Submit form for processing
        xhr = new XMLHttpRequest();
        xhr.addEventListener( 'load', doRecognizeLoad );
        xhr.open( 'POST', '/visual/recognition' );
        xhr.send( form );        
    };
    
    // Response from Visual Recognition
    var doRecognizeLoad = function() {
        var data = null;
        
        // Parse JSON
        data = JSON.parse( xhr.responseText );
        
        /*
         * TODO: Explore resulting data
         */
        // Debug
        console.log( data );
        console.log( data.images[0].classifiers[0].classes[0].class );        
        
        /*
         * TODO: Emit image subject matter
         */
        // Emit event with results
        emit( Visual.RECOGNIZE, {
            subject: data.images[0].classifiers[0].classes[0].class
        } );
        
        // Clean up
        xhr.removeEventListener( 'load', doRecognizeLoad );
        xhr = null;
    };
    
    // Debug
    console.log( 'Visual Recognition' );
    
    // Pointers
    return {
        RECOGNIZE: 'visual_recognize',
        
        on: on,
        recognize: recognize
    };

} )();
