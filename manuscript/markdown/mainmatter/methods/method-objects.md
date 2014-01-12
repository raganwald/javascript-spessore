## Method Objects

If functions are objects, and functions can have properties, then functions can have methods:

    function K (x) {
      return function (y) {
        return x;
      }
    }

    K.length
      //=> 1

    K.call(null, 'hello')
      //=> [Function]

We can give functions our own methods by assigning functions to their properties. We saw this previously when we decomposed an object's method into helper methods. Here's the same applied to a function:

    function factorial (n) {
      return factorial.helper(n, 1);
    }

    factorial.helper = function helper (n, accumulator) {
      if (n === 0) {
        return accumulator;
      }
      else return helper(n - 1, n * accumulator);
    }

Functions can have all sorts of properties. One of the more intriguing possibility is to maintain an array of functions:

    function sequencer (arg) {
      var that = this;

      return sequencer._functions.reduce( function (acc, fn) {
        return fn.call(that, acc);
      }, arg);
    }

    Object.defineProperties(sequencer, {
      _functions: {
        enumerable: false,
        writable: false,
        value: []
      },
      push: {
        enumerable: false,
        writable: false,
        value: function (fn) {
          return this._functions.push(fn);
        }
      },
      unshift: {
        enumerable: false,
        writable: false,
        value: function (fn) {
          return this._functions.unshift(fn);
        }
      }
    });

`sequencer` is an object-oriented way to implement the `pipeline` function from function-oriented libraries like [allong.es]. Instead of writing something like:

    function square (n) { return n * n; }
    function increment (n) { return n + 1; }

    pipeline(square, increment)(6)
      //=> 37

[underscore]: http://underscorejs.org
[allong.es]: http://allong.es

We can write:

    sequencer.push(square);
    sequencer.push(increment);

    sequencer(6)
      //=> 37

This gives us some additional flexibility that we will exploit more fully later on. But for now, the important idea is that a function can have properties of its own that it calls like helpers, and some of those properties can be collections. The collection properties can by dynamically updated after the fact.

What can we do with this?

### Garnished Functions

Let's expand our sequencer to have *two* lists of functions and a "body:"

    function garnished (arg) {
      var args = [].slice.call(arguments);

      garnished.befores.forEach( function(garnishing) {
        garnishing.apply(this, args);
      }, this);

      var returnValue = garnished.body.apply(this, arguments);

      garnished.afters.forEach( function(garnishing) {
        garnishing.call(this, returnValue);
      }, this);

      return returnValue;
    }

    Object.defineProperties(garnished, {
      befores: {
        enumerable: true,
        writable: false,
        value: []
      },
      body: {
        enumerable: true,
        writable: true,
        value: function () {}
      },
      afters: {
        enumerable: true,
        writable: false,
        value: []
      },
      unshift: {
        enumerable: false,
        writable: false,
        value: function (fn) {
          return this.befores.unshift(fn);
        }
      },
      push: {
        enumerable: false,
        writable: false,
        value: function (fn) {
          return this.afters.push(fn);
        }
      }
    });

Our `garnished` function has an `unshift` and `push` method just like our `sequencer`, but it is arranged such that unshifting functions puts them on the head of a list of before functions, while pushing functions puts them on the tail of a list of after functions. right in the middle is a `body` function that defaults to doing nothing, but we can assign it like any other property:

    garnished.body = function () { return 'i am a garnished function'; };
    garnished.unshift(function () { console.log('before the body'); });
    garnished.push(function () { console.log('after the body'); });

    garnished()
      //=>
        before the body
        after the body
        'i am a garnished function'

Our function has a basic body that is responsible for the return value when called. It also can be "garnished" with functions to call before the body is evaluated and functions to call after the body has been evaluated.

Before we make another example, let's not type out all that code again. Of course we are going to discuss prototypes and classes and sharing behaviour later, but for now let's simply write a function that gives us garnished functions:

    function garnishize (body) {

      function garnished (arg) {
        var args = [].slice.call(arguments);

        garnished.befores.forEach( function (garnishing) {
          garnishing.apply(this, args);
        }, this);

        var returnValue = garnished.body.apply(this, arguments);

        garnished.afters.forEach( function (garnishing) {
          garnishing.call(this, returnValue);
        }, this);

        return returnValue;
      }

      Object.defineProperties(garnished, {
        befores: {
          enumerable: true,
          writable: false,
          value: []
        },
        body: {
          enumerable: true,
          writable: false,
          value: body
        },
        afters: {
          enumerable: true,
          writable: false,
          value: []
        },
        unshift: {
          enumerable: false,
          writable: false,
          value: function (fn) {
            return this.befores.unshift(fn);
          }
        },
        push: {
          enumerable: false,
          writable: false,
          value: function (fn) {
            return this.afters.push(fn);
          }
        }
      });

      return garnished;
    }

    var double = garnishize(function (n) { return n * 2; });

    double(2)
      //=> 4

One day we discover a bug in our code, someone seems to be passing something that isn't a number to `double`:

    double('two')
      //=> NaN

 It would be nice to have strong, static typing for such a problem, but the next best thing is to check our arguments. Here's a function that checks all of its arguments and throws an exception if any of them are not numbers:

    function mustBeNumericArguments () {
      var args = [].slice.call(arguments);

      args.forEach(function (arg) {
        if (typeof(arg) !== 'number') throw ('Argument Error, "' + arg + '" is not a number');
      });
    }

Instead of rewriting the code for `double`, we can just garnish it:

    double.unshift(mustBeNumericArguments);

    double(2)
      //=> 4

    double('two')
      //=> Argument Error, "two" is not a number

This general pattern of "garnishing" functions with before and after functions is a long-standing pattern, going back to [Lisp Machine Flavours](http://www.definitions.net/definition/Flavors), an early object-oriented system that featured before-, after-, and default "daemons."

Implementing garnishing with properties has more moving parts than wrapping functions with combinators, however it has the advantage of being reflective: We will see later on how to make garnishes play well with prototype chains.