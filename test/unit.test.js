const assert = require('assert');
const Maths = require('../Maths');

describe('Basic maths test', function() {
    it('Test if 1 equals 1', function() {
        assert.equal(1, 1);
    });
    it('Test if 2 equals 2', function() {
        assert.equal(2, 2);
    });
});

describe('Maths class test', function() {
    it('Maths: Test if 1 + 1 = 2', function() {
        const actual = Maths.add(1, 1);
        const expected = 2;

        assert.equal(actual, expected);
    });

    it('Maths: Test if 4 - 1 = 3', function() {
        const actual = Maths.sub(4, 1);
        const expected = 3;

        assert.equal(actual, expected);
    });
});