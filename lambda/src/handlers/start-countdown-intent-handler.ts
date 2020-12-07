import * as Alexa from 'ask-sdk-core';
import * as capitalize from 'capitalize';
import moment from 'moment';
import { Intent, IntentRequest, Response } from 'ask-sdk-model';
import i18n from 'i18next';
import { normalize } from '@nfriend/amazon.date-normalizer';
import { db } from '~/adapters/dynamo-db';
import { getEventKey } from '~/util/get-event-key';
import { chooseOne } from '~/util/choose-one';
import soundEffectWithSsml from '~/apla/sound-effect-with-ssml.json';
import { getImageForEvent } from '~/util/get-image-for-event';
import { getDaysUntil } from '~/util/get-days-until';
import { getAllSuccessInterjections } from '~/util/get-all-success-interjections';
import { getFailureInterjection } from '~/util/get-failure-interjection';
import { buildResponse } from '~/util/build-response';
import { ASSETS_BASE_URL } from '~/constants';
import { YesIntentQuestion } from './yes-intent-handler';

const INTENT_NAME = 'StartCountdownIntent';

export const startCountdownIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    // If the user pressed a "Create a new countdown" button
    const wasCreateButtonPushed =
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'Alexa.Presentation.APL.UserEvent' &&
      (handlerInput.requestEnvelope.request as any).source.id ===
        'createNewButton';

    // If the intent was triggered normally, e.g. when the user
    // says "Create a new countdown"
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
    // also handles the "Create a new countdown" button press
    const countdownEventSlotValue = intent?.slots.CountdownEvent.value;

    // Again, because it's possible we're not currently inside an IntentRequest,
    // we need to makes sure we explicitly elicit slots for _this_ intent.
    const updatedIntent: Intent = intent || {
      name: INTENT_NAME,
      confirmationStatus: 'NONE',
      slots: {},
    };

    const cardTitle = i18n.t('Create a new countdown');

    if (!countdownEventSlotValue) {
      // The user has not yet provided an event name

      const visualText = i18n.t('What is the event?');
      const imageName = chooseOne(
        `question.png`,
        `conversation.png`,
        `interview.png`,
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/${imageName}`;

      const speak = chooseOne(
        i18n.t("What's the event?"),
        i18n.t("Okay, What's the event?"),
        i18n.t('Sure. What event would you like to track?'),
      );

      const reprompt = chooseOne(
        i18n.t("Sorry, what's the event?"),
        i18n.t('Sorry, what event would you like to track?'),
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

    const eventDateSlotValue = intent.slots.EventDate.value;

    if (!eventDateSlotValue) {
      // The user has not yet provided an event date

      const visualText = i18n.t('When is the event?');
      const imageName = chooseOne(
        '001-calendar.png',
        '002-calendar-1.png',
        '011-calendar-10.png',
        '012-calendar-11.png',
        '015-calendar-14.png',
        '016-calendar-15.png',
        '017-calendar-16.png',
        '024-calendar-22.png',
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/${imageName}`;

      const speak = chooseOne(
        i18n.t('Sure, when will it take place?'),
        i18n.t('Okay, when will it take place?'),
        i18n.t('When will it take place?'),
      );

      const reprompt = chooseOne(
        i18n.t('Sorry, when will it take place?'),
        i18n.t('Sorry, when will the event take place?'),
      );

      return buildResponse({
        handlerInput,
        visualText,
        eventImageSrc,
        speak,
        reprompt,
        cardTitle,
      })
        .addElicitSlotDirective('EventDate', updatedIntent)
        .getResponse();
    }

    const eventDate = normalize(eventDateSlotValue);
    const eventName = capitalize.words(countdownEventSlotValue);

    if (intent.confirmationStatus === 'NONE') {
      // The user has not yet confirmed everything is correct

      const visualText = [
        i18n.t('<b>{{eventName}}: {{eventDate}}</b><br><br>', {
          eventName,
          eventDate: eventDate.format('MMMM D, YYYY'),
        }),
        chooseOne(
          i18n.t('Does this look right?'),
          i18n.t('How does this look?'),
          i18n.t('Look good?'),
        ),
      ].join(' ');
      const eventImageSrc = `${ASSETS_BASE_URL}/images/faq.png`;

      const i18nData = {
        eventName,
        eventDate: eventDate.format('YYYY-MM-DD'),
      };

      const speak = chooseOne(
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
      );

      const reprompt = chooseOne(
        i18n.t(
          "Sorry, I didn't catch that. Should I go ahead and create the countdown?",
        ),
        i18n.t("Sorry, I didn't catch that. Should I create the countdown?"),
      );

      return buildResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak,
        reprompt,
      })
        .addConfirmIntentDirective(updatedIntent)
        .getResponse();
    } else if (intent.confirmationStatus === 'DENIED') {
      // The user has told us something is wrong with what we heard

      // Ideally, we would automatically restart this dialog, but the SDK
      // appears to have a bug where restarting an intent
      // does _not_ reset its `confirmationStatus`:
      // https://forums.developer.amazon.com/questions/221321/intent-confirmationstatus-cannot-be-changed-with-d.html
      // So, for now, we just ask the user to "manually" retrigger
      // this intent by promping them with the correct text.

      const visualText = i18n.t('Sorry about that!');
      const eventImageSrc = `${ASSETS_BASE_URL}/images/sad.png`;

      const speak = [
        getFailureInterjection(),
        chooseOne(
          i18n.t(
            'Sorry about that! Try saying "create a new countdown" again.',
          ),
          i18n.t(
            'Sorry! Say "start a new countdown" to give me another chance.',
          ),
        ),
      ].join(' ');

      const reprompt = i18n.t(
        'If you\'d like to try again, just say "create a new countdown".',
      );

      return buildResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak,
        reprompt,
      }).getResponse();
    }

    const eventKey = getEventKey(eventName);

    await db.put(handlerInput.requestEnvelope, {
      events: {
        [eventKey]: {
          eventName,
          eventDate: eventDate.toISOString(),
          createdOn: moment().utc().toISOString(),
        },
      },
    });

    handlerInput.attributesManager.setSessionAttributes({
      YesIntentQuestion: YesIntentQuestion.ShouldCreateReminder,
      eventName,
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

    const eventIsAtLeast2DaysAway = eventDate
      .clone()
      .subtract(1, 'day')
      .isAfter(moment.utc());

    if (eventIsAtLeast2DaysAway) {
      speeches.push(
        chooseOne(
          i18n.t(
            'Would you like to create a daily reminder for this countdown starting ten days before the event?',
          ),
          i18n.t(
            'Would you like daily reminders during the ten days leading up to this event?',
          ),
        ),
      );
    }

    const eventImageSrc = getImageForEvent(eventName);
    const visualText = getDaysUntil(eventDate, eventName).visual;

    const backgroundAudio = chooseOne(
      'soundbank://soundlibrary/human/amzn_sfx_crowd_cheer_med_01',
      `${ASSETS_BASE_URL}/audio/333404__jayfrosting__cheer-2.mp3`,
      `${ASSETS_BASE_URL}/audio/400587__misjoc__medium-crowd-cheering-01.mp3`,
      `${ASSETS_BASE_URL}/audio/277019__sandermotions__applause-4.mp3`,
      `${ASSETS_BASE_URL}/audio/462362__breviceps__small-applause.mp3`,
    );

    const response = buildResponse({
      handlerInput,
      visualText,
      eventImageSrc,
      cardTitle: eventName,
    }).addDirective({
      type: 'Alexa.Presentation.APLA.RenderDocument',
      token: 'token',
      document: soundEffectWithSsml,
      datasources: {
        data: {
          ssml: speeches.join(' '),
          backgroundAudio,
        },
      },
    });

    if (!eventIsAtLeast2DaysAway) {
      response.withShouldEndSession(true);
    }

    return response.getResponse();
  },
};
