// Necessary because Lambda doesn't respect
// package.json's "main" property. (It only
// executes a root "index.js".)
module.exports = require('build/index.js');
