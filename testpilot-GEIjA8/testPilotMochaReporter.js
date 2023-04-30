const Mocha = require('mocha');
const inherits = require('util').inherits;
const EVENT_TEST_FAIL = Mocha.Runner.constants ? Mocha.Runner.constants.EVENT_TEST_FAIL : 'fail';

/**
 * A custom Mocha reporter that inherits from the spec reporter,
 * but notifies TestPilot when a test fails.
 */
function TestPilotMochaReporter(runner) {
    Mocha.reporters.Spec.call(this, runner);

    runner.on(EVENT_TEST_FAIL, (test, err) => {
        // send failure message using process.send
        if (process.send) {
            process.send({
                type: 'test-failed',
                test: test.fullTitle(),
                err: err.message,
            });
        }
    });
}

inherits(TestPilotMochaReporter, Mocha.reporters.Spec);

module.exports = TestPilotMochaReporter;
