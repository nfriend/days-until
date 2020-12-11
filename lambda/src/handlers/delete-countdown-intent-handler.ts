import * as Alexa from 'ask-sdk-core';
import * as capitalize from 'capitalize';
import i18n from 'i18next';
import { IntentRequest, Response } from 'ask-sdk-model';
import { chooseOne } from '~/util/choose-one';
import { ASSETS_BASE_URL } from '~/constants';
import { buildRegularResponse } from '~/util/build-regular-response';
import { DaysUntilAttributes, db } from '~/adapters/dynamo-db';
import { getEventKey } from '~/util/get-event-key';
import { getFailureInterjection } from '~/util/get-failure-interjection';
import soundEffectWithSsml from '~/apla/sound-effect-with-ssml.json';

export const INTENT_NAME = 'DeleteCountdownIntent';

export const deleteCountdownIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === INTENT_NAME
    );
  },
  async handle(handlerInput: Alexa.HandlerInput): Promise<Response> {
    const intent = (handlerInput.requestEnvelope.request as IntentRequest)
      .intent;

    const countdownEventSlotValue = intent?.slots.CountdownEvent.value;

    const cardTitle = i18n.t('Delete a countdown');

    if (!countdownEventSlotValue) {
      // The user has not yet provided an event name

      const visualText = i18n.t('Which event would you like to delete?');
      const imageName = chooseOne(
        `question.png`,
        `conversation.png`,
        `interview.png`,
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/${imageName}`;

      const speak = chooseOne(
        i18n.t('Okay, which event would you like to delete?'),
        i18n.t('Sure, what event should I delete?'),
        i18n.t("Okay, what's the event you'd like to remove?"),
        i18n.t("What's the event to erase?"),
      );

      const reprompt = chooseOne(
        i18n.t('Sorry, which event should be deleted?'),
        i18n.t("Sorry, what's the name of the event that you want to delete?"),
      );

      return buildRegularResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak,
        reprompt,
      })
        .addElicitSlotDirective('CountdownEvent')
        .getResponse();
    }

    const eventName = capitalize.words(countdownEventSlotValue);
    const eventKey = getEventKey(eventName);

    const attributes: DaysUntilAttributes = await db.get(
      handlerInput.requestEnvelope,
    );

    const i18nData = { eventName };

    if (!attributes.events?.[eventKey]) {
      // We didn't find a matching event

      const visualText = i18n.t("{{eventName}} wasn't found", i18nData);
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
          i18n.t("I don't see a countdown for {{eventName}}.", i18nData),
          i18n.t("I couldn't find a countdown named {{eventName}}.", {
            eventName,
          }),
          i18n.t("I couldn't find a {{eventName}} countdown.", i18nData),
          i18n.t("I don't see a {{eventName}} countdown.", i18nData),
        ),
      ].join(' ');

      return buildRegularResponse({
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

    if (intent.confirmationStatus === 'NONE') {
      // The user has not yet confirmed everything is correct

      const visualText = chooseOne(
        i18n.t('Are you sure you want to delete {{eventName}}?', i18nData),
        i18n.t('Really remove {{eventName}}?', i18nData),
        i18n.t('Are you sure you want to erase {{eventName}}?', i18nData),
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/faq.png`;

      const speak = chooseOne(
        i18n.t('Are you sure you want to delete {{eventName}}?', i18nData),
        i18n.t('Are you sure you want to erase {{eventName}}?', i18nData),
        i18n.t(
          'Are you sure you want to permanently remove {{eventName}}?',
          i18nData,
        ),
      );

      const reprompt = chooseOne(
        i18n.t(
          "Sorry, I didn't catch that. Should I go ahead and delete {{eventName}}?",
          i18nData,
        ),
        i18n.t(
          "Sorry, I didn't catch that. Should I erase {{eventName}}?",
          i18nData,
        ),
      );

      return buildRegularResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak,
        reprompt,
      })
        .addConfirmIntentDirective()
        .getResponse();
    } else if (intent.confirmationStatus === 'DENIED') {
      // The user has decided not to delete the countdown

      const visualText = i18n.t('No countdowns have been deleted');
      const eventImageSrc = `${ASSETS_BASE_URL}/images/positive-vote.png`;

      const speak = chooseOne(
        i18n.t("Okay, I didn't delete anything."),
        i18n.t('Sounds good, nothing has been deleted.'),
      );

      return buildRegularResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak,
      })
        .withShouldEndSession(true)
        .getResponse();
    }

    await db.put(handlerInput.requestEnvelope, {
      events: {
        [eventKey]: null,
      },
    });

    const visualText = i18n.t('{{eventName}} has been deleted', i18nData);
    const eventImageSrc = `${ASSETS_BASE_URL}/images/calendar_with_red_x.png`;

    const speak = chooseOne(
      i18n.t('Done! {{eventName}} has been deleted.', i18nData),
      i18n.t(
        'All done! Your {{eventName}} countdown has been erased.',
        i18nData,
      ),
    );

    return buildRegularResponse({
      handlerInput,
      visualText,
      cardTitle,
      eventImageSrc,
      speak,
    })
      .withShouldEndSession(true)
      .getResponse();
  },
};
