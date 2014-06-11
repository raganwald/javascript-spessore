## Hiding Object Properties

Many "OO" programming languages have the notion of private instance variables, properties that cannot be accessed by other entities. JavaScript has no such notion, we have to use specific techniques to create the illusion of private state for objects.

### enumerability

In JavaScript, there is only one kind of "privacy" for properties. But it's not what you expect. When an object has properties, you can access them with the dot notation, like this:

    var dictionary = {
      abstraction: "an abstract or general idea or term",
      encapsulate: "to place in or as if in a capsule",
      object: "anything that is visible or tangible and is relatively stable in form"
    };

    dictionary.encapsulate
      //=> 'to place in or as if in a capsule'

You can also access properties indirectly through the use of `[]` notation and the value of an expression:

    dictionary[abstraction]
      //=> ReferenceError: abstraction is not defined

Whoops, the value of an *expression*: The expression `abstraction` looks up the value associated with the variable "abstraction." Alas, such a variable hasn't been defined in this code, so that's an error. This works, because 'abstraction' is an expression that evaluates to the string we want:

    dictionary['abstraction']
      //=> 'an abstract or general idea or term'

One kind of privacy concerns who has access to properties. In JavaScript, all code has access to all properties of every object. There is no way to create a property of an object such that some functions can access it and others cannot.

So what kind of privacy does JavaScript provide? In order to access a property, you have to know its name. If you don't know the names of an object's properties, you can access the names in several ways. Here's one:

    Object.keys(dictionary)
      //=>
        [ 'abstraction',
          'encapsulate',
          'object' ]

This is called *enumerating* an object's properties. Not only are they "public" in the sense that any code that knows the property's names can access it, but also, any code at all can enumerate them. You can do neat things with enumerable properties, such as:

    var descriptor = map(Object.keys(dictionary), function (key) {
      return key + ': "' + dictionary[key] + '"';
    }).join('; ');

    descriptor
      //=>
        'abstraction: "an abstract or general idea or term"; encapsulate: "to place in or as if in a
        capsule"; object: "anything that is visible or tangible and is relatively stable in form"'


So, our three properties are *accessible* and also *enumerable*. Are there any properties that are accessible, but not enumerable? There sure can be. You recall that we can define properties using `Object.defineProperty`. One of the options is called, appropriately enough, `enumerable`.

Let's define a getter that isn't enumerable:

    Object.defineProperty(dictionary, 'length', {
      enumerable: false,
      get: function () {
        return Object.keys(this).length
      }
    });

    dictionary.length
      //=> 3

Notice that `length` obviously isn't included in `Object.keys`, otherwise our little getter would return `4`, not `3`. And it doesn't affect our little descriptor expression, let's evaluate it again:

    map(Object.keys(dictionary), function (key) {
      return key + ': "' + dictionary[key] + '"';
    }).join('; ')
      //=>
        'abstraction: "an abstract or general idea or term"; encapsulate: "to place in or as if in a
        capsule"; object: "anything that is visible or tangible and is relatively stable in form"'

Non-enumerable properties don't have to be getters:

    Object.defineProperty(dictionary, 'secret', {
      enumerable: false,
      writable: true,
      value: "kept from the knowledge of any but the initiated or privileged"
    });

    dictionary.secret
      //=> 'kept from the knowledge of any but the initiated or privileged'

    dictionary.length
      //=> 3

`secret` is indeed a secret. It's fully accessible if you know it's there, but it's not enumerable, so it doesn't show up in `Object.keys`.

One way to "hide" properties in JavaScript is to define them as properties with `enumerable: false`.

### closures

We saw earlier that it is possible to fake private instance variables by hiding references in a closure, e.g.

    function immutable (propertiesAndValues) {
      return tap({}, function (object) {
        for (var key in propertiesAndValues) {
          if (propertiesAndValues.hasOwnProperty(key)) {
            Object.defineProperty(object, key, {
              enumerable: true,
              writable: false,
              value: propertiesAndValues[key]
            });
          }
        }
      });
    }

    var rentAmount = (function () {
      var _dollars = 420;
      var _cents = 0;
      return immutable({
        dollars: function () {
          return _dollars;
        },
        cents: function () {
          return _cents;
        }
      });
    })();

