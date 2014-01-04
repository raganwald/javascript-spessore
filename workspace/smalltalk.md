### Smalltalk

Smalltalk began in 1971 as a challenge: To implement Simula-style message passing in a page of Lisp code.

> Smalltalk is an object-oriented, dynamically typed, reflective programming language. Smalltalk was created as the language to underpin the "new world" of computing exemplified by "human–computer symbiosis." It was designed and created in part for educational use, more so for constructionist learning, at the Learning Research Group (LRG) of Xerox PARC by Alan Kay, Dan Ingalls, Adele Goldberg, Ted Kaehler, Scott Wallace, and others during the 1970s.

> The language was first generally released as Smalltalk-80. Smalltalk-like languages are in continuing active development, and have gathered loyal communities of users around them. ANSI Smalltalk was ratified in 1998 and represents the standard version of Smalltalk.

It gained features and functionality as it grew, until by 1976 it contained a rich dynamic programming environment, with sophisticated tools such as a real-time class browser. There are many technical differences between Simula and Smalltalk, but the key philosophical difference is that Smalltalk was designed as a general-purpose, full-stack programming language.

Simula was designed to run simulations. Smalltalk was designed to be the primary systems and application programming language for a series of workstations beginning with the fabled "Alto" in 1973 and culminating in 1980's "Dandelion."

Using "objects" in a general-purpose application programming environment was a tremendous change from using objects to model real-world entities.

When we want to model something in the real world, for use in a simulation, the process requires observing the real-world entities and choosing the real-world properties and real-world interactions with other entities that we consider significant. Thus, we end up with models for people, or devices, or even passive entities like documents.

But in an application environment, what are we modeling? Consider a "bank account." Its domain properties--the properties we observe in the real world--are easy to enumerate. Its currency, balance, and account number, to name just three. That's the same as if we were building a simulation.

But what behaviour does a bank account have in the real world? None. In 2014 at least, bank accounts are not "actors," they have no behaviour or volition. In a simulation, the bank account would be very passive and objects representing people would interact with it.

But a Smalltalk program might not be a simulation. Perhaps it's an application used by customer service reps to perform actions on behalf of telephone banking clients. Starting with Smalltalk, object-oriented programming involved providing objects with behaviours that turned them from passive instruments into actors.

A Smalltalk bank account object might know whether a cheque of a certain denomination can be cashed. In the real world, bank accounts know no such thing, a human