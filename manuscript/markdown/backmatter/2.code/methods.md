## Methods

~~~~~~~~
function isType (type) {
  return function (arg) {
    return typeof(arg) === type;
  };
}

function instanceOf (clazz) {
  return function (arg) {
    return arg instanceof clazz;
  };
}

function isPrototypeOf (proto) {
  return Object.prototype.isPrototypeOf.bind(proto);
}

function check () {
  var matchers = [].slice.call(arguments, 0, arguments.length - 1),
      body     = arguments[arguments.length - 1];
    
  return function () {
    var i,
        arg,
        value;
      
    if (arguments.length != matchers.length) return;
    for (i in arguments) {
      arg = arguments[i];
      if (!matchers[i].call(this, arg)) return;
    }
    value = body.apply(this, arguments);
    return value === undefined
           ? null
           : value;
  }
}

function appendable (fns) {
  var i,
      value,
      fn;
      
  if (fns === undefined) fns = [];
  
  function firstSuccess () {
    for (i in fns) {
      value = fns[i].apply(this, arguments);
      if (value !== undefined) return value;
    }
  }
  
  firstSuccess.appendChecked = function () {
    return appendable(fns.concat([check.apply(this, arguments)]));
  }
  
  return firstSuccess;
}

function MultipleDispatch () {
  return appendable().appendChecked.apply(this, arguments);
}
~~~~~~~~