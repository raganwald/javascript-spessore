## Thinking in Objects

[JavaScript Allongé][ja] is a book about writing functions, combining functions, and decorating functions. It explains JavaScript's methods and classes in terms of functions. It had a single-minded focus on thinking in functions. But of course, there is more to programming than just thinking in functions, there is also "thinking in objects."

[ja]: https://leanpub.com/javascript-allonge

And that's where **JavaScript Spessore** comes in: To celebrate thinking in objects, starting with the basics, building upon them, and then exploring new ways to think about object-oriented programming.

### 0, 1, ∞

To truly think in objects, you have to liberate yourself from thinking in terms of any one language's features, because there is more than one way to "do" objects and object-oriented programming. Let's compare a few other languages to JavaScript:

1. *Smalltalk* has objects, but a Smalltalk object's methods and instance variables are distinct from the contents of a Smalltalk container like a dictionary or array. JavaScript’s objects are dictionaries, and an object's methods and instance variables are the same thing as its contents.
1. *Ruby* has classes, modules, the metaclasses, and eigenclasses. JavaScript just has objects that are related to each other either with prototype chaining or as instance values.
1. When you invoke a method in *Common Lisp*, You may also be invoking multiple "before," "after," or "around" demons in addition to the method handler. In JavaScript, each method is handled by exactly one function.
1. *Java's* methods cannot be added to or removed from classes once their bytecodes have been loaded. JavaScript's methods can be added and removed at any time.

These four “distinctions” between other languages and JavaScript are also the four pillars of object-oriented programming language semantics:

1. **Objects** are the things we use to encapsulate data and behaviour by exposing methods (and optionally properties).
1. **Metaobjects** like classes or prototypes are objects that define the behaviour of other objects.
1. **Protocols** are the rules by which we figure out what exactly happens when we send a message to an object.
1. **Binding Times** are the rules that determine *when* the behaviour of objects, metaobjects, and protocols can be added, removed, or changed.

When we are truly "thinking in objects," we are thinking in objects, thinking in metaobjects, and thinking in protocols. And for good measure, we are also thinking of when these things are "bound." And that's why JavaScript Spessore's mission is to explore objects, metaobjects, protocols, and to examine the implications of when these behaviours are bound.

### J(oop)S[^plexer]

You may be thinking to yourself, "This is all very well, but it sounds like it is about object-oriented programming in general and not really about the specifics in JavaScript. Why JavaScript? Why not Lisp or Smalltalk or OCaml or some other language with more built-in facility for different object-oriented approaches?"

The answer is that this is a book for programmers that is about thinking in objects, thinking that works in any OO language. It happens to be written in JavaScript instead of Lisp for the same reason that it happens to be written in English instead of Latin: Because it's a language we share.

[^plexer]: J(oop)S is a [plexer](https://en.wikipedia.org/wiki/Rebus), it means "Object-Oriented Programming in JavaScript."

