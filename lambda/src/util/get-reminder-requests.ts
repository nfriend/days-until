import moment, { Moment } from 'moment';
import _ from 'lodash';
import i18n from 'i18next';
import { chooseOne } from './choose-one';

const DAYS_BEFORE_REMINDERS = 10;

export const getReminderRequests = (
  eventDate: Moment,
  eventName: string,
  reminderTime: string,
  userTimeZone: string,
): any[] => {
  const currentTime = moment.utc();
  const [reminderHours, reminderMinutes] = reminderTime.split(':');

  const requests: any = [];

  _.range(0, DAYS_BEFORE_REMINDERS + 1)
    .reverse()
    .forEach((daysBefore) => {
      if (
        eventDate
          .clone()
          .subtract(daysBefore, 'days')
          .isAfter(currentTime, 'day')
      ) {
        const i18nInfo = {
          daysUntil: daysBefore,
          eventName,
        };

        let text;

        if (daysBefore === 0) {
          text = chooseOne(
            i18n.t('{{eventName}} is today!', i18nInfo),
            i18n.t('Today is {{eventName}}!', i18nInfo),
          );
        } else if (daysBefore === 1) {
          text = chooseOne(
            i18n.t('{{eventName}} is tomorrow!', i18nInfo),
            i18n.t('Only one day until {{eventName}}!', i18nInfo),
          );
        } else {
          text = chooseOne(
            i18n.t('{{daysUntil}} days until {{eventName}}', i18nInfo),
            i18n.t('{{eventName}} is {{daysUntil}} days away', i18nInfo),
            i18n.t(
              'There are {{daysUntil}} days until {{eventName}}',
              i18nInfo,
            ),
          );
        }

        requests.push({
          requestTime: currentTime.format('YYYY-MM-DDTHH:mm:ss'),
          trigger: {
            type: 'SCHEDULED_ABSOLUTE',
            scheduledTime: eventDate
              .clone()
              .subtract(daysBefore, 'days')
              .set({
                hour: parseInt(reminderHours, 10),
                minute: parseInt(reminderMinutes, 10),
                second: 0,
              })
              .format('YYYY-MM-DDTHH:mm:ss'),
            timeZoneId: userTimeZone,
          },
          alertInfo: {
            spokenInfo: {
              content: [
                {
                  locale: 'en-US',
                  text,
                },
              ],
            },
          },
          pushNotification: {
            status: 'ENABLED',
          },
        });
      }
    });

  return requests;
};
