import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
import i18n from 'i18next';
import { ASSETS_BASE_URL } from '~/constants';
import { buildResponse } from '~/util/build-response';

export const INTENT_NAME = 'AMAZON.HelpIntent';

export const helpIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === INTENT_NAME
    );
  },
  async handle(handlerInput: Alexa.HandlerInput): Promise<Response> {
    const cardTitle = i18n.t('Help');
    const visualText = i18n.t('Here are some ways to use this skill');
    const eventImageSrc = `${ASSETS_BASE_URL}/images/lifebuoy.png`;

    const speak = [
      i18n.t(
        'Start by creating a new countdown. You can do this by saying "Ask Days Until to create a new countdown".',
      ),
      i18n.t(
        'Once you\'ve created a countdown, you can check on its status by saying "how many days until my birthday", for example.',
      ),
      i18n.t(
        'You can delete a countdown by saying "Ask Days Until to delete a countdown".',
      ),
      i18n.t(
        "There's also a few other things I can do. See this skill's description in the Alexa App for a complete list.",
      ),
      i18n.t('Hopefully that helped! Now, what would you like to do?'),
    ].join(' ');

    const reprompt = i18n.t('Sorry, what would you like to do?');

    return buildResponse({
      handlerInput,
      visualText,
      cardTitle,
      eventImageSrc,
      speak,
      reprompt,
    })
      .withShouldEndSession(false)
      .getResponse();
  },
};
