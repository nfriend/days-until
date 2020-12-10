import * as Alexa from 'ask-sdk-core';
import { YesNoIntentQuestion } from './yes-no-intent-question';
import i18n from 'i18next';
import { chooseOne } from '~/util/choose-one';
import { ASSETS_BASE_URL } from '~/constants';
import { buildResponse } from '~/util/build-response';
import { db } from '~/adapters/dynamo-db';
import {
  getSessionAttributes,
  setSessionAttributes,
} from '~/util/session-attributes';

export const noIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput) {
    const question: YesNoIntentQuestion = getSessionAttributes(handlerInput)
      .YesNoIntentQuestion;

    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent' &&
      Object.values(YesNoIntentQuestion).includes(question)
    );
  },
  async handle(handlerInput: Alexa.HandlerInput) {
    const question: YesNoIntentQuestion = getSessionAttributes(handlerInput)
      .YesNoIntentQuestion;

    if (question === YesNoIntentQuestion.ShouldCreateReminder) {
      setSessionAttributes(handlerInput, {
        YesNoIntentQuestion:
          YesNoIntentQuestion.ShouldStopPromptingForReminders,
      });

      const cardTitle = i18n.t('Reminder preferences');
      const visualText = i18n.t(
        'Would you like stop being prompted for reminders?',
      );
      const imageName = chooseOne(
        `question.png`,
        `conversation.png`,
        `interview.png`,
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/${imageName}`;

      const speak = i18n.t(
        'No problem, would you like me to stop prompting you to create reminders in the future?',
      );

      const reprompt = chooseOne(
        i18n.t(
          'Sorry, should I stop prompting you for reminders when you create countdowns in the future?',
        ),
      );

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
    } else if (question === YesNoIntentQuestion.ShouldCreateAnotherReminder) {
      const cardTitle = i18n.t('Create a new countdown');
      const visualText = i18n.t('All done!');
      const eventImageSrc = `${ASSETS_BASE_URL}/images/positive-vote.png`;

      const speak = chooseOne(
        i18n.t('Sounds good!'),
        i18n.t('Okay, no problem.'),
        i18n.t('Okay, sounds good.'),
      );

      return buildResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak,
      })
        .withShouldEndSession(true)
        .getResponse();
    } else if (
      question === YesNoIntentQuestion.ShouldStopPromptingForReminders
    ) {
      await db.put(handlerInput.requestEnvelope, {
        doNotPromptForReminders: false,
      });

      const cardTitle = i18n.t('Reminder preferences');
      const visualText = i18n.t("You'll continue to be prompted for reminders");
      const eventImageSrc = `${ASSETS_BASE_URL}/images/positive-vote.png`;

      const speak = i18n.t(
        "Great, I'll continue to ask when you make countdowns in the future.",
      );

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
        `Unhandled YesNoIntentQuestion in noIntentHandler: "${question}"`,
      );
    }
  },
};
