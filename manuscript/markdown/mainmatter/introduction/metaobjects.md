## What is a Metaobject?

> In computer science, a metaobject is an object that manipulates, creates, describes, or implements other objects (including itself). The object that the metaobject is about is called the base object. Some information that a metaobject might store is the base object's type, interface, class, methods, attributes, parse tree, etc.—[Wikipedia](https://en.wikipedia.org/wiki/Metaobject)

Given sufficiently rich patterns and techniques for describing object behaviour, we could write very sophisticated software just using objects. When we need behaviour for an object, we can give it methods by binding functions to keys in the object:

    var sam = {
      firstName: 'Sam',
      lastName: 'Lowry',
      fullName: function () {
        return this.firstName + " " + this.lastName;
      },
      rename: function (first, last) {
        this.firstName = first;
        this.lastName = last;
        return this;
      }
    }

This technique has two drawbacks. First, it intermingles properties that are part of the model domain (such as `firstName`) with methods (and possibly other properties, although none are shown here) that are part of the implementation domain. Second, when we needed to share common behaviour, we could have objects share common functions, but does it not scale: There's no sense of organization, no clustering of objects and functions that share a common responsibility.

Metaobjects solve this problem by separating the domain-specific properties of objects from their behaviour and implementation-specific properties. In classic JavaScript, we can use a prototype for the behaviour:

    var eigenPrototype = {
      fullName: function () {
        return this.firstName + " " + this.lastName;
      },
      rename: function (first, last) {
        this.firstName = first;
        this.lastName = last;
        return this;
      }
    };

    var sam = Object.create(eigenPrototype);
    sam.firstName = 'Sam';
    sam.lastName = 'Lowry';

This separates behaviour from our model's properties very neatly:

    Object.getOwnPropertyNames(sam)
      //=> [ 'firstName', 'lastName' ]

Insulating our base objects from our metaobjects is important for hiding implementation details, a core "OO" value. When we provide a method like `fullName`, we're hiding details of how to compute a full name from other entities, all they need to know is the name of the message to send.

But we need to hide implementation details within an object as well. Consider logging.[^logging] If we wish to write to the console every time an object is renamed, we have many choices. Here are three:

[^logging]: The canonical example of a cross-cutting concern. We could also consider implementing undo and transactions, they have similar characteristics.

First, we can rewrite our function:

    eigenPrototype.rename = function (first, last) {
      console.log(this.fullName() + " is being renamed " + first + " " + last);
      this.firstName = first;
      this.lastName = last;
      return this;
    };

Second, we can use a [method combinator][mc]:

    var logsNameChange = before( function (first, last) {
      console.log(this.fullName() + " is being renamed " + first + " " + last);
    });

    eigenPrototype.rename = logsNameChange( function (first, last) {
      this.firstName = first;
      this.lastName = last;
      return this;
    });

Third, we could use an aspect-oriented programming library like [YouAreDaChef]:

    YouAreDaChef(sam).before('rename', function (first, last) {
      console.log(this.fullName() + " is being renamed " + first + " " + last);
    });

[YouAreDaChef]:
[mc]: https://github.com/raganwald/method-combinators

Never mind which choice we should exercise. The important thing is that whatever we do should be hidden from the `sam` object itself! All it "knows" is that it has a prototype. What happens inside that prototype ought to be opaque. Is the `rename` function rewritten? Is it recombined? Is there a `before_rename` property with list of functions to execute? That should be irrelevant to the `sam` object itself.

The basic principle of the metaobject is that we separate the mechanics of behaviour from the domain properties of the base object. Everything else, like how inheritance is implemented, or whether a method is being logged, is hidden from the object.