// Allow node to understand the "~" path alias
// See https://www.npmjs.com/package/module-alias
require('module-alias/register');

// Necessary because Lambda doesn't respect
// package.json's "main" property. (It only
// executes a root "index.js".)
module.exports = require('build/index.js');
