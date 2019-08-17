import * as natural from 'natural';
import * as moment from 'moment';
import * as _ from 'lodash';
import * as Alexa from 'ask-sdk-v1adapter';
const capitalize = require('capitalize');

// not included in this repo.  After cloning this repo,
// create a "appId.json" file in the same directory as this
// file.  It should contain this skill's app ID, surrounded with quotes.
const appId = require('./appId.json');

interface IEventInfo {
  eventName: string;
  eventDate: string;
}

export const languageStrings = {
  en: {
    translation: {
      SKILL_NAME: 'Days Until',
      HELP_MESSAGE:
        `Sure.  You can create a new countdown by saying ` +
        `<break strength="strong"/> <prosody pitch="+10%">"start a new countdown"</prosody>, ` +
        `or check an existing countdown.  For example, ` +
        `<prosody pitch="+10%">"How many days until my birthday?"</prosody>`,
      EVENT_PROMPT:
        'Would you like to create a new countdown or check an existing one?',
      EVENT_REPROMPT: `I didn't catch that - can you repeat what you'd like to do?`,
      CONFIRMATION_INCORRECT_TITLE: ':(',
      CONFIRMATION_INCORRECT_MESSAGE: 'Ok, sorry about that!',
      CONFIRMATION_INCORRECT_MESSAGE_VISUAL: 'Sorry!',
      STOP_MESSAGE: 'Have a good one!',
      SAVED_MESSAGE: `Done. To check on this countdown, just say, "Ask Days Until, 'how long until`,
      COUNTDOWN_SAVED: 'Countdown Saved',
      NOT_FOUND_MESSAGE: `Hmm, I don't see a countdown for `,
      NOT_FOUND_MESSAGE_VISUAL: `I couldn't find a countdown for`,
      COUNTDOWN_NOT_FOUND: 'Countdown Not Found',
      ONE_DAY_MESSAGE_1: 'Only 1 day to go!',
      ONE_DAY_MESSAGE_2: `Tomorrow's the day!`,
      ONE_DAY_MESSAGE_3: `Only 1 day!`,
      TODAY: `Today`,
      TODAY_MESSAGE_1: `It's today!`,
      TODAY_MESSAGE_2: `There are no days left - it's today!`,
      TODAY_MESSAGE_3: `0 days - today is the day!`,
      YESTERDAY_MESSAGE_1: `It was yesterday.`,
      PAST_MESSAGE_1: `It was `,
      DAY: 'day',
      DAYS: 'days',
      DAY_AGO: 'day ago',
      DAYS_AGO: 'days ago',
      ERROR_MESSAGE: `Sorry, I think I misheard you.  Can you start again?`,
    },
  },
};

// the key of the event will be the metaphone-d
// version of the event name
function getEventKey(eventName: string): string {
  return natural.Metaphone.process(eventName);
}

