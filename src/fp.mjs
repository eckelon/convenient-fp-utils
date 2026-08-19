// fp.mjs — browser ESM for the FP layer.
// Standard ESM imports; consumers' vendor scripts replace these with globals.
import S from "sanctuary";
import $ from "sanctuary-def";

// ---- type reps ----
export const NumberRep = $.Number;
export const StringRep = $.String;
export const BooleanRep = $.Boolean;
export const ObjectRep = $.Object;
// $.Array is a type constructor (Type -> Type); applied once here.
export const ArrayRep = $.Array($.Any);
export const DateRep = $.Date;
export const NullRep = $.Null;
export const UndefinedRep = $.Undefined;

// ---- def factory ----
export const def = $.create({ checkTypes: true, env: $.env });
export { $ };

// ---- combinators (HOISTED before guards — TDZ: guards reference these at module-eval time) ----
export const T = S.T; // thrush: value FIRST, then fn
export { T as thrush };
export const substitution = (f) => (g) => (x) => f(x)(g(x));
export const apply = S.flip(S.I);
export const delayApply = (f) => (x) => () => f(x); // retards a call so exceptions land inside encase/encaseStorage

// ---- toMaybe (HOISTED before guards — guards reference at module-eval time) ----
// ternary, NOT ifElse — ifElse executes plain predicates and requires pure Boolean;
// predicates that return truthy non-Boolean values would throw.
export const toMaybe = def("toMaybe")({})([$.AnyFunction, $.Any, $.Maybe($.Any)])((pred) => (v) => (pred(v) ? S.Just(v) : S.Nothing));

// ---- ValidDate ----
// sanctuary-def's $.Date accepts Invalid Dates (instanceof Date); this enforces validity.
export const isValidDate = (d) => d instanceof Date && !Number.isNaN(d.getTime());
export const ValidDate = $.NullaryType("ValidDate")("https://sanctuary.js.org/#parseDate")([])(isValidDate);

// ---- guards (total predicates; never throw) ----
export const isString = def("isString")({})([$.Any, $.Boolean])(S.is(StringRep));
export const isBoolean = def("isBoolean")({})([$.Any, $.Boolean])(S.is(BooleanRep));
export const isObject = def("isObject")({})([$.Any, $.Boolean])(S.is(ObjectRep));
export const isArrayOf = def("isArrayOf")({})([$.AnyFunction, $.Any, $.Boolean])((g) =>
	S.compose(S.maybe(false)((arr) => arr.every((x) => g(x))))(toMaybe(S.is(ArrayRep))),
);
// .every stays — S.all throws on heterogeneous arrays; isArrayOf's contract is heterogeneous input -> false
export const isInt = def("isInt")({})([$.Any, $.Boolean])(Number.isInteger);
export const isFiniteNumber = def("isFiniteNumber")({})([$.Any, $.Boolean])(
	substitution(S.compose(S.and)(S.is(NumberRep)))(Number.isFinite));
export const isNonNullable = def("isNonNullable")({})([$.Any, $.Boolean])(
	substitution(S.compose(S.and)(S.compose(S.not)(S.is(NullRep))))(S.compose(S.not)(S.is(UndefinedRep))));
export const isNonEmptyStr = def("isNonEmptyStr")({})([$.Any, $.Boolean])(
	S.ifElse(isString)(S.compose(S.gt(0))(S.compose(S.size)(S.splitOn(""))))(S.K(false)));
// roundTrip: S.parseDate normalizes impossible dates (2026-02-30 -> 2026-03-02); ISO must match input.
const roundTrip = (s) =>
	S.maybe(false)((d) => d.toISOString().slice(0, 10) === s)(S.parseDate(s));
export const isDateStr = def("isDateStr")({})([$.Any, $.Boolean])(
	S.compose(S.maybe(false)(substitution(S.compose(S.and)(S.test(/^\d{4}-\d{2}-\d{2}$/)))(roundTrip)))(toMaybe(isString)),
);
export const isIn = def("isIn")({})([$.Array($.Any), $.Any, $.Boolean])(S.flip(S.elem));
export const replaceFirst = def("replaceFirst")({})([$.RegExp, $.String, $.String, $.String])((rx) => (a) => (s) => s.replace(rx, a));
export const replaceNamed = def("replaceNamed")({})([$.String, $.String, $.String, $.String])((name) => (value) => (text) => text.replace(name, value));
export const isInRange = def("isInRange")({})([$.FiniteNumber, $.FiniteNumber, $.Any, $.Boolean])((min) => (max) =>
	substitution(S.compose(S.and)(isFiniteNumber))(substitution(S.compose(S.and)(S.gte(min)))(S.lte(max))));
export const record = def("record")({})([$.StrMap($.AnyFunction), $.Any, $.Boolean])((shape) => (v) =>
	S.maybe(false)((obj) =>
		S.all((p) => S.snd(p)(obj[S.fst(p)]))(S.pairs(shape)),
	)(toMaybe(isObject)(v)),
);

// ---- Maybe helpers ----
// equalsNonNull: S.equals throws on null/undefined (not Setoid); gates non-nullable first.
export const equalsNonNull = (x) => S.ifElse(isNonNullable)(S.equals(x))(S.K(false));
export const safeGet = def("safeGet")({})([$.AnyFunction, $.String, $.Any, $.Maybe($.Any)])((pred) => (key) => (obj) =>
	isObject(obj) && pred(obj[key]) ? S.Just(obj[key]) : S.Nothing);

