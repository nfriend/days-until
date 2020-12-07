import moment from 'moment';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';
import { db, DaysUntilAttributes } from '~/adapters/dynamo-db';
import MockDate from 'mockdate';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');

describe('reportCountdownIntentHandler', () => {
  const userAttributes: DaysUntilAttributes = {};

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
  });

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();

  beforeEach(() => {
    MockDate.set(new Date(Date.UTC(2001, 1, 3)));
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

  describe('when the event is at least two days away', () => {
    it('prompts the user to create dailys reminders', async () => {
      MockDate.set(new Date(Date.UTC(2001, 1, 3)));

      const result = await executeLambda(event);

      expect(result).toSpeek(
        'Done! To check on this countdown, just say: <break strength="strong"/> Ask Days Until, how long until My Birthday? Would you like to create a daily reminder for this countdown starting ten days before the event?',
      );
    });
  });

  describe('when the event is tomorrow or earlier', () => {
    it('does not prompt the user to create dailys reminders', async () => {
      MockDate.set(new Date(Date.UTC(2001, 1, 4)));

      const result = await executeLambda(event);

      expect(result).toSpeek(
        'Done! To check on this countdown, just say: <break strength="strong"/> Ask Days Until, how long until My Birthday?',
      );
    });
  });
});
