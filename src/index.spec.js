
'use strict';

const { describe, expect, it } = require('@jest/globals');

const { fluture: { promise, resolve }, sanctuary: { I } } = require('.');

describe('fluture - sanctuary integration tests', () => {

  it('integrates Fluture with sanctuary\'s identity function',
    () => expect(promise(I(resolve (42)))).resolves.toBe(42));
});
