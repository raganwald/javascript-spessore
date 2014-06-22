## Taking a page out of LiSP

Teaching Lisp by implementing Lisp is a long-standing tradition. If you set out to learn to program with Lisp, you will find read book after book, lecture after lecture, and blog post after blog post, all explaining how to implement Lisp in Lisp. Christian Queinnec's [Lisp in Small Pieces][LiSP] is particularly notable, not just implementing a Lisp in Lisp, but covering a wide range of different semantics within Lisp.

[LiSP]: http://www.amazon.com/gp/product/B00AKE1U6O/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=B00AKE1U6O&linkCode=as2&tag=raganwald001-20

Lisp in Small Pieces's approach is to introduce a feature of Lisp, then develop an implementation. The book covers Lisp-1 vs. Lisp-2[^onevstwo], then discusses how to implement namespaces, building a simple Lisp-1 and a simple Lisp-2. Another chapter discusses scoping, and again you build interpreters for dynamic and block scoped Lisps.

[^onevstwo]: A "Lisp-1" has a single namespace for both functions and other values. A "Lisp-2" has separate namespaces for functions and other values. To the extend that JavaScript resembles a Lisp, it resembles a Lisp-1. See [The function namespace](http://en.wikipedia.org/wiki/Common_Lisp#The_function_namespace).

Building interpreters (and eventually compilers) may seem esoteric compared to tutorials demonstrating how to build a blogging engine, but there's a method to this madness. If you implement block scoping in a "toy" language, you gain a deep understanding of how closures really work in any language. If you write a Lisp that rewrites function calls in [Continuation Passing Style][CPS], you can't help but feel comfortable using JavaScript callbacks in [Node.js].

[CPS]: https://en.wikipedia.org/wiki/Continuation-passing_style
[Node.js]: http://nodejs.org/about/

Implementing a language feature teaches you a tremendous amount about how the feature works in a relatively short amount of time. And that goes double for implementing variations on the same feature--like dynamic vs block scoping or single vs multiple namespaces.

### j(oop)s

In this book, we are going to implement a variety of object-oriented programming language semantics, in JavaScript. We will implement different object semantics, implement different kinds of metaobjects, and implement different kinds of method protocols.

We'll see how to use JavaScript's basic building blocks to implement things like private state, multiple inheritence, protected methods, and more.

Unlike other books and tutorials, we won't focus on how to write object-oriented programs. We won't worry about patterns like "Facade," or walk through an "extract method" refactoring. We'll trust that there are more than enough existing resources covering these topics, and focus instead on the areas generally given short shrift by existing texts.

Our approach will be to focus on implementing OOP's basic tools. This will teach us (1) A great deal about how features like delegation and traits actually work, and (2) How to implement them in languages (like JavaScript) that do not provide much more than cursory support for OOP.
