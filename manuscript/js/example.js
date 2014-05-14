// example.js

function object(superprototype, propertyDescriptors) {
  if (arguments.length == 0 || typeof(superprototype) == 'undefined') {
    superprototype = Object.prototype;
  }
  var singletonMetaobject = Object.create(superprototype)
  return Object.create(singletonMetaobject, propertyDescriptors || {});
}

function flavouredSend (befores, body, afters, args) {
  var that = this;
  befores.forEach(function (fn) {
    fn.apply(that, args)
  });
  return afters.reduce(
    function (return_value, after_behaviour) {
       var new_return = after_behaviour.call(that, return_value);
       if (typeof(new_return) === 'undefined') {
         return return_value;
       }
       else return new_return;
    },
    body.apply(this, args)
  );
};

function method (object, methodName, optionalOverride) {

  if (object[methodName] == null || typeof(optionalOverride) === 'function') {

    function compositeMethod () {
      var args = [].slice.call(arguments, 0);
      return flavouredSend.call(this, compositeMethod.before, compositeMethod.body, compositeMethod.after, args);
    };

    Object.defineProperty(compositeMethod, 'before', {
      writable: false,
      value: []
    });

    Object.defineProperty(compositeMethod, 'body', {
      writable: true,
      value: optionalOverride || (function () {})
    });

    Object.defineProperty(compositeMethod, 'after', {
      writable: false,
      value: []
    });

    Object.defineProperty(compositeMethod, 'unshift', {
      writable: false,
      value: function (before_behaviour) {
        return compositeMethod.before.unshift(before_behaviour);
      }
    });

    Object.defineProperty(compositeMethod, 'push', {
      writable: false,
      value: function (after_behaviour) {
        return compositeMethod.after.push(after_behaviour);
      }
    });

    var singletonMetaobject = Object.getPrototypeOf(object)

    Object.defineProperty(singletonMetaobject, methodName, {
      set: function (body) {
        return compositeMethod.body = body;
      },
      get: function () {
        return compositeMethod;
      }
    });

  }

  return object[methodName];
};

function extendWithMethods (object, methodDescriptions) {
  for (var methodName in methodDescriptions) {
    method(object, methodName, methodDescriptions[methodName]);
  }
  return object;
}

//////////////////////////////////////////////////////////////////////////////

var sam = object();

extendObject(sam, {
  firstName: 'Sam',
  lastName: 'Lowry'
});

extendWithMethods(sam, {
  fullName: function () {
    return this.firstName + " " + this.lastName;
  },
  rename: function (first, last) {
    this.firstName = first;
    this.lastName = last;
    return this;
  }
});

method(sam, 'rename').unshift( function (firstName, lastName) {
  console.log(this.fullName() + " is being renamed " + firstName + " " + lastName);
});

sam.rename('Samuel', 'Lowrie');
