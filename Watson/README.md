Watson Workshop
===============

 1. Overview
	 2. What you will learn
		 3. Speech-To-Text
		 4. Text-To-Speech
		 5. Conversation
		 6. Visual Recognition
		 7. Translation
		 8. Concept Extraction
		 9. Tone Analysis
		 10. *Internet of Things*
	 11. Demo application
 12. Speech-To-Text (STT)
	 13. Authentication (Client)
	 14. Authentication (Server)
	 15. Audio Capture
	 16. Capture Events
	 17. Interim Results
	 18. Final Results
 19. Text-To-Speech (TTS)
	 20. Voices (Client)
	 21. Voices (Server)
	 22. Speech Synthesis
 23. Conversation
	 24. Tooling
		 25. Intents
		 26. Entities
		 27. Dialog
	 28. Request Intent (Client)
	 29. Request Intent (Server)
	 30. TTS Response (Dialog)
	 31. *Intent to Watson IoT (Server)*
	 32. *Multistep Dialog*
 33. Visual Recognition
	 34. Multipart Forms with XHR2
	 35. Upload Image (Client)
	 36. Upload Image (Server)
	 37. TTS Response (Subject Matter)
	 38. *Custom Classifier*
 39. Translation
	 40. Language Support (Client)
	 41. Language Support (Server)
	 42. Translation (Client)
	 43. Translation (Server)
	 44. *Identify Language*
 45. Concept Extraction
	 46. Isolate Target URL
	 47. Send URL to Watson (Server)
	 48. Aggregate Concepts (Only)
 49. Tone Analysis
	 50. Reading Local Files
	 51. Send Document Content (Client)
	 52. Send Document Content (Server)
 53. Personality Insight
	 54. Send Document Content (Server)
	 55. Aggregate and Sort Results
 53. Internet of Things
	 54. Devices
	 55. Application Access
	 56. Authentication
	 57. Client Identification
	 58. Topic Construction
	 59. Publish to Topic
	 60. Subscribe to Topic

Overview
========

What You Will Learn
-------------------

**Speech-To-Text**

Speech-to-Text bridges the gap between the spoken word and its written form. You will use machine intelligence to generate an accurate transcription. Transcription will use continuous audio (WebSocket) as well as file upload. The entire application leverages voice interactivity, and nothing will be typed to Watson.

**Text-To-Speech**

Text-to-Speech provides a REST API to synthesize speech audio from plain text. Any response from Watson in the example application will be spoken using this service.

**Conversation**

The Conversation services allows you to train and build a bot. The system allows you to define intents and entities, and to control dialog flow. Commonly used for chatbot services, the example application will also explore Internet of Things application.

**Visual Recognition**

Visual Recognition allows your application to understand the contents of an image. The service returns scores for relevant classifiers, representing things such as objects, events, and settings. You can also train your own classifier to design custom image recognition pertinent to your business.

**Translation**

The Language Translation service utilizes Statistical Machine Translation to translate content in multiple language. A string of text to be translated is provided, with a result in a specified language.

**Concept Extraction**

Concept extraction is a part of a broader service called, AlchemyLanguage. AlchemyLanguage uses natural language processing to provide text analysis. The results can provide an understanding of sentiment, keywords, entities, high-level concepts, and more. You will provide a URL to the service. The document at the URL will be processed, and the resulting data provided to the example application.

**Tone Analysis**

We have all experienced an email or text message that was not interpreted the way we expected. Tone Analysis allows you to perform a linguistics analysis to detect emotion, social tendencies, and language style. Emotions include anger, fear, joy, sadness, and disgust. Personality traits include conscientiousness, extroversion, agreeableness, and emotional range. Language styles include confident, analytical, and tentative. You will provide a text document to the service and display the results.

**Personality Insights**

How well do you know your customers? Do you know what drives them to visit your site? Buy your products? Who is the best match to be recruited at your company? Who might be the best fit for university admissions? Can we optimize the placement of criminals in jail to avoid physical confrontation? Knowing something about who we are gives your application tremendous power.

**Internet of Things**

