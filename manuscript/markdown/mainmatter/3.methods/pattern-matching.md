## Pattern Matching

Meta-methods are often associated with an abstraction for handling messages. In the "aspect-oriented programming" abstraction, methods can be provided with advice that runs before or after the method's body.

There are other abstractions. One of them is "pattern matching." In languages like Haskell, you can define multiple versions of a function's body, each associated with a particular pattern of input, for example:

    factorial :: (Integral a) => a -> a
    factorial 0 = 1
    factorial n = n * factorial (n - 1)

This says that if the input to `factorial` matches the pattern `0`, return 1. Otherwise, return factorial (n - 1). Pattern matching can get very interesting when you combine it with destructuring, such as this hypothetical syntax for defining a `map` function:

    map f, [] = []
    map f, [x] = [f(x)]
    map f, [x, rest...] = [f(x)] + map(rest)

We can implement a very small subset of this idea, pattern matching for functions that parse strings. Here's our function for manufacturing method objects:

    function patternMatcher () {
      function theMethod (str) {
        for (var i in theMethod._whens) {
          var when = theMethod._whens[i],
              args = when.pattern.exec(str);
          if (args) {
            console.log(args);
            return when.fn.apply(this, args);
          }
        }
      }
      Object.defineProperties(theMethod, {
        _whens: {
          enumerable: false,
          writable: false,
          value: []
        },
        when: {
          enumerable: false,
          writable: false,
          value: function (pattern, fn) {
            this._whens.push({pattern: pattern, fn: fn});
            return this;
          }
        }
      });
      return theMethod;
    }

We can use this to build an object that does its own parsing of names:

    var person = Object.create(null, {
      _givenNames: {
        enumerable: false,
        writable: true,
        value: []
      },
      _maternalSurname: {
        enumerable: false,
        writable: true
      },
      _paternalSurname: {
        enumerable: false,
        writable: true
      },
      _premaritalName: {
        enumerable: false,
        writable: true
      },
      name: {
        get: function () {
          // ...
        },
        set: patternMatcher().
             when(/^(\w+) (\w+)$/, function (name, given, last) {
               this._givenNames = [given];
               this._paternalSurname = last;
               return this;
             }).
             when(/^(\w+), (\w+)$/, function (name, last, given) {
               this._givenNames = [given];
               this._paternalSurname = last;
               return this;
             }).
             when(/^(\w+), (\w+)-(\w+)$/, function (name, maternal, paternal, given) {
               this._givenNames = [given];
               this._maternalSurname = maternal;
               this._paternalSurname = paternal;
               return this;
             })
      }
    });

The "name" setter would be embellished with many more cases, of course. But this gives the idea: A pattern matching method has a meta-method called `.when` that allows you to associate a pattern with a specific implementation.