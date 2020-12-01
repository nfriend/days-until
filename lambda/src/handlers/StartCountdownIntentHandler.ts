import * as Alexa from 'ask-sdk-core';
import * as capitalize from 'capitalize';
import { IntentRequest, Response } from 'ask-sdk-model';
import { normalize } from '@nfriend/amazon.date-normalizer';
import { db } from '~/adapters/dynamo-db';
import { getEventKey } from '~/util/get-event-key';
import i18n from 'i18next';
import { chooseOne } from '~/util/choose-one';
import startCountdownApl from '~/apl/start-countdown.json';
import startCountdownApla from '~/apla/start-countdown.json';
import { getImageForEvent } from '~/util/get-image-for-event';
import { getDaysUntil } from '~/util/get-days-until';
import { getAllSuccessInterjections } from '~/util/get-all-success-interjections';

export class StartCountdownIntentHandler implements Alexa.RequestHandler {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'StartCountdownIntent'
    );
  }
  async handle(handlerInput: Alexa.HandlerInput): Promise<Response> {
    const slots = (handlerInput.requestEnvelope.request as IntentRequest).intent
      .slots;

    const eventDateSlotValue = slots.EventDate.value;
    const countdownEventSlotValue = slots.CountdownEvent.value;

    const eventDate = normalize(eventDateSlotValue);
    const eventName = capitalize.words(countdownEventSlotValue);
    const eventKey = getEventKey(eventName);

    await db.put(handlerInput.requestEnvelope, {
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
        i18n.t('Done!'),
        i18n.t("You're all set!"),
        i18n.t('Got it!'),
        i18n.t('Awesome!'),
        i18n.t('Great!'),
        i18n.t('Perfect.'),
        ...getAllSuccessInterjections(),
      ),
    );

    speeches.push(
      i18n.t(
        'To check on this countdown, just say: <break strength="strong"/> Ask Days Until, how long until {{eventName}}?',
        { eventName },
      ),
    );

    if (
      Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
        'Alexa.Presentation.APL'
      ]
    ) {
      handlerInput.responseBuilder.addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: 'token',
        document: startCountdownApl,
        datasources: {
          data: {
            headerTitle: i18n.t('Days Until'),
            countdownStatusText: getDaysUntil(eventDate, eventName).visual,
            eventImageSrc: getImageForEvent(eventName),
          },
        },
      });
    }

    const backgroundAudio = chooseOne(
      'soundbank://soundlibrary/human/amzn_sfx_crowd_cheer_med_01',
      'soundbank://soundlibrary/human/amzn_sfx_large_crowd_cheer_02',
      'soundbank://soundlibrary/human/amzn_sfx_large_crowd_cheer_03',
      'soundbank://soundlibrary/human/amzn_sfx_crowd_applause_01',
      'soundbank://soundlibrary/human/amzn_sfx_crowd_applause_02',
    );

    return handlerInput.responseBuilder
      .addDirective({
        type: 'Alexa.Presentation.APLA.RenderDocument',
        token: 'token',
        document: startCountdownApla,
        datasources: {
          data: {
            ssml: speeches.join(' '),
            backgroundAudio,
          },
        },
      })
      .withShouldEndSession(true)
      .getResponse();
  }
}
