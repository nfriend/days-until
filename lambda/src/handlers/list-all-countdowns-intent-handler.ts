import * as Alexa from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
import i18n from 'i18next';
import moment from 'moment';
import { DaysUntilAttributes, db } from '~/adapters/dynamo-db';
import { ASSETS_BASE_URL } from '~/constants';
import { buildListResponse } from '~/util/build-list-response';
import { buildRegularResponse } from '~/util/build-regular-response';
import { chooseOne } from '~/util/choose-one';
import { getDaysUntil } from '~/util/get-days-until';
import { getImageForEvent } from '~/util/get-image-for-event';

export const INTENT_NAME = 'ListAllCountdownsIntent';

export const listAllCountdownsIntentHandler: Alexa.RequestHandler = {
  canHandle(handlerInput: Alexa.HandlerInput): boolean | Promise<boolean> {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === INTENT_NAME
    );
  },
  async handle(handlerInput: Alexa.HandlerInput): Promise<Response> {
    const attributes: DaysUntilAttributes = await db.get(
      handlerInput.requestEnvelope,
    );

    const events = attributes.events || {};
    const sortedUpcomingEvents = Object.values(events)

      // Convert each timestamp into a Moment object
      // and compute the days until each event.
      .map((event) => {
        const eventDate = moment(event.eventDate).utc();
        return {
          ...event,
          eventDate,
          daysUntil: getDaysUntil(eventDate, event.eventName),
        };
      })

      // Sort the events by event date
      .sort((event1, event2) => {
        return event1.eventDate.diff(moment(event2.eventDate).utc());
      })

      // filter out any that have already passed
      .filter((event) => {
        return event.daysUntil.diff >= 0;
      });

    if (sortedUpcomingEvents.length > 0) {
      // the user has created at least 1 event that's today or in the future

      const speeches: string[] = [];

      const cardTitle = i18n.t('All countdowns');

      let visualText;
      if (sortedUpcomingEvents.length === 1) {
        visualText = i18n.t('You only have one countdown');
        speeches.push(i18n.t('You only have one countdown.'));
      } else {
        visualText = i18n.t('You have {{count}} countdowns', {
          count: sortedUpcomingEvents.length,
        });
        speeches.push(
          i18n.t('You have {{count}} countdowns.', {
            count: sortedUpcomingEvents.length,
          }),
        );
      }

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

      speeches.push(
        ...sortedUpcomingEvents.map(
          (event) => `${event.daysUntil.predictableDescription}.`,
        ),
      );

      const items = sortedUpcomingEvents.map((event) => ({
        text: event.daysUntil.predictableDescription,
        imageSrc: getImageForEvent(event.eventName),
      }));

      return buildListResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak: speeches.join(' '),
        items,
      })
        .withShouldEndSession(true)
        .getResponse();
    } else {
      // the user hasn't yet created any events, or all their events have already passed

      const cardTitle = i18n.t('No countdowns');
      const visualText = i18n.t("You haven't yet created any countdowns!");
      const eventImageSrc = `${ASSETS_BASE_URL}/images/0.png`;

      const speak = [
        chooseOne(
          i18n.t("You don't have any countdowns!"),
          i18n.t("You haven't created any countdowns yet!"),
          i18n.t("You don't have any countdowns!"),
        ),
        chooseOne(
          i18n.t('To create one, say "create a new countdown."'),
          i18n.t('To create countdown, say "create a new one."'),
        ),
      ].join(' ');

      return buildRegularResponse({
        handlerInput,
        visualText,
        cardTitle,
        eventImageSrc,
        speak,
      })
        .withShouldEndSession(false)
        .getResponse();
    }
  },
};
