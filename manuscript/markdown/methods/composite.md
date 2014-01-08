## Composite Methods

One of the primary activities in programming is to *factor* programs or algorithms, to break them into smaller parts that can be reused or recombined in different ways.[^jargon]

[^jargon]: Common industry practice is to use the words "decompose" and "factor" interchangeably to refer to any breaking of code into smaller parts. Nevertheless, we will defy industry practice and use the word "decompose" to refer to breaking code into smaller parts whether those parts are to be recombined or reused or not, and use the word "factor" to refer to the stricter case of decomposition where the intention is to recombine or reuse the parts in different ways.

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
            return _firstName = str;
          }
        }
      },
      setLastName: {
        enumerable: false,
        writable: true,
        value: function (str) {
          if (typeof(str) === 'string' && str != '') {
            return _lastName = str;
          }
        }
      }
    });


### Functions are Objects

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

*to be continued*