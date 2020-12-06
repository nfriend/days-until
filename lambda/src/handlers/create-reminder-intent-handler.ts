import * as Alexa from 'ask-sdk-core';
import i18n from 'i18next';
import moment from 'moment';
import { Intent, IntentRequest, Response } from 'ask-sdk-model';
import { chooseOne } from '~/util/choose-one';
import { ASSETS_BASE_URL } from '~/constants';
import { buildResponse } from '~/util/build-response';
import { getEventKey } from '~/util/get-event-key';
import * as capitalize from 'capitalize';
import { db } from '~/adapters/dynamo-db';

const INTENT_NAME = 'CreateReminderIntent';

export const createReminderIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === INTENT_NAME
    );
  },
  async handle(handlerInput: Alexa.HandlerInput): Promise<Response> {
    const {
      eventName: eventNameFromSession,
    } = handlerInput.attributesManager.getSessionAttributes();
    const intent = (handlerInput.requestEnvelope.request as IntentRequest)
      .intent;
    const reminderTimeSlotValue = intent.slots.ReminderTime?.value;
    const countdownEventSlotValue =
      eventNameFromSession || intent.slots.CountdownEvent?.value;

    // Because it's possible we manually redirected to this intent from another,
    // we need to makes sure we explicitly elicit slots for _this_ intent.
    const updatedIntent: Intent = {
      name: INTENT_NAME,
      ...intent,
    };

    const cardTitle = i18n.t('Add a daily reminder');

    // Check to see if the user has granted permissions for reminder skills
    const remindersApiClient = handlerInput.serviceClientFactory.getReminderManagementServiceClient();
    const { permissions } = handlerInput.requestEnvelope.context.System.user;

    if (!permissions) {
      const speak = [
        i18n.t(
          "It looks like you haven't yet enabled reminders permissions. You can enable them in the Amazon Alexa app.",
        ),
        i18n.t(
          'After you\'ve done this, you can say: <break strength="strong"/> "Ask Days Until to create a new reminder."',
        ),
      ].join(' ');

      return handlerInput.responseBuilder
        .speak(speak)
        .withAskForPermissionsConsentCard([
          'alexa::alerts:reminders:skill:readwrite',
        ])
        .withShouldEndSession(true)
        .getResponse();
    }

    if (!countdownEventSlotValue) {
      const visualText = i18n.t('What is the event?');
      const imageName = chooseOne(
        `question.png`,
        `conversation.png`,
        `interview.png`,
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/${imageName}`;

      const speak = chooseOne(
        i18n.t("What's the event?"),
        i18n.t("Okay, What's the event?"),
        i18n.t('Sure. What event would you like to be reminded about?'),
      );

      const reprompt = chooseOne(
        i18n.t("Sorry, what's the event?"),
        i18n.t('Sorry, what event would you like to be reminded about?'),
      );

      return buildResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak,
        reprompt,
      })
        .addElicitSlotDirective('CountdownEvent', updatedIntent)
        .getResponse();
    }

    if (!reminderTimeSlotValue) {
      const visualText = i18n.t(
        'What time of day would you like to be reminded?',
      );
      const imageName = chooseOne(
        '001-clock.png',
        '002-alarm clock.png',
        '003-clock.png',
        '004-calendar.png',
        '005-gamepad.png',
        '006-stopwatch.png',
        '007-watch.png',
        '008-sun.png',
        '009-clock.png',
        '010-timer.png',
        '011-time zone.png',
        '012-sandglass.png',
        '013-digital clock.png',
        '014-clock.png',
        '015-smartwatch.png',
        '016-time management.png',
        '017-clock.png',
        '018-save time.png',
        '019-smartphone.png',
        '020-clock.png',
        '021-timer.png',
        '022-morning.png',
        '023-clock.png',
        '024-afternoon.png',
        '025-cuckoo clock.png',
        '026-clock.png',
        '027-time recorder.png',
        '028-clock.png',
        '029-kitchen timer.png',
        '030-smartwatch.png',
        '031-break time.png',
        '032-coffee break.png',
        '033-kitchen timer.png',
        '034-clock.png',
        '035-cuckoo clock.png',
        '036-clock.png',
        '037-clock.png',
        '038-24 hours.png',
        '039-fast time.png',
        '040-watch.png',
        '041-working time.png',
        '042-deadline.png',
        '043-digital watch.png',
        '044-delivery time.png',
        '045-chess clock.png',
        '046-laptop.png',
        '047-time is money.png',
        '048-night.png',
        '049-prime time.png',
        '050-pocket watch.png',
      );
      const eventImageSrc = `${ASSETS_BASE_URL}/images/${imageName}`;

      const speak = chooseOne(
        i18n.t('Sure, what time should I remind you?'),
        i18n.t('Okay, what time of day would you like to be reminded?'),
        i18n.t('When would you like to be reminded each day?'),
      );

      const reprompt = chooseOne(
        i18n.t('Sorry, what time should I remind you?'),
        i18n.t('Sorry, what time of day would you like your reminder?'),
      );

      return buildResponse({
        handlerInput,
        visualText,
        eventImageSrc,
        speak,
        reprompt,
        cardTitle,
      })
        .addElicitSlotDirective('RemiderTime', updatedIntent)
        .getResponse();
    }

    // Handle cases where the user said "Morning", "Night", etc.
    // See https://developer.amazon.com/en-US/docs/alexa/custom-skills/slot-type-reference.html#time
    const dailyReminderAt: string =
      ({
        MO: '09:00',
        AF: '15:00',
        EV: '18:00',
        NI: '21:00',
      } as any)[reminderTimeSlotValue] || reminderTimeSlotValue;

    const eventName = capitalize.words(countdownEventSlotValue);
    const eventKey = getEventKey(eventName);

    await db.put(handlerInput.requestEnvelope, {
      events: {
        [eventKey]: {
          dailyReminderAt,
        },
      },
    });

    const currentTime = moment.utc();
    const [reminderHours, reminderMinutes] = dailyReminderAt.split(':');
    const reminderRequest: any = {
      requestTime: currentTime.format('YYYY-MM-DDTHH:mm:ss'),
      trigger: {
        type: 'SCHEDULED_ABSOLUTE',
        scheduledTime: currentTime
          .set({
            hour: parseInt(reminderHours, 10),
            minute: parseInt(reminderMinutes, 10),
            second: 0,
          })
          .format('YYYY-MM-DDTHH:mm:ss'),
        recurrence: {
          freq: 'DAILY',
        },
      },
      alertInfo: {
        spokenInfo: {
          content: [
            {
              locale: 'en-US',

              // TODO: Apparently Alexa doesn't support dynamic reminders?
              // This removes most of the value for this use-case.
              // To do this correctly, we'd need a cron job that would run
              // every hour and update every reminder with its new value
              // (and delete old reminders).
              text:
                'Time to get yo daily banana. You better go before the banistas pack up.',
            },
          ],
        },
      },
      pushNotification: {
        status: 'ENABLED',
      },
    };

    await remindersApiClient.createReminder(reminderRequest);
  },
};
