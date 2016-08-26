var PATH = 'ws://' + ROOT_PATH + '/ws/chat';

var client = null;
var color = null;
var input = null;
var list = null;
var placeholder = null;
var socket = null;

function send( message ) {
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

// Focus removed from message input
function doInputBlur() {
    // Reset if no existing message
    if( input.innerHTML.trim().length == 0 ) {
        input.classList.add( 'placeholder' );            
        input.innerHTML = placeholder;
    }    
};

// Message input receives focus
function doInputFocus() {
    // Remove styling
    input.classList.remove( 'placeholder' );

    // Clear if no existing message
    if( input.innerHTML.trim() == placeholder ) {
        input.innerHTML = '';
    }
};

// Key press on editable element
// Watch for <Enter> key to send
function doInputKey( event ) {
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

// Received message from 
function doSocketMessage( message ) {
    var data = null;
    var element = null;    

    // Parse incoming data
    data = JSON.parse( message.data );

    // Debug    
    console.log( data );    
    
    // Create chat message
    element = document.createElement( 'div' );
    element.style.color = data.color;
    element.innerHTML = data.text;
    element.setAttribute( 'data-client', data.client );        

    // Add to history
    list.appendChild( element );
};

// Connected to WebSocket server
// Enable message input
function doSocketOpen() {
    // Debug
    console.log( 'Socket open.' );

    // Make input editable
    input.contentEditable = true;
};

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

// Reference for message history
// Only messages since joining
list = document.querySelector( '.history' );

// Capture for reference
placeholder = input.innerHTML;

// Initialize
socket = new WebSocket( PATH );
socket.addEventListener( 'open', doSocketOpen );
socket.addEventListener( 'message', doSocketMessage );
