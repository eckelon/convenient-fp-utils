'use strict';
const S = require('sanctuary');
const $ = require('sanctuary-def');

// ---- def factory ----
const def = $.create({ checkTypes: true, env: $.env });

// ---- type reps ----
const NumberRep = $.Number;
const StringRep = $.String;
const BooleanRep = $.Boolean;
const ObjectRep = $.Object;
const ArrayRep = $.Array($.Any);
const DateRep = $.Date;
const NullRep = $.Null;
const UndefinedRep = $.Undefined;

// ---- combinators ----

/**
 *
 * T :: a -> (a -> b) -> b
 *
 * Thrush combinator: value FIRST, then the function. Flip of application.
 * Same as sanctuary's S.T.
 *
 * @returns {Any}
 *
 */
const T = S.T;

/**
 *
 * substitution :: (a -> b -> c) -> (a -> b) -> a -> c
 *
 * Substitution combinator: threads one value to two consumers — f(x)(g(x)).
 *
 * @returns {Any}
 *
 */
const substitution = (f) => (g) => (x) => f(x)(g(x));

/**
 * apply :: a -> (a -> b) -> b
 *
 * Flip of identity application. S.flip(S.I).
 *
 * @returns {Any}
 */
const apply = S.flip(S.I);

/**
 * delayApply :: (a -> b) -> a -> (() -> b)
 *
 * Returns a thunk that captures x — retards evaluation so
 * exceptions land INSIDE an encase.
 *
 * @returns {Function}
 */
const delayApply = (f) => (x) => () => f(x);

/**
 *
 * mergeSingleton :: String -> a -> StrMap a -> StrMap a
 *
 * StrMap builder: creates a singleton {key: val} and returns a function that
 * concats it onto an existing StrMap. Point-free: compose(compose(concat))(singleton).
 *
 * @returns {Function}
 *
 */
const mergeSingleton = S.compose(S.compose(S.concat))(S.singleton);

/**
 *
 * constTrue :: a -> Boolean
 *
 * Always returns true
 *
 * @returns {Boolean}
 */
const constTrue = S.K(true);

/**
 *
 * constFalse :: a -> Boolean
 *
 * Always returns false
 *
 * @returns {Boolean}
 */
const constFalse = S.K(false);

// ---- toMaybe ----

/**
 *
 * toMaybe :: (a -> Boolean) -> a -> Maybe a
 *
 * Predicate gate: Just(v) when pred(v) is truthy, Nothing otherwise.
 * Uses a ternary, NOT ifElse — predicates that return truthy non-Boolean
 * values would throw with ifElse.
 *
 * @returns {Maybe}
 *
 */
const toMaybe = def('toMaybe')({})([$.AnyFunction, $.Any, $.Maybe($.Any)])((pred) => (v) => (pred(v) ? S.Just(v) : S.Nothing));

// ---- ValidDate ----

/**
 * isValidDate :: Date -> Boolean
 *
 * sanctuary-def's $.Date accepts Invalid Dates (instanceof Date); this enforces validity.
 *
 * @returns {Boolean}
 */
const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());
const ValidDate = $.NullaryType('ValidDate')('https://sanctuary.js.org/#parseDate')([])(isValidDate);

// ---- guards (total predicates; never throw) ----

/**
 * isString :: Any -> Boolean
 *
 * @returns {Boolean}
 */
const isString = def('isString')({})([$.Any, $.Boolean])(S.is(StringRep));

/**
 * isBoolean :: Any -> Boolean
 *
 * @returns {Boolean}
 */
const isBoolean = def('isBoolean')({})([$.Any, $.Boolean])(S.is(BooleanRep));

/**
 * isObject :: Any -> Boolean
 *
 * @returns {Boolean}
 */
const isObject = def('isObject')({})([$.Any, $.Boolean])(S.is(ObjectRep));

/**
 * isArrayOf :: (a -> Boolean) -> Any -> Boolean
 *
 * Checks if the value is an array where every element satisfies the predicate.
 * .every stays — S.all throws on heterogeneous arrays.
 *
 * @returns {Boolean}
 */
const isArrayOf = def('isArrayOf')({})([$.AnyFunction, $.Any, $.Boolean])((g) =>
	S.compose(S.maybe(false)((arr) => arr.every((x) => g(x))))(toMaybe(S.is(ArrayRep))));

/**
 * isInt :: Any -> Boolean
 *
 * @returns {Boolean}
 */
const isInt = def('isInt')({})([$.Any, $.Boolean])(Number.isInteger);

