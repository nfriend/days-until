import * as Alexa from 'ask-sdk-core';
import textWithImage from '~/apl/text-with-image.json';
import { ASSETS_BASE_URL } from '~/constants';
import i18n from 'i18next';
import { stripHtml } from './strip-html';

interface BuildRegularResponseParams {
  /** The handler input object */
  handlerInput: Alexa.HandlerInput;

  /** The text to speak */
  speak?: string;

  /** The reprompt text */
  reprompt?: string;

  /** URL to the image that should be shown */
  eventImageSrc: string;

  /** Text that will be shown visually */
  visualText: string;

  /** Text to be shown as the card's title. */
  cardTitle: string;
}

/**
 * Creates a response that includes an APL template
 * (text + an image), a standard card, and speech.
 * Used to eliminate some duplication below since
 * almost every turn in the conversation uses this pattern.
 */
export const buildRegularResponse = ({
  handlerInput,
  speak,
  reprompt,
  eventImageSrc,
  visualText,
  cardTitle,
}: BuildRegularResponseParams) => {
  const responseBuilder = handlerInput.responseBuilder;

  if (
    Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
      'Alexa.Presentation.APL'
    ]
  ) {
    responseBuilder.addDirective({
      type: 'Alexa.Presentation.APL.RenderDocument',
      token: 'token',
      document: textWithImage,
      datasources: {
        data: {
          headerTitle: i18n.t('Days Until'),
          headerImage: `${ASSETS_BASE_URL}/images/wall-calendar-with-logo.png`,
          text: visualText,
          eventImageSrc,
        },
      },
    });
  }

  if (speak) {
    responseBuilder.speak(speak);
  }

  if (reprompt) {
    responseBuilder.reprompt(reprompt);
  }

  responseBuilder.withStandardCard(
    cardTitle,
    stripHtml(visualText),
    eventImageSrc,
  );

  return responseBuilder;
};