// ---- array element accessors ----
// S.nth does not exist in v3.1.0; head/tail composition instead.
export const firstOf = S.head;
export const secondOf = S.compose(S.chain(S.head))(S.tail);

// ---- parse helpers (total: raw string -> Maybe number) ----
const parseFloatFinite = S.compose(toMaybe(isFiniteNumber))(Number.parseFloat);
export const parseFloatM = def("parseFloatM")({})([$.String, $.Maybe($.FiniteNumber)])(
	S.compose(S.chain(parseFloatFinite))(toMaybe(isNonEmptyStr)));
// stays plain (not def'd) — its curried def form breaks multi-arg callers.
export const parseIntM = (raw, min, max) =>
	S.chain(
		(s) =>
			toMaybe((v) => isInt(v) && v >= min && v <= max)(Number.parseInt(s, 10)),
	)(toMaybe(isNonEmptyStr)(raw));

export const encaseStorage = def("encaseStorage")({})([$.AnyFunction, $.Either($.Any)($.Any)])(S.flip(S.encase)(null));

export const readStorage = (key) => () => localStorage.getItem(key);
export const writeStorage = (key) => (value) =>
	S.encase(() => localStorage.setItem(key, value))(null);

// the ONLY iterator for heterogeneous StrMaps (sanctuary folds throw on heterogeneous values).
export const entriesOf = def("entriesOf")({})([$.StrMap($.Any), $.Array($.Array($.Any))])(Object.entries);

// rAF id bookkeeping — the single mutable let lives inside this closure
export const rafThrottle = (fn) => {
	let id = 0;
	return (...args) => {
		if (!id) id = requestAnimationFrame(() => { id = 0; fn(...args); });
	};
};

// ---- Sanctuary bare-name re-exports ----
export const pipe = S.pipe;
export const fromMaybe = S.fromMaybe;
export const isNothing = S.isNothing;
export const maybeToEither = S.maybeToEither;
export const either = S.either;
export const maybe = S.maybe;
export const map = S.map;
export const find = S.find;
export const justs = S.justs;
export const isJust = S.isJust;
export const gets = S.gets;
export const chain = S.chain;
export const maybeToNullable = S.maybeToNullable;
export const parseJson = S.parseJson;
export const fromEither = S.fromEither;
export const encase = S.encase;
export const reduce = S.reduce;
export const compose = S.compose;
export const filter = S.filter;
export const any = S.any;
export const all = S.all;
export const elem = S.elem;
export const test = S.test;
export const equals = S.equals;
export const size = S.size;
export const trim = S.trim;
export const splitOn = S.splitOn;
export const joinWith = S.joinWith;
export const append = S.append;
export const reject = S.reject;
export const insert = S.insert;
export const fromPairs = S.fromPairs;
export const head = S.head;
export const tail = S.tail;
export const last = S.last;
export const init = S.init;
export const flip = S.flip;
export const K = S.K;
export const I = S.I;
export const not = S.not;
export const and = S.and;
export const or = S.or;
export const ifElse = S.ifElse;
export const matchAll = S.matchAll;
export const maybe_ = S.maybe_;
export const singleton = S.singleton;
export const snd = S.snd;
export const Pair = S.Pair;
export const fst = S.fst;
export const parseDate = S.parseDate;
export const concat = S.concat;

export const mergeSingleton = S.compose(S.compose(S.concat))(S.singleton);

// ---- utility ports ----
// defBooleanFn normalizes predicates to Any -> Boolean (truthy results become real Booleans).
const defBooleanFn = def("booleanFunc")({})([$.Any, $.Boolean]);
const allPassReducer = (candidate) => reduce((acc) => (fn) => acc && fn(candidate))(true);
const allPassImpl = (candidate) => compose(allPassReducer(candidate))(map(defBooleanFn));
export const allPass = def("allPass")({})([$.Array($.AnyFunction), $.Any, $.Boolean])(S.flip(allPassImpl));
const anyPassReducer = (candidate) => reduce((acc) => (fn) => acc || fn(candidate))(false);
const anyPassImpl = (candidate) => compose(anyPassReducer(candidate))(map(defBooleanFn));
export const anyPass = def("anyPass")({})([$.Array($.AnyFunction), $.Any, $.Boolean])(S.flip(anyPassImpl));
export const getEq = def("getEq")({})([$.AnyFunction, $.String, $.Any, $.Any, $.Boolean])(
	(pred) => (name) => (value) => (obj) =>
		fromMaybe(false)(map(equals(value))(safeGet(pred)(name)(obj))),
);
export const findEq = def("findEq")({})([$.AnyFunction, $.String, $.Any, $.Array($.Object), $.Maybe($.Object)])(
	(pred) => (name) => (value) => find(getEq(pred)(name)(value)),
);
export const pluck = def("pluck")({})([$.AnyFunction, $.String, $.Array($.Object), $.Array($.Maybe($.Any))])(
	(pred) => (name) => map(S.gets(pred)([name])),
);
export const zipObj = (xs) => compose(fromPairs)(S.zip(xs));
export const map2 = (f) => map(map(f));
export const parallelAp = def("parallelAp")({})([$.AnyFunction, $.AnyFunction, $.Any, $.Array($.Any)])(
	(f) => (g) => (x) => [f(x), g(x)],
);
export const tap = (f) => (a) => (f(a), a);
export const consoleWarning = (msg) => tap(() => console.warn(msg));
export const constTrue = S.K(true);
export const constFalse = S.K(false);

// ---- Sanctuary namespace (backward compat: consumers use S.is(...), S.chain(...), etc.) ----
export { S };
