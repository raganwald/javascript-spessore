## Object-1s and Object-2s {#object-1}

In the discussion of hiding properties, we saw the example of a dictionary object. Here it is with its *domain properties*, the properties that correspond to the state of the object:

    var dictionary = {
      abstraction: "an abstract or general idea or term",
      encapsulate: "to place in or as if in a capsule",
      object: "anything that is visible or tangible and is relatively stable in form"
    };

By default, JavaScript permits us to add "behaviour" to the dictionary by binding functions to properties. We've already seen a better solution, but let's back up for a moment and write:

    dictionary.describe = function () {
      return map(['abstraction', 'encapsulate', 'object'], function (key) {
        return key + ': "' + dictionary[key] + '"';
      }).join('; ');
    };

    dictionary.describe()
      //=>
        'abstraction: "an abstract or general idea or term"; encapsulate: "to place in or as if in a capsule";
        object: "anything that is visible or tangible and is relatively stable in form"'

What happens if we get the keys of our object? By now, you know the answer immediately:

    Object.keys(dictionary)
      //=>
        [ 'abstraction',
          'encapsulate',
          'object',
          'describe' ]

The `describe` property is exactly the same as the `abstraction`, `encapsulate`, and `object` properties. This is not surprising once you've grasped the fact that JavaScript is sometimes described as a "Lisp-1."

What what?

### lisp-1s and lisp-2s

One of the big schisms in the history of the Lisp programming languages is over namespaces. In one branch of the tree, functions live in the same namespace as every other kind of value. So a name like `setvar` can be bound to any kind of value: A symbol, a string, a list, a function, whatever. Lisps with this namespace system are called "Lisp-1s" because they have one namespace for everything.[^jargon]

So in a Lisp-1, `(map someList myFun)` calls the function bound to the name `map`, passing along the values bound to the symbols `someList` and `myFun`. `myFun` can (and should) be a function, and that's fine.

[^jargon]: Some people argue that Lisp-1 and Lisp-2 are examples of "opaque jargon" and are a communication anti-pattern.

Other Lisps use a different system. Functions live in their own namespace. So `setvar` wouldn't be bound to a function, but it could be a symbol, list, or anything else. If you want a function named "setvar," you need special syntax to reach into the function namespace, like `#’setvar`.[^why]

In a Lisp-2, `(map someList myFun)` calls the function bound to the name `map`, passing along the values bound to the symbols `someList` and `myFun`. But it's not going to work, because it's going to look up the non-function value bound to the name `myFun`. To make it work properly, we need something like `(map someList #'myFun)`, indicating that we want to go into the function namespace to look up `myFun`.

[^why]: Why are there two different ways to handle namespaces in the Lisp family of languages? Some theorize that it goes back to some early implementation detail, perhaps it was efficient to put all the functions in one big data structure and put everything else in another. or perhaps it saved checking that something really is a function before invoking it, a rudimentary form of static type-checking.

### javascript is a javascript-1

In JavaScript, all values live in the same namespace. Anywhere you write a variable name like `foo`, it could be a function or it could be an "ordinary" value like an object, string, or number. When we write something like:

    map(someLisp, myFun)

All three names (map, someLisp, and myFun) are looked up in the same namespace and can contain functions or ordinary values. This is simpler and cleaner than having special rules for how to look functions up.

### javascript is also an object-1

As we've seen repeatedly, JavaScript objects have properties, and those properties can be either functions or ordinary values. If we write:

    dictionary.length

We might be accessing a function, we might be accessing a number. The only way to know is to try it:

    var dictionary = {
      abstraction: "an abstract or general idea or term",
      encapsulate: "to place in or as if in a capsule",
      object: "anything that is visible or tangible and is relatively stable in form"
    };

    Object.defineProperty(dictionary, 'length', {
      enumerable: false,
      writable: false,
      value: function () {
        return Object.keys(this).length;
      }
    });

    dictionary.length
      //=> [Function]

