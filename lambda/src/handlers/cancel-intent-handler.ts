import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
import i18n from 'i18next';
import { ASSETS_BASE_URL } from '~/constants';
import { buildResponse } from '~/util/build-response';
import { chooseOne } from '~/util/choose-one';
import { setSessionAttributes } from '~/util/session-attributes';
import { YesNoIntentQuestion } from './yes-no-intent-question';

export const INTENT_NAME = 'AMAZON.CancelIntent';

export const cancelIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === INTENT_NAME
    );
  },
  async handle(handlerInput: Alexa.HandlerInput): Promise<Response> {
    setSessionAttributes(handlerInput, {
      YesNoIntentQuestion: YesNoIntentQuestion.ShouldStopPromptingForReminders,
    });

    const cardTitle = i18n.t('Cancelled');
    const visualText = i18n.t('What would you like to do?');
    const imageName = chooseOne(
      `question.png`,
      `conversation.png`,
      `interview.png`,
    );
    const eventImageSrc = `${ASSETS_BASE_URL}/images/${imageName}`;

    const speak = chooseOne(
      i18n.t('No problem. Would you like to do something else?'),
      i18n.t("Sure, no problem. Is there something else you'd like to do?"),
    );

    return buildResponse({
      handlerInput,
      visualText,
      cardTitle,
      eventImageSrc,
      speak,
    })
      .withShouldEndSession(false)
      .getResponse();
  },
};
