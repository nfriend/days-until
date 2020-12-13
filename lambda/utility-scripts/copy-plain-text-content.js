#!/usr/bin/env node

// This utility script reads the contents of `skill-package/*.txt` files,
// JSON-escapes them (i.e. escapes double quotes, replaces newlines with \n),
// and copies the content into the corresponding properties inside `skill.json`.
// This is just for convenience, since editing large chunks of text
// inside JSON is painful.

// Note that this script only modifies the `en-US` properties, so
// this script should be run _before_ `copy-english-files.js`.

const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const skillJsonPath = path.resolve(__dirname, '../../skill-package/skill.json');
const skillJson = require(skillJsonPath);

const filesToCopy = [
  {
    txtFile: 'description.txt',
    skillJsonPropertyPath:
      'manifest.publishingInformation.locales.en-US.description',
  },
  {
    txtFile: 'updatesDescription.txt',
    skillJsonPropertyPath:
      'manifest.publishingInformation.locales.en-US.updatesDescription',
  },
  {
    txtFile: 'testingInstructions.txt',
    skillJsonPropertyPath: 'manifest.publishingInformation.testingInstructions',
  },
];

for (const fileToCopy of filesToCopy) {
  const txt = fs.readFileSync(
    path.join(__dirname, '../../skill-package', fileToCopy.txtFile),
    'utf8',
  );
  _.set(skillJson, fileToCopy.skillJsonPropertyPath, txt);
}

fs.writeFileSync(skillJsonPath, JSON.stringify(skillJson, null, 2));
