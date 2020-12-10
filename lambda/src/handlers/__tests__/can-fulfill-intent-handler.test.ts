import moment from 'moment';
import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';
import { db, DaysUntilAttributes } from '~/adapters/dynamo-db';
import { INTENT_NAME as REPORT_COUNTDOWN_INTENT_NAME } from '~/handlers/report-countdown-intent-handler';
import { INTENT_NAME as LIST_ALL_COUNTDOWNS_INTENT_NAME } from '~/handlers/list-all-countdowns-intent-handler';
import { INTENT_NAME as START_COUNTDOWN_INTENT_NAME } from '~/handlers/start-countdown-intent-handler';

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');
jest.mock('~/util/get-failure-interjection');

describe('canFulfillIntentHandler', () => {
  let userAttributes: DaysUntilAttributes;
  let event: any;

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();

  beforeEach(() => {
    userAttributes = {
      events: {
        'M BR0T': {
          eventName: 'My Birthday',
          eventDate: moment.utc('2001-02-05', 'YYYY-MM-DD').toISOString(),
        },
      },
    };

    event = createAlexaEvent({
      request: {
        type: 'CanFulfillIntentRequest',
        intent: {
          name: REPORT_COUNTDOWN_INTENT_NAME,
          confirmationStatus: 'NONE',
          slots: {
            CountdownEvent: {
              value: 'My Birthday',
            },
          },
        },
      },
    });
  });

  const expectCanFulfill = () => {
    it('responds with canFulfill === "YES"', async () => {
      const result: any = await executeLambda(event);

      expect(result.response.canFulfillIntent.canFulfill).toBe('YES');
    });
  };

  const expectCanMaybeFulfill = () => {
    it('responds with canFulfill === "MAYBE"', async () => {
      const result: any = await executeLambda(event);

      expect(result.response.canFulfillIntent.canFulfill).toBe('MAYBE');
    });
  };

  const expectCannotFulfill = () => {
    it('responds with canFulfill === "NO"', async () => {
      const result: any = await executeLambda(event);

      expect(result.response.canFulfillIntent.canFulfill).toBe('NO');
    });
  };

  describe('when the user is asking to check on an existing countdown', () => {
    describe('when the user ID exists', () => {
      describe('when the countdown exists', () => {
        expectCanFulfill();

        it('responsds with confidence about the CountdownEvent slot', async () => {
          const result: any = await executeLambda(event);

          expect(result.response.canFulfillIntent.slots).toEqual({
            CountdownEvent: {
              canUnderstand: 'YES',
              canFulfill: 'YES',
            },
          });
        });
      });

      describe('when the countdown does not exist', () => {
        beforeEach(() => {
          userAttributes = {
            events: {},
          };
        });

        expectCannotFulfill();
      });

      describe('when the CountdownEvent slot value is not provided', () => {
        beforeEach(() => {
          event.request.intent.slots = null;
        });

        expectCannotFulfill();
      });
    });

    describe('when the user ID does not exist', () => {
      beforeEach(() => {
        event.context.System.user.userId = null;
      });

      expectCannotFulfill();
    });
  });

  describe('when the user is asking to list all countdowns', () => {
    beforeEach(() => {
      event.request.intent.name = LIST_ALL_COUNTDOWNS_INTENT_NAME;
    });

    describe('when the user ID exists', () => {
      expectCanFulfill();
    });

    describe('when the user ID does not exist', () => {
      beforeEach(() => {
        event.context.System.user.userId = null;
      });

      expectCannotFulfill();
    });
  });

  describe('when the user is asking to create a new countdown', () => {
    beforeEach(() => {
      event.request.intent.name = START_COUNTDOWN_INTENT_NAME;
    });

    describe('when all slot values are filled', () => {
      beforeEach(() => {
        event.request.intent.slots = {
          CountdownEvent: {
            value: 'My Birthday',
          },
          EventDate: {
            value: '2015-01-01',
          },
        };
      });

      expectCanFulfill();
    });

    describe('when not all slot values are filled', () => {
      beforeEach(() => {
        event.context.System.user.userId = null;

        event.request.intent.slots = {
          CountdownEvent: {
            value: 'My Birthday',
          },
        };
      });

      expectCanMaybeFulfill();
    });
  });

  describe('when the user is asking for an unsupported intent', () => {
    beforeEach(() => {
      event.request.intent.name = 'CreateReminderIntent';
    });

    expectCannotFulfill();
  });
});
