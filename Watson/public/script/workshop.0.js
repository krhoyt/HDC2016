var Workshop = ( function() {
    
    // Private
    var capture = null;
    var original = null;
    var prompt = null;
    
    var progress = function() {
        // Hide input button
        TweenMax.to( capture, 0.50, {
            opacity: 0    
        } );            

        // Hide message before changing
        TweenMax.to( prompt, 0.50, {
            opacity: 0,
            onComplete: function() {
                // Clear
                prompt.innerHTML = '';

                // Change style
                prompt.classList.remove( 'help' );
                prompt.classList.add( 'transcribe' );
            }
        } );
        
        // Disable click event until session is over    
        capture.removeEventListener( 'click', doCaptureClick );
        capture.removeEventListener( 'dragover', doCaptureDrag );    
        capture.removeEventListener( 'drop', doCaptureDrop );                           
    };
    
    var reveal = function( message ) {
        // Display text that will be spoken
        prompt.innerHTML = message;

        // Display prompt
        TweenMax.to( prompt, 0.50, {
            opacity: 1
        } );                    
        
        // Speak results of image content
        TTS.say( message )
        
        // Reset button icon
        capture.classList.remove( 'file' );
        capture.classList.add( 'microphone' );        
        
        // Display button
        TweenMax.to( capture, 0.50, {
            opacity: 1
        } );            
        
        // Allow next session
        capture.addEventListener( 'click', doCaptureClick );
        capture.addEventListener( 'dragover', doCaptureDrag );    
        capture.addEventListener( 'drop', doCaptureDrop );                    
    };
    
    // Convenience to temporarily use a different language
    // Effects both speech and copy
    // Waits a period of time
    // Then reverts to original settings
    // Both speech and copy
    var swap = function( newText, newVoice ) {
        // Switching out of default
        // Store reference to revert
        if( original == null ) {
            original = {
                content: prompt.innerHTML,
                voice: TTS.getCurrent()
            };            
        } else {
            // Switching back
            original = null;
        }
        
        // Hide prompt
        TweenMax.to( prompt, 0.50, {
            opacity: 0,
            onComplete: function() {
                // Show new text
                // Set voice and speak
                prompt.innerHTML = newText;
                TTS.setCurrent( newVoice );
                
                // Only say when swapped
                if( original != null ) {
                    TTS.say( newText );                    
                }
                
                // Show prompt
                TweenMax.to( prompt, 0.50, {
                    opacity: 1,
                    onComplete: function() {
                        // If need to revert
                        if( original != null ) {
                            setTimeout( function() {
                                // Call same function after period elapses
                                swap( original.content, original.voice ); 
                            }, Workshop.TRANSLATE_DELAY );                            
                        }
                    }
                } );
            }
        } );
    };
    
    // Start the process of transcription
    var doCaptureClick = function() {
        // Debug
        console.log( 'Button clicked.' );

        // Queue to user that something is happening
        // Disable click event until session is over
        TweenMax.to( capture, 0.50, {
            opacity: 0.30    
        } );
        capture.removeEventListener( 'click', doCaptureClick );
        capture.removeEventListener( 'dragover', doCaptureDrag );    
        capture.removeEventListener( 'drop', doCaptureDrop );                
        
        // Transcribe
        STT.transcribe();
    }    
    
    // File dragged onto drop zone
    var doCaptureDrag = function( evt ) {
        // Debug
        console.log( 'File(s) dragged.' );
        // console.log( evt );
        
        // Stop default browser behavior    
        evt.stopPropagation();
        evt.preventDefault();

        // Prepare to drop
        evt.dataTransfer.dropEffect = 'copy';

        // Show user that we are ready
        capture.classList.remove( 'microphone' );
        capture.classList.add( 'file' );
    };    
    
    // File dropped
    // Send to Watson for transcription
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
        
        // Dropping of URL from another window or tab
        // Process the content on that resource
        // Do not continue
        if( evt.dataTransfer.getData( 'URL' ).length > 0 ) {
            // Debug
            console.log( evt.dataTransfer.getData( 'URL' ) );
            
            // Indicate that processing is happening
            progress();
            
            // Request language analytics
            Alchemy.language( evt.dataTransfer.getData( 'URL' ) );
            
            // Do not continue
            return;
        }
        
        // Support for different file types
        // Audio for speech-to-text
        // Image for recognition
        if( source.type.indexOf( 'audio' ) >= 0 ) {
            // Transcribe
            STT.file( source );
        } else if( source.type.indexOf( 'image' ) >= 0 ) {
            // Indicate that processing is happening
            progress(); 
            
            // Recognize
            Visual.recognize( source );
        }
    };        
    
    // Intent from Conversation service
    // Display and speak the results
    var doConversationIntent = function( evt ) {
        // Display dialog response
        TweenMax.to( prompt, 0.50,  {
            opacity: 0,
            onComplete: function() {
                prompt.innerHTML = evt.text;

                TweenMax.to( prompt, 0.50, {
                    opacity: 1    
                } );
            }
        } );   
        
        // Speak dialog response
        TTS.say( evt.text );
    };
    
    // Called when Alchemy Language processing is complete
    // Aggregates concepts
    // Uses text-to-speech to announce concepts
    var doLanguageComplete = function( evt ) {
        // Debug
        // console.log( 'Concept processing complete.' );
        
        // Speak and show concept result
        reveal( 
            'This appears to be about ' + 
            evt.concepts[0].toLowerCase() + 
            '.' 
        );
    };
    
    // Called when the prompt area is clicked
    // Translates diplayed content
    var doPromptClick = function() {
        Translate.to( prompt.innerHTML, Workshop.TRANSLATE_TARGET );
    };
    
    // Progress happening with Watson
    // Stream notifications
    // Current transcript
    var doSpeechProgress = function( evt ) {
        // Debug
        // console.log( 'Speech progress.' );
        
        // Display latest
        prompt.innerHTML = evt.transcript;
    };
    
    // Token from STT service
    // Authorization
    var doSpeechToken = function( evt ) {
        // Debug
        console.log( 'Speech token event.' );
        
        // Hide button until after session
        TweenMax.to( capture, 0.50, {
            opacity: 0
        } );

        // Hide message before changing
        TweenMax.to( prompt, 0.50, {
            opacity: 0,
            onComplete: function() {
                // Clear
                prompt.innerHTML = '';

                // Change style
                prompt.classList.remove( 'help' );
                prompt.classList.add( 'transcribe' );

                // Show
                prompt.style.opacity = 1;
            }
        } );        
    };
    
    // Watson transcription complete
    // Display in user interface
    var doSpeechTranscribe = function( evt ) {
        // Debug
        console.log( 'Transcription complete.' );
        
        // Show content
        prompt.innerHTML = evt.transcript;
        
        // Have Watson speak the results
        // Only if there is no conversation
        if( typeof Conversation == 'undefined' ) {
            TTS.say( evt.transcript );            
        } else {
            Conversation.dialog( evt.transcript );
        }
        
        // Just processed a file
        // Reset to microphone
        if( evt.type == 'file' ) {
            capture.classList.remove( 'file' );
            capture.classList.add( 'microphone' );
        }        
        
        // Show button for more interactions
        TweenMax.to( capture, 0.50, {
            opacity: 1
        } );    

        // Allow next session
        capture.addEventListener( 'click', doCaptureClick );
        capture.addEventListener( 'dragover', doCaptureDrag );    
        capture.addEventListener( 'drop', doCaptureDrop );                
    };
    
    // Translation is complete
    // Speak the results
    var doTranslateComplete = function( evt ) {
        // Temporarily show
        // Speak
        // Then revert
        swap( evt.translation, Workshop.TRANSLATE_VOICE );
    };
    
    var doVisualRecognize = function( evt ) {
        // Debug
        console.log( 'Visual recognition event.' );
        
        // Speak and show result content
        reveal( 
            'This looks like ' + 
            evt.subject + 
            '.' 
        );
    };
    
	// Event to start transcribing via microphone
	capture = document.querySelector( 'button.capture' );
	capture.addEventListener( 'click', doCaptureClick );
    
    // Support local file drag-drop    
    capture.addEventListener( 'dragover', doCaptureDrag );
    capture.addEventListener( 'drop', doCaptureDrop );    
    
    // Display messages
    prompt = document.querySelector( '.prompt' );        
    prompt.addEventListener( 'click', doPromptClick );
    
    // Register for events
    STT.on( STT.TOKEN, doSpeechToken );
    STT.on( STT.PROGRESS, doSpeechProgress );
    STT.on( STT.TRANSCRIBE, doSpeechTranscribe );
    Conversation.on( Conversation.INTENT, doConversationIntent );
    Visual.on( Visual.RECOGNIZE, doVisualRecognize );
    Translate.on( Translate.COMPLETE, doTranslateComplete );
    Alchemy.on( Alchemy.COMPLETE, doLanguageComplete );
    
    // Debug
    console.log( 'Workshop' );
    
    return {
        TRANSLATE_DELAY: 5000,
        TRANSLATE_TARGET: 'es',
        TRANSLATE_VOICE: 'es-ES_EnriqueVoice'
    };

} )();
