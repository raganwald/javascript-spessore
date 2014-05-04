# Composing Behaviours

We've seen how to compose behaviours to make prototypes. This is very powerful, as it allows us to build focused and fully encapsulate entities--behaviours--with clearly defined responsibilities. We can then create prototypes from the appropriate combinations of behaviours without having to build fragile prototype hierarchies.

The limitation of this approach is that when we want to reuse combinations of behaviours, we are limited to combining them into prototypes that must then be chained together. This arrangement will end up much flatter than an approach relying strictly on prototypes, but chaining prototypes is still limited to creating tree hierarchies. Also, prototype delegation does not do any conflict resolution.

If we had a way to compose behaviours directly, we would be able to build more complex behaviours from simple behaviours, and then mix those into prototypes as we see fit. We would avoid chaining prototypes unnecessarily and we would have the benefit of checking for and resolving conflicts.

### the simplest possible approach

The simplest way to do this would be to declare that composing behaviours is fully associative. Given prototype `P` and behaviours `a, b, c` and `d`, we could say that `P(null, composeBehaviours(a, b), composeBehaviours(b, c))` must be equal to `P(null, a, b, c, c)`.

The simplest possible `composeBehaviours` function would look like this:

~~~~~~~~
function composeBehaviours () {
  var __slice = [].slice;

  return __slice.call(arguments, 0);
}

composeBehaviours(HasName, IsSelfDescribing)
  //=> [HasName, IsSelfDescribing]
~~~~~~~~

It would simply return an array! We could modify `Prototype` to handle arrays with a simple combinator:

~~~~~~~~
function flatten (arr) {
  if (arr instanceof Array) {
    return arr.reduce(function (acc, element) {
        return acc.concat(flatten(element));
    }, []);
  }
  else return arr;
}

function flattenArguments(fn) {
  return function () {
    return fn.apply(this, flatten(__slice.call(arguments, 0)));
  }
}

var PrototypeThatHandlesArrays = flattenArguments(Prototype);
~~~~~~~~

This approach is unsatisfactory for several reasons. It does not actually compose anything, it simply delays composition until you make a prototype. Therefore, you cannot write any other function or method that operates on behaviours without modifying them to operate on arrays of behaviours.

We also lose some reflectivity. Each behaviour declares its dependencies, and they are easy to inspect. An array of behaviours does not, so we would have to inspect the array and infer its dependencies if we were debugging or building tooling for behaviours.

Rather than trying to offload composition onto the `Prototype` function, it would be far better to do the work and write a function that actually composes behaviours directly.

### encapsulating behaviours directly

If we're going to pull back from having the `Prototype` function do all the work, we could write a `composeBehaviour` function that does an almost entirely similar job, but before we do that, let's review what `Prototype` actually does. First, it *encapsulates* each behaviour by wiring the functions up to a prototype. Second, it *resolves conflicts*. Third, it *composes the resulting functions into an object*.

That's a lot of work. Perhaps we can pull some of that out:

~~~~~~~~
//////////////////////////////////////////////////////////////////////
//
// repeating ourself: remove before publication
//
//////////////////////////////////////////////////////////////////////

var __slice = [].slice;

function extend () {
  var consumer = arguments[0],
      providers = __slice.call(arguments, 1),
      key,
      i,
      provider;

  for (i = 0; i < providers.length; ++i) {
    provider = providers[i];
    for (key in provider) {
      if (Object.prototype.hasOwnProperty.call(provider, key)) {
        consumer[key] = provider[key];
      };
    };
  };
  return consumer;
};

function partialProxy (encapsulate, methods) {
  var proxyObject = Object.create(null);

  methods.forEach(function (methodName) {
    proxyObject[methodName] = function () {
      var result = encapsulate[methodName].apply(encapsulate, arguments);
      return (result === encapsulate)
             ? proxyObject
             : result;
    }
  });

  return proxyObject;
}

//////////////////////////////////////////////////////////////////////

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

function propertyFlags (behaviour) {
  var properties = [],
      propertyName;

  for (propertyName in behaviour) {
    if (behaviour[propertyName] === null) {
      properties.push(propertyName);
    }
  }

  return properties;
}

function methodsThatResolve (behaviour) {
  return methodsOfType(behaviour, 'object').filter(function (methodName) {
    return behaviour[methodName] != null;
  });
}

var number = 0;

function encapsulate (description) {
  var safekeepingName = "__" + ++number + "__",
      definedMethods = methodsOfType(description, 'function'),
      resolutions = methodsThatResolve(description),
      dependencies = methodsOfType(description, 'undefined'),
      properties = propertyFlags(description),
      encapsulate = Object.create(null);

  function createContext (methodReceiver) {
    return partialProxy(methodReceiver, dependencies, properties);
  }

  function getContext (methodReceiver) {
    var context = methodReceiver[safekeepingName];
    if (context == null) {
      context = createContext(methodReceiver);
      Object.defineProperty(methodReceiver, safekeepingName, {
        enumerable: false,
        writable: false,
        value: context
      });
    }
    return context;
  }

  dependencies.forEach(function (methodName) {
    encapsulate[methodName] = void 0;
  });

  definedMethods.forEach(function (methodName) {
    encapsulate[methodName] = function () {
      var context = getContext(this),
          result = description[methodName].apply(context, arguments);
      return (result === context) ? this : result;
    };
  });

  resolutions.forEach(function (methodName) {
    encapsulate[methodName] = definition[methodName];
  });

  return encapsulate;
}
~~~~~~~~

