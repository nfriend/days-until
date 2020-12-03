import * as Alexa from 'ask-sdk-core';

export const sessionEndedRequestHandler: Alexa.RequestHandler = {
  canHandle(input: Alexa.HandlerInput) {
    return (
      Alexa.getRequestType(input.requestEnvelope) === 'SessionEndedRequest'
    );
  },
  handle(handlerInput: Alexa.HandlerInput) {
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse();
  },
};
