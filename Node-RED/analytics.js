var Analytics = ( function() {

    // Constants
    var MILLIS = 86400000;
    
    // Private
    var activity = null;
    
    // Map a value from one range into another range
    // Linear transform
    var map = function( old_value, old_bottom, old_top, new_bottom, new_top ) {
        return ( old_value - old_bottom ) / ( old_top - old_bottom ) * ( new_top - new_bottom ) + new_bottom;
    };
    
    // Extract core pieces of data
    // Used for charting
    var process = function( data ) {
        var bar_element = null;        
        var bar_width = 0;        
        var days = 0;        
        var duration_time = 0;        
        var end_time = 0;        
        var iteration_total = 0;                
        var max_count = 0;        
        var message_count = [];        
        var start_date = null;        
        var start_day = 0;        
        var start_time = 0;

        // Date and time calculations
        start_time = data[0].value.timestamp;
        end_time = data[data.length - 1].value.timestamp;
        duration_time = end_time - start_time;
        days = ( duration_time / MILLIS ) + 1;        
        start_date = new Date( start_time );        
        
        /*
        console.log( start_time );
        console.log( end_time );        
        console.log( duration_time );
        console.log( days );
        console.log( start_date );
        */
        
        // Reset to discreet days
        start_date.setHours( 0 );
        start_date.setMinutes( 0 );
        start_date.setSeconds( 0 );
        start_date.setMilliseconds( 0 );
        start_day = start_date.getTime();
        
        // How many message in each discreet day
        for( var d = 0; d < days; d++ ) {
            for( var v = 0; v < data.length; v++ ) {
                if( data[v].value.timestamp >= ( start_day + ( d * MILLIS ) ) &&
                    data[v].value.timestamp < ( start_day + ( ( d + 1 ) * MILLIS ) ) ) {
                    iteration_total = iteration_total + 1;
                }
            }
            
            message_count.push( iteration_total );
            iteration_total = 0;
        }
        
        // Highest message count
        for( var m = 0; m < message_count.length; m++ ) {
            if( message_count[m] > max_count ) {
                max_count = message_count[m];
            }
        }
        
        // How wide is each bar
        bar_width = ( activity.clientWidth - ( ( message_count.length + 1 ) * 10 ) ) / message_count.length;
        
        /*
        console.log( message_count );
        console.log( max_count );
        console.log( bar_width );
        */
        
        // Build chart
        for( var c = 0; c < message_count.length; c++ ) {
            // Build bar
            bar_element = document.createElement( 'div' );
            bar_element.classList.add( 'bar' );
            bar_element.style.width = bar_width + 'px';
            bar_element.style.height = map( message_count[c], 0, max_count, 0, activity.clientHeight - 2 ) + 'px';
            bar_element.style.left = ( ( c * ( bar_width + 10 ) ) + 10 ) + 'px';
            
            // Place in chart
            activity.appendChild( bar_element );
        }
    };
    
    // Initialize
    console.log( 'Analytics' );
    
    // Get element for chart
    activity = document.querySelector( '.activity' );
    
    // Reveal
    return {
        process: process
    };

} )();
