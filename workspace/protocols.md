## What is a Protocol?

We've seen that a metaobject separates an object's domain-specific properties from the implementation details of its behaviour. The implementation details might be simple, such as a few methods that are expressed as functions, or complex, such as an inheritance hierarchy with composite methods.

A metaobject *protocol* (or just "protocol") is an interface for managing metaobjects. While the metaobject is responsible for the object's behaviour, the protocol is responsible for creating, changing, and removing behaviour from metaobjects.

### protocols and object creation

Previously, we showed how to use a prototype as a singletonMetaobject:

    var singletonMetaobject = {};
    var sam = Object.create(singletonMetaobject);

    extend(sam, {
      firstName: 'Sam',
      lastName: 'Lowry'
    });
    extend(singletonMetaobject, {
      fullName: function () {
        return this.firstName + " " + this.lastName;
      },
      rename: function (first, last) {
        this.firstName = first;
        this.lastName = last;
        return this;
      }
    });

A protocol can hide this implementation detail behind a function:

    function object(superprototype, propertyDescriptors) {
      if (arguments.length == 0 || typeof(superprototype) == 'undefined') {
        superprototype = Object.prototype;
      }
      var singletonMetaobject = Object.create(superprototype)
      return Object.create(singletonMetaobject, propertyDescriptors || {});
    }

    var sam = object();
    extend(sam, {
      firstName: 'Sam',
      lastName: 'Lowry'
    });

Adding methods to the singleton metaobject is also hidden behind a function. We'll elide the details for the moment:

    function extendWithMethods (object, methodDescriptions) {
      for (var methodName in methodDescriptions) {
        // ...
      }
      return object;
    }

    extendWithMethods(sam, {
      fullName: function () {
        return this.firstName + " " + this.lastName;
      },
      rename: function (first, last) {
        this.firstName = first;
        this.lastName = last;
        return this;
      }
    });

### protocols and advice

In the previous section, we gave three different implementations for adding logging to the `rename` method. The base object is insulated from the details by its metaobject, and the code that attaches the logging should likewise be insulated from the implementation choice.

Our protocol provides the insulation for us:

    function method (object, methodName, optionalOverride) {
      // ...
    }

    method(sam, 'rename').unshift( function (firstName, lastName) {
      console.log(this.fullName() + " is being renamed " + firstName + " " + lastName);
    });

    sam.rename('Samuel', 'Lowrie')
      //=> Sam Lowry is being renamed Samuel Lowrie
      //   { firstName: 'Samuel', lastName: 'Lowrie' }

The metaobject hides the implementation of "advice" from the base object. However, the implementation is exposed to the code responsible for adding logging to base objects. This is where the metaobject comes in.

To be specific, we meant that a base object should be insulated from the implementation consequences of rewriting a method, applying a combinator to it, or applying "before advice" to it. But we go further: In addition to insulating the base object from the implications of this choice, we must insulate the programmer from needing to think through and possibly re-invent the implementation of any of these three choices.
