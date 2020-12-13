#!/usr/bin/env node

// This utility script reads the contents of skill-package/description.txt
// and skill-package/updatesDescription.txt, JSON-escapes them
// (i.e. escapes double quotes, replaces newlines with \n),
// and copies the content into the corresponding properties inside `skill.json`.
// This is just for convenience, since editing large chunks of text
// inside JSON is painful.

// Note that this script only modifies the `en-US` properties, so
// this script should be run _before_ `copy-english-files.js`.

const fs = require('fs');
const path = require('path');

const descriptionTxtPath = path.resolve(
  __dirname,
  '../../skill-package/description.txt',
);

const updatesDescriptionTxtPath = path.resolve(
  __dirname,
  '../../skill-package/updatesDescription.txt',
);

const skillJsonPath = path.resolve(__dirname, '../../skill-package/skill.json');

const descriptionTxt = fs.readFileSync(descriptionTxtPath, 'utf8');

const updatesDescriptionTxt = fs.readFileSync(
  updatesDescriptionTxtPath,
  'utf8',
);

const skillJson = require(skillJsonPath);

const enUS = skillJson.manifest.publishingInformation.locales['en-US'];

enUS.description = descriptionTxt;
enUS.updatesDescription = updatesDescriptionTxt;

fs.writeFileSync(skillJsonPath, JSON.stringify(skillJson, null, 2));
