import moment from 'moment';
import MockDate from 'mockdate';
import _ from 'lodash';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';
import { db, DaysUntilAttributes } from '~/adapters/dynamo-db';
import { setSessionAttributes } from '~/util/session-attributes';
import { YesNoIntentQuestion } from '../yes-no-intent-question';
import { getDefaultApiClient } from '~/util/get-default-api-client';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');
jest.mock('~/util/session-attributes', () => ({
  setSessionAttributes: jest.fn(),
}));
jest.mock('~/util/get-default-api-client');

describe('startCountdownIntentHandler', () => {
  let userAttributes: DaysUntilAttributes;

  const event = createAlexaEvent({
    request: {
      type: 'IntentRequest',
      intent: {
        name: 'StartCountdownIntent',
        confirmationStatus: 'CONFIRMED',
        slots: {
          CountdownEvent: {
            value: 'My Birthday',
          },
          EventDate: {
            value: '2001-02-05',
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
  });

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();
  jest.spyOn(db, 'delete').mockResolvedValue();

  beforeEach(() => {
    jest.spyOn(getDefaultApiClient(), 'invoke');
    MockDate.set(new Date(Date.UTC(2001, 1, 3)));
    userAttributes = {};
  });

  afterEach(() => {
    MockDate.reset();
  });

  test('saves a new countdown to the database', async () => {
    await executeLambda(event);

    expect(((db.put as unknown) as jest.SpyInstance).mock.calls[1]).toEqual([
      expect.anything(),
      expect.objectContaining({
        events: {
          'M BR0T': {
            eventName: 'My Birthday',
            eventDate: moment.utc('2001-02-05', 'YYYY-MM-DD').toISOString(),
            createdOn: moment.utc('2001-02-03', 'YYYY-MM-DD').toISOString(),
          },
        },
      }),
    ]);
  });

  describe('when the event already exists and has reminders', () => {
    beforeEach(() => {
      userAttributes = {
        events: {
          'M BR0T': {
            eventName: 'My Birthday',
            eventDate: moment.utc('2000-01-09', 'YYYY-MM-DD').toISOString(),
            createdOn: moment.utc('1999-12-26', 'YYYY-MM-DD').toISOString(),
            reminderIds: ['1', '2', '3'],
          },
        },
      };
    });

    test('wipes out the old reminders before creating the new countdown', async () => {
      await executeLambda(event);

      // Each DELETE request is made to a URL that looks like:
      // https://api.amazonalexa.com/v1/alerts/reminders/<reminder ID>
      const allDeletedIds = ((getDefaultApiClient()
        .invoke as unknown) as jest.SpyInstance).mock.calls.map((call) =>
        _.last(call[0].url.split('/')),
      );

      expect(allDeletedIds).toEqual(
        userAttributes.events['M BR0T'].reminderIds,
      );

      expect(db.delete).toHaveBeenCalledTimes(1);
      expect(db.delete).toHaveBeenCalledWith(expect.anything(), [
        'events.M BR0T.reminderIds',
      ]);
    });
  });

  const expectNotToPromptForReminders = () => {
    it('does not prompt the user to create dailys reminders; prompts to create another countdown instead', async () => {
      const result = await executeLambda(event);

      expect(setSessionAttributes).toHaveBeenCalledWith(expect.anything(), {
        YesNoIntentQuestion: YesNoIntentQuestion.ShouldCreateAnotherReminder,
      });

      expect(result).toSpeek(
        'Done! To check on this countdown, just say: <break strength="strong"/> Ask Days Until, how long until My Birthday? Would you like to create another countdown?',
      );
    });
  };

  describe('when the event is at least two days away', () => {
    beforeEach(() => {
      MockDate.set(new Date(Date.UTC(2001, 1, 3)));
    });

    describe('when the user has previously asked not to be prompted to create reminders', () => {
      beforeEach(() => {
        userAttributes = {
          doNotPromptForReminders: true,
        };
      });

      expectNotToPromptForReminders();
    });

    describe('when the user has not asked not to be prompted to create reminders', () => {
      it('prompts the user to create dailys reminders', async () => {
        const result = await executeLambda(event);

        expect(setSessionAttributes).toHaveBeenCalledWith(expect.anything(), {
          YesNoIntentQuestion: YesNoIntentQuestion.ShouldCreateReminder,
          eventName: 'My Birthday',
        });

        expect(result).toSpeek(
          'Done! To check on this countdown, just say: <break strength="strong"/> Ask Days Until, how long until My Birthday? Also, would you like to create a daily reminder for this countdown starting ten days before the event?',
        );
      });
    });
  });

  describe('when the event is tomorrow or earlier', () => {
    beforeEach(() => {
      MockDate.set(new Date(Date.UTC(2001, 1, 4)));
    });

    expectNotToPromptForReminders();
  });
});
