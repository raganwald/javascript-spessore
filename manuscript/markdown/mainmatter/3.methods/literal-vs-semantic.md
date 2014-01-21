## The Letter and the Spirit of the Law

The 'law' that objects must only interact with each other through methods is generally accepted as an ideal, even though languages like JavaScript and Java do not enforce it. That being said, there are (roughly) two philosophies about the design of objects and their methods.

* *Literalists* believe that the important thing is the means of interaction be methods. Literalists are noted for using a profusion of getters and setters, which leads to code that is semantically identical to code where objects interact with each other's internal state, but every interaction is performed indirectly through a query or update.
* *Semanticists* believe that the important thing is that objects provide abstractions over their internal state. They avoid getters and setters, preferring to provide methods that are a level of abstraction above their internal representations.

By way of example, let's imagine that we have a `person` object. Our first cut at it involves storing a name. Here's a first cut at a literalist implementation:

    var person = Object.create(null, {
      _firstName: {
        enumerable: false,
        writable: true
      },
      _lastName: {
        enumerable: false,
        writable: true
      },
      getFirstName: {
        enumerable: false,
        writable: true,
        value: function () {
          return _firstName;
        }
      },
      setFirstName: {
        enumerable: false,
        writable: true,
        value: function (str) {
          return _firstName = str;
        }
      },
      getLastName: {
        enumerable: false,
        writable: true,
        value: function () {
          return _lastName;
        }
      },
      setLastName: {
        enumerable: false,
        writable: true,
        value: function (str) {
          return _lastName = str;
        }
      }
    });

This is largely pointless as it stands. Other objects now write `person.setFirstName('Bilbo')` instead of `person.firstName = 'Bilbo'`, but nothing of importance has been improved. The trouble with this approach as it stands is that it is a holdover form earlier times. Much of the trouble stems from design decisions made in languages like C++ and Java to preserve C-like semantics.

In those languages, once you have some code written as `person.firstName = 'Bilbo'`, you are forever stuck with `person` exposing a property to direct access. Without changing the semantics, you may later want to do something like make `person` [observable], that is, we add code such that other objects can be notified when the person object's name is updated.

[observable]: https://en.wikipedia.org/wiki/Observer_pattern

If `firstName` is a property being directly updated by other entities, we have no way to insert any code to handle the updating. The same argument goes for something like validating the name. Although validating names is a morass in the real world, we might have simple ideas such as that the first name will either have at least one character or be `null`, but never an empty string. If other entities directly update the property, we can't enforce this within our object.

In days of old, programmers would have needed to go through the code base changing `person.firstName = 'Bilbo'` into `person.setName('Bilbo')` (or even worse, adding all the observable code and validation code to other entities).

Thus, the literalist tradition grew of defining getters and setters as methods even if no additional functionality was needed immediately. With the code above, it is straightforward to introduce validation and observability:[^butmc]

    var person = Object.create(null, {
      // ...
      setFirstName: {
        enumerable: false,
        writable: true,
        value: function (str) {
          // insert validation and observable boilerplate here
          return _firstName = str;
        }
      },
      setLastName: {
        enumerable: false,
        writable: true,
        value: function (str) {
          // insert validation and observable boilerplate here
          return _lastName = str;
        }
      }
    });

[^butmc]: Later on, we'll see how to use [method combinators](https://github.com/raganwald/method-combinators) to do this more elegantly.

That seems very nice, but balanced against this is that contemporary implementations of JavaScript allow you to write getters and setters for properties that mediate access even when other entities are using property access syntax like `person.lastName = 'Baggins'`:

    var person = Object.create(null, {
      _firstName: {
        enumerable: false,
        writable: true
      },
      firstName: {
        get: function () {
          return _firstName;
        },
        set: function (str) {
          // insert validation and observable boilerplate here
          return _firstName = str;
        }
      },
      _lastName: {
        enumerable: false,
        writable: true
      },
      lastName: {
        get: function () {
          return _lastName;
        },
        set: function (str) {
          // insert validation and observable boilerplate here
          return _lastName = str;
        }
      }
    });

The preponderance of evidence suggests that if you are a literalist, you are better off not bothering with making getters and setters for everything in JavaScript, as you can add them later if need be.

### the semantic interpretation of object methods[^chongo]

[^chongo]: With the greatest respect to [Chongo](http://www.nytimes.com/2008/09/30/sports/othersports/30chongo.html), author of "The Homeless Interpretation of Quantum Mechanics."

What about the semantic approach?

With the literalist, properties like `firstName` are decoupled from methods like `setFirstName` so that the implementation of the properties can be managed by the object. Other objects calling `person.setFirstName('Frodo')` are insulated from details such as whether other objects are to be notified when `person` is changed.

But while the implementation is hidden, there is no abstraction involved. The level of abstraction of the properties is identical to the level of abstraction of the methods.

The semanticist takes this one step further. To the semanticist, objects insulate other entities from implementation details like observables and validation, but objects also provide an abstraction to other entities.

In our `person` example, first and last name is a very low-level concern, the kind of thing you think about when you're putting things in a database and worrying about searching and sorting performance. But what would be a higher-level abstraction?

Just a name.

You ask someone their name, they tell you. You ask for a name, you get it. An object that takes and accepts names hides from us all the icky questions like:

1. How do we handle people who only have one name? (it's not just celebrities)
2. Where do we store the extra middle names like Tracy Christopher Anthony Lee?
3. How do we handle formal Spanish names like [Gabriel José de la Concordia García Márquez][gabo]?
4. What do we do with [maiden names](https://en.wikipedia.org/wiki/Married_and_maiden_names) like Arlene Gwendolyn Lee née Barzey or Leocadia Blanco Álvarez de Pérez?

If we expose the low-level fields to other code, we demand that they know all about our object's internals and do the parsing where required. It may be simpler and easier to simply expose:

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
        set: function (str) {
          // ...
        }
      }
    });

[gabo]: https://en.wikipedia.org/wiki/Gabriel_Garc%C3%ADa_Márquez

The `person` object can then do the "icky" work itself. This centralizes responsibility for names.

Now, honestly, people have been handling names in a very US-centric way for a very long time, and few will put up a fuss if you make objects with highly literal name implementations. But the example illustrates the divide between a *literal design* where other objects operate at the same level of abstraction as the object's internals, and a *semantic design*, one that operates at a higher level of abstraction and is responsible for translating methods into queries and updates on the implementation.