export const alexaHandlers = {
  LaunchRequest: function() {
    this.emit(':ask', this.t('EVENT_PROMPT'), this.t('EVENT_REPROMPT'));
  },
  Unhandled: function() {
    this.emit(':tell', this.t('ERROR_MESSAGE'));
  },
  StartCountdownIntent: function() {
    if (this.event.request.dialogState !== 'COMPLETED') {
      this.emit(':delegate');
    } else if (this.event.request.intent.confirmationStatus === 'DENIED') {
      this.emit(
        ':tellWithCard',
        this.t('CONFIRMATION_INCORRECT_MESSAGE'),
        this.t('CONFIRMATION_INCORRECT_TITLE'),
        this.t('CONFIRMATION_INCORRECT_MESSAGE_VISUAL'),
      );
    } else {
      const eventName = capitalize.words(
        this.event.request.intent.slots.CountdownEvent.value,
      );
      let eventDate = this.event.request.intent.slots.EventDate.value;

      // validate that the date is valid, and convert to
      // something more useful, if necessary.
      // See all possible values here: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/built-in-intent-ref/slot-type-reference#date
      if (/^\d{4}-W\d{1,2}-WE$/.test(eventDate)) {
        // for specific weekends, like "this weekend",
        // eventDate will look like "2017-W49-WE"

        // remove the -WE suffix and add 5 days
        eventDate = moment(eventDate.replace(/-WE$/, ''))
          .add(5, 'days')
          .format('YYYY-MM-DD');
      } else if (/^\d{3}X$/.test(eventDate)) {
        // for decades, eventDate will look like '201X'

        // just replace the X with a 0 to signify
        // the start of the decade
        eventDate = eventDate.replace('X', '0');
      } else if (/^\d{4}-(WI|SP|SU|FA)$/.test(eventDate)) {
        // for seasons, eventDate will look like '2018-SP'

        // transform the date into an exact date, like "2018-03-21"
        eventDate = eventDate.replace(/WI$/, '12-21');
        eventDate = eventDate.replace(/SP$/, '03-21');
        eventDate = eventDate.replace(/SU$/, '06-21');
        eventDate = eventDate.replace(/FA$/, '09-21');
      } else if (eventDate === 'PRESENT_REF') {
        // if the user said "now"

        // convert the date into the expected format
        eventDate = moment().format('YYYY-MM-DD');
      }

      this.attributes[getEventKey(eventName)] = <IEventInfo>{
        eventName,
        eventDate,
      };

      this.emit(
        ':tellWithCard',
        this.t('SAVED_MESSAGE') + ' ' + eventName + `'".`,
        this.t('COUNTDOWN_SAVED'),
        eventName + '\n' + moment(eventDate).format('MMMM D, YYYY'),
      );
    }
  },
  ReportCountdownIntent: function() {
    if (this.event.request.dialogState !== 'COMPLETED') {
      this.emit(':delegate');
    } else {
      const eventName = capitalize.words(
        this.event.request.intent.slots.CountdownEvent.value,
      );
      const eventInfo = <IEventInfo>this.attributes[getEventKey(eventName)];

      if (!eventInfo) {
        this.emit(
          ':tellWithCard',
          this.t('NOT_FOUND_MESSAGE') + ' ' + eventName,
          this.t('COUNTDOWN_NOT_FOUND'),
          this.t('NOT_FOUND_MESSAGE_VISUAL') + ' ' + eventName,
        );
      } else {
        const today = moment().startOf('day');
        const eventDate = moment(eventInfo.eventDate);
        const dayDiff = eventDate.diff(today, 'days');

        if (dayDiff > 0) {
          // the event is in the future

          if (dayDiff === 1) {
            // it's tomorrow

            const rand = Math.floor(Math.random() * 3) + 1;
            this.emit(
              ':tellWithCard',
              this.t('ONE_DAY_MESSAGE_' + rand),
              this.t('SKILL_NAME'),
              eventName + '\n1 ' + this.t('DAY'),
            );
          } else {
            // it's at least 2 days away

            this.emit(
              ':tellWithCard',
              dayDiff + ' ' + this.t('DAYS'),
              this.t('SKILL_NAME'),
              eventName + '\n' + dayDiff + ' ' + this.t('DAYS'),
            );
          }
        } else if (dayDiff < 0) {
          // the event was in the past

          if (dayDiff === -1) {
            // the event was yesterday

            this.emit(
              ':tellWithCard',
              this.t('YESTERDAY_MESSAGE_1'),
              this.t('SKILL_NAME'),
              eventName + '\n1 ' + this.t('DAY_AGO'),
            );
          } else {
            // the event was at least 2 days ago

            this.emit(
              ':tellWithCard',
              this.t('PAST_MESSAGE_1') +
                ` ${-1 * dayDiff} ` +
                this.t('DAYS_AGO'),
              this.t('SKILL_NAME'),
              eventName + '\n' + -1 * dayDiff + ' ' + this.t('DAYS_AGO'),
            );
          }
        } else {
          // the event is today!

          const rand = Math.floor(Math.random() * 3) + 1;
          this.emit(
            ':tellWithCard',
            this.t('TODAY_MESSAGE_' + rand),
            this.t('SKILL_NAME'),
            eventName + '\n' + this.t('TODAY'),
          );
        }
      }
    }
  },
  'AMAZON.HelpIntent': function() {
    const speechOutput = this.t('HELP_MESSAGE');
    const reprompt = this.t('HELP_MESSAGE');
    this.emit(':ask', speechOutput, reprompt);
  },
  'AMAZON.CancelIntent': function() {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
  'AMAZON.StopIntent': function() {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
};

export const handler = function(event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.appId = appId;
  alexa.dynamoDBTableName = 'DaysUntilSkillData';
  alexa.resources = languageStrings;
  alexa.registerHandlers(alexaHandlers);
  alexa.execute();
};
