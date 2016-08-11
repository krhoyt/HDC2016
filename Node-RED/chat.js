var Chat = ( function() {
        
    // Constants
    var FULL = 'chat_full';
    var MESSAGE = 'chat_message';
    var PARTIAL = 'chat_partial';
    
    // Private
    var client = null;
    var color = null;
    var input = null;
    var listeners = null;
    var placeholder = null;
    var socket = null;
    
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
    
    var mode = function( value ) {
        if( value == FULL ) {
            input.style.right = '10px';
        } else if( value == PARTIAL ) {
            input.style.right = '265px';
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
        if( event.keyCode == 13) {
            // Stop default behavior
            // Default will insert line break
            event.preventDefault();
            event.stopPropagation();
            
            // Check for content to send
            if( input.innerHTML.trim().length > 0 ) {
                // Send the message
                socket.send( JSON.stringify( {
                    client: client,
                    color: color,
                    text: input.innerHTML.trim()
                } ) );

                // Clear the message
                // Focus remains for more messages
                input.innerHTML = '';                
            }
        }
    };
    
    // Received message from 
    var doSocketMessage = function( message ) {
        var data = null;
        
        // Parse incoming data
        data = JSON.parse( message.data );
        
        // Debug    
        console.log( data );
        
        // Create chat message
        emit( MESSAGE, data );
    };
    
    // Connected to WebSocket server
    // Enable message input
    var doSocketOpen = function() {
        // Debug
        console.log( 'Socket open.' );
    
        // Make input editable
        input.contentEditable = true;
    };
    
    // Initialize
    console.log( 'Chat' );

    // Unique client identifier
    client = 'hdc_' + Math.round( Math.random() * 1000 );
    
    // Unique client color
    color = 'rgb( ' + 
        Math.round( Math.random() * 255 ) + ', ' +
        Math.round( Math.random() * 255 ) + ', ' +
        Math.round( Math.random() * 255 ) +       
    ' )';
    
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
    
    // Reveal
    return {
        FULL: FULL,
        MESSAGE: MESSAGE,        
        PARTIAL: PARTIAL,
        addEventListener: addEventListener,
        getPlaceholder: getPlaceholder,
        setPlaceholder: setPlaceholder,
        mode: mode
    };
    
} )();
