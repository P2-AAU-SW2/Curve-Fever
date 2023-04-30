let mocha = require('mocha');
let assert = require('chai').assert;
let line_fever = require('..');
describe('test line_fever', function() {
    it('test line-fever.logger', function(done) {
        let gameStates = line_fever.startGame();
        line_fever.logger();
        done();
    })
})