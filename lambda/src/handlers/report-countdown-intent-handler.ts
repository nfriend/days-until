import * as Alexa from 'ask-sdk-core';
import * as capitalize from 'capitalize';
import i18n from 'i18next';
import { Intent, IntentRequest, Response } from 'ask-sdk-model';
import moment from 'moment';
import { chooseOne } from '~/util/choose-one';
import { ASSETS_BASE_URL } from '~/constants';
import { buildResponse } from '~/util/build-response';
import { DaysUntilAttributes, db } from '~/adapters/dynamo-db';
import { getEventKey } from '~/util/get-event-key';
import { getFailureInterjection } from '~/util/get-failure-interjection';
import soundEffectWithSsml from '~/apla/sound-effect-with-ssml.json';
import { getDaysUntil } from '~/util/get-days-until';
import { getImageForEvent } from '~/util/get-image-for-event';

export const INTENT_NAME = 'ReportCountdownIntent';

export const reportCountdownIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    // If the user pressed a "Check an existing countdown" button
    const wasCreateButtonPushed =
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'Alexa.Presentation.APL.UserEvent' &&
      (handlerInput.requestEnvelope.request as any).source.id ===
        'checkExistingButton';

    // If the intent was triggered normally, e.g. when the user
    // says "Check on an existing countdown"
    const wasCreateIntentRequested =
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === INTENT_NAME;

    // This handler handles both
    return wasCreateButtonPushed || wasCreateIntentRequested;
  },
  async handle(handlerInput: Alexa.HandlerInput): Promise<Response> {
    const intent = (handlerInput.requestEnvelope.request as IntentRequest)
      .intent;

    // It's possible intent may not be provided since this handler
    // also handles the "Check an existing countdown" button press
    const countdownEventSlotValue = intent?.slots.CountdownEvent.value;

    // Again, because it's possible we're not currently inside an IntentRequest,
    // we need to makes sure we explicitly elicit slots for _this_ intent.
    const updatedIntent: Intent = intent || {
      name: INTENT_NAME,
      confirmationStatus: 'NONE',
      slots: {},
    };

    const cardTitle = i18n.t('Check a countdown');

    if (!countdownEventSlotValue) {
      // The user has not yet provided an event name

      const visualText = i18n.t('Which event?');
      const imageName = chooseOne(
        `question.png`,
        `conversation.png`,
        `interview.png`,
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/${imageName}`;

      const speak = chooseOne(
        i18n.t('Okay, which event?'),
        i18n.t('Sure, what event?'),
        i18n.t("Okay, what's the event?"),
        i18n.t("What's the event?"),
      );

      const reprompt = chooseOne(
        i18n.t("Sorry, what's the event?"),
        i18n.t("Sorry, what's the name of the event?"),
      );

      return buildResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak,
        reprompt,
      })
        .addElicitSlotDirective('CountdownEvent', updatedIntent)
        .getResponse();
    }

    const eventName = capitalize.words(countdownEventSlotValue);
    const eventKey = getEventKey(eventName);

    const attributes: DaysUntilAttributes = await db.get(
      handlerInput.requestEnvelope,
    );

    if (attributes.events?.[eventKey]) {
      // We found the event!

      const eventDate = moment(attributes.events[eventKey].eventDate).utc();
      const eventImageSrc = getImageForEvent(eventName);
      const daysUntil = getDaysUntil(eventDate, eventName);

      const backgroundAudio = chooseOne(
        'soundbank://soundlibrary/human/amzn_sfx_crowd_cheer_med_01',
        `${ASSETS_BASE_URL}/audio/333404__jayfrosting__cheer-2.mp3`,
        `${ASSETS_BASE_URL}/audio/400587__misjoc__medium-crowd-cheering-01.mp3`,
        `${ASSETS_BASE_URL}/audio/277019__sandermotions__applause-4.mp3`,
        `${ASSETS_BASE_URL}/audio/462362__breviceps__small-applause.mp3`,
      );

      return buildResponse({
        handlerInput,
        visualText: daysUntil.visual,
        cardTitle: eventName,
        eventImageSrc,
      })
        .addDirective({
          type: 'Alexa.Presentation.APLA.RenderDocument',
          token: 'token',
          document: soundEffectWithSsml,
          datasources: {
            data: {
              ssml: daysUntil.speech,
              backgroundAudio,
            },
          },
        })
        .withShouldEndSession(true)
        .getResponse();
    } else {
      // We didn't find a matching event

      const visualText = i18n.t("{{eventName}} wasn't found", { eventName });
      const imageName = chooseOne(
        'confusion.png',
        'not-found.png',
        'speech-bubble.png',
        'sorry.png',
        'thinking.png',
        'broken-heart.png',
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/${imageName}`;

      const audioName = chooseOne(
        'ooo-1.mp3',
        'ooo-2.mp3',
        'ooo-3.mp3',
        'ooo-4.mp3',
        '73581__benboncan__sad-trombone.mp3',
        '336998__tim-kahn__awww-01.mp3',
      );
      const backgroundAudio = `${ASSETS_BASE_URL}/audio/${audioName}`;

      const speak = [
        getFailureInterjection(),
        chooseOne(
          i18n.t("I don't see a countdown for {{eventName}}", { eventName }),
          i18n.t("I couldn't find a countdown named {{eventName}}", {
            eventName,
          }),
          i18n.t("I couldn't find a {{eventName}} countdown", { eventName }),
          i18n.t("I don't see a {{eventName}} countdown", { eventName }),
        ),
      ].join(' ');

      return buildResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
      })
        .addDirective({
          type: 'Alexa.Presentation.APLA.RenderDocument',
          token: 'token',
          document: soundEffectWithSsml,
          datasources: {
            data: {
              ssml: speak,
              backgroundAudio,
            },
          },
        })
        .withShouldEndSession(true)
        .getResponse();
    }
  },
};
