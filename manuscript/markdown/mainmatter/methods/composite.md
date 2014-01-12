## Composite Methods

One of the primary activities in programming is to *factor* programs or algorithms, to break them into smaller parts that can be reused or recombined in different ways.

> Common industry practice is to use the words "decompose" and "factor" interchangeably to refer to any breaking of code into smaller parts. Nevertheless, we will defy industry practice and use the word "decompose" to refer to breaking code into smaller parts whether those parts are to be recombined or reused or not, and use the word "factor" to refer to the stricter case of decomposition where the intention is to recombine or reuse the parts in different ways.

Both methods and objects can and should be factored into reusable components that have a [single, well-defined responsibility](https://en.wikipedia.org/wiki/Single_responsibility_principle).[^martin]

[^martin]: Robert Martin's rule of thumb for determining whether a method has a single responsibility is to ask when and why it would ever change. If there is just one reason why you are likely to change a method, it has a single responsibility. If there is more than one reason why it might change, it should be decomposed into separate entities that each have a single responsibility.

The simplest way to decompose a method is to "extract" one or more helper methods. For example:

    var person = Object.create(null, {

      // ...

      setFirstName: {
        enumerable: false,
        writable: true,
        value: function (str) {
          if (typeof(str) === 'string' && str != '') {
            return this._firstName = str;
          }
        }
      },
      setLastName: {
        enumerable: false,
        writable: true,
        value: function (str) {
          if (typeof(str) === 'string' && str != '') {
            return this._lastName = str;
          }
        }
      }
    });

The methods `setFirstName` and `setLastName` both have a "guard clause" that will not update the object's hidden state unless the method is passed a non-empty string. The logic can be extracted into its own "helper method:"

    var person = Object.create(null, {

      // ...

      isaValidName: {
        enumerable: false,
        writable: false,
        value: function (str) {
          return (typeof(str) === 'string' && str != '');
        }
      },
      setFirstName: {
        enumerable: false,
        writable: true,
        value: function (str) {
          if (this.isaValidName(str)) {
            return this._firstName = str;
          }
        }
      },
      setLastName: {
        enumerable: false,
        writable: true,
        value: function (str) {
          if (this.isaValidName(str)) {
            return this._lastName = str;
          }
        }
      }
    });

The methods `setFirstName` and `setLastName` now call the helper method `isaValidName`. The usual motivation for this is known as [DRY] or "Don't Repeat Yourself." The DRY principle is stated as "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."

[DRY]: https://en.wikipedia.org/wiki/Don't_repeat_yourself

In this case, presumably there is one idea, "person names must be non-empty strings," and placing the implementation for this in the `isaValidString` helper method ensures that now there is just the one authoritative source for the logic, instead of one in each name setter method.

Decomposing a method needn't always be for the purpose of DRYing up the logic. Sometimes, a method breaks down logically into a hierarchy of steps. For example:

    var person = Object.create(null, {

      // ...

      doSomethingComplicated: {
        enumerable: false,
        writable: true,
        value: function () {
          this.setUp();
          this.doTheWork();
          this.breakdown();
          this.cleanUp();
        }
      },
      setUp: // ...
      doTheWork: // ...
      breakdown: // ...
      cleanUp: // ...
    });

This is as true of methods as it is of functions in general. However, objects have some extra considerations. The most conspicuous is that an object is its own namespace. When you break a method down into helpers, you are adding items to the namespace, making the object as a whole more difficult to understand. What methods call `setUp`? Can `breakdown` be called independently of `cleanUp`? Everything is thrown into an object higgledy-piggledy.

### decluttering with closures

JavaScript provides us with tools for reducing object clutter. The first is the [Immediately Invoked Function Expression][iife] ("IIFE"). If our four helpers exist only to decompose `doSomethingComplicated`, we can write:

[iife]: https://en.wikipedia.org/wiki/Immediately-invoked_function_expression

    var person = Object.create(null, {

      // ...

      doSomethingComplicated: {
        enumerable: false,
        writable: true,
        value: (function () {
          return function () {
            setUp.call(this);
            doTheWork.call(this);
            breakdown.call(this);
            cleanUp.call(this);
          };
          function setUp () {
            // ...
          }
          function doTheWork () {
            // ...
          }
          function breakdown () {
            // ...
          }
          function cleanUp () {
            // ...
          }
        })()
      },
    });

Now our four helpers exist only within the closure created by the IIFE, and thus it is impossible for any other method to call them. You could even create a `setUp` helper with a similar name for another function without clashing with this one. Note that we're not invoking these functions with `this.`, because they aren't methods any more. And to preserve the local object's context, we're calling them with `.call(this)`.

### decluttering with function objects

In JavaScript, methods are represented by functions. And in JavaScript, *functions are objects*. Functions have properties, and the properties behave just like objects we create with `{}` or `Object.create`:

    var K = function (x) {
      return function (y) {
        return x;
      };
    };

    Object.defineProperty(K, 'longName', {
      enumerable: true,
      writable: false,
      value: 'The K Combinator'
    });

    K.longName
      //=> 'The K Combinator'

    Object.keys(K)
      //=> [ 'longName' ]

We can take advantage of this by using a function as a container for its own helper functions. There are several easy patterns for this. Of course, you could write it all out by hand:

    function doSomethingComplicated () {
      doSomethingComplicated.setUp.call(this);
      doSomethingComplicated.doTheWork.call(this);
      doSomethingComplicated.breakdown.call(this);
      doSomethingComplicated.cleanUp.call(this);
    }

    doSomethingComplicated.setUp = function () {
      // ...
    }

    doSomethingComplicated.doTheWork = function () {
      // ...
    }

    doSomethingComplicated.breakdown = function () {
      // ...
    }

    doSomethingComplicated.cleanUp = function () {
      // ...
    }

    var person = Object.create(null, {

      // ...

      doSomethingComplicated: {
        enumerable: false,
        writable: true,
        value: doSomethingComplicated
      }
    });

If we'd like to make it neat and tidy inline, `tap` is handy:

    var person = Object.create(null, {

      // ...

      doSomethingComplicated: {
        enumerable: false,
        writable: true,
        value: tap(
          function doSomethingComplicated () {
            doSomethingComplicated.setUp.call(this);
            doSomethingComplicated.doTheWork.call(this);
            doSomethingComplicated.breakdown.call(this);
            doSomethingComplicated.cleanUp.call(this);
          }, function (its) {
            its.setUp = function () {
              // ...
            }

            its.doTheWork = function () {
              // ...
            }

            its.breakdown = function () {
              // ...
            }

            its.cleanUp = function () {
              // ...
            }
          })
      }
    });

In terms of code, this is no simpler than the IIFE solution. However, placing the helper methods inside the function itself does make them available for use or modification by other methods. For example, you can now use a method decorator on any of the helpers:

    var logsTheReciver = after( function (value) {
      console.log(this);
      return value;
    });

    person.doSomethingComplicated.doTheWork = logsTheReciver(person.doSomethingComplicated.doTheWork);

This would not have been possible if `doTheWork` was hidden inside a closure.

### Summary

Like "ordinary" functions, methods can benefit from being decomposed or factored into smaller functions. Two of the motivations for doing so are to DRY up the code and to break a method into more easily understood and obvious parts. The parts can be represented as helper methods, functions hidden in a closure, or properties of the method itself.