import * as Alexa from 'ask-sdk-core';
import { db } from '~/adapters/dynamo-db';
import i18n from 'i18next';
import { createReminderIntentHandler } from './create-reminder-intent-handler';
import { startCountdownIntentHandler } from './start-countdown-intent-handler';
import { YesNoIntentQuestion } from './yes-no-intent-question';
import { ASSETS_BASE_URL } from '~/constants';
import { buildRegularResponse } from '~/util/build-regular-response';
import { getSessionAttributes } from '~/util/session-attributes';
import { chooseOne } from '~/util/choose-one';

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
    } else if (question === YesNoIntentQuestion.ShouldCreateAnotherReminder) {
      return startCountdownIntentHandler.handle(handlerInput);
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

      return buildRegularResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak,
      })
        .withShouldEndSession(true)
        .getResponse();
    } else if (question === YesNoIntentQuestion.ShouldDoSomethingElse) {
      const cardTitle = i18n.t('Days Until');
      const visualText = i18n.t('What would you like to do?');
      const imageName = chooseOne(
        `question.png`,
        `conversation.png`,
        `interview.png`,
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/${imageName}`;

      const speak = chooseOne(
        i18n.t('Okay, what would you like to do?'),
        i18n.t('Sure, what would you like to do?'),
      );

      return buildRegularResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak,
      })
        .withShouldEndSession(false)
        .getResponse();
    } else {
      throw new Error(
        `Unhandled YesNoIntentQuestion in yesIntentHandler: "${question}"`,
      );
    }
  },
};
