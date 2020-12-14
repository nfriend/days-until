import moment from 'moment';
import _ from 'lodash';
import MockDate from 'mockdate';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';
import { db, DaysUntilAttributes } from '~/adapters/dynamo-db';
import { getDefaultApiClient } from '~/util/get-default-api-client';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');
jest.mock('~/util/get-default-api-client');
jest.mock('~/util/session-attributes', () => ({
  setSessionAttributes: jest.fn(),
  getSessionAttributes: () => jest.fn(),
}));

describe('createReminderIntentHandler', () => {
  const eventDate = moment.utc('2001-03-05', 'YYYY-MM-DD');
  let userAttributes: DaysUntilAttributes;
  let event: any;

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();
  jest.spyOn(db, 'delete').mockResolvedValue();

  beforeEach(() => {
    event = createAlexaEvent({
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
            permissions: {
              consentToken: '<consent-token-here>',
            },
          },
        },
      },
    });

    userAttributes = {
      events: {
        'M BR0T': {
          eventName: 'My Birthday',
          eventDate: eventDate.toISOString(),
        },
      },
    };

    MockDate.set(new Date(Date.UTC(2001, 1, 3)));

    jest.spyOn(getDefaultApiClient(), 'invoke');
  });

  afterEach(() => {
    MockDate.reset();

    event = null;
  });

  describe("when the user hasn't yet granted permissions", () => {
    beforeEach(() => {
      event.context.System.user.permissions = null;
    });

    test('directs the user to enable permissions in the Alexa app', async () => {
      const result: any = await executeLambda(event);

      expect(
        result.response.directives.some(
          (d: any) => d.type === 'Connections.SendRequest',
        ),
      ).toBe(true);
    });
  });

  describe('when the event is in the future', () => {
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

      expect(db.put).toHaveBeenCalledWith(expect.anything(), {
        doNotPromptForReminders: false,
        events: {
          'M BR0T': {
            dailyReminderAt: '13:30',
            reminderIds: Array(allRequestTimes.length).fill('fakeAlertToken'),
          },
        },
      });
    });

    test('creates reminders with the right speech', async () => {
      await executeLambda(event);

      const allSpeeches = ((getDefaultApiClient()
        .invoke as unknown) as jest.SpyInstance).mock.calls
        .slice(1)
        .map((call) => {
          return JSON.parse(call[0].body).alertInfo.spokenInfo.content[0].text;
        });

      expect(allSpeeches).toEqual([
        '10 days until My Birthday',
        '9 days until My Birthday',
        '8 days until My Birthday',
        '7 days until My Birthday',
        '6 days until My Birthday',
        '5 days until My Birthday',
        '4 days until My Birthday',
        '3 days until My Birthday',
        '2 days until My Birthday',
        'My Birthday is tomorrow!',
        'My Birthday is today!',
      ]);
    });

    test('speaks a confirmation that the reminder has been set', async () => {
      const result = await executeLambda(event);

      expect(result).toSpeek(
        "Done! You'll get a daily reminder starting ten days before My Birthday.",
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
          '2001-03-05T13:30:00',
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
          '2001-03-05T13:30:00',
        ]);
      });
    });
  });

  describe('when the event is in the past', () => {
    test('does not create any reminders', async () => {
      MockDate.set(new Date(Date.UTC(2001, 5, 5)));

      await executeLambda(event);

      expect(
        ((getDefaultApiClient()
          .invoke as unknown) as jest.SpyInstance).mock.calls.slice(1),
      ).toEqual([]);
    });
  });

  describe('when the event already has existing reminders', () => {
    beforeEach(() => {
      userAttributes.events['M BR0T'].reminderIds = ['1', '2', '3'];
    });

    test('deletes any existing reminders before it creates new ones', async () => {
      await executeLambda(event);

      // Each DELETE request is made to a URL that looks like:
      // https://api.amazonalexa.com/v1/alerts/reminders/<reminder ID>
      const allDeletedIds = ((getDefaultApiClient()
        .invoke as unknown) as jest.SpyInstance).mock.calls

        // First call is to get timezone info
        // Calls 2, 3, and 4 are to delete the existing reminders
        // The rest are to create new reminders
        .slice(1, 4)
        .map((call) => _.last(call[0].url.split('/')));

      expect(allDeletedIds).toEqual(
        userAttributes.events['M BR0T'].reminderIds,
      );

      expect(db.delete).toHaveBeenCalledTimes(1);
      expect(db.delete).toHaveBeenCalledWith(expect.anything(), [
        'events.M BR0T.reminderIds',
      ]);
    });
  });
});