`_dollars` and `_cents` aren't properties of the `rentAmount` object at all, they're variables within the environment of an IIFE. The functions associated with `dollars` and `cents` are within its scope, so they have access to its variables.

This has some obvious space and performance implications. There's also the general problem that an environment like a closure is its own thing in JavaScript that exists outside of the language's usual features. For example, you can iterate over the enumerable properties of an object, but you can't iterate over the variables being used inside of an object's functions. Another example: you can access a property indirectly with `[expression]`. You can't access a closure's variable indirectly without some clever finagling using `eval`.

Finally, there's another very real problem: Each and every function belonging to each and every object must be a distinct entity in JavaScript's memory. Let's make another amount using the same pattern as above:

    var rentAmount2 = (function () {
      var _dollars = 600;
      var _cents = 0;
      return immutable({
        dollars: function () {
          return _dollars;
        },
        cents: function () {
          return _cents;
        }
      });
    })();

We now have defined four functions: Two getters for `rentAmount`, and two for `rentAmount2`. Although the two `dollars` functions have identical code, they're completely different entities to JavaScript because each has a different enclosing environment. The same thing goes for the two `cents` functions. In the end, we're going to create an enclosing environment and two new functions every time we create an amount using this pattern.

### naming conventions

Let's compare this to a different approach. We'll write almost the identical code, but we'll rely on a naming convention to hide our values in plain sight:

    function dollars () {
      return this._dollars;
    }

    function cents () {
      return this._cents;
    }

    var rentAmount = immutable({
      dollars: dollars,
      cents: cents
    });
    rentAmount._dollars = 420;
    rentAmount._cents = 0;

Our convention is that other entities should not modify any property that has a name beginning with `_`. There's no enforcement, it's just a practice. Other entities can use getters and setters. We've created two functions, and we're using `this` to make sure they refer to the object's environment. With this pattern, we need two functions and one object to represent an amount.

One problem with this approach, of course, is that everything we're using is enumerable:

    Object.keys(rentAmount)
      //=>
        [ 'dollars',
          'cents',
          '_dollars',
          '_cents' ]

We'd better fix that:

    Object.defineProperties(rentAmount, {
      _dollars: {
        enumerable: false,
        writable: true
      },
      _cents: {
        enumerable: false,
        writable: true
      }
    });

Let's create another amount:

    var raisedAmount = immutable({
      dollars: dollars,
      cents: cents
    });

    Object.defineProperties(raisedAmount, {
      _dollars: {
        enumerable: false,
        writable: true
      },
      _cents: {
        enumerable: false,
        writable: true
      }
    });

    raisedAmount._dollars = 600;
    raisedAmount._cents = 0;

We create another object, but we can reuse the existing functions. Let's make sure:

    rentAmount.dollars()
      //=> 420

    raisedAmount.dollars()
      //=> 600

What does this accomplish? Well, it "hides" the raw properties by making them enumerable, then provides access (if any) to other objects through functions that can be shared amongst multiple objects.

As we saw earlier, this allows us to choose whether to expose setters as well as getters, it allows us to validate inputs, or even to have non-enumerable properties that are used by an object's functions to hold state.

The naming convention is useful, and of course you can use whatever convention you like. My personal preference for a very long time was to preface private names with `my`, such as `myDollars`. Underscores work just as well, and that's what we'll use in this book.

### summary

JavaScript does not have a way to enforce restrictions on accessing an object's properties: Any code that knows the name of a property can access the value, setter, or getter that has been defined for the object.

Private data can be faked with closures, at a cost in memory.

javaScript does allow properties to be non-enumerable. In combination with a naming convention and/or setters and getters, a reasonable compromise can be struck between fully private instance variables and completely open access.