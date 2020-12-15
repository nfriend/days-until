import i18n from 'i18next';
import moment, { Moment } from 'moment-timezone';
import { chooseOne } from './choose-one';

interface DaysUntil {
  /** The number of days away, relative to today */
  diff: number;

  /** Text that describes the day difference, inteded to be shown visually */
  visual: string;

  /** Text that describes the day difference, intended to be spoken */
  speech: string;

  /** A predictable (i.e. no randomness) description of the day difference */
  predictableDescription: string;
}

/**
 * Calculates the number of days to/from the provided event, and
 * returns the diff in a variety of formats.
 *
 * @param eventDate A Moment object that represents the event date. Must be in UTC timezone.
 * @param eventName The name of the event
 * @param deviceTimeZone The time zone of the user's device
 */
export const getDaysUntil = (
  eventDate: Moment,
  eventName: string,
  deviceTimeZone: string,
): DaysUntil => {
  const today = moment().utc().startOf('day').tz(deviceTimeZone);

  // The event date is stored as a UTC date at the beginning of the day
  // (the timezone of the device that created the countdown is ignored).
  // But we need to test against the beginning of the day in _user's_ timezone.
  // So we translate this date into the user's timezone, modifying the moment in time.
  const diff = eventDate
    .clone()
    .startOf('day')
    .tz(deviceTimeZone, true)
    .diff(today, 'days');

  let visual = '(Not yet implemented.)';
  let speech = '(Not yet implemented.)';
  let predictableDescription = '(Not yet implemented.)';

  const i18nParams = { eventName, diff: Math.abs(diff) };

  if (diff > 0) {
    // the event is in the future

    if (diff === 1) {
      // it's tomorrow

      visual = chooseOne(
        i18n.t('{{ eventName }} is tomorrow', i18nParams),
        i18n.t('One day until {{ eventName }}', i18nParams),
        i18n.t('Only one day until {{ eventName }}', i18nParams),
      );

      speech = chooseOne(
        i18n.t('Only 1 day to go!'),
        i18n.t("Tomorrow's the day!"),
        i18n.t('Only 1 day!'),
        i18n.t('Just 1 day!'),
      );

      predictableDescription = i18n.t(
        '{{ eventName }} is tomorrow',
        i18nParams,
      );
    } else {
      // it's at least 2 days away

      visual = chooseOne(
        i18n.t('{{ eventName }} is in {{ diff }} days', i18nParams),
        i18n.t('{{ diff }} days until {{ eventName }}', i18nParams),
      );

      speech = i18n.t('{{ diff }} days.', i18nParams);

      predictableDescription = i18n.t(
        '{{ eventName }} is in {{ diff }} days',
        i18nParams,
      );
    }
  } else if (diff < 0) {
    // the event was in the past

    if (diff === -1) {
      // the event was yesterday

      visual = chooseOne(
        i18n.t('{{ eventName }} was yesterday', i18nParams),
        i18n.t('{{ eventName }} was one day ago', i18nParams),
      );

      speech = i18n.t('It was yesterday.');

      predictableDescription = i18n.t(
        '{{ eventName }} was yesterday',
        i18nParams,
      );
    } else {
      // the event was at least 2 days ago

      visual = i18n.t('{{ eventName }} was {{ diff }} days ago', i18nParams);

      speech = i18n.t('It was {{ diff }} days ago.', i18nParams);

      predictableDescription = i18n.t(
        '{{ eventName }} was {{ diff }} days ago',
        i18nParams,
      );
    }
  } else {
    // the event is today!

    visual = i18n.t('{{ eventName }} is today', i18nParams);

    speech = chooseOne(
      i18n.t("It's today!"),
      i18n.t("There are no days left - it's today!"),
      i18n.t('0 days - today is the day!'),
      i18n.t('Today is the day - 0 days!'),
    );

    predictableDescription = i18n.t('{{ eventName }} is today', i18nParams);
  }

  return { diff, visual, speech, predictableDescription };
};
