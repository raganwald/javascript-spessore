## Proxies {#proxies}

*TODO: Rewrite this as a section about encapsulation*

When we discuss [Metaobjects](#metaobjects), we'll look at a technique called [forwarding](#forwarding), wherein one object's functions call the exact same function in another object. In the simple case where the only methods an object has are those that it forwards to another object, we call that object a [proxy] for the other object, which we call the *base object*, because it looks and behaves like the base object.

[proxy]: https://en.wikipedia.org/wiki/Proxy_pattern

For example:

~~~~~~~~
var stackBase = {
  array: [],
  index: -1,
  push: function (value) {
    return this.array[this.index += 1] = value;
  },
  pop: function () {
    var value = this.array[this.index];
    this.array[this.index] = void 0;
    if (this.index >= 0) {
      this.index -= 1;
    }
    return value;
  },
  isEmpty: function () {
    return this.index < 0;
  }
};

var stackProxy = {
  push: function (value) {
    return stackBase.push(value);
  },
  pop: function () {
    return stackBase.pop();
  },
  isEmpty: function () {
    return stackBase.isEmpty();
  }
};
~~~~~~~~

A proxy behaves like the base object, but hides the base object's properties:

~~~~~~~~
stackProxy.push('hello');
stackProxy.push('base');
stackProxy.pop();
  //=> 'base'

stackProxy
  //=>
    { push: [Function],
      pop: [Function],
      isEmpty: [Function] }
~~~~~~~~



Of course, we can automate the writing of functions:

~~~~~~~~
function proxy (baseObject) {
  var proxyObject = Object.create(null),
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

var stack = proxy(stackBase);
stack.push('auto');

stack.pop()
  //=> 'auto'
~~~~~~~~

A proxy isn't the original object, but it is often more than good enough. In some designs, the base objects are only ever manipulated through proxies. We create proxies with a transformation function. Later on, we'll see more sophisticated transformation functions that can create partial proxies (proxies for only some of the base object's behaviours), as well as proxies that control the creation of private state.