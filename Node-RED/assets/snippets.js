// Add details
var now = new Date();

msg.payload.timestamp = now.getTime(); 
msg.payload.type = 'chat';

return msg;

// Mobile in
// Build chat
var color =
  'rgb( ' + 
  Math.round( Math.random() * 255 ) + ', ' + 
  Math.round( Math.random() * 255 ) + ', ' + 
  Math.round( Math.random() * 255 ) + 
  ' )';

msg.payload = { 
    client: msg.payload.From, 
    color: color, 
    text: msg.payload.Body 
};

// Do not echo back to mobile 
msg.payload.source = 'mobile';

return msg;
