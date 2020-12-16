import * as Alexa from 'ask-sdk-core';
import i18n from 'i18next';
import { ASSETS_BASE_URL } from '~/constants';
import { buildRegularResponse } from './build-regular-response';
import { chooseOne } from './choose-one';
import { getFailureInterjection } from './get-failure-interjection';
import soundEffectWithSsml from '~/apla/sound-effect-with-ssml.json';

/**
 * Returns a response that tells the user the requested event wasn't found
 *
 * @param handlerInput The current handlerInput
 * @param eventName The name of the requested event
 * @param cardTitle The text to show as the card's title
 */
export const getEventNotFoundResponse = (
  handlerInput: Alexa.HandlerInput,
  eventName: string,
  cardTitle: string,
) => {
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
};
