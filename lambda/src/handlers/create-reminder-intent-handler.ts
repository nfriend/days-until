import * as Alexa from 'ask-sdk-core';
import i18n from 'i18next';
import moment from 'moment';
import { Intent, IntentRequest, Response } from 'ask-sdk-model';
import { chooseOne } from '~/util/choose-one';
import { ASSETS_BASE_URL, REMINDERS_PERMISSIONS_TOKEN } from '~/constants';
import { buildResponse } from '~/util/build-response';
import { getEventKey } from '~/util/get-event-key';
import * as capitalize from 'capitalize';
import { DaysUntilAttributes, db } from '~/adapters/dynamo-db';
import { getReminderRequests } from '~/util/get-reminder-requests';

export const INTENT_NAME = 'CreateReminderIntent';

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
    const reminderTimeSlotValue = intent.slots?.ReminderTime?.value;
    const countdownEventSlotValue =
      eventNameFromSession || intent.slots?.CountdownEvent?.value;

    // Because it's possible we manually redirected to this intent from another,
    // we need to makes sure we explicitly elicit slots for _this_ intent.
    const updatedIntent: Intent = {
      name: INTENT_NAME,
      ...intent,
    };

    const cardTitle = i18n.t('Add a daily reminder');

    // Check to see if the user has granted permissions for reminder skills
    const remindersApiClient = handlerInput.serviceClientFactory.getReminderManagementServiceClient();
    const remindersPermissions =
      handlerInput.requestEnvelope.context.System.user.permissions?.scopes?.[
        'alexa::alerts:reminders:skill:readwrite'
      ]?.status === 'GRANTED';

    console.log(
      'user permissions:',
      JSON.stringify(
        handlerInput.requestEnvelope.context.System.user.permissions,
        null,
        2,
      ),
    );

    if (!remindersPermissions) {
      // Save any current slot values we have so that they can be
      // retrieved later after permissions have been granted.
      handlerInput.attributesManager.setSessionAttributes({
        slots: {
          ReminderTime: {
            value: reminderTimeSlotValue,
          },
          CountdownEvent: {
            value: countdownEventSlotValue,
          },
        },
      });

      return handlerInput.responseBuilder
        .addDirective({
          type: 'Connections.SendRequest',
          name: 'AskFor',
          payload: {
            '@type': 'AskForPermissionsConsentRequest',
            '@version': '1',
            permissionScope: 'alexa::alerts:reminders:skill:readwrite',
          },
          token: REMINDERS_PERMISSIONS_TOKEN,
        })

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
    const attributes: DaysUntilAttributes = await db.get(
      handlerInput.requestEnvelope,
    );
    const eventDate = moment.utc(attributes.events[eventKey].eventDate);

    const upsServiceClient = handlerInput.serviceClientFactory.getUpsServiceClient();
    const userTimeZone = await upsServiceClient.getSystemTimeZone(
      handlerInput.requestEnvelope.context.System.device.deviceId,
    );

    console.log('userTimeZone', userTimeZone);

    const reminderRequests = getReminderRequests(
      eventDate,
      eventName,
      dailyReminderAt,
      userTimeZone,
    );

    reminderRequests.map(async (request) => {
      (await remindersApiClient.createReminder(request)).alertToken;
    });

    const reminderIds = await Promise.all(reminderRequests);

    await db.put(handlerInput.requestEnvelope, {
      events: {
        [eventKey]: {
          dailyReminderAt,
          reminderIds,
        },
      },
    });

    const visualText = i18n.t('Reminder saved!');
    const eventImageSrc = `${ASSETS_BASE_URL}/images/calendar_reminder.png`;

    const speak = chooseOne(
      i18n.t(
        "Done! You'll get a daily reminder starting ten days before your event.",
      ),
      i18n.t(
        "You're all set! I'll send you a daily reminder during the ten days before your event.",
      ),
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
  },
};
