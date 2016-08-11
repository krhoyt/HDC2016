var History = ( function() {

    // Constants
    var FULL = 'history_full';
    var PARTIAL = 'history_partial';
    
    // Private
    var history = null;
    var xhr = null;

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
    xhr.open( 'GET', 'http://visual.mybluemix.net/hdc/chat', true );
    xhr.send( null );    
    
    // Reveal
    return {
        FULL: FULL,
        PARTIAL: PARTIAL,
        create: create,
        mode: mode
    };

} )();