Watson IoT allows you to securely connect and manage devices, and analyze data. Unlike the language-oriented features of the rest of this workshop, Watson IoT centers around "big data" analysis. The concepts behind big data analysis are beyond the scope of this workshop. Time/interest permitting, a basic introduction to the core concepts will be demonstrated.

Speech-To-Text (STT)
====================

In this section you will learn to authenticate API requests for Watson Speech-To-Text. You will then leverage the Watson Speech JavaScript library to capture audio. While the audio is being processed, events will be surfaced that will be captured and displayed as necessary. A transcript will be displayed for the the final results of the audio (microphone) capture. You will also learn how to upload a pre-recorded audio file for processing (sessionless).

Authentication (Client)
-----------------------

Before we can use the STT service, we need to get an authentication token from it first. To do this we will use XHR from the client, to our server. The server will keep our credentials away from the visibility of the client. This is a pattern used throughout this demonstration application.

    // Get token
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doTokenLoad );
    xhr.open( 'GET', SERVER_PATH + 'stt/token', true );
    xhr.send( null ); 

Authentication (Server)
-----------------------

Getting an authentication token at the server requires that we use our service credentials for HTTP Basic Authorization. The username and password for each Watson service is different. We want to keep these away from the client. A GET request against Watson STT token generation, will result in a string with the corresponding token. Tokens are good for one hour, but we will renew the token with each STT operation.

    // Access token
    router.get( '/token', function( req, res ) {
      var hash = null;
	
      // Authentication
      // HTTP Basic
      hash = new Buffer( 
        req.config.stt.username + 
        ':' + 
        req.config.stt.password
      ).toString( 'base64' );
	
      // Request token
      request( {
        method: 'GET',
        url: WATSON_STREAM + '?url=' + req.config.stt.url,	
          headers: {
            'Authorization': 'Basic ' + hash
          }
      }, function( err, result, body ) {
          res.send( body );
      } );
    } );

Audio Capture
-------------

With a token in hand, back on the client, we can then leverage one of two different STT methods. One way is to use the microphone, while the other is to upload an audio file.

    // Start stream to Watson
    // Either microphone or local file
    if( source == null ) {
      watson = WatsonSpeech.SpeechToText.recognizeMicrophone( {
        continuous: false,
        objectMode: true,
        token: xhr.responseText
      } );
    } else {
      watson = WatsonSpeech.SpeechToText.recognizeFile( {
        data: source,
        token: xhr.responseText
      } );
    }   

The Watson Speech JavaScript library, in the case of STT, is abstracting a number of complex touch points. For example, audio capture through the browser. Transcoding, or accessing the raw feed, and passing it into a WebSocket instance. Handling WebSocket events to surface common behavior. This same technique (including WebSocket) is used on other platforms where STT libraries are available (iOS, Android). Should you have a custom need, you can build against the WebSocket API directly.

Capture Events
--------------

The Watson Speech JavaScript library emits a few different events. During the transcription process, a "data" event is emitted. This event will show how Watson understands the latest context of the audio capture. There is also an "end" event to let you know when Watson thinks the audio capture session is over. You may also want to listen for errors.

    // Transcription events
    watson.setEncoding( 'utf8' );
    watson.on( 'data', doWatsonData );
    watson.on( 'error', doWatsonError );
    watson.on( 'end', doWatsonEnd );  

Interim Results
---------------

