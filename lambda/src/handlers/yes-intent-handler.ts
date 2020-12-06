import * as Alexa from 'ask-sdk-core';
import { createReminderIntentHandler } from './create-reminder-intent-handler';

export enum YesIntentQuestion {
  ShouldCreateReminder = 'ShouldCreateReminder',
}

export const yesIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput) {
    const question: YesIntentQuestion = handlerInput.attributesManager.getSessionAttributes()
      .YesIntentQuestion;

    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        'AMAZON.YesIntent' &&
      Object.values(YesIntentQuestion).includes(question)
    );
  },
  async handle(handlerInput: Alexa.HandlerInput) {
    const question: YesIntentQuestion = handlerInput.attributesManager.getSessionAttributes()
      .YesIntentQuestion;

    if (question === YesIntentQuestion.ShouldCreateReminder) {
      return createReminderIntentHandler.handle(handlerInput);
    } else {
      throw new Error(`Unhandled YesIntentQuestion: "${question}"`);
    }
  },
};