/**
 * isFiniteNumber :: Any -> Boolean
 *
 * @returns {Boolean}
 */
const isFiniteNumber = def('isFiniteNumber')({})([$.Any, $.Boolean])(
	substitution(S.compose(S.and)(S.is(NumberRep)))(Number.isFinite));

/**
 * isNonNullable :: Any -> Boolean
 *
 * @returns {Boolean}
 */
const isNonNullable = def('isNonNullable')({})([$.Any, $.Boolean])(
	substitution(S.compose(S.and)(S.compose(S.not)(S.is(NullRep))))(S.compose(S.not)(S.is(UndefinedRep))));

/**
 * isNonEmptyStr :: Any -> Boolean
 *
 * @returns {Boolean}
 */
const isNonEmptyStr = def('isNonEmptyStr')({})([$.Any, $.Boolean])(
	S.ifElse(isString)(S.compose(S.gt(0))(S.compose(S.size)(S.splitOn(''))))(S.K(false)));

// roundTrip: S.parseDate normalizes impossible dates (2026-02-30 -> 2026-03-02); ISO must match input.
const roundTrip = (s) =>
	S.maybe(false)((d) => d.toISOString().slice(0, 10) === s)(S.parseDate(s));

/**
 * isDateStr :: Any -> Boolean
 *
 * Validates YYYY-MM-DD date strings with round-trip check.
 *
 * @returns {Boolean}
 */
const isDateStr = def('isDateStr')({})([$.Any, $.Boolean])(
	S.compose(S.maybe(false)(substitution(S.compose(S.and)(S.test(/^\d{4}-\d{2}-\d{2}$/)))(roundTrip)))(toMaybe(isString)));

/**
 * isIn :: Array Any -> Any -> Boolean
 *
 * @returns {Boolean}
 */
const isIn = def('isIn')({})([$.Array($.Any), $.Any, $.Boolean])(S.flip(S.elem));

/**
 * replaceFirst :: RegExp -> String -> String -> String
 *
 * @returns {String}
 */
const replaceFirst = def('replaceFirst')({})([$.RegExp, $.String, $.String, $.String])((rx) => (a) => (s) => s.replace(rx, a));

/**
 * replaceNamed :: String -> String -> String -> String
 *
 * @returns {String}
 */
const replaceNamed = def('replaceNamed')({})([$.String, $.String, $.String, $.String])((name) => (value) => (text) => text.replace(name, value));

/**
 * isInRange :: FiniteNumber -> FiniteNumber -> Any -> Boolean
 *
 * @returns {Boolean}
 */
const isInRange = def('isInRange')({})([$.FiniteNumber, $.FiniteNumber, $.Any, $.Boolean])((min) => (max) =>
	substitution(S.compose(S.and)(isFiniteNumber))(substitution(S.compose(S.and)(S.gte(min)))(S.lte(max))));

/**
 * record :: StrMap (a -> Boolean) -> Any -> Boolean
 *
 * Shape guard: returns true when every key's predicate passes on the object.
 * Total — never throws on non-objects.
 *
 * @returns {Boolean}
 */
const record = def('record')({})([$.StrMap($.AnyFunction), $.Any, $.Boolean])((shape) => (v) =>
	S.maybe(false)((obj) =>
		S.all((p) => S.snd(p)(obj[S.fst(p)]))(S.pairs(shape)))(toMaybe(isObject)(v)));

// ---- Maybe helpers ----

/**
 * equalsNonNull :: a -> Any -> Boolean
 *
 * S.equals throws on null/undefined (not Setoid); gates non-nullable first.
 *
 * @returns {Boolean}
 */
const equalsNonNull = (x) => S.ifElse(isNonNullable)(S.equals(x))(S.K(false));

/**
 * safeGet :: (a -> Boolean) -> String -> Any -> Maybe a
 *
 * Total accessor: null/undefined/missing key -> Nothing (never throws).
 *
 * @returns {Maybe}
 */
const safeGet = def('safeGet')({})([$.AnyFunction, $.String, $.Any, $.Maybe($.Any)])((pred) => (key) => (obj) =>
	isObject(obj) && pred(obj[key]) ? S.Just(obj[key]) : S.Nothing);

// ---- array element accessors ----
// S.nth does not exist in v3.1.0; head/tail composition instead.
const firstOf = S.head;
const secondOf = S.compose(S.chain(S.head))(S.tail);

// ---- parse helpers (total: raw string -> Maybe number) ----