![A look at interim results and the final result.](http://images.kevinhoyt.com/watson.workshop.stt.png)

During audio capture, the data supplied in a "data" event is a JavaScript object with various properties. Different alternatives, with confidence rankings are reported. When using an audio file, the data supplied in the "data" event is a simple string. It is important to track the data event, as final transcription is not provided in the "end" event.

    // Track changes to transcript
    if( source == null ) {
      // Copy full object
      transcript = Object.assign( {}, data );

      // Display current
      emit( STT.PROGRESS, {
        transcript: transcript.alternatives[transcript.index].transcript    
	  } );
    } else {
      // Just a string
      transcript = data;
    }        

Final Results
-------------

Depending on the means of audio capture, you will want to finalize which version of the transcript you intend to use at this point. For the example application, we will only be surfacing the text of the final transcript result. For microphone capture, this means getting into the resulting JavaScript object. For an audio file upload, it means reporting the string result that was provided.

    if( source == null ) {
      transcript = transcript.alternatives[transcript.index].transcript;
    }  

Text-To-Speech (TTS)
==============

Now that we have the ability to capture spoken and recorded content, and change that into textual content, it only makes sense to have Watson speak it back to us. With this we come one step closer to having an actual dialog with a machine. This is the purpose of text-to-speech (TTS). The same Watson JavaScript library used previously for STT, will also serve to synthesize speech.

Voices (Client)
---------------

Before we start synthesizing speech, it may be helpful to have a better idea of the voices that Watson can use to speak. The default is a male voice called, Michael. Getting the listing of possible voices does not require an authorization token. It does however require authentication using the username and password for the account associated with the service. From the client then, all one needs to do is invoke a call to our server.

    // Initial load of various voices
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doVoicesLoad );
    xhr.open( 'GET', SERVER_PATH + 'tts/voices', true );
    xhr.send( null );

Voices (Server)
---------------

Once our client request has arrived at the server, we will use the account credentials for the TTS service instance for HTTP Basic Auth access to Watson. The URL for the voices services, as provided in the account credentials is also needed.

    router.get( '/voices', function( req, res ) {
	  var hash = null;
	
      // Authentication
      // HTTP Basic
	  hash = new Buffer( 
		req.config.tts.username + 
		':' + 
		req.config.tts.password
	  ).toString( 'base64' );
	
      // Get voice list
	  request( {
		method: 'GET',
		url: WATSON_VOICES + '?url=' + req.config.tts.url,	
		headers: {
		  'Authorization': 'Basic ' + hash
		}
	  }, function( err, result, body ) {
	    res.send( body );
	  } );
    } );

Speech Synthesis
----------------

The process of converting text content to speech is call synthesis. As with the STT service, access to the TTS synthesis service requires an authorization token. The same process as with STT is followed and will not be covered again here.  Once the authorization token is received, we have only to call the appropriate Watson JavaScript library function.

    WatsonSpeech.TextToSpeech.synthesize( {
      text: content,
      token: xhr.responseText,
      voice: current            
    } );

The default voice, the male voice of "Michael" is used in this example. Later, as we get into translation, we will refer back to the voice list for an appropriate voice for a different language.

