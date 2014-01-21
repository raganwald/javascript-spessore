## What is a Metaobject Protocol?

![Normalized Pump Pressure Reading](images/nalundgaard.jpg)[^nalundgaard]

[^nalundgaard]: [Normalized Pump Pressure Reading](http://www.flickr.com/photos/nalundgaard/3163040635) (c) 2009 Nicholas Lundgaard, [some rights reserved](http://creativecommons.org/licenses/by-sa/2.0/deed.en)

Now that we've reviewed what we might call the "Standard Approach" to object-oriented programming in JavaScript, let's take a step back and think about object-oriented programming of object-oriented programming.

JavaScript's objects and prototypes are obviously *programmable*, you can write things like:

    MyPseudoClass.prototype.newMethod = function () { return 'yipee!' };
    delete MyPseudoClass.prototype.oldMethod;

But you do so with direct manipulation, much as in a traditional C program database you directly update structs rather than send messages to objects. JavaScript's "metaprogramming" is much like C's structs: It isn't object-oriented at all, even though the programs you write *with* its prototypes are object-oriented.

But what if we were to program JavaScript's objects and prototypes in an object-oriented way? What if we built *metaobjects*, objects that defined the behaviour of other objects, and gave those objects methods of their own just like the objects we build to represent domain entities?

What indeed. We'd have a *metaobject protocol* for JavaScript.

> A metaobject protocol provides the vocabulary to access and manipulate the structure and behavior of objects.  Typical functions of a metaobject protocol include:  Creating and deleting new classes; Creating new methods and properties; Changing the class structure so that classes inherit from different classes; Generating or modifying the code that defines the methods for the class.--[Wikipedia](https://en.wikipedia.org/wiki/Metaobject)

In this book, we'll look at building our own, richer metaobject protocols on top of JavaScript. Our metaobject protocols will be guided by the philosophy that object behaviour should be divvied amongst three entities:

* Objects are responsible for the domain-specific properties of entities we're modeling.
* Metaobjects are responsible for encapsulating the behaviour of base objects.
* Protocols are façades for insulating code that defines behaviour from the implementation of metaobjects.