var History = ( function() {
    
    // Constants
    var FULL = 'history_full';
    var LOAD = 'history_load';
    var PARTIAL = 'history_partial';
    var PATH = 'http://localhost:1880/hdc/chat';
    
    // Private
    var history = null;
    var listeners = null;
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
    
    // Create history line
    var create = function( data ) {
        var element = null;
        
        // Build element
        element = document.createElement( 'div' );
        element.style.color = data.color;
        element.innerHTML = data.text;
        element.setAttribute( 'data-client', data.client );        
                
        // Add to history
        history.appendChild( element );      
        
        // Show last element
        if( history.scrollHeight > history.clientHeight ) {    
            element.scrollIntoView( false );
        }       
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
    
    // Control size of component
    // Show search sidebar
    var mode = function( value ) {
        if( value == FULL ) {
            history.style.right = '10px';
        } else if( value == PARTIAL ) {
            history.style.right = '265px';
        }
    };
    
    // Populates chat history
    var doHistoryLoad = function() {
        var data = null;
        
        // Parse JSON
        data = JSON.parse( xhr.responseText );
        
        // Debug
        console.log( data );
        
        // Chart history
        emit( LOAD, data.rows );
        
        // Create history
        for( var h = 0; h < data.rows.length; h++ ) {
            create( data.rows[h].value );
        }
        
        // Clean up
        xhr.removeEventListener( 'load', doHistoryLoad );
        xhr = null;
    };    
    
    // Initialize
    console.log( 'History' );
    
    // Reference to message history element
    history = document.querySelector( '.history' );    
    
    // Get history
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doHistoryLoad );
    xhr.open( 'GET', PATH, true );
    xhr.send( null );    
    
    // Reveal
    return {
        FULL: FULL,
        LOAD: LOAD,
        PARTIAL: PARTIAL,
        addEventListener: addEventListener,
        create: create,
        mode: mode
    };

} )();
