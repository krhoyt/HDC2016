var Search = ( function() {
    
    // Constants
    var CLEAR = 'search_clear';
    var PATH = 'https://' + ROOT_PATH + '/hdc/chat/search';
    var RESULTS = 'search_results';
    
    // Private
    var button = null;
    var input = null;
    var listeners = null;
    var placeholder = null;    
    var xhr = null;
    
    // Allow external event listeners
    var addEventListener = function( name, callback ) {
        // Create holder if needed
        if( listeners == null ) {
            listeners = [];
        }
        
        // Track listeners
        listeners.push( {
            callback: callback,
            name: name    
        } );
    };
    
    // Send event to listeners
    var emit = function( name, value ) {
        for( var c = 0; c < listeners.length; c++ ) {
            if( listeners[c].name == name ) {
                listeners[c].callback( {
                    data: value,
                    type: name
                } );
            }
        }    
    };    
    
    // Placeholder access methods
    // Get value
    var getPlaceholder = function() {
        return placeholder;
    };
    
    // Set value
    var setPlaceholder = function( value ) {
        // Check for existing message
        // Change placeholder if no message
        if( input.innerHTML.trim() == getPlaceholder() ) {
            input.innerHTML = value;
        }
        
        // Store for reference
        placeholder = value;
    };
    
    var doClearClick = function() {
        // Internal components
        // Clear button
        button.style.visibility = 'hidden';

        // Search content
        input.innerHTML = '';
        input.classList.add( 'placeholder' );            
        input.innerHTML = getPlaceholder();        
        
        // External components
        emit( CLEAR, true );    
    };
    
    // Focus removed from message input
    var doInputBlur = function() {
        // Reset if no existing message
        if( input.innerHTML.trim().length == 0 ) {
            input.classList.add( 'placeholder' );            
            input.innerHTML = getPlaceholder();
            
            // Let external components know
            // Restore history
            emit( CLEAR, true );
        }    
    };
    
    // Message input receives focus
    var doInputFocus = function() {
        // Remove styling
        input.classList.remove( 'placeholder' );
        
        // Clear if no existing message
        if( input.innerHTML.trim() == getPlaceholder() ) {
            input.innerHTML = '';
        }
    };
    
    // Key press on editable element
    // Watch for <Enter> key to send
    var doInputKey = function( event ) {
        // <Enter> key with message to send
        if( event.keyCode == 13 ) {
            // Stop default behavior
            // Default is to insert a break
            event.preventDefault();
            event.stopPropagation();            
            
            // If there is query contents
            if( input.innerHTML.trim().length > 0 ) {
                // Search the database
                xhr = new XMLHttpRequest();
                xhr.addEventListener( 'load', doSearchLoad );
                xhr.open( 'POST', PATH, true );
                xhr.setRequestHeader( 'Content-Type', 'application/json' );
                xhr.send( JSON.stringify( {
                    text: input.innerHTML.trim()
                } ) );                
            }
        }
    };    
    
    // Search results
    var doSearchLoad = function() {
        var data = null;
        var docs = null;
        
        // Parse
        data = JSON.parse( xhr.responseText );
        
        // Debug
        console.log( data );
        
        // Build results
        docs = [];
        
        if( data.rows.length > 0 ) {
            for( var d = 0; d < data.rows.length; d++ ) {
                docs.push( data.rows[d].doc );
            }            
        } else if( data.rows.length == 0 ) {
            docs.push( {
                client: 'hdc_admin',
                color: 'rgb( 255, 0, 0 )',
                text: 'No matches found.'
            } );
        }
        
        // Emit event
        emit( RESULTS, docs );
        
        // Clear button
        button.style.visibility = 'visible';        
        
        // Clean up
        xhr.removeEventListener( 'load', doSearchLoad );
        xhr = null;
    };
    
    // Initialize
    console.log( 'Search' );
    
    // Reference to search input element
    // Configure event listeners
    input = document.querySelector( '.search' );
    input.addEventListener( 'focus', doInputFocus );
    input.addEventListener( 'blur', doInputBlur );
    input.addEventListener( 'keypress', doInputKey );    
    
    // Store provided placeholder
    setPlaceholder( input.innerHTML );    
    
    // Clear button
    button = document.querySelector( '.clear' );
    button.addEventListener( 'click', doClearClick );
    
    // Reveal
    return {
        CLEAR: CLEAR,
        RESULTS: RESULTS,
        addEventListener: addEventListener,
        getPlaceholder: getPlaceholder,
        setPlaceholder: setPlaceholder    
    };

} )();