We can use these one-at-a-time with `extend`:

~~~~~~~~
var SingsSongs = encapsulate({
  _songs: null,

  initialize: function () {
    this._songs = [];
    return this;
  },
  addSong: function (name) {
    this._songs.push(name);
    return this;
  },
  songs: function () {
    return this._songs;
  }
});

var Singer = extend({}, SingsSongs),
    raffi  = Object.create(Singer).initialize();

raffi.addSong('The more we get together');
raffi
  //=> {}
raffi.songs()
  //=> [ 'The more we get together' ]
~~~~~~~~

Composing encapsulate behaviours is now easier. First, a version that does not handle conflicts:

~~~~~~~~
function composeBehaviours () {
  return __slice.call(arguments, 0).reduce(function (composed, behaviour) {
    var definedMethods = methodsOfType(behaviour, 'function'),
        dependencies = methodsOfType(behaviour, 'undefined');

    definedMethods.forEach(function (methodName) {
      if (composed[methodName] === void 0) { // none or a dependency
        composed[methodName] = behaviour[methodName];
      }
      else throw "'" + methodName + "' has a conflict."
    });

    dependencies.forEach(function (methodName) {
      if (composed[methodName] === void 0) { // none or a dependency
        composed[methodName] = void 0;
      }
      else if (typeof(composed[methodName]) !== 'function') {
        throw "'" + methodName + "' conflicts with entry of type '" + typeof(composed[methodName]) + "'";
      }
      // else do nothing, dependency is satisfied
    });
    return composed;
  }, Object.create(null));
}

var HasName = encapsulate({
  _name: null,

  // methods
  name: function () {
    return this._name;
  },
  setName: function (name) {
    this._name = name;
    return this;
  }
});

var HasCareer = encapsulate({
  _career: null,

  // methods
  career: function () {
    return this._career;
  },
  setCareer: function (career) {
    this._career = career;
    return this;
  }
});

var IsSelfDescribing = encapsulate({
  name: undefined,
  career: undefined,

  // method
  description: function () {
    return this.name() + ' is a ' + this.career();
  }
});

composeBehaviours(HasName, HasCareer, IsSelfDescribing);
  //=>
    { name: [Function],
      setName: [Function],
      career: [Function],
      setCareer: [Function],
      description: [Function] }
~~~~~~~~

And now we add conflict resolution:

~~~~~~~~

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

// We can attach them to a behaviour with a helper function:

function resolve(behaviour, policySpecification) {
  var result = extend(Object.create(null), behaviour);

  Object.keys(policySpecification).forEach(function (methodName) {
    var policy = policySpecification[methodName],
        policyResolver;

    if (typeof(policy) ===  'string') {
      policyResolver = policies[policy];
      result[methodName] = {};
      result[methodName][policy] = behaviour[methodName];
    }
    else throw "'" + policy + "' is unsupported";
  });

  return result;
}

function composeBehaviours () {
  return __slice.call(arguments, 0).reduce(function (composed, behaviour) {
    var definedMethods = methodsOfType(behaviour, 'function'),
        resolutions = methodsThatResolve(behaviour),
        dependencies = methodsOfType(behaviour, 'undefined');

    definedMethods.forEach(function (methodName) {
      if (composed[methodName] === void 0) { // none or a dependency
        composed[methodName] = behaviour[methodName];
      }
      else throw "'" + methodName + "' has a conflict."
    });

    dependencies.forEach(function (methodName) {
      if (composed[methodName] === void 0) { // none or a dependency
        composed[methodName] = void 0;
      }
      else if (typeof(composed[methodName]) !== 'function') {
        throw "'" + methodName + "' conflicts with entry of type '" + typeof(composed[methodName]) + "'";
      }
      // else do nothing, dependency is satisfied
    });

    resolutions.forEach(function (methodName) {
      var resolution = behaviour[methodName],
          policy = Object.keys(resolution)[0],
          resolutionPolicy = policies[policy],
          newMethod = resolution[policy],
          existingMethod;

      if (methodName in composed) {
        existingMethod = composed[methodName];
        if (typeof(existingMethod) === 'function') {
          composed[methodName] = resolutionPolicy(newMethod, existingMethod);
        }
        else throw "'" + methodName + "' is attempting to resolve a '" + typeof(existingMethod) + "'";
      }
      else throw "'" + methodName + "' is not conflicted, but was given a resolution"
    });

    return composed;
  }, Object.create(null));
}

var SingsSongs = {
  _songs: null,

  initialize: function () {
    this._songs = [];
    return this;
  },
  addSong: function (name) {
    this._songs.push(name);
    return this;
  },
  songs: function () {
    return this._songs;
  }
};

var HasAwards = {
  _awards: null,

  initialize: function () {
    this._awards = [];
    return this;
  },
  addAward: function (name) {
    this._awards.push(name);
    return this;
  },
  awards: function () {
    return this._awards;
  }
};

composeBehaviours(SingsSongs, HasAwards)
  //=> 'initialize' has a conflict.

var AwardWinningSongwriter = composeBehaviours(
  SingsSongs,
  resolve(HasAwards, {initialize: 'after'})
);

var tracy = Object.create(AwardWinningSongwriter).initialize();

tracy.addSong('Fast Car');
tracy.addAward('Grammy');

tracy.songs()
  //=> [ 'Fast Car' ]

tracy.awards()
  //=> [ 'Grammy' ]
~~~~~~~~

We can use our behaviours directly in prototypes, or mix them into objects with `extend`.