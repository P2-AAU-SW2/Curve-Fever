const child_process = require('child_process');
const path = require('path');
const fs = require('fs');

const mocha = process.argv[2];
const test = process.argv[3];

const mochaArgs = [
    '--exit',
    '--allow-uncaught=false',
    '--reporter',
    path.join(__dirname, 'testPilotMochaReporter.js'),
    '--',
    test,
];

const child = child_process.fork(mocha, mochaArgs);
var testResult;

child.on('message', message => {
    if (message.type === 'test-failed') {
        testResult = message.err;
    }
});

child.on('exit', (code, signal) => {
    if (!testResult) {
        if (code !== 0) {
            testResult = `Test failed with exit code ${code}.`;
        } else if (signal) {
            testResult = `Test failed with signal ${signal}.`;
        } else {
            testResult = 'Test passed!';
        }
    }
    fs.writeFileSync(path.join(__dirname, 'testPilotResult.txt'), testResult);
});
