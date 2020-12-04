import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
import i18n from 'i18next';
import { chooseOne } from '~/util/choose-one';
import launchApl from '~/apl/launch.json';
import { ASSETS_BASE_URL } from '~/constants';
import textWithImage from '~/apl/text-with-image.json';

export const launchRequestHandler: Alexa.RequestHandler = {
  canHandle(input: Alexa.HandlerInput): boolean | Promise<boolean> {
    return Alexa.getRequestType(input.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput: Alexa.HandlerInput): Response | Promise<Response> {
    const isFirstLaunch: boolean = handlerInput.attributesManager.getRequestAttributes()
      .isFirstLaunch;

    let text;
    const eventImageSrc = chooseOne(
      `${ASSETS_BASE_URL}/images/waving-hand.png`,
      `${ASSETS_BASE_URL}/images/waving-hand-2.png`,
    );

    const speeches = [];

    if (isFirstLaunch) {
      text = i18n.t('Trying saying, "Create a new countdown."');

      if (
        Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
          'Alexa.Presentation.APL'
        ]
      ) {
        handlerInput.responseBuilder.addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          token: 'token',
          document: textWithImage,
          datasources: {
            data: {
              headerTitle: i18n.t('Days Until'),
              headerImage: `${ASSETS_BASE_URL}/images/wall-calendar-with-logo.png`,
              text,
              eventImageSrc,
            },
          },
        });
      }

      speeches.push(
        chooseOne(
          i18n.t('Welcome to Days Until!'),
          i18n.t('Hello!'),
          i18n.t('Hi there!'),
          i18n.t('Hi!'),
        ),
        i18n.t('Looks like this is your first visit!'),
        i18n.t(
          'To get started, say <break strength="strong"/> <prosody pitch="+10%">"create a new countdown."</prosody>',
        ),
      );
    } else {
      text = i18n.t('What would you like to do?');

      if (
        Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)[
          'Alexa.Presentation.APL'
        ]
      ) {
        handlerInput.responseBuilder.addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          token: 'token',
          document: launchApl,
          datasources: {
            data: {
              headerTitle: i18n.t('Days Until'),
              headerImage: `${ASSETS_BASE_URL}/images/wall-calendar-with-logo.png`,
              welcomeMessage: i18n.t('Welcome! What would you like to do?'),
              checkExistingButtonText: i18n.t('Check an existing countdown'),
              createNewButtonText: i18n.t('Create a new countdown'),
            },
          },
        });
      }

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

    return handlerInput.responseBuilder
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
      .withStandardCard(i18n.t('Welcome!'), text, eventImageSrc)
      .getResponse();
  },
};
