## More Encapsulation {#more-encapsulation}

Some objects have multiple responsibilities. A `Person` can be an `Author`, can `HaveChildren`, can `HaveInvestments` and so forth. Each particular responsibility can be cleanly separated into its own metaobject, and their state combined into one object with techniques like our private mixins that work with shared prototypes using  [safekeeping for shared prototypes](#safekeeping-shared-prototypes).

This cleanly separates the code we write along lines of responsibility. Encapsulating the base object within a proxy reduces the surface area available for coupling by hiding all private state. But each mixin has access to all of the object's methods, and every responsibility we add swells this set of methods, increasing the surface area again.

Adding multiple responsibilities is always going to increase the surface area of an object, but we can still control the surface area with proxies. Here's our `proxy` method again:

~~~~~~~~
function proxy (baseObject, optionalPrototype) {
  var proxyObject = Object.create(optionalPrototype || null),
      methodName;
  for (methodName in baseObject) {
    if (typeof(baseObject[methodName]) ===  'function') {
      (function (methodName) {
        proxyObject[methodName] = function () {
          var result = baseObject[methodName].apply(baseObject, arguments);
          return (result === baseObject)
                 ? proxyObject
                 : result;
        }
      })(methodName);
    }
  }
  return proxyObject;
}
~~~~~~~~

It copies *all* of an object's methods into the proxy. But what if it copied fewer? Here's a `partialProxy` function, it works just like `proxy`, but instead of iterating over the base object's properties, it iterates over a subset we provide.

~~~~~~~~
function partialProxy (baseObject, methods, optionalPrototype) {
  var proxyObject = Object.create(optionalPrototype || null);

  methods.forEach(function (methodName) {
    proxyObject[methodName] = function () {
      var result = baseObject[methodName].apply(baseObject, arguments);
      return (result === baseObject)
             ? proxyObject
             : result;
    }
  });
  return proxyObject;
}
~~~~~~~~

We can use this. For example, if we have some kind of persistence-backed business model object, if we have a function that operates on the model but is only concerned with its persistence, we can write something like this:

~~~~~~~~
function save (model) {
  model = partialProxy(model, ['save', 'beforeSave', 'afterSave']);

  // ...
}
~~~~~~~~

This function will now only deal with the `save`, `beforeSave`, and `afterSave` methods of the model. Consistent use of partial proxies reduces coupling and helps keep functions and methods focused on simple responsibilities.

Using partial proxies for every on every function may feel oppressive and too "Java-like." But let's hold our skepticism for a moment. This technique has a very useful application elsewhere.

### partial proxies and metaobjects

One of the big concerns with metaobjects is that they become coupled over time. We solved a huge problem with coupling by introducing the idea of mixing behaviour in that has private state but access to the base object through a proxy.

As base objects grow, coupling will grow here as well. But unlike peer-peer code, it isn't always obvious that metaobjects are becoming coupled to each other, because metaobjects do not interact direct with each other, they interact with the base object.

So moderating their access is more valuable than moderating peer access. Can we use partial proxies to help? Of course we can.

Let's start with the behaviours we want to mix in. Two of them define two methods and don't depend on any method being defined:

~~~~~~~~
var HasName = {
  name: function () {
    return this.name;
  },
  setName: function (name) {
    this.name = name;
    return this;
  }
};

var HasCareer = {
  career: function () {
    return this.name;
  },
  setCareer: function (name) {
    this.name = name;
    return this;
  }
};
~~~~~~~~

But the third depends on two methods and defines one more method. We'll show that by saying that it lists all the methods that end up being defined, but it only provides a function for one of them:

~~~~~~~~
var IsSelfDescribing = {
  name: undefined,
  career: undefined,

  description: function () {
    return this.name() + ' is a ' + this.career();
  }
};
~~~~~~~~

Now we can rewrite `extendsWithProxy` to use the new information, we'll call it `estendsWithProxy`:

~~~~~~~~
var number = 0;

function methodsOfType (behaviour, type) {
  var methods = [],
      methodName;

  for (methodName in behaviour) {
    if (typeof(behaviour[methodName]) === type) {
      methods.push(methodName);
    }
  };
  return methods;
}

function extendWithProxy (prototype, behaviour) {
  var safekeepingName = "__" + ++number + "__",
      definedMethods = methodsOfType(behaviour, 'function'),
      undefinedMethods = methodsOfType(behaviour, 'undefined'),
      methodName;

  definedMethods.forEach(function (methodName) {
    prototype[methodName] = function () {
      var context = this[safekeepingName],
          result;
      if (context == null) {
        context = partialProxy(this, undefinedMethods);
        Object.defineProperty(this, safekeepingName, {
          enumerable: false,
          writable: false,
          value: context
        });
      }
      result = behaviour[methodName].apply(context, arguments);
      return (result === context) ? this : result;
    };
  });

  return prototype;
}

var Careerist = {};

extendWithProxy(Careerist, HasName);
extendWithProxy(Careerist, HasCareer);
extendWithProxy(Careerist, IsSelfDescribing);

var michael    = Object.create(Careerist),
    bewitched = Object.create(Careerist);

michael.setName('Michael Sam');
bewitched.setName('Samantha Stephens');

michael.setCareer('Athlete');
bewitched.setCareer('Thaumaturge');

michael.description()
  //=> 'Michael Sam is a Athlete'
bewitched.description()
  //=> 'Samantha Stephens is a Thaumaturge'
~~~~~~~~

We have the same behaviour as before, but now we've limited the scope of our mixins such that they only rely on calling the methods they need.

### composing mixins

An interesting thing about our mixins is that they compose nicely. For starters, we can observe that if you compose any two behaviour objects, if one of them defines a behaviour and the other requires it, the result does not require it.

In other words:

~~~~~~~~
function composeMixins (a, b) {
  // ...
}

composeMixins(HasName, IsSelfDescribing)
  //=>
    {
      career: undefined,
      name: [Function],
      setName: [Function],
      description: [Function] }
~~~~~~~~

The result of composing `HasName` and `IsSelfDescribing` does not "require" `name` because `HasName` provides it. We can write that:

~~~~~~~~
var __slice = [].slice;

function composeMixins () {
  var mixins = __slice.call(arguments, 0);

  return mixins.reduce(function (result, mixin) {
    return Object.keys(mixin).reduce(function (result, methodName) {
      if (result.hasOwnProperty(methodName)) {
        if (typeof(mixin[methodName]) === 'undefined') {
          // do nothing
        }
        else if (typeof(result[methodName]) ===  'undefined') {
          result[methodName] = mixin[methodName];
        }
        else {
          // not defined yet
        }
      }
      else result[methodName] = mixin[methodName];
      return result;
    }, result);
  }, {});
}

composeMixins(HasName, IsSelfDescribing)
  //=>
    { name: [Function],
      setName: [Function],
      career: undefined,
      description: [Function] }
~~~~~~~~

You'll notice that we have an empty spot for the case where two mixins both define a method. This will break our `composeMixins` code.

So let's fix that: Here's our use case:

~~~~~~~~
var HasChildren = {
  initialize: function () {
    this._children = [];
    return this;
  },
  addChild: function (name) {
    this._children.push(name);
    return this;
  },
  numberOfChildren: function () {
    return this._children.length;
  }
};

var IsAuthor = {
  initialize: function () {
    this._books = [];
    return this;
  },
  addBook: function (name) {
    this._books.push(name);
    return this;
  },
  books: function () {
    return this._books;
  }
};
~~~~~~~~

We'll make a temporary change:

~~~~~~~~
var HasChildren = {
  initialize: {
    after: function () {
      this._children = [];
      return this;
    }
  },
  addChild: function (name) {
    this._children.push(name);
    return this;
  },
  numberOfChildren: function () {
    return this._children.length;
  }
};

var IsAuthor = {
  initialize: {
    after: function () {
      this._books = [];
      return this;
    }
  },
  addBook: function (name) {
    this._books.push(name);
    return this;
  },
  books: function () {
    return this._books;
  }
};
~~~~~~~~

And now we'll incorporate conflict resolution into our compose function:

~~~~~~~~
var __slice = [].slice;

var policies = {
  overwrite: function overwrite (fn1, fn2) {
    return fn2;
  },
  discard: function discard (fn1, fn2) {
    return fn1;
  },
  before: function before (fn1, fn2) {
    return function () {
      fn2.apply(this, arguments);
      return fn1.apply(this, arguments);
    }
  },
  after: function after (fn1, fn2) {
    return function () {
      fn1.apply(this, arguments);
      return fn2.apply(this, arguments);
    }
  },
  around: function around (fn1, fn2) {
    return function () {
      var argArray = [fn1.bind(this)].concat(__slice.call(arguments, 0));
      return fn2.apply(this, argArray);
    }
  }
};

function composeMixins () {
  var mixins = __slice.call(arguments, 0),
      dummy  = function () {};

  return mixins.reduce(function (acc1, mixin) {
    return Object.keys(mixin).reduce(function (result, methodName) {
      var bDefinition = mixin[methodName],
          bType       = typeof(bDefinition),
          aFunc,
          aType,
          bResolverKey,
          bFunc;

      if (result.hasOwnProperty(methodName)) {
        aFunc = result[methodName];
        aType = typeof(aFunc);

        if (aType ===  'undefined') {
          if (bType === 'function' || bType === 'undefined') {
            result[methodName] = bDefinition;
          }
          else if (bType == 'object') {
            bResolverKey = Object.keys(bDefinition)[0];
            bFunc = bDefinition[bResolverKey];
            if (bResolverKey === 'around') {
              result[methodName] = function () {
                return bFunc.apply(this, [dummy] + __slice.call(0, arguments));
              }
            }
            else result[methodName] = bFunc;
          }
          else throw 'unimplemented';
        }
        else if (bType === 'object') {
          bResolverKey = Object.keys(bDefinition)[0];
          bFunc = bDefinition[bResolverKey];
          result[methodName] = policies[bResolverKey](aFunc, bFunc);
        }
        else if (bType === 'undefined') {
          // do nothing
        }
        else throw 'unimplemented'
      }
      else if (bType === 'function' || bType === 'undefined') {
        result[methodName] = bDefinition;
      }
      else if (bType == 'object') {
        bResolverKey = Object.keys(bDefinition)[0];
        bFunc = bDefinition[bResolverKey];
        if (bResolverKey === 'around') {
          result[methodName] = function () {
            return bFunc.apply(this, [dummy] + __slice.call(0, arguments));
          }
        }
        else result[methodName] = bFunc;
      }
      else throw 'unimplemented';

      return result;
    }, acc1);
  }, {});
}

composeMixins(HasChildren, IsAuthor)
  //=>
  { initialize: [Function],
    addChild: [Function],
    numberOfChildren: [Function],
    addBook: [Function],
    books: [Function] }
~~~~~~~~

White writing `{ after: function ... }` may not seem particularly onerous, it is very convenient to be able to compose mixins that were not written to be composed. We can separate the mixin from the policy and use a function to integrate them:

~~~~~~~~
function resolve(mixin, policySpecification) {
  var result = extend(Object.create(null), mixin);

  Object.keys(policySpecification).forEach(function (policy) {
    var methodNames = policySpecification[policy];

    methodNames.forEach(function (methodName) {
      result[methodName] = {};
      result[methodName][policy] = mixin[methodName];
    });
  });

  return result;
}

var HasChildren = {
  initialize: function () {
    this._children = [];
    return this;
  },
  addChild: function (name) {
    this._children.push(name);
    return this;
  },
  numberOfChildren: function () {
    return this._children.length;
  }
};

var IsAuthor = {
  initialize: function () {
    this._books = [];
    return this;
  },
  addBook: function (name) {
    this._books.push(name);
    return this;
  },
  books: function () {
    return this._books;
  }
};

composeMixins(
  HasChildren,
  resolve(IsAuthor, { after: ['initialize'] })
)
~~~~~~~~

We now have a system for encapsulating base objects from their mixins, providing private state to each mixin, and restricting the scope of methods accessed by mixins. Furthermore, we can compose these mixins, and we are required to resolve all method conflicts at the time of composition.

We have created [traits]:

> An object defined as a trait is created as the composition of methods, which can be used by other classes without requiring multiple inheritance. In case of a naming collision, when more than one trait to be used by a class has a method with the same name, the programmer must explicitly disambiguate which one of those methods will be used in the class; thus manually solving the "diamond problem" of repeated inheritance. This is different from other composition methods in object-oriented programming, where conflicting names are automatically resolved by scoping rules.

[traits]: https://en.wikipedia.org/wiki/Trait_(computer_programming)