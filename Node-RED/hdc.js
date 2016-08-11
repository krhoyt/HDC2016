var HDC = ( function() {
    
    // Chat message has arrived
    // Display in history listing
    var doChatMessage = function( event ) {
        History.create( event.data );    
    };
    
    // Search field has been cleared
    // Reset UI to hide search results
    var doSearchClear = function( event ) {
        History.mode( History.FULL );
        Chat.mode( Chat.FULL );
        Results.clear( event.data );
    };
    
    // Search results available
    // Adjust UI to show results listing
    // Populate results listing
    var doSearchResults = function( event ) {
        History.mode( History.PARTIAL );
        Chat.mode( Chat.PARTIAL );
        Results.show( event.data );
    };
    
    // Initialize
    console.log( 'HDC' );
    
    // Wire up listeners
    Chat.addEventListener( Chat.MESSAGE, doChatMessage );
    Search.addEventListener( Search.RESULTS, doSearchResults );
    Search.addEventListener( Search.CLEAR, doSearchClear );
    
    // Reveal
    return {
        
    };
    
} )();
