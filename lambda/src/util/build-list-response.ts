import * as Alexa from 'ask-sdk-core';
import listWithImages from '~/apl/list-with-images.json';
import { ASSETS_BASE_URL } from '~/constants';
import i18n from 'i18next';
import { stripHtml } from './strip-html';

interface BuildListResponseParams {
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

  /** The list of items to render */
  items: {
    /** The items's text */
    text: string;

    /** URL to the image that will be rendered next to the text */
    imageSrc: string;
  }[];
}

/**
 * Similar to buildRegularResponse, except this one
 * renders a list of items.
 */
export const buildListResponse = ({
  handlerInput,
  speak,
  reprompt,
  eventImageSrc,
  visualText,
  cardTitle,
  items,
}: BuildListResponseParams) => {
  const responseBuilder = handlerInput.responseBuilder;

  if (
    Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
      'Alexa.Presentation.APL'
    ]
  ) {
    responseBuilder.addDirective({
      type: 'Alexa.Presentation.APL.RenderDocument',
      token: 'token',
      document: listWithImages,
      datasources: {
        data: {
          headerTitle: i18n.t('Days Until'),
          headerImage: `${ASSETS_BASE_URL}/images/wall-calendar-with-logo.png`,
          items,
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
