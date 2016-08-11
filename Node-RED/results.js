var Results = ( function() {

    // Private
    var results = null;
    
    // Clear any existing content
    // Likely search results
    var clear = function( hide ) {
        // Remove elements
        while( results.children.length > 0 ) {
            results.children[0].remove();            
        }
        
        // Alternatively hide results
        if( hide ) {
            results.style.visibility = 'hidden';
        }
    };
    
    // Show latest search results
    var show = function( data ) {
        var element = null;        
        
        // Clear old results
        clear( false );
        
        // Build elements
        for( var e = 0; e < data.length; e++ ) {
            element = document.createElement( 'div' );
            element.style.color = data[e].color;
            element.innerHTML = data[e].text;
            element.setAttribute( 'data-client', data[e].client );                    
            
            // Add to listing
            results.appendChild( element );
        }
        
        // Show results
        results.style.visibility = 'visible';
    };
    
    // Initialize
    console.log( 'Results' );

    // Reference to document element
    results = document.querySelector( '.results' );
    
    // Reveal
    return {
        clear: clear,
        show: show
    };
    
} )();
