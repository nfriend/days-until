import * as Alexa from 'ask-sdk-core';
import * as capitalize from 'capitalize';
import { IntentRequest, Response } from 'ask-sdk-model';
import { normalize } from '@nfriend/amazon.date-normalizer';
import { db } from '~/adapters/dynamo-db';
import { getEventKey } from '~/util/get-event-key';
import i18n from 'i18next';

export class StartCountdownIntentHandler implements Alexa.RequestHandler {
  canHandle(input: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(input.requestEnvelope) === 'StartCountdownIntent'
    );
  }
  async handle(input: Alexa.HandlerInput): Promise<Response> {
    const slots = (input.requestEnvelope.request as IntentRequest).intent.slots;

    const eventDateSlotValue = slots.EventDate.value;
    const countdownEventSlotValue = slots.CountdownEvent.value;

    const eventDate = normalize(eventDateSlotValue);
    const eventName = capitalize.words(countdownEventSlotValue);
    const eventKey = getEventKey(eventName);

    await db.put(input.requestEnvelope, {
      events: {
        [eventKey]: {
          eventName,
          eventDate: eventDate.toISOString(),
        },
      },
    });

    return input.responseBuilder
      .speak(
        i18n.t(
          'Done. To check on this countdown, just say, "Ask Days Until, how long until {{eventName}}?"',
          { eventName },
        ),
      )
      .withShouldEndSession(true)
      .getResponse();
  }
}
