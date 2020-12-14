import { DaysUntilAttributes, db } from '~/adapters/dynamo-db';
import * as Alexa from 'ask-sdk-core';

export interface DeleteRemindersForEventOptions {
  /**
   * Whether or not to also erase the reminder IDs
   * stored in the Days Until database
   */
  alsoDeleteFromDB?: boolean;
}

/**
 * Deletes all reminders associated with an event (if it exists)
 * Can be called even if the event doesn't yet exist.
 *
 * @param handlerInput The current handlerInput
 * @param eventKey The event key
 */
export const deleteRemindersForEvent = async (
  handlerInput: Alexa.HandlerInput,
  eventKey: string,
  options?: DeleteRemindersForEventOptions,
) => {
  const attributes: DaysUntilAttributes = await db.get(
    handlerInput.requestEnvelope,
  );

  const event = attributes.events?.[eventKey];

  if (event) {
    const { reminderIds } = event;

    // Delete all associated reminders, if any, and if we (still) have permission
    if (reminderIds?.length > 0) {
      const remindersApiClient = handlerInput.serviceClientFactory.getReminderManagementServiceClient();
      const permissions =
        handlerInput.requestEnvelope.context.System.user.permissions;

      if (permissions) {
        await Promise.all(
          reminderIds.map(async (idToDelete) => {
            return await remindersApiClient.deleteReminder(idToDelete);
          }),
        );

        if (options?.alsoDeleteFromDB) {
          await db.delete(handlerInput.requestEnvelope, [
            `events.${eventKey}.reminderIds`,
          ]);
        }
      }
    }
  }
};
