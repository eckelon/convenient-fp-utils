
'use strict';

const { describe, expect, it } = require('@jest/globals');

const {
  sanctuary: { add, compose: B, equals, fromMaybe, gt, is, Just, Nothing, pipe, size, splitOn }
  , sanctuaryDef: { Array, Number, String }
  , utils: { allPass, anyPass, F, findEq, getEq, included, includes, map2, map3, noop, parallelAp, parallelApN, pluck, pReject, pResolve, T, tap, zipObj }
} = require('.');

const getStringLength = B(size)(splitOn(''));

describe('utils tests', () => {

  it('returns undefined when using the noop function', () => expect(noop()).toBeUndefined());

  it('resolves a value', () => expect(pResolve('value')).resolves.toBe('value'));

  it('rejects a value', () => expect(pReject('value')).rejects.toMatch('value'));

  it('always return true', () => expect(T('value')).toBe(true));

  it('always return false', () => expect(F('value')).toBe(false));

  it('taps a function', () => {
    let a = 0;
    const funfun = tap((x) => (a = a + x));
    expect(funfun(3)).toBe(3);
    expect(a).toBe(3);
  });

  it('applies zipObj successfully', () =>
    expect(zipObj(['a', 'b', 'c'])([1, 2, 3]))
      .toMatchObject({ a: 1, b: 2, c: 3 }));

  it('maps functor with map2', () => {
    const functor = Just(Just(3));
    const getValue = B(fromMaybe(-1))(fromMaybe(Nothing));
    expect(B(getValue)(map2(add(1)))(functor)).toBe(4);
  });

  it('maps functor with map3', () => {
    const functor = Just(Just(Just(3)));
    const getValue = pipe([
      fromMaybe(Nothing)
      , fromMaybe(Nothing)
      , fromMaybe(-1)
    ]);
    expect(B(getValue)(map3(add(1)))(functor)).toBe(4);
  });

  it('checks if a list includes a value, returning true', () => expect(includes(3)([1, 2, 3])).toBe(true));
  it('checks if a list includes a value, returning false', () => expect(includes('Bob')(['Alice', 'Mindy'])).toBe(false));

  it('checks if a value is included in a a list, returning true', () => expect(included([1, 2, 3])(3)).toBe(true));
  it('checks if a value is included in a a list, returning false', () => expect(included([1, 2, 3])(3)).toBe(true));

  it('plucks a new list with the same named properties of the given object, if they satisfy the predicate',
    () => expect(pluck(is(Number))('age')([{ age: 33 }, { age: 44 }, { age: 55 }])).toEqual([Just(33), Just(44), Just(55)]));

  describe('allPass tests', () => {
    it('confirms all functions are true', () => {
      expect(allPass([
        equals('foo')
        , B(gt(0))(getStringLength)
      ])('foo')).toBe(true);
    });

    it('confirms not all functions are true', () => {
      expect(allPass([
        equals('foo')
        , equals('bar')
      ])('foo')).toBe(false);
    });

    it('fails due to one of the functions not returning boolean', () => {
      const toBeTested = () => allPass([() => {}])('foo');
      expect(toBeTested).toThrowError(TypeError);
      expect(toBeTested).toThrowError(/The value at position 1 is not a member of ‘Boolean’/);
    });
  });

  describe('anyPass tests', () => {
    it('confirms that at least on function is true', () => {
      expect(anyPass([
        equals('foo')
        , equals('bar')
      ])('foo')).toBe(true);
    });

    it('confirms all functions are false', () => {
      expect(anyPass([
        equals('bar')
        , equals('baz')
      ])('foo')).toBe(false);
    });

    it('fails due to one of the functions not returning boolean', () => {
      const toBeTested = () => anyPass([() => {}])('foo');
      expect(toBeTested).toThrowError(TypeError);
      expect(toBeTested).toThrowError(/The value at position 1 is not a member of ‘Boolean’/);
    });

    it('it parallel applies two functions to same value', () =>
      expect(parallelAp(add(1))(add(2))(1)).toStrictEqual([2, 3]));

    it('fails due to one of the functions is not a function', () =>
      expect(() => parallelAp('Not a function')(add(2))(1)).toThrowError(/The value at position 1 is not a member of ‘Function’/));

    it('it parallel applies N functions to same value', () =>
      expect(parallelApN([add(1), add(2)])(1)).toStrictEqual([2, 3]));

    it('fails due to one of the functions is not a function', () =>
      expect(() => parallelApN(['Not a function', add(2)])(1)).toThrowError(/The value at position 1 is not a member of ‘Function’/));
  });

  describe('getEq tests', () => {

    it('returns true when field is an equal String',
      () => expect(getEq(is(String))('name')('Mindy')({ name: 'Mindy' })).toBe(true));

    it('returns true when field is an equal Number',
      () => expect(getEq(is(Number))('index')(14)({ index: 14 })).toBe(true));

    it('returns false when field is not an equal String',
      () => expect(getEq(is(String))('name')('Mindy')({ name: 'Alice' })).toBe(false));

    it('returns false when field is not an equal Number',
      () => expect(getEq(is(Number))('index')(14)({ index: 74 })).toBe(false));

    it('returns false when field is an equal String since predicate was expecting an Array of String',
      () => expect(getEq(is(Array(String)))('name')('Mindy')({ name: 'Mindy' })).toBe(false));
  });

  describe('findEq tests', () => {

    it('returns a Maybe containing the object whose name equals to the desired String',
      () => expect(findEq(is(String))('name')('Mindy')
      ([{ name: 'Alice' }, { name: 'Mindy' }]))
        .toEqual(Just({ name: 'Mindy' })));

    it('returns a Maybe containing Nothing since no object found whose name equals to the desired String',
      () => expect(findEq(is(String))('name')('Bob')
      ([{ name: 'Alice' }, { name: 'Mindy' }]))
        .toEqual(Nothing));

    it('returns a Maybe containing the object whose index equals to the desired Number',
      () => expect(findEq(is(Number))('index')(14)
      ([{ index: 14 }, { index: 74 }]))
        .toEqual(Just({ index: 14 })));

    it('returns a Maybe containing Nothing since no object found whose index equals to the desired Number',
      () => expect(findEq(is(Number))('index')(1)
      ([{ index: 14 }, { index: 74 }]))
        .toEqual(Nothing));

    it('returns a Maybe containing Nothing since the predicate function does not match the desired value',
      () => expect(findEq(is(String))('index')(14)
      ([{ index: 14 }, { index: 74 }]))
        .toEqual(Nothing));

  });
});
