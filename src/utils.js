'use strict';
/**
 * This object offers a curated set of composable functions that we usually use.
 *
 * @param {object} dependencies object containing the sanctuary (S) dependency.
 * @return {object} utils functions.
 */
module.exports = ({ $: { Any, AnyFunction, Array, Boolean, create, env, Function, Maybe, Object, String },  S: { compose: B, equals, find, flip: C, fromMaybe, fromPairs, get, K, map, pipe, reduce, zip } }) => {


  const def = create ({ checkTypes: true, env });

  const defBooleanFn = def('booleanFunc')({})([Any, Boolean])

  /**
 *
 * tap :: (a -> Any) -> a -> a
 *
 * Runs the given function with the supplied object, then returns the object.
 *
 * @returns {Any} returns what the function passed returns.
 *
 */
  const tap = (f) => (a) => (f (a), a);

  /**
   * This is the 'no operation' function. It just returns undefined.
   *
   * @returns {Undefined}
   */
  const noop = () => {};

  /**
   *
   * T :: Boolean b => a -> b
   *
   * Always returns true
   *
   * @returns {Boolean}
   */
  const T = K (true);

  /**
   *
   * F :: Boolean b => a -> b
   *
   * Always returns false
   *
   * @returns {Boolean}
   */
  const F = K (false);

  /**
 * zipObj :: Array -> Array -> Object
 *
 * Creates a new object out of a list of keys and a list of values. Key/value pairing is truncated to the length of the shorter of the two lists.
 *
 * ```
 * zipObj(['a', 'b', 'c'])([1, 2, 3]); //=> {a: 1, b: 2, c: 3}
 * ```
 *
 * @returns {Object}
 */
  const zipObj = (xs) => B (fromPairs) (zip (xs));


  /**
   * pResolve :: a -> Promise
   *
   * It returns a promise that resolves with the given param
   *
   * @returns {Promise}
   */
  const pResolve = (a) => Promise.resolve (a);

  /**
   * pReject :: a -> Promise
   *
   * It returns a promise that rejects with the given param
   *
   * @returns {Promise}
   */
  const pReject = (a) => Promise.reject (a);


  /**
   * map2 :: Functor f => (a -> b) -> f a -> f b
   *
   * Takes a function and a functor with another functor inside, applies the function to each of the deepest functor's values, and returns a functor of the same shape than the top functor.
   *
   * @returns {Functor}
   */
  const map2 = (f) => map(map(f));

  /**
   * map2 :: Functor f => (a -> b) -> f a -> f b
   *
   * Takes a function and a functor with two nested functors inside, applies the function to each of the deepest functor's values, and returns a functor of the same shape than the top functor.
   *
   * @returns {Functor}
   */
  const map3 = (f) => map(map(map(f)));

  const allPassReducer = (candidate) => reduce((acc) => (fn) => acc && fn(candidate))(true);
  const allPassImpl = (candidate) => B(allPassReducer(candidate))(map(defBooleanFn));

  /**
   * allPass :: Any a => Boolean b =>  [(a -> b)] -> (a -> b)
   *
   * Takes a list of predicates and returns a predicate that returns true for a given list of arguments if every one of the provided predicates is satisfied by those arguments. False otherwise.
   *
   * @returns {Boolean}
   */
  const allPass = def('allPass')
  ({})
  ([Array(AnyFunction), Any, Boolean])
  (C(allPassImpl));

  const anyPassReducer = (candidate) => reduce((acc) => (fn) => acc || fn(candidate))(false);
  const anyPassImpl = (candidate) => B(anyPassReducer(candidate))(map(defBooleanFn));

  /**
   * anyPass :: Any a => Boolean b =>  [(a -> b)] -> (a -> b)
   *
   * Takes a list of predicates and returns a predicate that returns true for a given list of arguments if at least one of the provided predicates is satisfied by those arguments. False otherwise.
   *
   * @returns {Boolean}
   */
  const anyPass = def('anyPass')
  ({})
  ([Array(AnyFunction), Any, Boolean])
  (C(anyPassImpl));

  const parallelApImpl = (f) => (g) => (x) => ([f(x), g(x)]);
  /**
   parallelAp :: Function f => Function g => Any a => Array(a)
   *
   * Takes two functions and applies them to the same given value, returning an array of results
   *
   * @returns {Array}
   */
  const parallelAp = def('parallelAp')
  ({})
  ([AnyFunction, AnyFunction, Any, Array(Any)])
  (parallelApImpl);

  const parallelApNImpl = (functions) => (x) => functions.reduce((acc, fn) => [...acc, fn(x)], []);

  /**
   parallelApN :: Array Function => Any a => Array(a)
   *
   * Takes N functions and applies them to the same given value, returning an array of results
   *
   * @returns {Array}
   */
  const parallelApN = def('parallelApN')
  ({})
  ([Array(AnyFunction), Any, Array(Any)])
  (parallelApNImpl);

  const includesImpl = (value) => (list) => list.includes(value);
  /**
   includes :: Any => Array Any => Boolean
   *
   * Takes a value and an array and returns True if the value is contained in the array. False otherwise.
   *
   * @returns {Boolean}
   */
  const includes = def('includes')
  ({})
  ([Any, Array(Any), Boolean])
  (includesImpl);


  const getEqImpl = (predicate) => (name) => (value) => pipe([
    get(predicate)(name)
    , map(equals(value))
    , fromMaybe(false)
  ]);

  /**
   * getEq :: Function => String => Any => Object => Maybe Boolean
   *
   * Returns true if the specified object property is equal, in S.equals terms, to the given value; false otherwise.
   *
   * @returns Boolean
   */
  const getEq = def('getEq')
  ({})
  ([Function([Any, Boolean]), String, Any, Object, Boolean])
  (getEqImpl);


  const findEqImpl = (predicate) => (name) => (value) => find(getEq(predicate)(name)(value));
  /**
   * findEq :: Function Boolean => String => Any => Array Object => Maybe Boolean
   *
   * Takes a predicate, a field name, a value and an object array and returns Just the leftmost object of the array which field equals the desired value; Nothing otherwise.
   *
   * @returns Maybe
   */
  const findEq = def('findEq')
  ({})
  ([Function([Any, Boolean]), String, Any, Array(Object), Maybe(Object)])
  (findEqImpl);


  const pluckImpl = (predicate) => (name) => map(get(predicate)(name));
  /**
   * pluck :: Function Boolean => String => Array Maybe Any
   *
   * Returns a new list by plucking the same named property off all objects in the list supplied.
   *
   * @returns Array
   */
  const pluck = def('pluck')
  ({})
  ([Function([Any, Boolean]), String, Array(Object), Array(Maybe(Any))])
  (pluckImpl)

  return { allPass, anyPass, F, map2, map3, noop, parallelAp, parallelApN, pReject, pResolve, T, tap, zipObj, includes, included: C(includes), getEq, findEq, pluck };
}