Thus, by default, JavaScript's properties are a single namespace containing both functions and ordinary values. The functions we assign as behaviours of the object live alongside the values that belong to the domain.

Not all "OO" languages are "Object-1s." Ruby, for example, is an "Object-2." In Ruby, object methods live in a complete different namespace from their instance variables, and both of them live in a complete different namespace from the contents of containers like Hashes.

For example:

    dictionary = Object.new

    dictionary.instance_variable_set(:@abstraction, "an abstract or general idea or term")

    def dictionary.abstraction
      "the act of considering something as a general quality or characteristic, " +
      "apart from concrete realities, specific objects, or actual instances."
    end

Its methods and instance variables are assigned as if they're separate things. Let's access them from
outside the object:

    dictionary.instance_variable_get(:@abstraction)
      #=> "an abstract or general idea or term"

    dictionary.abstraction
      #=> "the act of considering something as a general quality or characteristic,
           apart from concrete realities, specific objects, or actual instances.

And from within its own methods?

    def dictionary.tryThis
      puts @abstraction, nil, abstraction
    end

    dictionary.tryThis
      #=>
        an abstract or general idea or term

        the act of considering something as a general quality or characteristic,
        apart from concrete realities, specific objects, or actual instances.

In Ruby, instance variables live in their own namespace separately from methods, you have to use a sigil, `@` to access them. Ruby is an Object-2.

### writing javascript in object-2 style

It's a huge benefit that JavaScript is a "Lisp-1" in the sense that there is one namespace for all variables. But it can be a benefit to write JavaScript in an "Object-2" style, separating our methods from our domain properties.

One of the practices we saw earlier was to hide properties by making them non-enumerable. This is often useful for methods:

    var dictionary = {
      abstraction: "an abstract or general idea or term",
      encapsulate: "to place in or as if in a capsule",
      object: "anything that is visible or tangible and is relatively stable in form"
    };

    Object.defineProperty(dictionary, 'length', {
      enumerable: false,
      writable: false,
      value: function () {
        return Object.keys(this).length;
      }
    });

    Object.keys(dictionary).indexOf('value') >= 0
      //=> false

As we see, `Object.keys` gives us the names of the enumerable properties, the ones we're using for domain state. What about the non-enumerable properties? We have a partial answer with `Object.getOwnPropertyNames`:

    Object.getOwnPropertyNames(dictionary)
      //=>
        [ 'abstraction',
          'encapsulate',
          'object',
          'length' ]

Given this, we can construct:

    function methods (object) {
      var domainProperties = Object.keys(object);

      return Object.getOwnPropertyNames(object).filter( function (name) {
        return typeof(object[name]) === 'function' && domainProperties.indexOf(name) === -1;
      })
    }

    methods(dictionary)
      //=> ['length']

We would need to be strict about making all of your methods non-enumerable to use this function.

### prototypes and object-2s

Another way to create an object-2 is to use a prototype. We'll talk about prototypes in more detail later, but we could easily write:

~~~~~~~~
var Dictionary = {
  length: function () {
    return Object.keys(this).length;
  }
}

var dictionary = Object.create(Dictionary);

dictionary.abstraction = "an abstract or general idea or term";
dictionary.encapsulate = "to place in or as if in a capsule";
dictionary.object      = "anything that is visible or tangible and is relatively stable in form";

dictionary.length()
  //=> 3
~~~~~~~~

Prototypes are the way JavaScript natively handles delegation: Our `dictionary` object doesn't have a property for `length`, but it *delegates* handling `length` to `Dictionary`. It does have properties for  `abstraction`, `encapsulate`, and `object`, so when you write `dictionary.abstraction`, you get `"an abstract or general idea or term"` back.

Prototypes are JavaScript's way of making Object-2s. They happen to be *Metaobject-1s*, but that is a story we will investigate later.
