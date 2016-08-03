var Chat = ( function() {
        
    // Private
    var client = null;
    var color = null;
    var history = null;
    var input = null;
    var placeholder = null;
    var socket = null;
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
    
    // Populates chat history
    var doHistoryLoad = function() {
        var data = null;
        
        // Parse JSON
        data = JSON.parse( xhr.responseText );
        
        // Debug
        console.log( data );
        
        // Create history
        for( var h = 0; h < data.length; h++ ) {
            create( data[h] );
        }
        
        // Clean up
        xhr.removeEventListener( 'load', doHistoryLoad );
        xhr = null;
    }
    
    // Focus removed from message input
    var doInputBlur = function() {
        // Reset if no existing message
        if( input.innerHTML.trim().length == 0 ) {
            input.classList.add( 'placeholder' );            
            input.innerHTML = getPlaceholder();
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
        if( event.keyCode == 13 && input.innerHTML.trim().length > 0 ) {
            
            event.preventDefault();
            event.stopPropagation();
            
            // Send the message
            socket.send( JSON.stringify( {
                client: client,
                color: color,
                text: input.innerHTML.trim(),
                timestamp: Date.now()
            } ) );
            
            // Clear the message
            // Focus remains for more messages
            input.innerHTML = '';
        }
    }
    
    // Received message from 
    var doSocketMessage = function( message ) {
        var data = null;
        
        // Parse incoming data
        data = JSON.parse( message.data );
        
        // Debug    
        console.log( data );
        
        // Create chat message
        create( data );
    };
    
    // Connected to WebSocket server
    // Enable message input
    var doSocketOpen = function() {
        // Debug
        console.log( 'Socket open.' );
    
        // Make input editable
        input.contentEditable = true;
    };
    
    // Debug
    console.log( 'WebSocket' );

    // Unique client identifier
    client = 'hdc_' + Math.round( Math.random() * 1000 );
    
    // Unique client color
    color = 'rgb( ' + 
        Math.round( Math.random() * 255 ) + ', ' +
        Math.round( Math.random() * 255 ) + ', ' +
        Math.round( Math.random() * 255 )        
    ' )';
    
    // Reference to message history element
    history = document.querySelector( '.history' );
    
    // Reference to message input element
    // Configure event listeners
    input = document.querySelector( '.message' );
    input.addEventListener( 'focus', doInputFocus );
    input.addEventListener( 'blur', doInputBlur );
    input.addEventListener( 'keypress', doInputKey );
    
    // Store provided placeholder
    setPlaceholder( input.innerHTML );
    
    // Initialize
    socket = new WebSocket( 'ws://visual.mybluemix.net/ws/chat' );
    socket.addEventListener( 'open', doSocketOpen );
    socket.addEventListener( 'message', doSocketMessage );
    
    // Get history
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doHistoryLoad );
    xhr.open( 'GET', 'http://visual.mybluemix.net/hdc/chat', true );
    xhr.send( null );
    
    // Reveal
    return {
        getPlaceholder: getPlaceholder,
        setPlaceholder: setPlaceholder
    };
    
} )();
