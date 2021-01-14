# convenient-fp-utils *1.0.0*

> module that wraps different fp libraries together and adds some convenient functions


### src/index.js


#### module.exports() 

Convenient FP Utils is a module that wraps different fp libraries together.

**Why not ramda or lodash/fp?**

I like ramda and lodash/fp; they're cool in most situations, but despite they help us to write clean and composable code, this code is not type-safe. Sanctuary allows us to write type-safe code with its functions, and with sanctuary-def we're able to write type-safe functions.






##### Returns


- `object`  all the convenient-fp-utils utilities




### src/utils.js


#### module.exports(dependencies) 

This object offers a curated set of composable functions that we usually use.




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| dependencies | `object`  | object containing the sanctuary (S) dependency. | &nbsp; |




##### Returns


- `object`  utils functions.



#### tap() 

tap :: (a -> Any) -> a -> a

Runs the given function with the supplied object, then returns the object.






##### Returns


- `Any`  returns what the function passed returns.



#### noop() 

This is the 'no operation' function. It just returns undefined.






##### Returns


- `Undefined`  



#### T() 

T :: Boolean b => a -> b

Always returns true






##### Returns


- `Boolean`  



#### F() 

F :: Boolean b => a -> b

Always returns false






##### Returns


- `Boolean`  



#### zipObj() 

zipObj :: Array -> Array -> Object

Creates a new object out of a list of keys and a list of values. Key/value pairing is truncated to the length of the shorter of the two lists.

```
zipObj(['a', 'b', 'c'])([1, 2, 3]); //=> {a: 1, b: 2, c: 3}
```






##### Returns


- `Object`  



#### pResolve() 

pResolve :: a -> Promise

It returns a promise that resolves with the given param






##### Returns


- `Promise`  



#### pReject() 

pReject :: a -> Promise

It returns a promise that rejects with the given param






##### Returns


- `Promise`  



#### map2() 

map2 :: Functor f => (a -> b) -> f a -> f b

Takes a function and a functor with another functor inside, applies the function to each of the deepest functor's values, and returns a functor of the same shape than the top functor.






##### Returns


- `Functor`  



#### map3() 

map2 :: Functor f => (a -> b) -> f a -> f b

Takes a function and a functor with two nested functors inside, applies the function to each of the deepest functor's values, and returns a functor of the same shape than the top functor.






##### Returns


- `Functor`  



#### allPass() 

allPass :: Any a => Boolean b =>  [(a -> b)] -> (a -> b)

Takes a list of predicates and returns a predicate that returns true for a given list of arguments if every one of the provided predicates is satisfied by those arguments. False otherwise.






##### Returns


- `Boolean`  



#### anyPass() 

anyPass :: Any a => Boolean b =>  [(a -> b)] -> (a -> b)

Takes a list of predicates and returns a predicate that returns true for a given list of arguments if at least one of the provided predicates is satisfied by those arguments. False otherwise.






##### Returns


- `Boolean`  



#### parallelAp() 

parallelAp :: Function f => Function g => Any a => Array(a)

Takes two functions and applies them to the same given value, returning an array of results






##### Returns


- `Array`  



#### includes() 

includes :: Any => Array Any => Boolean

Takes a value and an array and returns True if the value is contained in the array. False otherwise.






##### Returns


- `Boolean`  



#### getEq() 

getEq :: Function => String => Any => Object => Maybe Boolean

Returns true if the specified object property is equal, in S.equals terms, to the given value; false otherwise.






##### Returns


-  Boolean



#### findEq() 

findEq :: Function Boolean => String => Any => Array Object => Maybe Boolean

Takes a predicate, a field name, a value and an object array and returns Just the leftmost object of the array which field equals the desired value; Nothing otherwise.






##### Returns


-  Maybe



#### pluck() 

pluck :: Function Boolean => String => Array Maybe Any

Returns a new list by plucking the same named property off all objects in the list supplied.






##### Returns


-  Array




### src/http.js


#### module.exports(dependencies) 

This object offers a curated set of composable functions to make http-requests with fetch API




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| dependencies | `object`  | object containing the fluture and sanctuary (S) dependencies. | &nbsp; |




##### Returns


- `object`  http functions.



#### doGet() 

doGet :: Promise b => a -> b

It makes a GET http request and returns a promise result






##### Returns


- `Promise`  



#### doPost() 

doPost :: Promise c => a -> b -> c

It makes a POST http request with data as body, and returns a promise result






##### Returns


- `Promise`  




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
