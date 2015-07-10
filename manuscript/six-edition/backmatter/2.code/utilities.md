## Utility Functions

Throughout this book, we have used utility functions in our code snippets and examples. Here is a list of functions we've borrowed from other sources. Most are from [underscore][underscore] or [allong.es][allong.es].

    var allong = require('allong.es');
    var _ = require('underscore');

### extend

`extend` can be found in the [underscore][underscore] library:

    var extend = _.extend;

Or you can use this formulation:

<<(js/extend.js)

[underscore]: http://underscorejs.org
[allong.es]: http://allong.es
[ja]: https://leanpub.com/javascriptallongesix

### pipeline

`pipeline` composes functions in the order they are applied:

    var pipeline = allong.es.pipeline;

    function square (n) { return n * n; }
    function increment (n) { return n + 1; }

    pipeline(square, increment)(6)
      //=> 37

### tap

`tap` passes a value to a function, discards the result, and returns the original value:

    var tap = allong.es.tap;

    tap(6, function (n) {
      console.log("Hello there, " + n);
    });
      //=>
        Hello there, 6
        6

### map

`map` applies function to an array, returning an array of the results:

    var map = allong.es.map;

    map([1, 2, 3], function (n) {
      return n * n;
    });
      //=> [1, 4, 9]

### variadic

`variadic` takes a function and returns a "variadic" function, one that collects arguments in an array and passes them to the last parameter:

    var variadic = allong.es.variadic;

    var a = variadic(function (args) {
      return { args: args };
    });

    a(1, 2, 3, 4, 5)
      //=> { args: [1, 2, 3, 4, 5] }

    var b = variadic(function (first, second, rest) {
      return { first: first, second: second, rest: rest };
    });

    b(1, 2, 3, 4, 5)
      //=> { first: 1, second: 2, rest: [3, 4, 5] }

### unvariadic

`unvariadic` takes a variadic function and turns it into a function with a fixed arity:

    var unvariadic = allong.es.unvariadic;

    function ensuresArgumentsAreNumbers (fn) {
      return unvariadic(fn.length, function () {
        for (var i in arguments) {
          if (typeof(arguments[i]) !== 'number') {
            throw "Ow! NaN!!"
          }
        }
        return fn.apply(this, arguments);
      });
    }

    function myAdd (a, b) {
      return a + b;
    }

    var myCheckedAdd = ensuresArgumentsAreNumbers(myAdd);

    myCheckedAdd.length
      //=> 2
