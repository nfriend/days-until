import * as Alexa from 'ask-sdk-core';
import { db } from '~/adapters/dynamo-db';
import i18n from 'i18next';
import { createReminderIntentHandler } from './create-reminder-intent-handler';
import { YesNoIntentQuestion } from './yes-no-intent-question';
import { ASSETS_BASE_URL } from '~/constants';
import { buildResponse } from '~/util/build-response';
import { getSessionAttributes } from '~/util/get-sessions-attributes';

export const yesIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput) {
    const question: YesNoIntentQuestion = getSessionAttributes(handlerInput)
      .YesNoIntentQuestion;

    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'AMAZON.YesIntent' &&
      Object.values(YesNoIntentQuestion).includes(question)
    );
  },
  async handle(handlerInput: Alexa.HandlerInput) {
    const question: YesNoIntentQuestion = getSessionAttributes(handlerInput)
      .YesNoIntentQuestion;

    if (question === YesNoIntentQuestion.ShouldCreateReminder) {
      return createReminderIntentHandler.handle(handlerInput);
    } else if (
      question === YesNoIntentQuestion.ShouldStopPromptingForReminders
    ) {
      await db.put(handlerInput.requestEnvelope, {
        doNotPromptForReminders: true,
      });

      const cardTitle = i18n.t('Reminder preferences');
      const visualText = i18n.t(
        "You'll no longer be prompted to create reminders",
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/positive-vote.png`;

      const speak = i18n.t("Sounds good, I won't ask again!");

      return buildResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak,
      })
        .withShouldEndSession(true)
        .getResponse();
    } else {
      throw new Error(
        `Unhandled YesNoIntentQuestion in yesIntentHandler: "${question}"`,
      );
    }
  },
};
