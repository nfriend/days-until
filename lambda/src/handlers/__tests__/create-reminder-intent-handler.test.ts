import moment from 'moment';
import _ from 'lodash';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';
import { db, DaysUntilAttributes } from '~/adapters/dynamo-db';
import MockDate from 'mockdate';
import { getDefaultApiClient } from '~/api-clients/get-default-api-client';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');
jest.mock('~/api-clients/get-default-api-client');

describe('createReminderIntentHandler', () => {
  const eventDate = moment.utc('2001-03-05', 'YYYY-MM-DD');

  const userAttributes: DaysUntilAttributes = {
    events: {
      'M BR0T': {
        eventName: 'My Birthday',
        eventDate: eventDate.toISOString(),
      },
    },
  };

  let event: any;

  const createEvent = (diffs = {}) => {
    event = createAlexaEvent(
      _.merge(
        {},
        {
          request: {
            type: 'IntentRequest',
            intent: {
              name: 'CreateReminderIntent',
              confirmationStatus: 'NONE',
              slots: {
                CountdownEvent: {
                  value: 'My Birthday',
                },
                ReminderTime: {
                  value: '13:30',
                },
              },
            },
          },
          context: {
            System: {
              user: {
                permissions: {},
              },
            },
          },
        },
        diffs,
      ),
    );
  };

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();

  beforeEach(() => {
    MockDate.set(new Date(Date.UTC(2001, 1, 3)));

    jest.spyOn(getDefaultApiClient(), 'invoke');
  });

  afterEach(() => {
    MockDate.reset();

    event = null;
  });

  describe("when the user hasn't yet granted permissions", () => {
    beforeEach(() => {
      createEvent({
        context: {
          System: {
            user: {
              permissions: null,
            },
          },
        },
      });
    });

    test('directs the user to enable permissions in the Alexa app', async () => {
      const result = await executeLambda(event);

      expect(result).toSpeek(
        'It looks like you haven\'t yet enabled reminders permissions. You can enable them in the Amazon Alexa app. After you\'ve done this, you can say: <break strength="strong"/> "Ask Days Until to create a new reminder."',
      );
    });
  });

  describe('when the event is in the future', () => {
    beforeEach(() => {
      createEvent();
    });

    test('creates reminders only for the ten days before the event', async () => {
      await executeLambda(event);

      const allRequestTimes = ((getDefaultApiClient()
        .invoke as unknown) as jest.SpyInstance).mock.calls
        .slice(1)
        .map((call) => {
          return JSON.parse(call[0].body).requestTime;
        });

      expect(allRequestTimes).toEqual(
        Array(allRequestTimes.length).fill('2001-02-03T00:00:00'),
      );
    });

    test('speaks a confirmation that the reminder has been set', async () => {
      const result = await executeLambda(event);

      expect(result).toSpeek(
        "Done! You'll get a daily reminder starting ten days before your event.",
      );
    });

    describe('when the event is more than 10 days away', () => {
      test('creates reminders only for the ten days before the event', async () => {
        await executeLambda(event);

        const allScheduledTimes = ((getDefaultApiClient()
          .invoke as unknown) as jest.SpyInstance).mock.calls
          .slice(1)
          .map((call) => {
            return JSON.parse(call[0].body).trigger.scheduledTime;
          });

        expect(allScheduledTimes).toEqual([
          '2001-02-23T13:30:00',
          '2001-02-24T13:30:00',
          '2001-02-25T13:30:00',
          '2001-02-26T13:30:00',
          '2001-02-27T13:30:00',
          '2001-02-28T13:30:00',
          '2001-03-01T13:30:00',
          '2001-03-02T13:30:00',
          '2001-03-03T13:30:00',
          '2001-03-04T13:30:00',
        ]);
      });
    });

    describe('when the event is less than 10 days away', () => {
      test('creates reminders only for the days between today and the event', async () => {
        MockDate.set(new Date(Date.UTC(2001, 2, 1)));

        await executeLambda(event);

        const allScheduledTimes = ((getDefaultApiClient()
          .invoke as unknown) as jest.SpyInstance).mock.calls
          .slice(1)
          .map((call) => {
            return JSON.parse(call[0].body).trigger.scheduledTime;
          });

        expect(allScheduledTimes).toEqual([
          '2001-03-02T13:30:00',
          '2001-03-03T13:30:00',
          '2001-03-04T13:30:00',
        ]);
      });
    });
  });

  describe('when the event is today', () => {
    beforeEach(() => {
      createEvent();
    });

    test('does not create any reminders', async () => {
      MockDate.set(new Date(Date.UTC(2001, 2, 5)));

      await executeLambda(event);

      expect(
        ((getDefaultApiClient()
          .invoke as unknown) as jest.SpyInstance).mock.calls.slice(1),
      ).toEqual([]);
    });
  });

  describe('when the event is in the past', () => {
    beforeEach(() => {
      createEvent();
    });

    test('does not create any reminders', async () => {
      MockDate.set(new Date(Date.UTC(2001, 5, 5)));

      await executeLambda(event);

      expect(
        ((getDefaultApiClient()
          .invoke as unknown) as jest.SpyInstance).mock.calls.slice(1),
      ).toEqual([]);
    });
  });
});
