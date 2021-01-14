'use strict';

const { create, env } = require('sanctuary');
const fluture = require('fluture');
const $ = require('sanctuary-def');
const {
  ConcurrentFutureType,
  env: fEnv,
  FutureType,
} = require('fluture-sanctuary-types');

const isProd = /production/i.test(process.env.NODE_ENV);

const S = create({ checkTypes: !isProd, env: [...env, ...fEnv] });
const def = $.create({ checkTypes: !isProd, env: [...$.env, ...fEnv] });

const http = require('./http')({ fluture, S });
const utils = require('./utils')({ $, S });

/**
 *Convenient FP Utils is a module that wraps different fp libraries together.
 *
 * **Why not ramda or lodash/fp?**
 *
 * I like ramda and lodash/fp; they're cool in most situations, but despite they help us to write clean and composable code, this code is not type-safe. Sanctuary allows us to write type-safe code with its functions, and with sanctuary-def we're able to write type-safe functions.
 *
 * @returns {object} all the convenient-fp-utils utilities
 *
 */
module.exports = {
  sanctuary: S
  , sanctuaryDef: { ...$, def, FutureType, ConcurrentFutureType }
  , fluture
  , http
  , utils
};
