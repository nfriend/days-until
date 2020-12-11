#!/usr/bin/env node

const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');

// This is a temporary script that copies data from the
// old Days Until database and merges it into the new database.

const DEBUG = false;

const getAllItems = async (ddb, tableName) => {
  let data;
  let count = 0;
  do {
    console.log(`Getting page ${count + 1} of table ${tableName}...`);

    const params = {
      TableName: tableName,
    };

    if (data?.LastEvaluatedKey) {
      params.ExclusiveStartKey = data.LastEvaluatedKey;
    }

    const page = await ddb.scan(params).promise();

    if (!data) {
      data = page;
    } else {
      data.Items = data.Items.concat(page.Items);
      data.LastEvaluatedKey = page.LastEvaluatedKey;
      data.Count = parseInt(data.Count, 10) + parseInt(page.Count, 10);
      delete data.ScannedCount;
    }

    count++;
  } while (data.LastEvaluatedKey);

  return data;
};

(async () => {
  const AWS = require('aws-sdk');
  AWS.config.update({ region: 'us-east-1' });

  const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

  if (DEBUG) {
    console.log('Querying old DaysUntilSkillData database...');
  }

  const oldData = await getAllItems(ddb, 'DaysUntilSkillData');

  if (DEBUG) {
    fs.writeFileSync('./old-data.json', JSON.stringify(oldData, null, 2));
  }

  console.log('Querying new DaysUntilV2SkillData database...');

  const newData = await getAllItems(ddb, 'DaysUntilV2SkillData');

  if (DEBUG) {
    fs.writeFileSync('./new-data.json', JSON.stringify(oldData, null, 2));
  }

  console.log('Computing updates...');

  const newDataMap = newData.Items.reduce((acc, curr) => {
    acc[curr.id.S] = curr.attributes;
    return acc;
  }, {});

  const updates = oldData.Items.map((oldItem) => {
    const convertedEvents = Object.keys(oldItem.mapAttr.M).reduce(
      (acc, curr) => {
        try {
          acc[curr] = _.cloneDeep(oldItem.mapAttr.M[curr]);
          acc[curr].M.eventDate.S = moment
            .utc(acc[curr].M.eventDate.S, 'YYYY-MM-DD')
            .toISOString();

          // Delete any events that evaluated to null
          if (!acc[curr].M.eventDate.S) {
            delete acc[curr];
          }
        } catch (err) {
          console.log('Ran into an error while processing an event');

          if (DEBUG) {
            console.log(
              'Event:',
              JSON.stringify(oldItem.mapAttr.M[curr], null, 2),
            );
          }

          console.log('Deleting event...');

          delete acc[curr];
        }

        return acc;
      },
      {},
    );

    const update = {
      id: oldItem.userId,
      attributes: {
        M: {
          events: {
            M: convertedEvents,
          },
        },
      },
    };

    const newItemAttributes = newDataMap[oldItem.userId.S];
    if (newItemAttributes) {
      _.merge(update.attributes, newItemAttributes);
    }

    return update;
  });

  console.log('Computing batches...');

  const allBatchWrites = [];

  while (updates.length) {
    const first25 = updates.splice(0, 25);

    allBatchWrites.push({
      RequestItems: {
        DaysUntilV2SkillData: first25.map((update) => ({
          PutRequest: {
            Item: update,
          },
        })),
      },
    });
  }

  fs.writeFileSync('./batches.json', JSON.stringify(allBatchWrites, null, 2));

  for (const [index, batch] of allBatchWrites.entries()) {
    console.log(`Uploading batch ${index + 1} of ${allBatchWrites.length}...`);
    try {
      await ddb.batchWriteItem(batch).promise();
    } catch (err) {
      console.log(
        `Encountered an error while uploading batch ${index + 1}:`,
        err,
      );

      if (DEBUG) {
        console.log('Batch details:', JSON.stringify(batch, null, 2));
      }

      throw err;
    }
  }
})();
