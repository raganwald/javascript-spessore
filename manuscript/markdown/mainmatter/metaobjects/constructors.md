## JavaScript's Constructors

Metaobjects have one key responsibility: *Defining shared object behaviour*. Although it's not strictly required, most object-oriented languages accomplish this by having metaobjects also construct each object.

In classic JavaScript, any function can be used to construct a new object with the use of the `new` keyword. All functions have a `prototype` property even if they aren't intended to be used as constructors. You can change a function's prototype is you wish.

Functions used to create objects are called *constructors*, and in classic JavaScript the *constructor* is responsible for initializing new objects, while the *prototype* is responsible for the behaviour of the object. When we use JavaScript's `new` operator on a function, the prototype of the object is initialized automatically to be the prototype of the constructor. Since initialization and the prototype flow from the constructor, it is tempting to think of the constructor as the "Queen of all Things" in JavaScript.

    var ClassicJSConstructor = function () {};
    ClassicJSConstructor.prototype.identity = 'classic';
    var classicObject = new ClassicJSConstructor();
    Object.getPrototypeOf(classicObject)
      //=> { identity: 'classic' }
    classicObject instanceof ClassicJSConstructor
      //=> true

If we follow that reasoning, we think of constructors as our metaobjects, and consider the prototype as part of the constructor. JavaScript encourages this perspective by providing an `instanceof` operator that appears to test whether an object was created by a particular constructor.[^tt]

[^tt]: Most OO programmers prefer using polymorphism to explicitly testing `instanceof`. Wide use of explicit type testing is generally a design smell, but nevertheless it is a useful tool in some circumstances.

JavaScript constructors are a convenience mechanism, nothing more. `new` operators and constructors aren't even necessary to create objects:

    var NakedPrototype = {
      identity: 'naked'
    };
    var unconstructedObject = Object.create(NakedPrototype);
    Object.getPrototypeOf(unconstructedObject)
      //=> { identity: 'naked' }

Furthermore, the `instanceof` operator doesn't do what it advertises. It appears to test whether a constructor created an object. But it doesn't, it tests whether an object and a function have compatible `prototype` properties.

Here we are fooling the operator:

    var NeverConstructedAnything = function () {};
    NeverConstructedAnything.prototype = NakedPrototype;
    unconstructedObject instanceof NeverConstructedAnything
      //=> true

It turns out that `instanceof` is fine when there is a 1:1 correspondence between constructors and prototypes, when we do not change prototypes dynamically, and when we use `new` for all objects, eschewing `Object.create`. But the moment we venture into deeper waters, they the required workarounds outweigh their convenience.

The prototype always defines the behaviour of an object. JavaScript's "constructors," `new` operator, and its `instanceof` operator are convenient for programming within a narrow band of conventions, but are unreliable in the general case.

Therefore, although constructors can be used create objects, we consider the object's prototype to be central to the idea of a metaobject. We do not rely on the `instanceof` operator, ever.