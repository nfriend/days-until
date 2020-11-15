#!/usr/bin/env node

// A utility script that merges en-US.base.json into en-US.json.
// This is necessary because Alexa Skill Utterance and Schema Generator
// (https://github.com/KayLerch/alexa-utterance-generator)
// doesn't yet support dialogs.

const fs = require('fs');
const _ = require('../lambda/node_modules/lodash');
const path = require('path');

const basePath = '../skill-package/interactionModels/custom';

const base = require(path.resolve(__dirname, basePath, 'en-US.base.json'));
const model = require(path.resolve(__dirname, basePath, 'en-US.json'));

const merged = _.merge({}, base, model);

fs.writeFileSync(
  path.resolve(basePath, 'en-US.json'),
  JSON.stringify(merged, null, 2),
);
