## Encapsulation and Composition

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

function partialProxy (baseObject, methods, proxyPrototype) {
  var proxyObject = Object.create(proxyPrototype || null);

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

function methodsOfType (behaviour, list, type) {
  return list.filter(function (methodName) {
    return typeof(behaviour[methodName]) === type;
  });
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
  return methodsOfType(behaviour, Object.keys(behaviour), 'object').filter(function (methodName) {
    return behaviour[methodName] != null && methodName[0] != '_';
  });
}

var number = 0;

function encapsulate (behaviour) {
  var safekeepingName = "__" + ++number + "__",
      properties = Object.keys(behaviour),
      methods = properties.filter(function (methodName) {
          return typeof behaviour[methodName] === 'function';
        }),
      privateMethods = methods.filter(function (methodName) {
          return methodName[0] === '_';
        }),
      publicMethods = methods.filter(function (methodName) {
          return methodName[0] !== '_';
        }),
      definedMethods = methodsOfType(behaviour, publicMethods, 'function'),
      dependencies = methodsOfType(behaviour, properties, 'undefined'),
      encapsulatedObject = {},
      proxyPrototype;

  function createContext (methodReceiver) {
    return Object.defineProperty(
      partialProxy(methodReceiver, publicMethods.concat(dependencies), proxyPrototype),
      'self',
      { writable: false, enumerable: false, value: methodReceiver }
    );
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

  proxyPrototype = privateMethods.reduce(function (acc, methodName) {
    acc = acc || {};
    acc[methodName] = behaviour[methodName];
    return acc;
  }, null);

  definedMethods.forEach(function (methodName) {
    var methodBody = behaviour[methodName];

    Object.defineProperty(encapsulatedObject, methodName, {
      enumerated: true,
      writable: false,
      value: function () {
        var context = getContext(this),
            result  = methodBody.apply(context, arguments);
        return (result === context) ? this : result;
      }
    });
  });

  dependencies.forEach(function (methodName) {
    if (encapsulatedObject[methodName] == null) {
      encapsulatedObject[methodName] = void 0;
    }
  });

  return Object.preventExtensions(encapsulatedObject);
}

/////////////////////////////////////////////////////////

function isUndefined (value) {
  return typeof value === 'undefined';
}

function isntUndefined (value) {
  return typeof value !== 'undefined';
}

function isFunction (value) {
  return typeof value === 'function';
}

function orderStrategy2 () {
  if (arguments.length === 1) {
    return arguments[0];
  }
  else {
    var fns = __slice.call(arguments, 0);

    return function composed () {
      var args    = arguments,
          context = this,
          values  = fns.map(function (fn) {
            return fn.apply(context, args);
          }).filter(isntUndefined);

      if (values.length > 0) {
        return values[values.length - 1];
      }
    }
  }
}

function propertiesToArrays (metaobjects) {
  return metaobjects.reduce(function (collected, metaobject) {
    var key;

    for (key in metaobject) {
      if (key in collected) {
        collected[key].push(metaobject[key]);
      }
      else collected[key] = [metaobject[key]]
    }
    return collected;
  }, {})
}

function resolveUndefineds (collected) {
  return Object.keys(collected).reduce(function (resolved, key) {
    var values = collected[key];

    if (values.every(isUndefined)) {
      resolved[key] = undefined;
    }
    else resolved[key] = values.filter(isntUndefined);

    return resolved;
  }, {});
}

function applyProtocol(seed, resolveds, protocol) {
  return Object.keys(resolveds).reduce( function (applied, key) {
    var value = resolveds[key];

    if (isUndefined(value)) {
      applied[key] = value;
    }
    else if (value.every(isFunction)) {
      applied[key] = protocol.apply(null, value);
    }
    else throw "Don't know what to do with " + value;

    return applied;
  }, seed);
}

function canBeMergedInto (object1, object2) {
  var prototype1 = Object.getPrototypeOf(object1),
      prototype2 = Object.getPrototypeOf(object2);

  if (prototype1 === null) return prototype2 === null;
  if (prototype2 === null) return true;
  if (prototype1 === prototype2) return true;

  return Object.prototype.isPrototypeOf.call(prototype2, prototype1);
}

// shim if allong.es.callLeft not available

var callLeft2 = (function () {
  if (typeof callLeft == 'function') {
    return callLeft;
  }
  else if (typeof allong === 'object' && typeof allong.es === 'object' && typeof allong.es.callLeft === 'function') {
    return allong.es.callLeft;
  }
  else {
    return function callLeft2 (fn, arg2) {
      return function callLeft2ed (arg1) {
        return fn.call(this, arg1, arg2);
      };
    };
  }
})();

function seedFor (objectList) {
  var seed = objectList[0] == null
             ? Object.create(null)
             : Object.create(Object.getPrototypeOf(objectList[0])),
      isCompatibleWithSeed = callLeft2(canBeMergedInto, seed);

  if (!objectList.every(isCompatibleWithSeed)) throw 'incompatible prototypes';
  return seed;
}

function composeMetaobjects {
  var metaobjects = __slice.call(arguments, 0),
      arrays      = propertiesToArrays(metaobjects),
      resolved    = resolveUndefineds(arrays),
      seed        = seedFor(metaobjects),
      composed    = applyProtocol(seed, resolved, orderStrategy2);

  return composed;
}
~~~~~~~~
