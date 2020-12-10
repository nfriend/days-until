import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';
import { db, DaysUntilAttributes } from '~/adapters/dynamo-db';
import { createReminderIntentHandler } from '~/handlers/create-reminder-intent-handler';
import { startCountdownIntentHandler } from '~/handlers/start-countdown-intent-handler';
import { YesNoIntentQuestion } from '../yes-no-intent-question';

let mockSessionAttributes = {};

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');
createReminderIntentHandler.handle = jest.fn();
startCountdownIntentHandler.handle = jest.fn();
jest.mock('~/util/session-attributes', () => ({
  getSessionAttributes: () => mockSessionAttributes,
}));

describe('yesIntentHandler', () => {
  const userAttributes: DaysUntilAttributes = {};

  const event = createAlexaEvent({
    request: {
      type: 'IntentRequest',
      intent: {
        name: 'AMAZON.YesIntent',
        slots: {},
      },
    },
  });

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();

  describe('when the user is respond "yes" to "would you like to create a daily reminder?"', () => {
    test('redirects to the createReminderIntentHandler', async () => {
      mockSessionAttributes = {
        YesNoIntentQuestion: YesNoIntentQuestion.ShouldCreateReminder,
      };

      await executeLambda(event);

      expect(createReminderIntentHandler.handle).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the user is respond "yes" to "would you like to stop being prompted for reminders?"', () => {
    test('saves this preference in the database as doNotPromptForReminders and responds with a confirmation', async () => {
      mockSessionAttributes = {
        YesNoIntentQuestion:
          YesNoIntentQuestion.ShouldStopPromptingForReminders,
      };

      const result = await executeLambda(event);

      expect(db.put).toHaveBeenCalledWith(expect.anything(), {
        doNotPromptForReminders: true,
      });

      expect(result).toSpeek("Sounds good, I won't ask again!");
    });
  });

  describe('when the user is respond "yes" to "would you like to create another countdown?"', () => {
    test('redirects back to the startCountdownIntentHandler', async () => {
      mockSessionAttributes = {
        YesNoIntentQuestion: YesNoIntentQuestion.ShouldCreateAnotherReminder,
      };

      await executeLambda(event);

      expect(startCountdownIntentHandler.handle).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the user is respond "yes" to "would you like to do something else?"', () => {
    test('redirects back to the startCountdownIntentHandler', async () => {
      mockSessionAttributes = {
        YesNoIntentQuestion: YesNoIntentQuestion.ShouldDoSomethingElse,
      };

      const result = await executeLambda(event);

      expect(result).toSpeek('Okay, what would you like to do?');
    });
  });
});
