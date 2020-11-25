import * as Alexa from 'ask-sdk-core';
import * as Sentry from '@sentry/node';
import i18n from 'i18next';
import { chooseOne } from '~/util/choose-one';
import { getFailureInterjection } from '~/util/get-failure-interjection';

export class ErrorHandler implements Alexa.ErrorHandler {
  canHandle() {
    return true;
  }
  handle(handlerInput: Alexa.HandlerInput, error: Error) {
    console.log(`~~~~ error:`, error);
    console.log(`~~~~ handlerInput:`, handlerInput);

    Sentry.captureException(error);

    const speeches: string[] = [];

    speeches.push(getFailureInterjection());

    speeches.push(
      chooseOne(
        i18n.t('I had trouble doing what you asked. Please try again.'),
        i18n.t('Something went wrong. Can you try again?'),
        i18n.t('Something went wrong - sorry about that! Can you try again?'),
        i18n.t(
          "I'm sorry, but I had trouble doing what you asked! Can you try again?",
        ),
      ),
    );

    const speech = speeches.join(' ');

    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt(speech)
      .getResponse();
  }
}
