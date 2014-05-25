## Source Code: Composing Behaviour

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

    encapsulatedObject[methodName] = function () {
      var context = getContext(this),
          result  = methodBody.apply(context, arguments);
      return (result === context) ? this : result;
    };
  });

  dependencies.forEach(function (methodName) {
    if (encapsulatedObject[methodName] == null) {
      encapsulatedObject[methodName] = void 0;
    }
  });

  return encapsulatedObject;
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

    return function sequenced () {
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
    Object.keys(metaobject).forEach(function (key) {
      if (key in collected) {
        collected[key].push(metaobject[key]);
      }
      else collected[key] = [metaobject[key]]
    });
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

function applySequenceFn(resolveds, protocol) {
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
  }, {});
}

function sequence () {
  var metaobjects = __slice.call(arguments, 0),
      arrays      = propertiesToArrays(metaobjects),
      resolved    = resolveUndefineds(arrays),
      sequenced   = applySequenceFn(resolved, orderStrategy2);

  return sequenced;
}

/////////////////////////////////////////////////////////

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

function resolveByName (behaviour) {
  var result = Object.create(null);

  Object.keys(behaviour).forEach(function (methodName) {
    var resolver = Object.keys(policies).reduce(function (acc, policy) {
      if (Object.keys(acc).length === 0) {
        var regex = new RegExp("^" + policy + "([A-Z])(.*)$"),
            actualMethodName;
        if (md = methodName.match(regex)) {
          actualMethodName = md[1].toLowerCase() + md[2];
          acc[actualMethodName] = {};
          acc[actualMethodName][policy] = behaviour[methodName];
        }
      }
      return acc;
    }, Object.create(null));
    if (Object.keys(resolver).length === 0) {
      result[methodName] = behaviour[methodName];
    }
    else extend(result, resolver);
  });

  return result;
}

function allEncompasses (prototype1, prototype2) {
  if (prototype1 === null) return prototype2 === null;
  if (prototype2 === null) return true;
  if (prototype1 === prototype2) return true;
  return Object.prototype.isPrototypeOf.call(prototype2, prototype1);
}

function extendBehaviour (composed, behaviour) {
  var definedMethods = Object.keys(behaviour).filter(function (methodName) {
          return typeof behaviour[methodName] === 'function' && methodName[0] !== '_';
        }),
      dependencies = Object.keys(behaviour).filter(function (methodName) {
          return typeof behaviour[methodName] === 'undefined' && methodName[0] !== '_';
        }),
      resolutions = methodsThatResolve(behaviour);

  // quick check for validity
  if (!allEncompasses(Object.getPrototypeOf(composed), Object.getPrototypeOf(behaviour))) {
    throw "incompatible prototypes";
  }

  // copy all defined methods without overwriting
  definedMethods.forEach(function (methodName) {
    if (composed[methodName] === void 0) { // none or a dependency
      composed[methodName] = behaviour[methodName];
    }
    else throw "'" + methodName + "' has a conflict."
  });

  // remove dependencies where satisfied
  dependencies.forEach(function (methodName) {
    if (composed[methodName] === void 0) { // none or a dependency
      composed[methodName] = void 0;
    }
    else if (typeof(composed[methodName]) !== 'function') {
      throw "'" + methodName + "' conflicts with entry of type '" + typeof(composed[methodName]) + "'";
    }
    // else do nothing, dependency is satisfied
  });

  // resolve outstanding
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
}

function composeBehaviours () {
  // `behaviours` is an array to be reduced in place. The first element is shallow-copied
  var behaviours = __slice.call(arguments, 0),
      seed = extend(Object.create(Object.getPrototypeOf(behaviours[0])), behaviours[0]);
  behaviours[0] = seed;

  return behaviours.reduce(extendBehaviour);
}
~~~~~~~~

For example:

~~~~~~~~
var Songwriter = encapsulate({
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

var Subscribable = encapsulate({
  initialize: function () {
    this.subscribers = [];
    return this;
  },
  subscribe: function (callback) {
    this.subscribers.push(callback);
  },
  unsubscribe: function (callback) {
    this.subscribers = this.subscribers.filter( function (subscriber) {
      return subscriber !== callback;
    });
  },
  notify: function () {
    this.subscribers.forEach( function (subscriber) {
      subscriber.call(this.self, arguments);
    });
  }
});

var sweetBabyJames = Object.create(composeBehaviours(
  Songwriter,
  resolve( Subscribable, {initialize: 'after'} ),
  resolveByName(
    encapsulate({
      notify: undefined,
      afterAddSong: function () { return this.notify(); }
    })
  )
)).initialize();

var SongwriterView = encapsulate({
  initialize: function (model, name) {
    this.model = model;
    this.name = name;
    this.model.subscribe(this.render.bind(this));
    return this;
  },
  _englishList: function (list) {
    var butLast = list.slice(0, list.length - 1),
        last = list[list.length - 1];
    return butLast.length > 0
           ? [butLast.join(', '), last].join(' and ')
           : last;
  },
  render: function () {
    var songList  = this.model.songs().length > 0
                    ? [" has written " + this._englishList(this.model.songs().map(function (song) {
                        return "'" + song + "'"; }))]
                    : [];

    console.log(this.name + songList);
    return this;
  }
})

var jamesView = Object.create(SongwriterView).initialize(sweetBabyJames, 'James Taylor');

sweetBabyJames.addSong('Fire and Rain')
~~~~~~~~
