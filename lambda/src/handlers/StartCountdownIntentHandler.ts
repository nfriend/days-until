import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';

export class StartCountdownIntentHandler implements Alexa.RequestHandler {
  canHandle(input: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(input.requestEnvelope) === 'StartCountdownIntent'
    );
  }
  handle(): Response | Promise<Response> {
    throw new Error(
      `StartCountdownIntent is not yet implemented! Sentry release version: ${process.env.SENTRY_RELEASE_VERSION}`,
    );
  }
}
