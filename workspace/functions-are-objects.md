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