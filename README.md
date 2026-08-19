# convenient-fp-utils

Curated set of composable, type-safe utility functions built on top of [Sanctuary](https://sanctuary.js.org/) and [sanctuary-def](https://github.com/sanctuary-js/sanctuary-def).

**Why not Ramda or lodash/fp?** They help write clean composable code, but it's not type-safe. Sanctuary gives us type-safe functions, and sanctuary-def lets us write type-safe functions of our own.

## [Visual Reference](https://eckelon.github.io/convenient-fp-utils/)

Interactive animated diagrams for every function — open it to understand what each one does at a glance.

## Install

```sh
npm install github:eckelon/convenient-fp-utils
```

## Architecture

Single source file: `src/utils.js` (CommonJS). Browser ESM is generated at build time via sed transformation (CJS `require` → `window.*` globals).

## Functions

### Combinators

| Function | Signature | Description |
|----------|-----------|-------------|
| `T` | `a → (a → b) → b` | Thrush — value first, then function |
| `substitution` | `(a → b → c) → (a → b) → a → c` | S combinator — threads `x` to two consumers: `f(x)(g(x))` |
| `delayApply` | `(a → b) → a → (() → b)` | Captures arg in a thunk (for encase) |
| `mergeSingleton` | `String → a → StrMap a → StrMap a` | Build `{k: v}` and concat onto a StrMap |
| `constTrue` | `a → Boolean` | `K(true)` — always true |
| `constFalse` | `a → Boolean` | `K(false)` — always false |

### Maybe

| Function | Signature | Description |
|----------|-----------|-------------|
| `toMaybe` | `(a → Boolean) → a → Maybe a` | Predicate gate: `Just(v)` or `Nothing` |
| `safeGet` | `(a → Boolean) → String → Any → Maybe a` | Total property accessor (never throws) |
| `equalsNonNull` | `a → Any → Boolean` | `S.equals` that doesn't throw on null |
| `firstOf` | `[a] → Maybe a` | `S.head` |
| `secondOf` | `[a] → Maybe a` | Second element via tail + head |

### Guards

Total predicates — never throw, always return `Boolean`.

`isString` · `isBoolean` · `isObject` · `isArrayOf` · `isInt` · `isFiniteNumber` · `isNonNullable` · `isNonEmptyStr` · `isDateStr` · `isIn` · `isInRange` · `record`

### Parse

| Function | Signature | Description |
|----------|-----------|-------------|
| `parseFloatM` | `String → Maybe FiniteNumber` | Total float parser |
| `parseIntM` | `(String, Number, Number) → Maybe Integer` | Range-bounded int parser |

### Collections

| Function | Signature | Description |
|----------|-----------|-------------|
| `allPass` | `[a → Boolean] → a → Boolean` | AND of predicates |
| `anyPass` | `[a → Boolean] → a → Boolean` | OR of predicates |
| `getEq` | `(a → Boolean) → String → Any → Any → Boolean` | Property equality check |
| `findEq` | `(a → Boolean) → String → Any → [Object] → Maybe Object` | Find by property value |
| `pluck` | `(a → Boolean) → String → [Object] → [Maybe a]` | Extract property from array |
| `zipObj` | `[String] → [a] → StrMap a` | Keys + values → object |
| `map2` | `(a → b) → f (f a) → f (f b)` | Map over nested functor |
| `parallelAp` | `(a → b) → (a → c) → a → [b, c]` | Two functions, one value, array of results |

### Effects

| Function | Signature | Description |
|----------|-----------|-------------|
| `tap` | `(a → Any) → a → a` | Side-effect, return unchanged |
| `noop` | `() → undefined` | No-op |
| `encaseStorage` | `(() → a) → Either Error a` | Wrap throwing thunk in Either |
| `readStorage` | `String → () → String\|null` | localStorage getter thunk |
| `writeStorage` | `String → String → Either Error ()` | Total localStorage setter |
| `entriesOf` | `StrMap Any → [[String, Any]]` | Object.entries for heterogeneous StrMaps |
| `rafThrottle` | `Function → Function` | requestAnimationFrame throttle |
| `replaceFirst` | `RegExp → String → String → String` | Curried regex replace |
| `replaceNamed` | `String → String → String → String` | Curried literal replace |

### Sanctuary re-exports

Bare-name re-exports for convenience: `pipe`, `compose`, `map`, `chain`, `reduce`, `filter`, `find`, `fromMaybe`, `maybe`, `either`, `K`, `I`, `flip`, `equals`, `append`, `reject`, `head`, `tail`, `last`, `init`, and more.

## License

MIT
