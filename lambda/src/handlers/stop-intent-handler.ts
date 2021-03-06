import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
import i18n from 'i18next';
import { ASSETS_BASE_URL } from '~/constants';
import { buildRegularResponse } from '~/util/build-regular-response';
import { chooseOne } from '~/util/choose-one';

export const INTENT_NAME = 'AMAZON.StopIntent';

export const stopIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === INTENT_NAME
    );
  },
  async handle(handlerInput: Alexa.HandlerInput): Promise<Response> {
    const cardTitle = i18n.t('All done');
    const visualText = i18n.t('Have a great day!');
    const eventImageSrc = `${ASSETS_BASE_URL}/images/waving-hand.png`;

    const speak = chooseOne(
      i18n.t('Have a good one!'),
      i18n.t('Have a great day!'),
      i18n.t('Counting the days until we chat again!'),
      i18n.t('Toodles!'),
      i18n.t('Chat again soon!'),
      i18n.t('See you!'),
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
