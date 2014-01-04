> A metaobject protocol provides the vocabulary to access and manipulate the structure and behavior of objects.  Typical functions of a metaobject protocol include:  Creating and deleting new classes; Creating new methods and properties; Changing the class structure so that classes inherit from different classes; Generating or modifying the code that defines the methods for the class.--[Wikipedia](https://en.wikipedia.org/wiki/Metaobject)

Languages with support for object-oriented programming typically provide their own "Vocabulary to access and manipulate the structure and behavior of objects" at runtime. Ruby, for example, provides keywords like `def` and `class`, as well as imbuing objects and modules with a variety of methods for inspecting and modifying behaviour while the program is running.

JavaScript can be said to have an extremely minimalist metaobject protocol. In this book, we'll look at building our own, richer metaobject protocols on top of JavaScript. Our metaobject protocols will be guided by the philosophy that object behaviour should be divied amongst three entities:

* Objects are responsible for the domain-specific properties of entities we're modeling.
* Metaobjects are responsible for encapsulating the behaviour of base objects.
* Protocols are façades for insulating code that defines behaviour from the implementation of metaobjects.