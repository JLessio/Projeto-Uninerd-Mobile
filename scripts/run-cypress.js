delete process.env.ELECTRON_RUN_AS_NODE;

const cypress = require('cypress');

cypress.run({ browser: 'chrome' }).then((result) => {
  if (result.failures) {
    console.error(result.message);
    process.exit(1);
  }
  process.exit(result.totalFailed ? 1 : 0);
});
