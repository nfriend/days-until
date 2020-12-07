import moment, { Moment } from 'moment';
import _ from 'lodash';
import i18n from 'i18next';
import { chooseOne } from './choose-one';

const MAX_NUM_OF_REMINDERS = 10;

export const getReminderRequests = (
  eventDate: Moment,
  eventName: string,
  reminderTime: string,
  userTimeZone: string,
): any[] => {
  const currentTime = moment.utc();
  const [reminderHours, reminderMinutes] = reminderTime.split(':');

  const requests: any = [];

  _.range(1, MAX_NUM_OF_REMINDERS + 1)
    .reverse()
    .forEach((daysBefore) => {
      if (eventDate.clone().subtract(daysBefore, 'days').isAfter(currentTime)) {
        const i18nInfo = {
          daysUntil: daysBefore,
          eventName,
        };

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
                  text: chooseOne(
                    i18n.t('{{daysUntil}} days until {{eventName}}', i18nInfo),
                    i18n.t(
                      '{{eventName}} is {{daysUntil}} days away',
                      i18nInfo,
                    ),
                    i18n.t(
                      'There are {{daysUntil}} days until {{eventName}}',
                      i18nInfo,
                    ),
                  ),
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
