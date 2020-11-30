import i18n from 'i18next';
import moment, { Moment } from 'moment';
import { chooseOne } from './choose-one';

interface DaysUntil {
  diff: number;
  visual: string;
  speech: string;
}

export const getDaysUntil = (
  eventDate: Moment,
  eventName: string,
): DaysUntil => {
  const today = moment().utc().startOf('day');
  const diff = eventDate.diff(today, 'days');

  let visual = '(Not yet implemented.)';
  let speech = '(Not yet implemented.)';

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
    } else {
      // it's at least 2 days away

      visual = chooseOne(
        i18n.t('{{ eventName }} is in {{ diff }} days', i18nParams),
        i18n.t('{{ diff }} day until {{ eventName }}', i18nParams),
      );

      speech = i18n.t('{{ diff }} days.', i18nParams);
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
    } else {
      // the event was at least 2 days ago

      visual = i18n.t('{{ eventName }} was {{ diff }} days ago', i18nParams);

      speech = i18n.t('It was {{ diff }} days ago.', i18nParams);
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
  }

  return { diff, visual, speech };
};
