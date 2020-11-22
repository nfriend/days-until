import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';

export class StartCountdownIntentHandler implements Alexa.RequestHandler {
  canHandle(input: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(input.requestEnvelope) === 'StartCountdownIntent'
    );
  }
  handle(input: Alexa.HandlerInput): Response | Promise<Response> {
    console.log('input:', input);

    return input.responseBuilder
      .speak("Sorry, but this handler isn't implemented yet!")
      .withShouldEndSession(true)
      .getResponse();
  }
}
