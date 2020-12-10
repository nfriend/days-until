import * as Alexa from 'ask-sdk-core';
import * as capitalize from 'capitalize';
import { IntentRequest } from 'ask-sdk-model';
import { DaysUntilAttributes, db } from '~/adapters/dynamo-db';
import { INTENT_NAME as REPORT_COUNTDOWN_INTENT_NAME } from './report-countdown-intent-handler';
import { INTENT_NAME as LIST_ALL_COUNTDOWNS_INTENT_NAME } from './list-all-countdowns-intent-handler';
import { INTENT_NAME as START_COUNTDOWN_INTENT_NAME } from '~/handlers/start-countdown-intent-handler';

import { getEventKey } from '~/util/get-event-key';

export const canFulfillIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      'CanFulfillIntentRequest'
    );
  },
  async handle(handlerInput: Alexa.HandlerInput) {
    const { responseBuilder } = handlerInput;
    const { intent } = handlerInput.requestEnvelope.request as IntentRequest;
    const { userId } = handlerInput.requestEnvelope.context.System.user;
    const countdownEventSlotValue = intent.slots?.CountdownEvent?.value;
    const eventDateSlotValue = intent.slots?.EventDate?.value;

    if (intent.name === REPORT_COUNTDOWN_INTENT_NAME) {
      if (!userId) {
        responseBuilder.withCanFulfillIntent({
          canFulfill: 'NO',
        });
      } else if (!countdownEventSlotValue) {
        responseBuilder.withCanFulfillIntent({
          canFulfill: 'NO',
        });
      } else {
        const eventName = capitalize.words(countdownEventSlotValue);
        const eventKey = getEventKey(eventName);

        const attributes: DaysUntilAttributes = await db.get(
          handlerInput.requestEnvelope,
        );

        if (attributes.events?.[eventKey]) {
          responseBuilder.withCanFulfillIntent({
            canFulfill: 'YES',
            slots: {
              CountdownEvent: {
                canUnderstand: 'YES',
                canFulfill: 'YES',
              },
            },
          });
        } else {
          responseBuilder.withCanFulfillIntent({
            canFulfill: 'NO',
          });
        }
      }
    } else if (intent.name === LIST_ALL_COUNTDOWNS_INTENT_NAME) {
      if (userId) {
        responseBuilder.withCanFulfillIntent({
          canFulfill: 'YES',
        });
      } else {
        responseBuilder.withCanFulfillIntent({
          canFulfill: 'NO',
        });
      }
    } else if (intent.name === START_COUNTDOWN_INTENT_NAME) {
      if (countdownEventSlotValue && eventDateSlotValue) {
        responseBuilder.withCanFulfillIntent({
          canFulfill: 'YES',
          slots: {
            CountdownEvent: {
              canUnderstand: 'YES',
              canFulfill: 'YES',
            },
            EventDate: {
              canUnderstand: 'YES',
              canFulfill: 'YES',
            },
          },
        });
      } else {
        responseBuilder.withCanFulfillIntent({
          canFulfill: 'MAYBE',
        });
      }
    } else {
      responseBuilder.withCanFulfillIntent({
        canFulfill: 'NO',
      });
    }

    return responseBuilder.getResponse();
  },
};
