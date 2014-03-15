

### self-binding classes {#selfbindingclasses}

Subclassing `Class` and overriding `defineMethod` has many applications for making focused changes to semantics. We'll look at one more example. Consider this counter:

    var Counter = Class.create(BasicObjectClass);

    Counter
      .defineMethod('initialize', function () { this._count = 0; })
      .defineMethod('increment', function () { ++this._count; })
      .defineMethod('count', function () { return this.count; });

    var c = Counter.create();

And we have some function written in continuation-passing-style:

    function log (message, callback) {
      console.log(message);
      return callback();
    }

Alas, we can't use our counter:

    log("doesn't work", c.increment);

The trouble is that the expression `c.increment` returns the body of the method, but when it is invoked using `callback()`, the original context of `c` has been lost. The usual solution is to write:

    log("works", c.increment.bind(c));

The `.bind` method binds the context permanently. Another solution is to write (or use a [function][_bind] to write):

[_bind]: http://underscorejs.org/#bind

    c.increment = c.increment.bind(c);

Then you can write:

    log("works without thinking about it", c.increment);

It seems like a lot of trouble to be writing this out everywhere, *especially* when the desired behaviour is nearly always that methods be bound. Let's subclass `Class` again:

    var SelfBindingClass = Class.create(Class);

    SelfBindingClass.defineMethod( 'defineMethod', function (name, body) {
      Object.defineProperty(this.prototype, name, {
        get: function () {
          return body.bind(this);
        }
      });
      return this;
    });

    Counter = SelfBindingClass.create();

    c = Counter.create();

    log("still works without thinking about it", c.increment);

Classes that are instances of `SelfBindingClass` are now self-binding. Once again, we've encapsulated the internal representation and implementation, and hidden it behind a method.