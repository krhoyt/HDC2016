
**Overview**

 - Basic Chat
 - Store History
 - Get History
 - HTTP API
 - Search
 - Analytics
 - Mobile Integration
 - Watson STT
 - Watson IoT

**Basic Chat**

 - WebSocket In (/ws/chat)
 - WebSocket Out (/ws/chat)
 - Change (delete msg._session)
 
**Store History**

 - Parse JSON
 - Add Details

    var now = new Date();

    msg.payload.timestamp = now.getTime();
    msg.payload.type = 'chat';

    return msg;

 - Store History (hdc, insert)

**Get History**

 - HTTP In (GET, /hdc/chat)
 - HTTP Request
	 - GET
	 - https://krhoyt.cloudant.com/hdc/_design/chat/_view/by_timestamp?descending=false
	 - Basic Authentication
	 - 
 - HTTP Out
 - Comment Out (websocket.js)
 - Comment In (history.js, chat.js, hdc.js)

**HTTP API**

 - HTTP In (POST, /hdc/chat)
 - HTTP Out
 - Connect
	 - WebSocket Out
	 - Add Details
	 - HTTP Out
 - Shell (chat.js)

**Search**

 - HTTP In (POST, /hdc/chat/search)
 - Change (set, msg.query, msg.payload.text)
 - HTTP Request
	 - GET
	 - UTF-8 String https://krhoyt.cloudant.com/hdc/_design/chat/_search/by_text?q=text:{{{query}}}&include_docs=true
	 - Basic Authentication
	 - Parsed JSON
 - HTTP Out
 - Comment In (search.js, results.js)
 
**Analytics (Extra Time)**

 - Comment In (analytics.js)

**Mobile Integration**

 - HTTP In (POST, /hdc/mobile)
 - Build Chat

    var color = 'rgb( ' +
      Math.round( Math.random() * 255 ) + ', ' +
      Math.round( Math.random() * 255 ) + ', ' +
      Math.round( Math.random() * 255 ) + ' )';

    msg.payload = {
      client: msg.payload.From,
      color: color,
      text: msg.payload.Body
    };

    // Do not echo back to mobile
    msg.payload.source = 'mobile';

    return msg;

 - Connect
	 - Build Chat -> Add Details
	 - Build Chat -> WebSocket Out
 - Switch (msg.payload.source, is null)
 - Change (set, msg.payload, msg.payload.text)
 - Twilio Out (demo, ###522####)
 - Add Details -> Switch

**Speech-To-Text (Extra Time)**

 - HTTP In (GET, /hdc/token)
 - HTTP Request
	 - GET
	 - https://stream.watsonplatform.net/authorization/api/v1/token?url=https://stream.watsonplatform.net/speech-to-text/api
	 - Basic Authentication
	 - UTF-8 String
 - HTTP Out

**Internet of Things (Extra Time)**

 - Encode JSON
 - IoT Out
	 - API Key
	 - Device Command
	 - Photon
	 - HDC2016
	 - blink
	 - JSON
	 - {"blink": 1}
 - Add Details -> Encode JSON
