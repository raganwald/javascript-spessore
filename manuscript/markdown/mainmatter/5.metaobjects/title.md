# Metaobjects {#metaobjects}

![Krups Machines](images/shadowbecomeswhite.jpg)[^shadowbecomeswhite]

[^shadowbecomeswhite]: [Krups Machines](http://www.flickr.com/photos/31383674@N00/10529091736) (c) 2010 Shadow Becomes White, [some rights reserved](http://creativecommons.org/licenses/by-nd/2.0/deed.en)

> In computer science, a metaobject is an object that manipulates, creates, describes, or implements other objects (including itself). The object that the metaobject is about is called the base object. Some information that a metaobject might store is the base object's type, interface, class, methods, attributes, parse tree, etc.--[Wikipedia](https://en.wikipedia.org/wiki/Metaobject)

It is technically possible to write software just using objects. When we need behaviour for an object, we can give it methods by binding functions to keys in the object:

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

We call this a "naïve" object. It has state and behaviour, but it lacks division of responsibility between its state and its behaviour.

This lack of separation has two drawbacks. First, it intermingles properties that are part of the model domain (such as `firstName`) with methods (and possibly other properties, although none are shown here) that are part of the implementation domain. Second, when we needed to share common behaviour, we could have objects share common functions, but does it not scale: There's no sense of organization, no clustering of objects and functions that share a common responsibility.

Metaobjects solve this problem by separating the domain-specific properties of objects from their behaviour and implementation-specific properties. In classic JavaScript, objects have *prototypes*, and the prototypes are the objects' metaobjects.

The basic principle of the metaobject is that we separate the mechanics of behaviour from the domain properties of the base object. There are many ways to implement metaobjects, and we will explore some of these as a mechanism for exploring some of the ideas in Object-Oriented Programming.