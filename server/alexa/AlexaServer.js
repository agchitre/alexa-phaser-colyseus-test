import Alexa from 'ask-sdk-core';
import { ExpressAdapter } from 'ask-sdk-express-adapter';

export class AlexaServer {

    constructor(app, url) {
        let getMessageIntent = (requestEnvelope) => {
            const requestMessage = requestEnvelope.request.message;
            if(requestMessage) {
                if(requestMessage.intent) {
                    return requestMessage.intent;
                }
            }
            return null; // Otherwise no intent found in the message body
        };

        let supportsHTMLInterface = (handlerInput) => {
            const supportedInterfaces = Alexa.getSupportedInterfaces(handlerInput.requestEnvelope);
            const htmlInterface = supportedInterfaces['Alexa.Presentation.HTML'];
            console.log(supportedInterfaces);
            
            return htmlInterface !== null && htmlInterface !== undefined;
        };
        
        let conditionallyLaunchWebApp = (handlerInput) => {
            if(supportsHTMLInterface(handlerInput)) {
                console.log("Supports HTML");
                
                handlerInput.responseBuilder.addDirective({
                    type:"Alexa.Presentation.HTML.Start",
                    data: {
                        "slime":"time"
                    },
                    request: {
                        uri: url,
                        method: "GET"
                    },
                    configuration: {
                       "timeoutInSeconds": 1800
                    }})
                    .speak("Welcome back.");
            }
            else {
                handlerInput.responseBuilder.speak("Sorry, this skill is only supported on screened devices.");
            }
        };
        
        const LaunchRequestHandler = {
            canHandle(handlerInput) {
                return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
            },
            handle(handlerInput) {
                conditionallyLaunchWebApp(handlerInput);
                return handlerInput.responseBuilder
                    .getResponse();
                
            }
        };
        
        const WebAppSpeakIntentHandler = {
          canHandle(handlerInput) {
              return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.HTML.Message'
                  && getMessageIntent(handlerInput.requestEnvelope) === 'speak';
          },
          handle(handlerInput) {
              
              return handlerInput.responseBuilder
                  .speak(handlerInput.requestEnvelope.request.message.contents)
                  .getResponse();
          }
        }
        
        const WebAppAskIntentHandler = {
          canHandle(handlerInput) {
              return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.HTML.Message'
                  && getMessageIntent(handlerInput.requestEnvelope) === 'ask';
          },
          handle(handlerInput) {
              
              return handlerInput.responseBuilder
                  .speak(handlerInput.requestEnvelope.request.message.contents)
                  .reprompt()
                  .getResponse();
          }
        }
        
        const WebAppExitIntentHandler = {
          canHandle(handlerInput) {
              return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.HTML.Message'
                  && getMessageIntent(handlerInput.requestEnvelope) === 'exit';
          },
          handle(handlerInput) {
              const speakOutput = 'Okay, see you next time!';
        
              return handlerInput.responseBuilder
                  .speak(speakOutput)
                  .withShouldEndSession(true)
                  .getResponse();
          }
        }
        
        const HelpIntentHandler = {
            canHandle(handlerInput) {
                return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                    && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
            },
            handle(handlerInput) {
                
                if(supportsHTMLInterface(handlerInput)) {
                    handlerInput.responseBuilder.addDirective({
                        "type":"Alexa.Presentation.HTML.HandleMessage",
                        "message": {
                            "intent":"help"
                        }
                    });
                }
                
                return handlerInput.responseBuilder
                    .getResponse();
            }
        };
        
        const CancelAndStopIntentHandler = {
            canHandle(handlerInput) {
                return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                    && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
            },
            handle(handlerInput) {
                const speakOutput = 'Thanks for playing!';
        
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .withShouldEndSession(true)
                    .getResponse();
            }
        };
        
        const FallbackIntentHandler = {
            canHandle(handlerInput) {
                return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
                    && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
            },
            handle(handlerInput) {
                const speakOutput = 'Sorry, I don\'t know about that. Please try again.';
        
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .reprompt(speakOutput)
                    .getResponse();
            }
        };
        
        const SessionEndedRequestHandler = {
            canHandle(handlerInput) {
                return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
            },
            handle(handlerInput) {
                // Any clean-up logic goes here.
                return handlerInput.responseBuilder.getResponse();
            }
        };
        
        const ErrorHandler = {
            canHandle() {
                return true;
            },
            handle(handlerInput, error) {
                console.log(`Error handled: ${error.message}`);
        
                return handlerInput.responseBuilder
                .speak('Sorry, I don\'t understand your command. Please say it again.')
                .reprompt('Sorry, I don\'t understand your command. Please say it again.')
                .getResponse();
            }
        };
        
        const skillBuilder = Alexa.SkillBuilders.custom();
        skillBuilder.addRequestHandlers(
            LaunchRequestHandler,
            WebAppSpeakIntentHandler, 
            WebAppAskIntentHandler,
            WebAppExitIntentHandler,
            HelpIntentHandler,
            CancelAndStopIntentHandler,
            FallbackIntentHandler,
            SessionEndedRequestHandler,
        );
        
        const skill = skillBuilder.create();
        const expressAdapter = new ExpressAdapter(skill, false, false);

        app.post('/', expressAdapter.getRequestHandlers());
    }
}