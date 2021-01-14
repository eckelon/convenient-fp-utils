'use strict';

const fetch = require('node-fetch');

/**
 * This object offers a curated set of composable functions to make http-requests with fetch API
 *
 * @param {object} dependencies object containing the fluture and sanctuary (S) dependencies.
 * @return {object} http functions.
 */
module.exports = ({
  fluture: { attemptP, promise },
  S: { concat, flip, pipe, singleton },
}) => {
  const defaultHeaders = { 'Content-Type': 'application/json' };
  const stringify = (x) => JSON.stringify(x);

  const fetchf = (options) => (url) => attemptP(() => fetch(url, options));

  const doGetRequest = fetchf({ headers: defaultHeaders });
  const doPostRequest = (url) =>
    pipe([
      stringify
      , singleton('body')
      , concat({ method: 'POST', headers: defaultHeaders })
      , flip(fetchf)(url)
    ]);

  /**
   * doGet :: Promise b => a -> b
   *
   * It makes a GET http request and returns a promise result
   *
   * @returns {Promise}
   */
  const doGet = (url) => promise(doGetRequest(url));

  /**
   * doPost :: Promise c => a -> b -> c
   *
   * It makes a POST http request with data as body, and returns a promise result
   *
   * @returns {Promise}
   */
  const doPost = (url) => (data) => promise(doPostRequest(url)(data));

  return { doGet, doPost };
};
