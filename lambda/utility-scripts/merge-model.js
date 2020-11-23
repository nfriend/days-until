#!/usr/bin/env node

// A utility script that merges en-US.base.json into en-US.json.
// This is necessary because Alexa Skill Utterance and Schema Generator
// (https://github.com/KayLerch/alexa-utterance-generator)
// doesn't yet support dialogs.

const fs = require('fs');
const _ = require('lodash');
const path = require('path');

const basePath = '../../skill-package/interactionModels/custom';

const baseFilePath = path.resolve(__dirname, basePath, 'en-US.base.json');
const modelFilePath = path.resolve(__dirname, basePath, 'en-US.json');

const base = require(baseFilePath);
const model = require(modelFilePath);

const merged = _.merge({}, base, model);

fs.writeFileSync(modelFilePath, JSON.stringify(merged, null, 4));