![A look at the voice options.](http://images.kevinhoyt.com/watson.workshop.voice.png)

Conversation
============

Having Watson convert our spoken word to text, and then repeat it back to us using synthesis in the "Michael" voice is neat, and interesting, but hardly useful. In order to have a dialog with Watson, we will need to train the system on the types of things we might say, and what types of things might be expected responses. These are called intents.

Tooling
-------

The tooling for mapping out a dialog is contained in the Watson Conversation Service found in IBM Bluemix.

**Intents**

![Conversation Intents](http://images.kevinhoyt.com/watson.workshop.intents.png)

Intents represent an action, as in "What is the intent of this text content?" It maps meaning onto our otherwise nondescript text. In the screenshot above, there are three intents - welcome, turn_on, and turn_off. In the "welcome" intent there is a collection of phrases that might map to the incoming text. As with most things in machine learning, the more samples the better.

*Note the general vagueness of the provided phrases. Entities will help us to make this more robust.*

**Entities**

![Conversation Entities](http://images.kevinhoyt.com/watson.workshop.entities.png)

Sometimes our phrases can either be (a) too specific or (b) have variants on which we did not account. Take for example the "place" entity in the screenshot above. When we say "welcome" to Watson, we might be inclined to mention the event, venue, city, etc. Entities allow us to provide synonyms for what might otherwise turn up a common or repeated parts of the phrases in our intents. Think of this as having as many permutations of the intent phrases as there are synonyms.

**Dialog**

![Conversation Dialog](http://images.kevinhoyt.com/watson.workshop.dialog.png)

Now that we have specified the intents and the entities, we can start mapping out how Watson should respond to incoming content. In the screenshot above, we can look for the "welcome" intent, and further refine it by providing a variation of entities. Then we supply a phrase that Watson should use to respond when a match is found.

Watson takes time to train. As you supply variations on intents and entities, and/or change the dialog flow, Watson will evaluate the content. Depending on the model, this can take several minutes.

There is also a part of the dialog flow for when there is no match.

Request Intent (Client)
--------------

Now that we have Watson able to turn our spoken word into text, we have to provide Watson with that text to determine and intent and appropriate response.

    // Determine intent
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doIntentLoad );
    xhr.open( 'POST', SERVER_PATH + 'conversation/intent', true );
    xhr.setRequestHeader( 'Content-Type', 'application/json' );    
    xhr.send( JSON.stringify( {
      text: phrase
    } ) ); 

Request Intent (Server)
-----------------------

As before, the server will use HTTP Basic Auth and our service credentials when making the request to Watson. Watson will expect a JSON structure with a property named "input" and a property of that named "text". The "text" is where the STT results will be placed for the request.

    request( {
	  method: 'POST',
      url: url,	
	  headers: {
	    'Authorization': 'Basic ' + hash
      },
      json: true,
      body: {
        input: {
          text: req.body.text
        }
      }
	}, function( err, result, body ) {
        // Client gets unparsed body content
		res.send( body );
	} );

TTS Response (Dialog)
---------------------

The workshop application has been made using discreet modules. One module for each of the various Watson services. These modules do not know anything about one another (decoupled). The modules raise events with content that is then orchestrated by the workshop controller module.

    // Notify UI of discovered intent
    // UI will display and speak results
    emit( Conversation.INTENT, {
      intent: data.intents[0].intent,
      text: data.output.text[0]
    } );  

Once the workshop module receives the response text from Watson, it will in turn display it on the screen, and also pass it to the TTS module so Watson can synthesize the text into speech. The Conversation service has now enabled us to have a full, spoken, dialog with Watson.

![An example of how Watson sees the conversation.](http://images.kevinhoyt.com/watson.workshop.conversation.png)

Visual Recognition
==================

It is a feature of the human body that most of us take for granted every day - sight. As they say "A picture is worth a thousand words." Watson can look at images and determine a lot about their content. Maybe you want to see if there are any faces in a photo. Maybe you want to look for your company logo in social media. Maybe you want to analyze x-ray images of tissue to find cancer earlier than an oncologist? This is what Visual Recognition brings to your application.

Multipart Forms with XHR2
-------------------------

Before we get to the actual visual recognition features, we will need to upload an image from the client (browser), to the server (Node.js), and then on to Watson (awesome). Uploading an image from the browser is nothing new, but HTML5 makes this much easier.

**Drag and Drop**

In order to select an image for upload we will be using HTML5 drag/drop features as well. This will allow you to drag an image from the desktop, into the browser, and have it uploaded seamlessly. The default behavior when you drag/drop content in the browser is for it to try and display the content. We do not want that, so we need to catch the events and override them.

    capture.addEventListener( 'dragover', doCaptureDrag );    
    capture.addEventListener( 'drop', doCaptureDrop );                    

The "dragover" event happens when content is initially dragged into the browser. We then have several different ways we can respond. More on that in a moment. The "drop" event happens when the content is finally dropped into the browser. We will get a reference to the file(s) and be able to take further actions.

    // File dragged onto drop zone
    var doCaptureDrag = function( evt ) {       
      // Debug
      console.log( 'File(s) dragged.' );
        
      // Stop default browser behavior    
      evt.stopPropagation();
      evt.preventDefault();

      // Prepare to drop
      evt.dataTransfer.dropEffect = 'copy';

      // Show user that we are ready
      capture.classList.remove( 'microphone' );
      capture.classList.add( 'file' );
    };    

There are two key actions we need to take to keep the browser from wanting to display the content. The first is to stop the course of the event bubbling that takes place by default. The next is to specify our intent with the dragged content. In this case, we will want a copy of the content.

    // File dropped
    var doCaptureDrop = function( evt ) {
      var source = null;
        
      // Debug
      console.log( 'File(s) dropped.' );

      // Stop default browser behavior
      // Which will try to display the content
      evt.stopPropagation();
      evt.preventDefault();
        
      // Reference to shorten access
      source = evt.dataTransfer.files[0];
      
      // Checking MIME type
      // Not always accurate
      // Good enough for a workshop  
      if( source.type.indexOf( 'image' ) >= 0 ) {
        // Indicate that processing is happening
        progress(); 
            
        // Recognize
        Visual.recognize( source );
      }
    };        

Just as with the drag operation, we need to cancel the default bubbling of the event. Then we have access to the file(s) on the "dataTransfer" property of the event. We can actually read the physical file from the browser at this time - which will do in a later example. For now we just want to upload the file.

Note that I am using the file MIME type to determine the content type. This is risky from a security perspective. In many cases, renaming a file will reflect a different MIME type. This could allow somebody with malicious intent to upload an executable to your servers.

Upload Image (Client)
---------------------

XHR2 brings us some much welcomed features. Among them is the "FormData" data structure, which allows us to easily mimic content that might normally be submitted via an HTML form. This includes attaching images for upload.

    // Build multipart form
    form = new FormData();
    form.append( 'attachment', object );

The server is expecting the file attachment to be on a property called "attachment". You might choose a different name/convention for your upload behavior.

    // Submit form for processing
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doRecognizeLoad );
    xhr.open( 'POST', SERVER_PATH + 'visual/recognition' );
    xhr.send( form );  

Uploading the file then is simply a matter of an XHR POST where we send the FormData variable.

Upload Image (Server)
---------------------

How to handle an image upload at the server depends largely on your chosen stack, and personal preferences. A common option for Node.js is "multer". The "multer" library does a great job at simplifying a file upload, while giving you many options for customization.

    // Upload storage options
    // Unique name with extension
    var storage = multer.diskStorage( {
	  destination: 'public/uploads',
      filename: function( req, file, cb ) {
        cb( null, randomstring.generate() + '.jpg' );
      }
    } );

    // Upload handler
    var upload = multer( {
      storage: storage
    } );

One way to prevent malicious attacks on uploaded files is to change the name of the file on disk. It is also important that we not overwrite an existing image that has been upload by somebody else, using the same name. To generate a unique file name, we will specify a custom storage option for the upload.

    // Image upload
    router.post( '/recognition', upload.single( 'attachment' ), function( req, res ) {
      var url = null;
    
      // URL using API key
      url = 
        WATSON_CLASSIFY +
        '?api_key=' + req.config.visual.api_key +
        VERSION;
    
      // Multipart file upload to Watson
      request( {
        method: 'POST',
        url: url,
        formData: {
		  parameters: fs.createReadStream( __dirname + '/parameters.json' ),
          images_file: fs.createReadStream( __dirname + '/../' + req.file.path )
        }
      }, function( err, result, body ) {    
        res.send( body );        
      } );    
    } );

Unlike the STT or TTS services which use a token and HTTP Basic Auth, Visual Recognition uses an API key. This is due to technology acquired by an acquisition.  

When we upload the file, we send along some parameters as well. The "parameters.json" contains the following JSON content.

    {
	  "classifier_ids": ["default"],
	  "owners": ["me", "IBM"]
    }

A "classifier" is how Watson groups the objects found in images. There is a default classifier provided by IBM which is smart enough to know about most general content - animals, objects, etc. If you are having Watson look at image for your company logo, then you will want to build your own classifier, and train Watson on your specific content. Custom classifiers is beyond the scope of this workshop.

![How Watson sees a particular image of a cup of coffee.](http://images.kevinhoyt.com/watson.workshop.coffee.png)

Classifiers can be shared. In this case, we will tell Watson to use the "default" classifier provided by "me" and "IBM". This is specified because the term "default" might be used as a classifier for a different search.

TTS Response (Subject Matter)
-----------------------------

The same observer pattern we used for the Conversation Service will be used for the Visual Recognition service. The data emitted by the event will be an array of "classes" found in the provided image. You can think of classes as a noun-based label for objects. They are provided in order considered most likely to be a match.

    // Aggregate classifiers
    for( var c = 0; c < data.images[0].classifiers[0].classes.length; c++ ) {
      classifiers.push( data.images[0].classifiers[0].classes[c].class ); 
    }

The following pictures will both yield the first class as "coffee". What is interesting is the results Watson considers to be less of a match. Play around with various images and explore the results. This will help you decide if you want to further create a custom classifier for your needs.

![This is coffee. Watson thinks it looks like it might be an espresso.](http://images.kevinhoyt.com/coffee.espresso.jpg)

![This is coffee, too. Watson thinks it might have been from a Starbucks.](http://images.kevinhoyt.com/coffee.starbucks.jpg)

Translation
===========

The Waston Translation Service is exactly what it sounds like - you provide a block of text, tell Watson what language it is in, and what language you want it to be in, and a translation takes place.

Language Support (Client)
-------------------------

Before we started using the TTS service, we asked Watson for a list of voices that could be used. When it comes to translation, we will start off with a request to Watson for the list of translatable languages.

    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doVoicesLoad );
    xhr.open( 'GET', SERVER_PATH + 'translate/languages', true );
    xhr.send( null );

Language Support (Server)
-------------------------

    // Identifiable languages
    router.get( '/languages', function( req, res ) {
      var hash = null;
      var url = null;
    
      // API endpoint
      url =
        req.config.translate.url +
        PATH_LANGUAGES;    
    
      // Authentication
      // HTTP Basic
	  hash = new Buffer( 
		req.config.translate.username + 
		':' + 
		req.config.translate.password
	  ).toString( 'base64' );    
    
      request( {
        method: 'GET',
        url: url,
        headers: {
          'Authorization': 'Basic ' + hash
        }
      }, function( err, result, body ) {
        // Client gets unparsed body content        
        res.send( body );
      } );
    } );

At the server, where we will actually communicate with Watson, we will be back to HTTP Basic Auth. A request is made against the Watson endpoint that lists the languages that can be used.

Translation (Client)
--------------------

Having used the STT service to take our spoken word and transcribe it into text content, we are ready to pass that content along for translation.

        // Request translation
        xhr = new XMLHttpRequest();
        xhr.addEventListener( 'load', doTranslateLoad );
        xhr.open( 'POST', SERVER_PATH + 'translate/to', true );
        xhr.setRequestHeader( 'Content-Type', 'application/json' );            
        xhr.send( JSON.stringify( {
            source: getSource(),
            target: getTarget(),
            text: content
        } ) );

The key parameters here are the source language, the target language, and the text to be translated. In this case we will assume that English is the source language, and that we will be translating into Spanish.

![A look at the language options.](http://images.kevinhoyt.com/watson.workshop.language.png)

Translation (Server)
--------------------

	request( {
	  method: 'POST',
	  url: url,	
	  headers: {
        'Accept': 'application/json',
	    'Authorization': 'Basic ' + hash
	  },
      form: {
        source: req.body.source,
        target: req.body.target,
        text: req.body.text
      }
	}, function( err, result, body ) {
      // Client gets unparsed body content
	  res.send( body );
	} );

The same parameters passed to the server are now repurposed and sent to Watson. In this case, Watson expects them as a form. The resulting translation is then sent back to the client, and the content spoken using the TTS service. The translation is from English to Spanish, and as such we can use the voices listing from the TTS service to specify that Watson should use a specific dialect. You can have Watson say Spanish using an English voice, but it will sound like a seventh-grader taking their first Spanish class.

![Translation results.](http://images.kevinhoyt.com/watson.workshop.translation.png)

Concept Extraction
==================

Given a PDF or text file that describes a movie, would you be able to described the key concepts? This feature is what Concept Extraction provides for your application. A document that describes a movie is one thing, but it can take on a whole different dimension if you include the reviews of the movie. Finding the movie that is right for your Friday night family viewing just got a whole lot easier.

Also consider the hundreds of thousands (six figures) of medical articles publish in journals every year. It is simply not possible for a physician to keep up on all of it. Watson can be trained to digest all this data, and extract the concepts to make sense of the content. Then when provided with your complete medical history, Watson can make recommendations that often surpass when humans can accomplish.

Isolate Target URL
------------------

We talked earlier about drag/drop features of HTML5. In this case, the drag/drop of a URL (from a browser address bar or saved link) will yield a MIME type that includes the text "url".

    // Dropping of URL from another window or tab
    // Process the content on that resource
    if( evt.dataTransfer.getData( 'URL' ).length > 0 ) {
      // Debug
      console.log( evt.dataTransfer.getData( 'URL' ) );
            
      // Indicate that processing is happening
      progress();
            
      // Request language analytics
      Alchemy.language( evt.dataTransfer.getData( 'URL' ) );
    }

Concept extraction, and other natural language processing (NLP) features, currently falls under the "Alchemy" umbrella. Alchemy API was acquired by IBM in March 2015.

**Send URL to Watson (Client)**

In the interest of brevity, having already thoroughly covered the use of XHR to send our data to the server, the client-to-server piece of this example will not be reviewed.

Send URL to Watson (Server)
---------------------------

    // Identify the language of provided content
    router.post( '/language', function( req, res ) {
	  request( {
		method: 'POST',
		url: req.config.alchemy.url + PATH_COMBINED,	
        form: {
          apikey: req.config.alchemy.api_key,
          outputMode: 'json',
          url: req.body.url
        }
	  }, function( err, result, body ) {
        // Client gets unparsed body content
		res.send( body );
	  } );    
    } );

Authentication is once again using an API key in place of HTTP Basic Auth. We send an HTTP POST with the API key, a specific output mode (XML also an option), and the URL we want to have Watson look at. Watson will in turn load the content from the Web, analyze the content, and send back the results. How many results you want - how deep you want Watson to analyze - is specified by changing the URL. For the purposes of this demo, we are telling Watson to give us all the data it uncovers.

Aggregate Concepts (Only)
-------------------------

![There is a pretty substantial amount of data around concepts.](http://images.kevinhoyt.com/watson.workshop.concepts.png)

In inspection of the data structure returned by Watson will reveal an extensive amount of information. Because there is really only room on the screen for a basic response, we will distill this down to just the core concepts in the document found at the provided URL.

    // Response from Alchemy Language
    var doLanguageLoad = function() {
      var concepts = null;        
      var data = null;
        
      // Parse JSON
      data = JSON.parse( xhr.responseText );
        
      // Debug
      // NLP FTW
      console.log( data );
        
      // Prepare result
      concepts = [];    

      // Aggregate concepts
      for( var c = 0; c < data.concepts.length; c++ ) {
        if( data.concepts[c].relevance >= getThreshold() ) {
          concepts.push( data.concepts[c].text );
        }
      }
        
      // Emit event with results
      emit( Alchemy.COMPLETE, {
        concepts
      } );
        
      // Clean up
      xhr.removeEventListener( 'load', doLanguageLoad );
      xhr = null;
    };

Tone Analysis
=============

If there is one thing that our voices can do, that our text messages and emails cannot, it is expression emotion. Many an email war has been started by misunderstood content represented in a cold, dry, message. The objective of tone analysis is to help you from making that type of mistake. Maybe this is that quarterly email to investors, or maybe it is the press release for a new product or feature.

Reading Local Files
-------------------

We have already seen drag/drop operations of files from outside the browser, but now we will add reading the contents of the file. Using JavaScript, right from the local browser, without ever having to upload a file, you can perform analysis of the contents of the file - both binary and textual. In this case, we will use the FileReader object to read the text file that was dragged and dropped into the application.

    // Read the local file
    // Text content
    reader = new FileReader();
    reader.addEventListener( 'load', doFileLoad );
    reader.readAsText( source );

This process happens asynchronously, like so many other aspects of JavaScript, so we will need an event handler for when the contents of the file are loaded. The entire file will be loaded into memory before this event is called. A small text file is not going to cause problems, so long as we clean up after ourselves.

    // Called when a local file has been read
    // Sends text content to Watson services
    var doFileLoad = function() {
      // Debug
      console.log( 'File read complete.' );

      // Support multiple actions
      // Tone analysis
      // Personality insight
      if( shift ) {
        // Send to Personality Insights
        Personality.insights( reader.result );
      } else {
        // Send to Tone Analysis
        Tone.analyze( reader.result );            
      }
        
      // Clean up
      reader.removeEventListener( 'load', doFileLoad );
      reader = null;
    };

We will use this technique for tone analysis in this case. Later we will use the same approach again, only with the shift key pressed, to look at personality insights.

Send Document Content (Client)
------------------------------

Given that the content of the file could be pretty substantial, an HTTP POST is going to be the best way to get the data to the server for further processing. More realistically, file upload is probably the way to go here, but that operation is already being used in our application for visual recognition.

    // Send content to Watson
    xhr = new XMLHttpRequest();
    xhr.addEventListener( 'load', doAnalyzeLoad );
    xhr.open( 'POST', SERVER_PATH + 'tone/analyze' );
    xhr.setRequestHeader( 'Content-Type', 'application/json' );
    xhr.send( JSON.stringify( {
      content: content    
    } ) );        

Send Document Content (Server)
------------------------------

When sending the data to Watson for tone analysis, the service expects that the body of an HTTP POST is a JSON string containing the content to be analyzed. HTTP Basic Auth is still used here for authentication.

    // Request analysis
	request( {
	  method: 'POST',
	  url: req.config.tone.url + VERSION,	
	  headers: {
	    'Authorization': 'Basic ' + hash,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( {
        text: req.body.content
      } )
	}, function( err, result, body ) {
      res.send( body );
    } );

Document tone is analyzed on a per-sentence basis, as well as an overall document value. The document-level analysis will return three tone areas - emotion, language, and social. Within each of these results, the dominant tones will be listed in an array, from most common to least common. At the sentence-level, the same areas are reported, but the resulting tones may not be sorted by relevance.

![A view of the document results, and sentence results.](http://images.kevinhoyt.com/watson.workshop.tones.png)

Personality Insights
====================

How well do you know your customers? Do you know what drives them to visit your site? Buy your products? Who is the best match to be recruited at your company? Who might be the best fit for university admissions? Can we optimize the placement of criminals in jail to avoid physical confrontation? Knowing something about who we are gives your application tremendous power.

**Send Document Content (Client)**

In this case, the flow of uploading the content happens the exact same way as with tone analysis. The local text file is opened and read, and the resulting contents are then sent to the server for processing. In order to trigger the upload to the personality service, press and hold the shift key while dragging the file into the browser.

Send Document Content (Server)
------------------------------

The Personality Insights service expects plain text content by default. It is capable of accepting up to 20 Mb of data per request. When sending plain text, the "charset" value is required on the "Content-Type" header. You can use this header to change what it is you are sending, and what you are expecting in return. Other options include JSON, and CSV.

    // Request insight
	request( {
	  method: 'POST',
	  url: req.config.personality.url + PATH_PROFILE,	
	  headers: {
	    'Authorization': 'Basic ' + hash,
        'Content-Type': 'text/plain; charset=utf-8'
	  },
      body: req.body.content
	}, function( err, result, body ) {
      res.send( body );
	} );

Aggregate and Sort Results
--------------------------

![A glimpse into the insight of a presidential candidate based on their acceptance speech.](http://images.kevinhoyt.com/watson.workshop.personality.png)

The results for the various traits of personality insights are not sorted. In the case of showing a single specific result for Watson to speak, we will want to sort the results first. The result tree can be vary complex, so be careful when processing the data.

    // Look for the needs part of the tree
    for( var t = 0; t < data.tree.children.length; t++ ) {
      if( data.tree.children[t].id == "needs" ) {                
        // Abbreviate node traversal
        tree = data.tree.children[t].children[0].children;
                
        // Sort node by percentage
        tree = tree.sort( function( a, b ) {
          var result = 0;
                    
          if( a.percentage > b.percentage ) {
            result = -1;
          } else if( a.percentage < b.percentage ) {
            result = 1;
          }
                    
          return result;
        } );                
                
        // Aggregate needs
        for( var n = 0; n < tree.length; n++ ) {
          needs.push( tree[n].name );
        }
                
        break;
      }
    }

