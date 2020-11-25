import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
import i18n from 'i18next';
import { chooseOne } from '~/util/choose-one';

export class LaunchRequestHandler implements Alexa.RequestHandler {
  canHandle(input: Alexa.HandlerInput): boolean | Promise<boolean> {
    return Alexa.getRequestType(input.requestEnvelope) === 'LaunchRequest';
  }
  handle(input: Alexa.HandlerInput): Response | Promise<Response> {
    const isFirstLaunch: boolean = input.attributesManager.getRequestAttributes()
      .isFirstLaunch;

    const speeches = [];

    if (isFirstLaunch) {
      speeches.push(
        chooseOne(
          i18n.t('Welcome to Days Until!'),
          i18n.t('Hello!'),
          i18n.t('Hi there!'),
          i18n.t('Hi!'),
        ),
        i18n.t('Looks like this is your first visit!'),
        i18n.t(
          'To get started, say <break strength="strong"/> <prosody pitch="+10%">"start a new countdown."</prosody>',
        ),
      );
    } else {
      speeches.push(
        chooseOne(
          i18n.t('Hello again!'),
          i18n.t('Hello!'),
          i18n.t('Hi there!'),
          i18n.t('Hi!'),
          i18n.t('Hi again!'),
          i18n.t('Hey there!'),
        ),
        chooseOne(
          i18n.t(
            'Would you like to create a new countdown or check an existing one?',
          ),
          i18n.t(
            'Would you like to start a new countdown or check an existing one?',
          ),
          i18n.t(
            'Would you like to begin a new countdown or check an existing countdown?',
          ),
        ),
      );
    }

    return input.responseBuilder
      .speak(speeches.join(' '))
      .reprompt(
        chooseOne(
          i18n.t("I didn't catch that - can you repeat what you'd like to do?"),
          i18n.t(
            "Sorry, I didn't quite catch that. What would you like to do?",
          ),
          i18n.t('Sorry, I missed that. How can I help?'),
        ),
      )
      .getResponse();
  }
}