/**
 * parseFloatM :: String -> Maybe FiniteNumber
 *
 * @returns {Maybe}
 */
const parseFloatFinite = S.compose(toMaybe(isFiniteNumber))(Number.parseFloat);
const parseFloatM = def('parseFloatM')({})([$.String, $.Maybe($.FiniteNumber)])(
	S.compose(S.chain(parseFloatFinite))(toMaybe(isNonEmptyStr)));

/**
 * parseIntM :: (String, Number, Number) -> Maybe Integer
 *
 * Stays plain (not def'd) — its curried def form breaks multi-arg callers.
 *
 * @returns {Maybe}
 */
const parseIntM = (raw, min, max) =>
	S.chain((s) => toMaybe((v) => isInt(v) && v >= min && v <= max)(Number.parseInt(s, 10)))(toMaybe(isNonEmptyStr)(raw));

// ---- storage helpers ----

/**
 * encaseStorage :: Function -> Either Any Any
 *
 * @returns {Either}
 */
const encaseStorage = def('encaseStorage')({})([$.AnyFunction, $.Either($.Any)($.Any)])(S.flip(S.encase)(null));
const readStorage = (key) => () => localStorage.getItem(key);
const writeStorage = (key) => (value) => S.encase(() => localStorage.setItem(key, value))(null);

// ---- heterogeneous StrMap iterator ----

/**
 * entriesOf :: StrMap Any -> Array (Array Any)
 *
 * The ONLY iterator for heterogeneous StrMaps (sanctuary folds throw on heterogeneous values).
 *
 * @returns {Array}
 */
const entriesOf = def('entriesOf')({})([$.StrMap($.Any), $.Array($.Array($.Any))])(Object.entries);

// ---- rAF throttle ----

/**
 * rafThrottle :: Function -> Function
 *
 * rAF id bookkeeping — the single mutable let lives inside this closure.
 *
 * @returns {Function}
 */
const rafThrottle = (fn) => {
	let id = 0;
	return (...args) => {
		if (!id) id = requestAnimationFrame(() => { id = 0; fn(...args); });
	};
};

// ---- utility ports ----
const defBooleanFn = def('booleanFunc')({})([$.Any, $.Boolean]);
const allPassReducer = (candidate) => S.reduce((acc) => (fn) => acc && fn(candidate))(true);
const allPassImpl = (candidate) => S.compose(allPassReducer(candidate))(S.map(defBooleanFn));

/**
 * allPass :: Array (a -> Boolean) -> a -> Boolean
 *
 * Takes a list of predicates and returns a predicate that returns true for a given list of arguments if every one of the provided predicates is satisfied by those arguments. False otherwise.
 *
 * @returns {Boolean}
 */
const allPass = def('allPass')({})([$.Array($.AnyFunction), $.Any, $.Boolean])(S.flip(allPassImpl));

const anyPassReducer = (candidate) => S.reduce((acc) => (fn) => acc || fn(candidate))(false);
const anyPassImpl = (candidate) => S.compose(anyPassReducer(candidate))(S.map(defBooleanFn));

/**
 * anyPass :: Array (a -> Boolean) -> a -> Boolean
 *
 * Takes a list of predicates and returns a predicate that returns true for a given list of arguments if at least one of the provided predicates is satisfied by those arguments. False otherwise.
 *
 * @returns {Boolean}
 */
const anyPass = def('anyPass')({})([$.Array($.AnyFunction), $.Any, $.Boolean])(S.flip(anyPassImpl));

/**
 * getEq :: (a -> Boolean) -> String -> Any -> Any -> Boolean
 *
 * Returns true if the specified object property is equal, in S.equals terms, to the given value; false otherwise.
 *
 * @returns {Boolean}
 */
const getEq = def('getEq')({})([$.AnyFunction, $.String, $.Any, $.Any, $.Boolean])(
	(pred) => (name) => (value) => (obj) =>
		S.fromMaybe(false)(S.map(S.equals(value))(safeGet(pred)(name)(obj))));

/**
 * findEq :: (a -> Boolean) -> String -> Any -> Array Object -> Maybe Object
 *
 * Takes a predicate, a field name, a value and an object array and returns Just the leftmost object of the array which field equals the desired value; Nothing otherwise.
 *
 * @returns {Maybe}
 */
const findEq = def('findEq')({})([$.AnyFunction, $.String, $.Any, $.Array($.Object), $.Maybe($.Object)])(
	(pred) => (name) => (value) => S.find(getEq(pred)(name)(value)));

