import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';

const INTENT_NAME = 'AMAZON.FallbackIntent';

export const fallbackIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === INTENT_NAME
    );
  },
  handle(handlerInput: Alexa.HandlerInput): Response | Promise<Response> {
    return handlerInput.responseBuilder
      .speak('inside the fallback handler')
      .getResponse();
  },
};
