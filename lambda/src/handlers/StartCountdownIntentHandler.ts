import * as Alexa from 'ask-sdk-core';
import * as capitalize from 'capitalize';
import { IntentRequest, Response } from 'ask-sdk-model';
import { normalize } from '@nfriend/amazon.date-normalizer';
import { db } from '~/adapters/dynamo-db';
import { getEventKey } from '~/util/get-event-key';
import i18n from 'i18next';
import { chooseOne } from '~/util/choose-one';

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

    const speeches = [];

    speeches.push(
      chooseOne(
        // Typing Short (2)
        i18n.t(
          '<audio src="soundbank://soundlibrary/office/amzn_sfx_typing_short_02"/>',
        ),

        // Swoosh Fast 1x (1)
        i18n.t(
          '<audio src="soundbank://soundlibrary/foley/amzn_sfx_swoosh_fast_1x_01"/>',
        ),

        // Hits (10)
        i18n.t('<audio src="soundbank://soundlibrary/wood/hits/hits_10"/>'),

        // Movement (8)
        i18n.t(
          '<audio src="soundbank://soundlibrary/telephones/movement/movement_08"/>',
        ),

        // Screens (10)
        i18n.t(
          '<audio src="soundbank://soundlibrary/computers/screens/screens_10"/>',
        ),

        // Watches (6)
        i18n.t(
          '<audio src="soundbank://soundlibrary/clocks/watches/watches_06"/>',
        ),

        // Hits (6)
        i18n.t('<audio src="soundbank://soundlibrary/glass/hits/hits_06"/>'),

        // Glasses Clink (2)
        i18n.t(
          '<audio src="soundbank://soundlibrary/foley/amzn_sfx_glasses_clink_02"/>',
        ),
      ),
    );

    speeches.push(
      chooseOne(
        i18n.t('Done!'),
        i18n.t("You're all set!"),
        i18n.t('Got it!'),
        i18n.t('Okay'),
        i18n.t('Great!'),
        i18n.t('Perfect.'),
      ),
    );

    speeches.push(
      i18n.t(
        'To check on this countdown, just say, "Ask Days Until, how long until {{eventName}}?"',
        { eventName },
      ),
    );

    return input.responseBuilder
      .speak(speeches.join(' '))
      .withShouldEndSession(true)
      .getResponse();
  }
}
