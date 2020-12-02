import * as Alexa from 'ask-sdk-core';
import * as capitalize from 'capitalize';
import { IntentRequest, Response } from 'ask-sdk-model';
import { normalize } from '@nfriend/amazon.date-normalizer';
import { db } from '~/adapters/dynamo-db';
import { getEventKey } from '~/util/get-event-key';
import i18n from 'i18next';
import { chooseOne } from '~/util/choose-one';
import startCountdownSuccessApl from '~/apl/start-countdown-success.json';
import startCountdownSuccessApla from '~/apla/start-countdown-success.json';
import { getImageForEvent } from '~/util/get-image-for-event';
import { getDaysUntil } from '~/util/get-days-until';
import { getAllSuccessInterjections } from '~/util/get-all-success-interjections';
import { ASSETS_BASE_URL } from '~/constants';

export class StartCountdownIntentHandler implements Alexa.RequestHandler {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'StartCountdownIntent'
    );
  }
  async handle(handlerInput: Alexa.HandlerInput): Promise<Response> {
    const intent = (handlerInput.requestEnvelope.request as IntentRequest)
      .intent;

    const countdownEventSlotValue = intent.slots.CountdownEvent.value;

    if (!countdownEventSlotValue) {
      // The user has not yet provided an event name

      if (
        Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
          'Alexa.Presentation.APL'
        ]
      ) {
        handlerInput.responseBuilder.addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          token: 'token',
          document: startCountdownSuccessApl,
          datasources: {
            data: {
              headerTitle: i18n.t('Testing!'),
              countdownStatusText: 'testing!',
              eventImageSrc: getImageForEvent('testing christmas'),
            },
          },
        });
      }

      return handlerInput.responseBuilder
        .speak(
          chooseOne(
            i18n.t("What's the event?"),
            i18n.t("Okay, What's the event?"),
            i18n.t('Sure. What event would you like to track?'),
          ),
        )
        .reprompt(
          chooseOne(
            i18n.t("Sorry, what's the event?"),
            i18n.t('Sorry, what event would you like to track?'),
          ),
        )
        .addElicitSlotDirective('CountdownEvent')
        .getResponse();
    }

    const eventDateSlotValue = intent.slots.EventDate.value;

    if (!eventDateSlotValue) {
      // The user has not yet provided an event date

      return handlerInput.responseBuilder
        .speak(
          chooseOne(
            i18n.t('Sure, when will it take place?'),
            i18n.t('Okay, when will it take place?'),
            i18n.t('When will it take place?'),
          ),
        )
        .reprompt(
          chooseOne(
            i18n.t('Sorry, when will it take place?'),
            i18n.t('Sorry, when will the event take place?'),
          ),
        )
        .addElicitSlotDirective('EventDate')
        .getResponse();
    }

    const eventDate = normalize(eventDateSlotValue);
    const eventName = capitalize.words(countdownEventSlotValue);

    if (intent.confirmationStatus !== 'CONFIRMED') {
      // The user has not yet confirmed everything is correct

      const i18nData = {
        eventName,
        eventDate: eventDate.format('YYYY-MM-DD'),
      };

      return handlerInput.responseBuilder
        .speak(
          chooseOne(
            i18n.t(
              "I'll create a new countdown for {{eventName}} on {{eventDate}}. Does that sound right?",
              i18nData,
            ),
            i18n.t(
              "Okay, I'll start a countdown for {{eventName}} on {{eventDate}}. Did I get that right?",
              i18nData,
            ),
            i18n.t(
              "I'll create a new countdown for {{eventName}} on {{eventDate}}. Is that right?",
              i18nData,
            ),
          ),
        )
        .reprompt(
          chooseOne(
            i18n.t(
              "Sorry, I didn't catch that. Should I go ahead and create the countdown?",
            ),
            i18n.t(
              "Sorry, I didn't catch that. Should I create the countdown?",
            ),
          ),
        )
        .addConfirmIntentDirective()
        .getResponse();
    }

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
        document: startCountdownSuccessApl,
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
      `${ASSETS_BASE_URL}/audio/333404__jayfrosting__cheer-2.mp3`,
      `${ASSETS_BASE_URL}/audio/400587__misjoc__medium-crowd-cheering-01.mp3`,
      `${ASSETS_BASE_URL}/audio/277019__sandermotions__applause-4.mp3`,
      `${ASSETS_BASE_URL}/audio/462362__breviceps__small-applause.mp3`,
    );

    return handlerInput.responseBuilder
      .addDirective({
        type: 'Alexa.Presentation.APLA.RenderDocument',
        token: 'token',
        document: startCountdownSuccessApla,
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
