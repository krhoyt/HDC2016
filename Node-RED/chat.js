var Chat = ( function() {
        
    // Constants
    var FULL = 'chat_full';
    var MESSAGE = 'chat_message';
    var PARTIAL = 'chat_partial';
    var PATH = 'ws://localhost:1880/ws/chat';
    var TOKEN = 'http://localhost:1880/hdc/token';
    
    // Private
    var client = null;
    var color = null;
    var input = null;
    var listeners = null;
    var microphone = null;
    var placeholder = null;
    var socket = null;
    var watson = null;
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
    
    // Basic layout control
    // Manages width to show search results
    var mode = function( value ) {
        if( value == FULL ) {
            input.style.right = '10px';
            microphone.style.right = '16px';
        } else if( value == PARTIAL ) {
            input.style.right = '265px';
            microphone.style.right = '271px';
        }
    };
    
    // Send a chat message via WebSocket
    var send = function( message ) {
        if( message == null ) {
            message = input.innerHTML.trim();
        }
        
        // Check for content to send
        if( message.length > 0 ) {
            // Send the message
            socket.send( JSON.stringify( {
                client: client,
                color: color,
                text: message
            } ) );

            // Clear the message
            // Focus remains for more messages
            input.innerHTML = '';                
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
            
            // Send chat message
            send( null );
        }
    };
    
    // Microphone activated
    // Get Watson token
    var doMicrophoneClick = function() {
        // No clicking while recording
        microphone.removeEventListener( 'click', doMicrophoneClick );        
        
        // Hide from view while getting token        
        TweenMax.to( microphone, 0.50,  {
            opacity: 0    
        } );
        
        // Get token
        xhr = new XMLHttpRequest();
        xhr.addEventListener( 'load', doWatsonToken );
        xhr.open( 'GET', TOKEN, true );
        xhr.send( null );
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
        
        // Allow voice transcription
        microphone.style.visibility = 'visible';
        microphone.addEventListener( 'click', doMicrophoneClick );
    };
    
    // Watson authentication token loaded
    // Start listening
    var doWatsonToken = function() {        
        // Place focus on input field
        input.focus();
        
        // Change up microphone icon
        microphone.classList.remove( 'ready' );
        microphone.classList.add( 'recording' );
        
        // Show recording status        
        TweenMax.to( microphone, 0.50, {
            opacity: 1    
        } );
        
        // Start transcription
        watson = WatsonSpeech.SpeechToText.recognizeMicrophone( {
            continuous: false,
            objectMode: true,
            token: xhr.responseText
        } );        
        
        // Transcription events
        watson.setEncoding( 'utf8' );
        watson.on( 'data', doWatsonData );
        watson.on( 'error', doWatsonError );
        watson.on( 'end', doWatsonEnd );          
        
        // Clean up
        xhr.removeEventListener( 'load', doWatsonToken );
        xhr = null;
    };
    
    // Ongoing transcription events
    var doWatsonData = function( data ) {
        input.innerHTML = data.alternatives[data.index].transcript;
    };
    
    // Fail
    var doWatsonError = function( err ) {
        // Debug
        console.log( 'Watson error.' );
        console.log( err );
    };    
    
    // Stream capture ended
    // Move cursor to end of text
    var doWatsonEnd = function() {
        var range = null;
        var selection = null;
        
        // Create text range
        range = document.createRange();
        range.setStart( input.firstChild, input.innerHTML.trim().length );
        range.collapse( true );
        
        // Apply selection using given range
        selection = window.getSelection();                
        selection.removeAllRanges();
        selection.addRange( range );
        
        // Revert microphone to ready
        microphone.classList.remove( 'recording' );
        microphone.classList.add( 'ready' );
        microphone.addEventListener( 'click', doMicrophoneClick );
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
    
    // Reference to microphone element
    // Speech-to-Text
    microphone = document.querySelector( '.microphone' );
    
    // Reference to message input element
    // Configure event listeners
    input = document.querySelector( '.message' );
    input.addEventListener( 'focus', doInputFocus );
    input.addEventListener( 'blur', doInputBlur );
    input.addEventListener( 'keypress', doInputKey );
    
    // Store provided placeholder
    setPlaceholder( input.innerHTML );
    
    // Initialize
    socket = new WebSocket( PATH );
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
