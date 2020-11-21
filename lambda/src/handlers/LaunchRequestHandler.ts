import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
import i18n from 'i18next';
import { chooseOne } from '../util/choose-one';

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
          i18n.t('Testing the translation linter!'),
          i18n.t('Hello!'),
          i18n.t('Hi there!'),
        ),
        i18n.t('Looks like this is your first visit!'),
        i18n.t(
          'You can create a new countdown by saying something like <break strength="strong"/> <prosody pitch="+10%">"start a new countdown for my birthday."</prosody>',
        ),
        i18n.t(
          'Then, check on its status by saying <break strength="strong"/> <prosody pitch="+10%">"Ask Days Until, how long until my birthday?"</prosody>',
        ),
        i18n.t('What would you like to do?'),
      );
    } else {
      speeches.push(
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
