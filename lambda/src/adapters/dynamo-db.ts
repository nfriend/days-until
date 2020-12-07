import * as Adapter from 'ask-sdk-dynamodb-persistence-adapter';
import { RequestEnvelope } from 'ask-sdk-model';
import _ from 'lodash';

export const adapter = new Adapter.DynamoDbPersistenceAdapter({
  tableName: 'DaysUntilV2SkillData',
  createTable: true,
});

export interface DaysUntilAttributes {
  lastLaunch?: string;
  events?: {
    [eventKey: string]: {
      eventName?: string;
      eventDate?: string;
      createdOn?: string;
      dailyReminderAt?: string;
      reminderIds?: string[];
    };
  };
}

export const db = {
  /**
   * Writes values to the database
   * @param requestEnvelope The current request envelope
   * @param values The values to write to the database
   */
  async put(
    requestEnvelope: RequestEnvelope,
    values: DaysUntilAttributes,
  ): Promise<void> {
    const attrs = await adapter.getAttributes(requestEnvelope);
    await adapter.saveAttributes(requestEnvelope, _.merge({}, attrs, values));
  },

  /**
   * Gets all the values from the database
   * @param requestEnvelope The current request envelope
   */
  async get(requestEnvelope: RequestEnvelope): Promise<DaysUntilAttributes> {
    return (await adapter.getAttributes(
      requestEnvelope,
    )) as DaysUntilAttributes;
  },

  /**
   * Deletes one or more values from the database
   * @param requestEnvelope The current request envelope
   * @param keys A list of keys to delete
   */
  async delete(
    requestEnvelope: RequestEnvelope,
    keys: Array<keyof DaysUntilAttributes>,
  ): Promise<void> {
    const attrs = await adapter.getAttributes(requestEnvelope);
    for (const key of keys) {
      delete attrs[key];
    }
    await adapter.saveAttributes(requestEnvelope, attrs);
  },
};
