## Introduction

I> A Smalltalk object can do exactly three things: Hold state (references to other objects), receive a message from itself or another object, and in the course of processing a message, send messages to itself or another object.
I>
I>--[Smalltalk on Wikipedia][smalltalk]

[smalltalk]: https://en.wikipedia.org/wiki/Smalltalk

Objects seem simple enough: They hold state, they receive messages, they process those messages, and in the course of processing messages, they also send messages. This brief definition implies an important idea: Objects can *change state* in the course of processing messages. They do this directly by removing, changing, or adding to the references they hold.

### messages and method invocations

![A nine year-old messenger boy](images/messenger.jpg)

Smalltalk speaks of "messages." The metaphor of a message is very clear. A message is composed and sent from one entity (the "sender") to one entity (the "recipient"). The sender specifies the identity of the recipient. The message may contain information for the recipient, instructions to perform some task, or a question to be answered. An immediate reply may be requested, or the sender may trust the message's recipient to act appropriately. The metaphor of the "message" emphasizes the arms-length relationship between sender and recipient.[^protocols]

[^protocols]: More exotic messaging protocols are possible. Instead of a message being couriered from one entity to another entity, it could be posted on a public or semi-private space where many recipients could view it and decide for themselves whether to respond. Or perhaps there is a dispatching entity that examines each message and decides who ought to respond, much as an operator might direct your call to the right person within an organization.

Popular languages don't usually discuss messages. Instead, they speak of "invoking methods." Invoking a method has a much more imperative implication than "sending a message." It implies that the entity doing the invoking is causing something to happen, even if the precise implementation is the receiver's responsibility. Most popular languages are synchronous: The code that invokes the method waits for a response.

### methods

A method is a kind of recipe for handling a message. In JavaScript, methods are functions. In other languages, methods are a separate kind of thing than functions. In many languages, the namespace for methods is distinct from the namespace for instance variables and other internal references. In JavaScript, methods and internal state are stored together as properties by default.

If we wish to organize methods separately from internal state, we must impose our own structure.

### references and state

You can imagine sending a message to a mathematician: "What's the biggest number: one, five, or four?" You can do that is JavaScript:

    Math.max(1, 5, 4)
      //=> 5

Although this is a message, it is unsatisfying to think of `Math` as an object, because it doesn't have any state. Objects were invented fifty years ago[^Simula] to model entities when building simulations. When making a simulation, an essential design technique is to make provide entity with its own independent decision-making ability.

[^Simula]: https://en.wikipedia.org/wiki/Simula "The Simula Programming Language"

Let's say we're modeling traffic. In real life, each car has its own characteristics like maximum speed. Each car has a driver with their own particular style of driving, and of course different cars have different destinations and perhaps different senses of urgency. Each driver independently responds to the local situation around their car. The same goes for traffic lights, roads... Everything has its own independent behavior.

The way to build a simulation is to provide each simulated entity such as the cars, roads, and traffic lights, with their own little programs. You then embed them in a simulated city with a supervisory program doling out events such as rain. Finally, you start the simulation and see what happens.

The key need is to be able to have entities be independent decision-making units that respond to events from outside of themselves. In essence, we're describing computing units. Computation has, at its heart, a program and some kind of storage representing its state. Although impractical, each entity in a simulation could be a Turing Machine with a long tape.

And thus when we think of "objects," we think of independent computing devices, each with their own storage representing their state: **An object is an entity that use handlers to respond to messages. It maintains internal state, and its handlers are responsible for querying and/or updating its state**.
