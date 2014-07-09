### semantic structs

Let's use a much simpler example. We've already seen [Records](#records):

~~~~~~~~
function Record (initialValues) {
  if (Record.prototype.isPrototypeOf(this)) {
    var struct = this;

    Object.keys(initialValues).forEach(function (key) {
      Object.defineProperty(struct, key, {
        enumerable: true,
        writable: true,
        value: initialValues[key]
      });
    });
    return Object.preventExtensions(struct);
  }
  else return new Record(initialValues);
}
~~~~~~~~

`Record` is a structural type, not a semantic type, and it relies on properties. We'll update it to create accessor functions:

~~~~~~~~
function RecordWithAccessors (initialValues) {
  if (RecordWithAccessors.prototype.isPrototypeOf(this)) {
    var record = this;

    Object.keys(initialValues).forEach(function (key) {
      record["_" + key] = initialValues[key];
      record[key] = function (optionalValue) {
        if (optionalValue === undefined)
          return record["_" + key];
        else {
          record["_" + key] = optionalValue;
          return this;
        }
      }
    });
    return Object.preventExtensions(record);
  }
  else return new Record(initialValues);
}

var r = new RecordWithAccessors({foo: 1, bar: 2});

r.foo();
  //=> 1
r.bar(3);
r.bar();
  //=> 3
~~~~~~~~

`RecordWithAccessors` is juts like `Record`, but uses accessors instead of properties. But we can build on it: `SemanticStruct` makes constructor functions from lists of properties:

~~~~~~~~
function SemanticStruct () {
  var keys = [].slice.call(arguments, 0);

  function Constructor () {
    if (Constructor.prototype.isPrototypeOf(this)) {
      var struct = this,
          i;

      for (i = 0; i < arguments.length; ++i) {
        struct["_" + keys[i]] = arguments[i];
      };
      return Object.preventExtensions(struct);
    }
    else return new Constructor(initialValues);
  };

  keys.forEach(function (key) {
    Constructor.prototype[key] = function (optionalValue) {
      if (optionalValue === undefined)
        return this["_" + key];
      else {
        this["_" + key] = optionalValue;
        return this;
      }
    }
  });

  return Constructor;
}

var Fubar = SemanticStruct('foo', 'bar'),
    r = new Fubar(1, 2);
  //=> { _foo: 1, _bar: 2 }

r.bar(3);
r.bar();
  //=> 3

r instanceof Fubar
  //=> true
~~~~~~~~