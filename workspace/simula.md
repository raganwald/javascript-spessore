### Simula

The phrase "object-oriented programming" (abbreviated "OOP") means a lot of different things to a lot of different people. Encapsulation is obviously a huge part of OOP. But there's more to it than that. The first modern OO programming language, Simula, was used for writing simulations.

> Simula is a name for two simulation programming languages, Simula I and Simula 67, developed in the 1960s at the Norwegian Computing Center in Oslo, by Ole-Johan Dahl and Kristen Nygaard. Syntactically, it is a fairly faithful superset of ALGOL 60.

> Simula 67 introduced objects, classes, inheritance and subclasses, virtual methods, coroutines, discrete event simulation, and features garbage collection.

> Simula is considered the first object-oriented programming language. As its name implies, Simula was designed for doing simulations, and the needs of that domain provided the framework for many of the features of object-oriented languages today.--[Wikipedia](https://en.wikipedia.org/wiki/Simula)

Objects were proxies for real-world entities. If we're using Simula to simulate customer service agents handling phone queries from customers, we would use objects to 'represent' customer service agents, customers, telephone queues, issues needing resolution, and so forth.

The primary activity in simulation is to classify entities and the relationships between them, then to represent those entities and relationships in code. Thus, a big part of Simula programming is designing "classes" to represent sets of objects that have common behaviour.

One class might represent customer service agents, another might represent customers, a third might represent queues, and so forth. Each class describes the behaviour of each of the entities, so the customer class describes the behaviour of each customer entity. Each class also has a real-world, intuitive meaning. Each object has a class. Objects will also have individual state, for example each customer may have a different issue needing resolution.

The main things we'll take away from this are:

1. Objects represent individual, real-world entities;
2. Classes represent sets of objects with common behaviour and have a real-world intuitive meaning.
3. Objects manage state;
4. Classes manage behaviour.

There's a *lot* more to Simula, but let's move on...