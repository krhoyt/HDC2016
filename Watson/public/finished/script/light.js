var Light = ( function() {
    
    // Constant
    var IOT_CLIENT = 'd:ts200f:Photon:HDC2016';
    var IOT_SERVER = 'ts200f.messaging.internetofthings.ibmcloud.com';
    var IOT_TOPIC = 'iot-2/cmd/light/fmt/json';
    
    // Private
    var client = null;
    
    // Connected to Watson
    // Subscribe to commands
    var doConnectSuccess = function() {
        // Debug
        console.log( 'Connected to Watson.' );
        
        // Listen for light commands
        client.subscribe( IOT_TOPIC );
    };
    
    // Lost connection to Watson
    var doConnectionLost = function( response ) {
        // Debug
        console.log( response );
    };
    
    // Device command arrived
    var doMessageArrived = function( message ) {
        var data = null;
        
        // Parse JSON
        data = JSON.parse( message.payloadString );
        
        // Debug
        console.log( 'Command arrived.' );
        console.log( data );
        
        if( data.light == true ) {
            document.body.style.backgroundColor = 'white';    
        } else if( data.light == false ) {
            document.body.style.backgroundColor = 'black';                
        }
    };
    
    // Debug
    console.log( 'Light' );
    
    // Instantiate MQTT client
    client = new Paho.MQTT.Client(
        IOT_SERVER, 
        1883, 
        IOT_CLIENT
    );
    
    // Event listeners
    client.onConnectionLost = doConnectionLost;
    client.onMessageArrived = doMessageArrived;
    
    // Connect to Watson
    client.connect( {
        onSuccess: doConnectSuccess,
        userName: 'use-token-auth',
        password: IOT_TOKEN
    } );
    
    // Reveal
    return {};
    
} )();
