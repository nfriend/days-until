import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
import { REMINDERS_PERMISSIONS_TOKEN } from '~/constants';

export const connectionsResponseHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'Connections.Response' &&
      (handlerInput.requestEnvelope.request as any).token ===
        REMINDERS_PERMISSIONS_TOKEN
    );
  },
  async handle(handlerInput: Alexa.HandlerInput): Promise<Response> {
    return handlerInput.responseBuilder
      .speak('Not implemented!')
      .withShouldEndSession(true)
      .getResponse();
  },
};
