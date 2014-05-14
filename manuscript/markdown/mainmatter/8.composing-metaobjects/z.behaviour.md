## Composable Behaviour in JavaScript

~~~~~~~~
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

var policies = {
  overwrite: function overwrite (fn1, fn2) {
    return fn1;
  },
  discard: function discard (fn1, fn2) {
    return fn2;
  },
  before: function before (fn1, fn2) {
    return function () {
      var fn1value = fn1.apply(this, arguments),
          fn2value = fn2.apply(this, arguments);
      return fn2value !== void 0
             ? fn2value
             : fn1value;
    }
  },
  after: function after (fn1, fn2) {
    return function () {
      var fn2value = fn2.apply(this, arguments),
          fn1value = fn1.apply(this, arguments);
      return fn2value !== void 0
             ? fn2value
             : fn1value;
    }
  },
  around: function around (fn1, fn2) {
    return function () {
      var argArray = [fn2.bind(this)].concat(__slice.call(arguments, 0));
      return fn1.apply(this, argArray);
    }
  }
};

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

function partialProxy (baseObject, methods) {
  var proxyObject = Object.create(null);

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

function encapsulate (behaviour) {
  var safekeepingName = "__" + ++number + "__",
      definedMethods = methodsOfType(behaviour, 'function'),
      dependencies = methodsOfType(behaviour, 'undefined'),
      encapsulatedObject = {};

  function createContext (methodReceiver) {
    return partialProxy(methodReceiver, dependencies);
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

  definedMethods.forEach(function (methodName) {
    var methodBody = behaviour[methodName];

    encapsulatedObject[methodName] = function () {
      var context = getContext(this),
          result  = methodBody.apply(context, arguments);
      return (result === context) ? this : result;
    };
  });

  return encapsulatedObject;
}

var policies = {
  overwrite: function overwrite (fn1, fn2) {
    return fn1;
  },
  discard: function discard (fn1, fn2) {
    return fn2;
  },
  before: function before (fn1, fn2) {
    return function () {
      var fn1value = fn1.apply(this, arguments),
          fn2value = fn2.apply(this, arguments);
      return fn2value !== void 0
             ? fn2value
             : fn1value;
    }
  },
  after: function after (fn1, fn2) {
    return function () {
      var fn2value = fn2.apply(this, arguments),
          fn1value = fn1.apply(this, arguments);
      return fn2value !== void 0
             ? fn2value
             : fn1value;
    }
  },
  around: function around (fn1, fn2) {
    return function () {
      var argArray = [fn2.bind(this)].concat(__slice.call(arguments, 0));
      return fn1.apply(this, argArray);
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

function allEncompasses (prototype1, prototype2) {
  if (prototype1 === null) return prototype2 === null;
  if (prototype2 === null) return true;
  if (prototype1 === prototype2) return true;
  return Object.prototype.isPrototypeOf.call(prototype2, prototype1);
}

function composeBehaviours () {
  var behaviours = __slice.call(arguments, 0),
      seed = extend(Object.create(Object.getPrototypeOf(behaviours[0])), behaviours[0]);

  behaviours[0] = seed;

  return behaviours.reduce(function (composed, behaviour) {
    var definedMethods = methodsOfType(behaviour, 'function'),
        resolutions = methodsThatResolve(behaviour),
        dependencies = methodsOfType(behaviour, 'undefined');

    if (!allEncompasses(Object.getPrototypeOf(composed), Object.getPrototypeOf(behaviour))) {
      throw "incompatible prototypes";
    }

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
  });
}
~~~~~~~~
