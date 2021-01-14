'use strict';

/* eslint-disable no-undef */
jest.mock('node-fetch');
/* eslint-enable no-undef */

const { describe, expect, it } = require('@jest/globals');
const fetch = require('node-fetch');

const { http: { doGet, doPost } } = require('.');

describe('http tests', () => {
  it('returns promise for GET http request', () => {
    fetch.mockReturnValue(Promise.resolve('value'));
    expect(doGet('http://localhost:3000')).resolves.toBe('value');
  });

  it('returns promise for GET http request', () => {
    fetch.mockReturnValue(Promise.resolve('value'));
    expect(doPost('http://localhost:3000')({ id: 1 })).resolves.toBe('value');
  });
});
