import moment from 'moment';
import MockDate from 'mockdate';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';
import { db, DaysUntilAttributes } from '~/adapters/dynamo-db';
import { setSessionAttributes } from '~/util/session-attributes';
import { YesNoIntentQuestion } from '../yes-no-intent-question';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');
jest.mock('~/util/session-attributes', () => ({
  setSessionAttributes: jest.fn(),
}));

describe('reportCountdownIntentHandler', () => {
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
  });

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();

  beforeEach(() => {
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
