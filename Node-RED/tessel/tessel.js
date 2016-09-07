var jsonfile = require( 'jsonfile' );
var mqtt = require( 'mqtt' );
var tessel = require( 'tessel' );

var blink = null;
var button = null;
var client = null;
var config = null;
var led = null;
var pressed = null;
var state = null;

// LED on pin 1
// Treat as digital output
// Turn off initially
led = tessel.port.B.pin[1];
led.output( 0 );
state = 0;

// Work with button on pin 5
button = tessel.port.B.pin[5];
pressed = false;

// Monitor button pin
bounce = setInterval( function() {
	// Asynchromouns button reading
	// Digital signal (on or off)
	button.read( function( err, value ) {
		// Up (off)
		if( value === 0 ) {
			pressed = false;
		// Down (on)
		} else if( value === 1 ) {
			// Only fire press once
			if( !pressed ) {
				pressed = true;
				
                // Stop blinking
                clearInterval( blink );
                led.output( 0 )
                blink = null;
				
				console.log( 'Pressed.' );
			}
		}
	} );	
}, 100 );

// External configuration
config = jsonfile.readFileSync( __dirname + '/config.json' );

// Connect to Watson IoT
var client  = mqtt.connect( 
	config.iot_host, 
	{
		clientId: config.iot_client,
		username: config.iot_user,
		password: config.iot_password,
		port: config.iot_port
	}
);

// Connected to Watson
// Subscribe for report rate changes
client.on( 'connect', function() {
    // Debug
	console.log( 'Connected.' );
    
    // Subscribe
	client.subscribe( config.topic_blink, function( error, granted ) {
		// Debug
		console.log( 'Subscribed.' );
	} );
} );

// New message arrived
client.on( 'message', function( topic, message ) {
    // Debug
    console.log( 'Message.' );
    
    // Not already blinking
    if( blink == null ) {
        // Start blinking
        blink = setInterval( function() {
            // Toggle LED
            if( state == 0 ) {
                state = 1;
            } else {
                state = 0;
            }
	
            // Control LED
            led.output( state );            
        }, 500 );        
    }
} );
