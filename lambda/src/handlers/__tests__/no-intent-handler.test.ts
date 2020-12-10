import { createAlexaEvent } from './create-alexa-event';
import { executeLambda } from './execute-lambda';
import { db, DaysUntilAttributes } from '~/adapters/dynamo-db';
import { YesNoIntentQuestion } from '../yes-no-intent-question';
import { setSessionAttributes } from '~/util/session-attributes';

let mockSessionAttributes = {};

jest.mock('~/util/choose-one');
jest.mock('~/adapters/dynamo-db');
jest.mock('~/util/session-attributes', () => ({
  getSessionAttributes: () => mockSessionAttributes,
  setSessionAttributes: jest.fn(),
}));

describe('noIntentHandler', () => {
  const userAttributes: DaysUntilAttributes = {};

  const event = createAlexaEvent({
    request: {
      type: 'IntentRequest',
      intent: {
        name: 'AMAZON.NoIntent',
        slots: {},
      },
    },
  });

  jest
    .spyOn(db, 'get')
    .mockImplementation(() => Promise.resolve(userAttributes));
  jest.spyOn(db, 'put').mockResolvedValue();

  describe('when the user is respond "no" to "would you like to create a daily reminder?"', () => {
    test('prompts the user if they would like to opt out of future reminder requests', async () => {
      mockSessionAttributes = {
        YesNoIntentQuestion: YesNoIntentQuestion.ShouldCreateReminder,
      };

      const result = await executeLambda(event);

      expect(setSessionAttributes).toHaveBeenCalledWith(expect.anything(), {
        YesNoIntentQuestion:
          YesNoIntentQuestion.ShouldStopPromptingForReminders,
      });

      expect(result).toSpeek(
        'No problem, would you like me to stop prompting you to create reminders in the future?',
      );
    });
  });

  describe('when the user is respond "no" to "would you like to stop being prompted for reminders?"', () => {
    test('saves this preference in the database as doNotPromptForReminders and responds with a confirmation', async () => {
      mockSessionAttributes = {
        YesNoIntentQuestion:
          YesNoIntentQuestion.ShouldStopPromptingForReminders,
      };

      const result = await executeLambda(event);

      expect(db.put).toHaveBeenCalledWith(expect.anything(), {
        doNotPromptForReminders: false,
      });

      expect(result).toSpeek(
        "Great, I'll continue to ask when you make countdowns in the future.",
      );
    });
  });

  describe('when the user is respond "no" to "would you like to create another reminder?"', () => {
    test('responds with a confirmation that everything is done', async () => {
      mockSessionAttributes = {
        YesNoIntentQuestion: YesNoIntentQuestion.ShouldCreateAnotherReminder,
      };

      const result = await executeLambda(event);

      expect(result).toSpeek('Sounds good!');
    });
  });

  describe('when the user is respond "no" to "would you like to do something else?"', () => {
    test('redirects to the StopIntent handler', async () => {
      mockSessionAttributes = {
        YesNoIntentQuestion: YesNoIntentQuestion.ShouldDoSomethingElse,
      };

      const result = await executeLambda(event);

      expect(result).toSpeek('Have a good one!');
    });
  });
});
