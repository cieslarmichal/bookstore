const baseConfig = require('./tests-base.config');

module.exports = {
  ...baseConfig,
  testRegex: '.integration.test.ts$',
};
