## Methods

~~~~~~~~
function equals (x) {
  return function eq (y) { return (x === y); };
}

function not (fn) {
  var name = fn.name === ''
             ? "not"
             : "not_" + fn.name;
             
  return nameAndLength(name, fn.length, function () {
    return !fn.apply(this, arguments)
  });
}

function getWith (prop, obj) {
  function gets (obj) {
    return obj[prop];
  }
  
  return obj === undefined
         ? gets
         : gets(obj);
}

function mapWith (fn, mappable) {
  function maps (collection) {
    return collection.map(fn);
  }
  
  return mappable === undefined
         ? maps
         : maps(collection);
}

function pluckWith (prop, collection) {
  var plucker = mapWith(getWith(prop));
  
  return collection === undefined
         ? plucker
         : plucker(collection);
}

function nameAndLength(name, length, body) {
  var abcs = [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
               'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
               'z', 'x', 'c', 'v', 'b', 'n', 'm' ],
      pars = abcs.slice(0, length),
      src  = "(function " + name + " (" + pars.join(',') + ") { return body.apply(this, arguments); })";
  
  return eval(src);
}

function imitate(exemplar, body) {
  return nameAndLength(exemplar.name, exemplar.length, body);
}

function when (guardFn, optionalFn) {
  function guarded (fn) {
    return imitate(fn, function () {
      if (guardFn.apply(this, arguments))
        return fn.apply(this, arguments);
    });
  }
  return optionalFn == null
         ? guarded
         : guarded(optionalFn);
}

function Match () {
  var fns     = [].slice.call(arguments, 0),
      lengths = pluckWith('length', fns),
      length  = Math.min.apply(null, lengths),
      names   = pluckWith('name', fns).filter(function (name) { return name !== ''; }),
      name    = names.length === 0
                ? ''
                : names[0];
  
  return nameAndLength(name, length, function () {
    var i,
        value;
    
    for (i in fns) {
      value = fns[i].apply(this, arguments);
      
      if (value !== undefined) return value;
    }
  });
}

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

function MatchTypes () {
  var matchers = [].slice.call(arguments, 0, arguments.length - 1),
      body     = arguments[arguments.length - 1];
      
  function typeChecked () {
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
  
  return imitate(body, typeChecked);
}
~~~~~~~~