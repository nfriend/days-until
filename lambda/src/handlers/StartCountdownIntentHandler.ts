import * as Alexa from 'ask-sdk-core';
import { IntentRequest, Response } from 'ask-sdk-model';
import { normalize } from '@nfriend/amazon.date-normalizer';

export class StartCountdownIntentHandler implements Alexa.RequestHandler {
  canHandle(input: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(input.requestEnvelope) === 'StartCountdownIntent'
    );
  }
  handle(input: Alexa.HandlerInput): Response | Promise<Response> {
    const eventDateSlotValue = (input.requestEnvelope.request as IntentRequest)
      .intent.slots.EventDate.value;

    const eventDate = normalize(eventDateSlotValue);

    return input.responseBuilder
      .speak(
        `If I was working, I would create an event on ${eventDate.format(
          'YYYY/MM/DD',
        )}`,
      )
      .withShouldEndSession(true)
      .getResponse();
  }
}