/**
 * pluck :: (a -> Boolean) -> String -> Array Object -> Array (Maybe Any)
 *
 * Returns a new list by plucking the same named property off all objects in the list supplied.
 *
 * @returns {Array}
 */
const pluck = def('pluck')({})([$.AnyFunction, $.String, $.Array($.Object), $.Array($.Maybe($.Any))])(
	(pred) => (name) => S.map(S.gets(pred)([name])));

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
const zipObj = (xs) => S.compose(S.fromPairs)(S.zip(xs));

/**
 * map2 :: Functor f => (a -> b) -> f (f a) -> f (f b)
 *
 * Maps over a nested functor (two levels deep).
 *
 * @returns {Functor}
 */
const map2 = (f) => S.map(S.map(f));

/**
 * parallelAp :: (a -> b) -> (a -> c) -> a -> Array
 *
 * Takes two functions and applies them to the same given value, returning an array of results.
 *
 * @returns {Array}
 */
const parallelAp = def('parallelAp')({})([$.AnyFunction, $.AnyFunction, $.Any, $.Array($.Any)])(
	(f) => (g) => (x) => [f(x), g(x)]);

/**
 *
 * tap :: (a -> Any) -> a -> a
 *
 * Runs the given function with the supplied object, then returns the object.
 *
 * @returns {Any} returns what the function passed returns.
 *
 */
const tap = (f) => (a) => (f(a), a);

/**
 * consoleWarning :: String -> a -> a
 *
 * Logs a warning and returns the value unchanged.
 *
 * @returns {Any}
 */
const consoleWarning = (msg) => tap(() => console.warn(msg));

/**
 * This is the 'no operation' function. It just returns undefined.
 *
 * @returns {Undefined}
 */
const noop = () => {};

// ---- Sanctuary bare-name re-exports ----
const pipe = S.pipe;
const fromMaybe = S.fromMaybe;
const isNothing = S.isNothing;
const maybeToEither = S.maybeToEither;
const either = S.either;
const maybe = S.maybe;
const map = S.map;
const find = S.find;
const justs = S.justs;
const isJust = S.isJust;
const gets = S.gets;
const chain = S.chain;
const maybeToNullable = S.maybeToNullable;
const parseJson = S.parseJson;
const fromEither = S.fromEither;
const encase = S.encase;
const reduce = S.reduce;
const compose = S.compose;
const filter = S.filter;
const any = S.any;
const all = S.all;
const elem = S.elem;
const test = S.test;
const equals = S.equals;
const size = S.size;
const trim = S.trim;
const splitOn = S.splitOn;
const joinWith = S.joinWith;
const append = S.append;
const reject = S.reject;
const insert = S.insert;
const fromPairs = S.fromPairs;
const head = S.head;
const tail = S.tail;
const last = S.last;
const init = S.init;
const flip = S.flip;
const K = S.K;
const I = S.I;
const not = S.not;
const and = S.and;
const or = S.or;
const ifElse = S.ifElse;
const matchAll = S.matchAll;
const maybe_ = S.maybe_;
const singleton = S.singleton;
const snd = S.snd;
const Pair = S.Pair;
const fst = S.fst;
const parseDate = S.parseDate;
const concat = S.concat;

module.exports = {
	$, S, def,
	NumberRep, StringRep, BooleanRep, ObjectRep, ArrayRep, DateRep, NullRep, UndefinedRep,
	T, substitution, apply, delayApply, mergeSingleton, constTrue, constFalse,
	toMaybe, ValidDate, isValidDate,
	isString, isBoolean, isObject, isArrayOf, isInt, isFiniteNumber, isNonNullable, isNonEmptyStr,
	isDateStr, isIn, isInRange, record, replaceFirst, replaceNamed,
	equalsNonNull, safeGet, firstOf, secondOf,
	parseFloatM, parseIntM, encaseStorage, readStorage, writeStorage,
	entriesOf, rafThrottle,
	allPass, anyPass, getEq, findEq, pluck, zipObj, map2, parallelAp,
	tap, consoleWarning, noop,
	pipe, fromMaybe, isNothing, maybeToEither, either, maybe,
	map, find, justs, isJust, gets, chain, maybeToNullable,
	parseJson, fromEither, encase, reduce, compose, filter,
	any, all, elem, test, equals, size, trim,
	splitOn, joinWith, append, reject, insert, fromPairs,
	head, tail, last, init, flip, K, I, not, and, or,
	ifElse, matchAll, maybe_, singleton, snd, Pair, fst, parseDate, concat,
};
