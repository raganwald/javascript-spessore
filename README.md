# JavaScript Spessore

[JavaScript Allongé][ja] is a book that explains programming in JavaScript beginning with the most basic unit of computation JavaScript offers: The function. Although it is not a book about functional programming in the large, it is very definitely a book about thinking in functions.

[ja]: https://leanpub.com/javascriptallongesix

Of course, JavaScript also has objects and methods. JavaScript Allongé explains how JavaScript uses functions to implement methods and prototypes, and it shows you how to encapsulate private object state, how to write classes, and how to use mixins.

This is certainly more than enough to write great works of software. But the curious mind cannot help but ask questions.  Clearly, JavaScript is doing something different from a language like Ruby:

1. **Ruby also has objects, but they work differently than JavaScript's objects**. Everything in Ruby is an object 24/7/365, whereas in JavaScript, primitives are not objects. Ruby's instance variables are distinct from its methods, and both of those are distinct from the mechanisms for collections like arrays and hashes. JavaScript's objects are, for the most part, always hashes. Ruby does not allow objects to directly access each other's instance variables, JavaScript does.
2. **Ruby has classes, modules, the metaclasses, and eigenclasses**. JavaScript just has objects that are related to each other either with prototype chaining or as instance values.
3. **When you invoke a method in Ruby, it has a relatively rich protocol for "dispatching" the method to the appropriate method body, involving the eigenclass, class, modules, and `method_missing` handlers**. JavaScript's protocol is insanely simple in contrast, involving only objects and a single chain of prototypes. Ruby's protocol allows multiple levels of privacy for methods. Every method in JavaScript is public.

These three "properties" of Ruby and JavaScript, are also the three pillars of object-oriented programming languages: *Objects* are the things we use to encapsulate data and behaviour by exposing methods (and optionally properties). *Metaobjects* like classes or prototypes are objects that define the behaviour of other objects. And *Protocols* are the rules by which we figure out what exactly happens when we send a message to an object.

### 0, 1, ∞

There's a maxim in programming that "The only numbers allowed are zero, one, and infinity." By this rule, we know that if there is more than one way program with objects, there must be many different ways to program with objects. Likewise, there must be many different ways to program with metaobjects, and many different ways to design protocols.

This is absolutely true, and it's easy to find examples of languages that do things differently than either JavaScript or Ruby. Java objects expose their instance variables like JavaScript, but like Ruby, they're not hashes. C++'s metaobjects include structs and classes, but not modules. Most "OO" languages are single dispatch: The protocol for handling method invocation is based on the receiver of the method. But the Common Lisp Object System has [multiple dispatch], a method or function's handling can be determined by more than one of the objects involved.

[multiple dispatch]: https://en.wikipedia.org/wiki/Multiple_dispatch

### beyond thinking in javascript

When learning a new language, programmers invariably focus on two things: Learning how to use the new language to do things in a style they already find familiar, and then learning to think in the new language and program in its natural style. After learning many languages, the experienced programmer begins to think at a higher plane, in abstractions that apply across all languages. They effortlessly bend each language to their will, knowing how to use "native" idioms effectively, and knowing how to make the code easier to read and maintain by incorporating universal ideas that apply across multiple languages.

The purpose of JavaScript Spessore is to articulate the ideas behind objects, metaobjects, and protocols directly, without forcing the reader to painstakingly infer them from long study of many languages. JavaScript Spessore starts with JavaScript's objects and prototypes, then uses them to build the kinds of objects you'll find in other programming languages, developing the idea of "thinking in objects."

The book then takes JavaScript's simple metaobject system and builds upon it, developing a metaprogramming style in JavaScript. Finally, it works in different protocols, developing ideas you can find in languages such as Lisp, Eiffel, and Haskell. By the conclusion, the reader will be equipped not just to program *with* JavaScript's objects, but to program the very way that objects work.

JavaScript Allonge began at the beginning, with functions, and built upwards to a rich programming style using functions to their fullest. JavaScript Spessore does the same for objects: Begin at the beginning, with the simplest concepts, and build upon them step by step to a rich and expressive metaobject protocol programming style.
