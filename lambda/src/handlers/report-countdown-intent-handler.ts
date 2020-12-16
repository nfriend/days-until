import * as Alexa from 'ask-sdk-core';
import * as capitalize from 'capitalize';
import i18n from 'i18next';
import { Intent, IntentRequest, Response } from 'ask-sdk-model';
import moment from 'moment';
import { chooseOne } from '~/util/choose-one';
import { ASSETS_BASE_URL } from '~/constants';
import { buildRegularResponse } from '~/util/build-regular-response';
import { DaysUntilAttributes, db } from '~/adapters/dynamo-db';
import { getEventKey } from '~/util/get-event-key';
import soundEffectWithSsml from '~/apla/sound-effect-with-ssml.json';
import { getDaysUntil } from '~/util/get-days-until';
import { getImageForEvent } from '~/util/get-image-for-event';
import { getUserTimezone } from '~/util/get-user-timezone';
import { getEventNotFoundResponse } from '~/util/get-event-not-found-response';

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

      return buildRegularResponse({
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
      const daysUntil = getDaysUntil(
        eventDate,
        eventName,
        await getUserTimezone(handlerInput),
      );

      const backgroundAudio = chooseOne(
        'soundbank://soundlibrary/human/amzn_sfx_crowd_cheer_med_01',
        `${ASSETS_BASE_URL}/audio/333404__jayfrosting__cheer-2.mp3`,
        `${ASSETS_BASE_URL}/audio/400587__misjoc__medium-crowd-cheering-01.mp3`,
        `${ASSETS_BASE_URL}/audio/277019__sandermotions__applause-4.mp3`,
        `${ASSETS_BASE_URL}/audio/462362__breviceps__small-applause.mp3`,
      );

      return buildRegularResponse({
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

      return getEventNotFoundResponse(handlerInput, eventName, cardTitle);
    }
  },
};
