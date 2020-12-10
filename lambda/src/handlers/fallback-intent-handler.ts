import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
import i18n from 'i18next';
import { ASSETS_BASE_URL } from '~/constants';
import { buildRegularResponse } from '~/util/build-regular-response';
import { chooseOne } from '~/util/choose-one';
import { getFailureInterjection } from '~/util/get-failure-interjection';
import soundEffectWithSsml from '~/apla/sound-effect-with-ssml.json';

const INTENT_NAME = 'AMAZON.FallbackIntent';

export const fallbackIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === INTENT_NAME
    );
  },
  handle(handlerInput: Alexa.HandlerInput): Response | Promise<Response> {
    const cardTitle = i18n.t('Hmm...');
    const visualText = i18n.t("Days Until isn't sure how to do that!");
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
        i18n.t("Sorry, but Days Until doesn't know how to do that!"),
        i18n.t("Sorry, but this skill can't do that!"),
        i18n.t("Sorry, but I'm not sure how to do that!"),
      ),
      chooseOne(
        i18n.t(
          'You can create, check, and delete countdowns, and also set countdown reminders.',
        ),
      ),
      chooseOne(i18n.t('What would you like to do?')),
    ].join(' ');

    const reprompt = i18n.t('Sorry, what would you like to do?');

    return buildRegularResponse({
      handlerInput,
      visualText,
      cardTitle,
      eventImageSrc,
      reprompt,
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
      .withShouldEndSession(false)
      .getResponse();
  },
};
