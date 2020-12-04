import * as Alexa from 'ask-sdk-core';
import * as capitalize from 'capitalize';
import { Intent, IntentRequest, Response } from 'ask-sdk-model';
import { normalize } from '@nfriend/amazon.date-normalizer';
import { db } from '~/adapters/dynamo-db';
import { getEventKey } from '~/util/get-event-key';
import i18n from 'i18next';
import { chooseOne } from '~/util/choose-one';
import textWithImage from '~/apl/text-with-image.json';
import soundEffectWithSsml from '~/apla/sound-effect-with-ssml.json';
import { getImageForEvent } from '~/util/get-image-for-event';
import { getDaysUntil } from '~/util/get-days-until';
import { getAllSuccessInterjections } from '~/util/get-all-success-interjections';
import { ASSETS_BASE_URL } from '~/constants';
import { getFailureInterjection } from '~/util/get-failure-interjection';

const INTENT_NAME = 'StartCountdownIntent';

export const startCountdownIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    const wasCreateButtonPushed =
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
        'Alexa.Presentation.APL.UserEvent' &&
      (handlerInput.requestEnvelope.request as any).source.id ===
        'createNewButton';

    const wasCreateIntentRequested =
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === INTENT_NAME;

    return wasCreateButtonPushed || wasCreateIntentRequested;
  },
  async handle(handlerInput: Alexa.HandlerInput): Promise<Response> {
    const intent = (handlerInput.requestEnvelope.request as IntentRequest)
      .intent;

    // It's possible intent may not be provided since this handler
    // also handles the "Create a new countdown" button press
    const countdownEventSlotValue = intent?.slots.CountdownEvent.value;

    // Again, because it's possible we're not currently inside an IntentRequest,
    // we need to makes sure we explicitly elicit slots for _this_ intent.
    const updatedIntent: Intent = intent || {
      name: INTENT_NAME,
      confirmationStatus: 'NONE',
      slots: {},
    };

    if (!countdownEventSlotValue) {
      // The user has not yet provided an event name

      const text = i18n.t('What is the event?');
      const imageName = chooseOne(
        `question.png`,
        `conversation.png`,
        `interview.png`,
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/${imageName}`;

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

      return handlerInput.responseBuilder
        .speak(
          chooseOne(
            i18n.t("What's the event?"),
            i18n.t("Okay, What's the event?"),
            i18n.t('Sure. What event would you like to track?'),
          ),
        )
        .reprompt(
          chooseOne(
            i18n.t("Sorry, what's the event?"),
            i18n.t('Sorry, what event would you like to track?'),
          ),
        )
        .withStandardCard(i18n.t('Create a new countdown'), text, eventImageSrc)
        .addElicitSlotDirective('CountdownEvent', updatedIntent)
        .getResponse();
    }

    const eventDateSlotValue = intent.slots.EventDate.value;

    if (!eventDateSlotValue) {
      // The user has not yet provided an event date

      const text = i18n.t('When is the event?');
      const imageName = chooseOne(
        '001-calendar.png',
        '002-calendar-1.png',
        '011-calendar-10.png',
        '012-calendar-11.png',
        '015-calendar-14.png',
        '016-calendar-15.png',
        '017-calendar-16.png',
        '024-calendar-22.png',
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/${imageName}`;

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

      return handlerInput.responseBuilder
        .speak(
          chooseOne(
            i18n.t('Sure, when will it take place?'),
            i18n.t('Okay, when will it take place?'),
            i18n.t('When will it take place?'),
          ),
        )
        .reprompt(
          chooseOne(
            i18n.t('Sorry, when will it take place?'),
            i18n.t('Sorry, when will the event take place?'),
          ),
        )
        .withStandardCard(i18n.t('Create a new countdown'), text, eventImageSrc)
        .addElicitSlotDirective('EventDate', updatedIntent)
        .getResponse();
    }

    const eventDate = normalize(eventDateSlotValue);
    const eventName = capitalize.words(countdownEventSlotValue);

    if (intent.confirmationStatus === 'NONE') {
      // The user has not yet confirmed everything is correct

      const text = [
        i18n.t('<b>{{eventName}}: {{eventDate}}</b><br><br>', {
          eventName,
          eventDate: eventDate.format('MMMM D, YYYY'),
        }),
        chooseOne(
          i18n.t('Does this look right?'),
          i18n.t('How does this look?'),
          i18n.t('Look good?'),
        ),
      ].join(' ');
      const eventImageSrc = `${ASSETS_BASE_URL}/images/faq.png`;

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

      const i18nData = {
        eventName,
        eventDate: eventDate.format('YYYY-MM-DD'),
      };

      return handlerInput.responseBuilder
        .speak(
          chooseOne(
            i18n.t(
              "I'll create a new countdown for {{eventName}} on {{eventDate}}. Does that sound right?",
              i18nData,
            ),
            i18n.t(
              "Okay, I'll start a countdown for {{eventName}} on {{eventDate}}. Did I get that right?",
              i18nData,
            ),
            i18n.t(
              "I'll create a new countdown for {{eventName}} on {{eventDate}}. Is that right?",
              i18nData,
            ),
          ),
        )
        .reprompt(
          chooseOne(
            i18n.t(
              "Sorry, I didn't catch that. Should I go ahead and create the countdown?",
            ),
            i18n.t(
              "Sorry, I didn't catch that. Should I create the countdown?",
            ),
          ),
        )
        .withStandardCard(i18n.t('Create a new countdown'), text, eventImageSrc)
        .addConfirmIntentDirective(updatedIntent)
        .getResponse();
    } else if (intent.confirmationStatus === 'DENIED') {
      const text = i18n.t('Sorry about that!');
      const eventImageSrc = `${ASSETS_BASE_URL}/images/sad.png`;

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

      const speeches = [];

      speeches.push(getFailureInterjection());

      // Retrying is not currently possible due to https://forums.developer.amazon.com/questions/221321/intent-confirmationstatus-cannot-be-changed-with-d.html
      // speeches.push(
      //   chooseOne(
      //     i18n.t("Let's try again. What's the name of the event?"),
      //     i18n.t("Let's give it another try. What's the event?"),
      //   ),
      // );

      speeches.push(
        chooseOne(
          i18n.t(
            'Sorry about that! Try saying "create a new countdown" again.',
          ),
          i18n.t(
            'Sorry! Say "start a new countdown" to give me another chance.',
          ),
        ),
      );

      return (
        handlerInput.responseBuilder
          .speak(speeches.join(' '))
          // .reprompt(
          //   chooseOne(
          //     i18n.t("Sorry, what's the event?"),
          //     i18n.t('Sorry, what event would you like to track?'),
          //   ),
          // )
          .reprompt(
            i18n.t(
              'If you\'d like to try again, just say "create a new countdown".',
            ),
          )
          .withStandardCard(
            i18n.t('Create a new countdown'),
            text,
            eventImageSrc,
          )

          // Commenting out until there is a solution to the problem linked above
          // .addElicitSlotDirective('CountdownEvent', {
          //   name: INTENT_NAME,
          //   confirmationStatus: 'NONE',
          //   slots: {
          //     // Why are these required to be explicitly called out here but not above?
          //     // ¯\_(ツ)_/¯
          //     EventDate: {
          //       name: 'EventDate',
          //       confirmationStatus: 'NONE',
          //     },
          //     CountdownEvent: {
          //       name: 'CountdownEvent',
          //       confirmationStatus: 'NONE',
          //     },
          //   },
          // })

          .getResponse()
      );
    }

    const eventKey = getEventKey(eventName);

    await db.put(handlerInput.requestEnvelope, {
      events: {
        [eventKey]: {
          eventName,
          eventDate: eventDate.toISOString(),
        },
      },
    });

    const speeches = [];

    speeches.push(
      chooseOne(
        i18n.t('Done!'),
        i18n.t("You're all set!"),
        i18n.t('Got it!'),
        i18n.t('Awesome!'),
        i18n.t('Great!'),
        i18n.t('Perfect.'),
        ...getAllSuccessInterjections(),
      ),
    );

    speeches.push(
      i18n.t(
        'To check on this countdown, just say: <break strength="strong"/> Ask Days Until, how long until {{eventName}}?',
        { eventName },
      ),
    );

    const eventImageSrc = getImageForEvent(eventName);
    const text = getDaysUntil(eventDate, eventName).visual;

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

    const backgroundAudio = chooseOne(
      'soundbank://soundlibrary/human/amzn_sfx_crowd_cheer_med_01',
      `${ASSETS_BASE_URL}/audio/333404__jayfrosting__cheer-2.mp3`,
      `${ASSETS_BASE_URL}/audio/400587__misjoc__medium-crowd-cheering-01.mp3`,
      `${ASSETS_BASE_URL}/audio/277019__sandermotions__applause-4.mp3`,
      `${ASSETS_BASE_URL}/audio/462362__breviceps__small-applause.mp3`,
    );

    return handlerInput.responseBuilder
      .addDirective({
        type: 'Alexa.Presentation.APLA.RenderDocument',
        token: 'token',
        document: soundEffectWithSsml,
        datasources: {
          data: {
            ssml: speeches.join(' '),
            backgroundAudio,
          },
        },
      })
      .withStandardCard(eventName, text, eventImageSrc)
      .withShouldEndSession(true)
      .getResponse();
  },
};
