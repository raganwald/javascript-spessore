// objectMethod.js

function applyWithFlavours (befores, inside, afters, args) {
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
    inside.apply(this, args)
  );
};

function objectMethod (object, method_name, optional_body) {

  if (object[method_name] == null ||
    object[method_name].before == null ||
    object[method_name].inside == null ||
    object[method_name].after == null) {

    function composite_method () {
      var args = [].slice.call(arguments, 0);
      applyWithFlavours(composite_method.before, compsite_method.inside, composite_method.after, args);
    };

    Object.defineProperty(composite_method, 'before', {
      writable: false,
      value: []
    });

    Object.defineProperty(composite_method, 'inside', {
      writable: true,
      value: optional_body || (function () {})
    });

    Object.defineProperty(composite_method, 'after', {
      writable: false,
      value: []
    });

    Object.defineProperty(composite_method, 'unshift', {
      writable: false,
      value: function (before_behaviour) {
        return composite_method.before.unshift(before_behaviour);
      }
    });

    Object.defineProperty(composite_method, 'push', {
      writable: false,
      value: function (after_behaviour) {
        return composite_method.after.push(after_behaviour);
      }
    });

    Object.defineProperty(object, method_name, {
      set: function (body) {
        return composite_method.inside = body;
      },
      get: function () {
        return composite_method;
      }
    });

  }
  else if (optional_body != null) {
    object[method_name].inside = optional_body;
  }

  return object[method_name];
};