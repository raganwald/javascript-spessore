## What is a Method?

As an abstraction, an object is an independent entity that maintains internal state and that responds to messages by reporting its internal state and/or making changes to its internal state. In the course of handling a message, an object may send messages to other objects and receive replies from them.

A "method" is an another idea that is related to, but not the same as, handling a message. A method is a function that encapsulates an object's behaviour. Methods are invoked by a calling entity much as a function is invoked by some code.

The distinction may seem subtle, but the easiest way to grasp the distinction is to focus on the word "message." A message is an entity of its own. You can store and forward a message. You can modify it. You can copy it. You can dispatch it to multiple objects. You can put it on a "blackboard" and allow objects to decide for themselves whether they want to respond to it.

Methods, on the other hand, operate "closer to the metal." They look and behave like function calls. In JavaScript, methods *are* functions. To be a method, a function must be the property of an object. We've seen methods earlier, here's a naïve example:

    var allong = require('allong.es');
    map = allong.es.map;

    var dictionary = {
      abstraction: "an abstract or general idea or term",
      encapsulate: "to place in or as if in a capsule",
      object: "anything that is visible or tangible and is relatively stable in form",
      descriptor: function () {
        return map(['abstraction', 'encapsulate', 'object'], function (key) {
          return key + ': "' + dictionary[key] + '"';
        }).join('; ');
      }
    };

    dictionary.descriptor()
      //=>
        'abstraction: "an abstract or general idea or term"; encapsulate: "to place in or as if in a capsule";
        object: "anything that is visible or tangible and is relatively stable in form"'

In this example, `descriptor` is a method. As we saw earlier, this code has many problems, but let's hand-wave them for a moment. Let's be clear about our terminology. This `dictionary` object has a method called `descriptor`. The function associated with `descriptor` is called the *method handler*.

When we write `dictionary.descriptor()`, we're *invoking or calling the descriptor method*. The object is then *handling the method invocation* by evaluating the function.

In describing objects, we refer to objects as encapsulating their internal state. The ideal is that objects **never** directly access or manipulate each other's state. Instead, objects interact with each other solely through methods.

There are many things that methods can do. Two of the most obvious are to *query* an object's internal state and to *update* its state. Methods that have no purpose other than to report internal state are called queries, while methods that have no purpose other than to update an object's internal state are called updates.

